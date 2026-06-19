import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const MINHA_RECEITA_BASE = "https://minhareceita.org";
const API_TIMEOUT_MS = 10000;

// Live fallback for recently-opened companies that are not yet in minhareceita's
// monthly "Dados Abertos CNPJ" dump (so minhareceita returns 404 for them even
// though the company is active at the Receita Federal). CNPJá's commercial API
// does live RFB lookups and covers these. Gated by the CNPJA_API_KEY secret —
// removing the secret instantly disables the fallback (reverts to old behavior).
const CNPJA_BASE = "https://api.cnpja.com";
const FALLBACK_TIMEOUT_MS = Number(Deno.env.get("FALLBACK_TIMEOUT_MS") ?? "15000");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

// ── CNPJ validation (check digits algorithm) ──

function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * weights1[i];
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[12]) !== digit1) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(digits[i]) * weights2[i];
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[13]) !== digit2) return false;

  return true;
}

function formatCNPJ(digits: string): string {
  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
}

// ── Map API size codes ──

function mapPorteToSize(porte: string | null | undefined): string {
  if (!porte) return "";
  const p = porte.toUpperCase();
  if (p.includes("MICRO") || p.includes("MEI")) return "1-10";
  if (p.includes("PEQUENO")) return "11-50";
  if (p.includes("MEDIO") || p.includes("MÉDIO")) return "51-200";
  if (p.includes("GRANDE")) return "201-500";
  return "";
}

// ── Shared address composition (keeps output identical across sources) ──

interface AddressParts {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  city: string;
  state: string;
  cep: string;
}

function composeAddress(p: AddressParts): string {
  return [
    p.logradouro,
    p.numero ? `${p.numero}` : "",
    p.complemento || "",
    p.bairro ? `- ${p.bairro}` : "",
    p.city ? `, ${p.city}/${p.state}` : "",
    p.cep ? `- CEP ${p.cep}` : "",
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

interface CnpjLookupData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  displayName: string;
  situacaoCadastral: string;
  codigoSituacaoCadastral: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  city: string;
  state: string;
  address: string;
  industry: string;
  size: string;
  porte: string;
}

// ── Map minhareceita response -> CnpjLookupData ──

// deno-lint-ignore no-explicit-any
function mapMinhaReceita(apiData: any, cnpjDigits: string): CnpjLookupData {
  const tipoLogradouro = apiData.descricao_tipo_de_logradouro || "";
  const logradouro = [tipoLogradouro, apiData.logradouro].filter(Boolean).join(" ");
  const nomeFantasia = apiData.nome_fantasia || "";
  const razaoSocial = apiData.razao_social || "";
  const cep = apiData.cep || "";
  const numero = apiData.numero || "";
  const complemento = apiData.complemento || "";
  const bairro = apiData.bairro || "";
  const city = apiData.municipio || "";
  const state = apiData.uf || "";

  return {
    cnpj: formatCNPJ(cnpjDigits),
    razaoSocial,
    nomeFantasia,
    displayName: nomeFantasia || razaoSocial,
    situacaoCadastral: apiData.descricao_situacao_cadastral || "",
    codigoSituacaoCadastral: apiData.situacao_cadastral || 0,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    city,
    state,
    address: composeAddress({ logradouro, numero, complemento, bairro, city, state, cep }),
    industry: apiData.cnae_fiscal_descricao || "",
    size: mapPorteToSize(apiData.porte),
    porte: apiData.porte || "",
  };
}

// ── Map CNPJá Office response -> CnpjLookupData ──
// Schema confirmed live: address.street already includes the street-type prefix
// ("Avenida Republica do Chile"); status.id is the numeric code (2 = Ativa).

// deno-lint-ignore no-explicit-any
function mapCnpjaOffice(office: any, cnpjDigits: string): CnpjLookupData {
  // minhareceita returns these fields UPPERCASE; CNPJá returns Title-case.
  // Normalize so company records look identical regardless of the source.
  const up = (s: string | null | undefined): string => (s || "").toUpperCase();
  const addr = office.address ?? {};
  const razaoSocial = up(office.company?.name);
  const nomeFantasia = up(office.alias);
  const logradouro = up(addr.street);
  const numero = addr.number || "";
  const complemento = up(addr.details);
  const bairro = up(addr.district);
  const city = up(addr.city);
  const state = (addr.state || "").toUpperCase();
  const cep = (addr.zip || "").replace(/\D/g, "");
  const porte = up(office.company?.size?.text);
  const codigoSituacaoCadastral = typeof office.status?.id === "number" ? office.status.id : 0;

  return {
    cnpj: formatCNPJ(cnpjDigits),
    razaoSocial,
    nomeFantasia,
    displayName: nomeFantasia || razaoSocial,
    situacaoCadastral: (office.status?.text || "").toUpperCase(),
    codigoSituacaoCadastral,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    city,
    state,
    address: composeAddress({ logradouro, numero, complemento, bairro, city, state, cep }),
    industry: office.mainActivity?.text || "",
    size: mapPorteToSize(porte),
    porte,
  };
}

type FallbackResult =
  | { kind: "ok"; data: CnpjLookupData }
  | { kind: "not_found" }
  | { kind: "unavailable" }
  | { kind: "disabled" };

// Called ONLY when minhareceita returns 404 (well-formed CNPJ absent from the
// monthly dump). CRITICAL: a fallback transport/HTTP error must NOT be reported
// as not_found — that would permanently block a legitimately-active recent
// company. Only a real 404 / empty payload means "genuinely does not exist".
async function fetchCnpjaFallback(cnpjDigits: string): Promise<FallbackResult> {
  const apiKey = Deno.env.get("CNPJA_API_KEY");
  if (!apiKey) return { kind: "disabled" };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FALLBACK_TIMEOUT_MS);

  try {
    // strategy=CACHE_IF_ERROR -> prefer a live RFB lookup (freshest data for a
    // brand-new company), fall back to cache only if the live lookup errors.
    const resp = await fetch(`${CNPJA_BASE}/office/${cnpjDigits}?strategy=CACHE_IF_ERROR`, {
      signal: controller.signal,
      headers: { "Authorization": apiKey, "Accept": "application/json" },
    });

    if (resp.status === 404) return { kind: "not_found" };
    // 401/402/403 (auth/credits), 429 (rate), 5xx, anything non-2xx -> retryable,
    // NEVER not_found.
    if (!resp.ok) return { kind: "unavailable" };

    const office = await resp.json();
    if (!office || !office.taxId) return { kind: "not_found" };

    return { kind: "ok", data: mapCnpjaOffice(office, cnpjDigits) };
  } catch (_e) {
    // abort/timeout/network/parse -> retryable, NOT not_found
    return { kind: "unavailable" };
  } finally {
    clearTimeout(timeoutId);
  }
}

function notFoundResponse(): Response {
  return new Response(
    JSON.stringify({ error: "not_found", message: "CNPJ nao encontrado na base da Receita Federal. Verifique o numero e tente novamente." }),
    { status: 404, headers: jsonHeaders }
  );
}

function apiUnavailableResponse(): Response {
  return new Response(
    JSON.stringify({ error: "api_unavailable", message: "O servico de consulta de CNPJ esta temporariamente indisponivel. Tente novamente em alguns minutos." }),
    { status: 503, headers: jsonHeaders }
  );
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { cnpj: rawCnpj } = await req.json();

    if (!rawCnpj) {
      return new Response(
        JSON.stringify({ error: "missing_cnpj", message: "CNPJ e obrigatorio." }),
        { status: 400, headers: jsonHeaders }
      );
    }

    // Strip non-digits
    const cnpjDigits = String(rawCnpj).replace(/\D/g, "");

    // Validate format locally
    if (!isValidCNPJ(cnpjDigits)) {
      return new Response(
        JSON.stringify({ error: "invalid_format", message: "CNPJ com formato invalido. Verifique os digitos." }),
        { status: 400, headers: jsonHeaders }
      );
    }

    // Check uniqueness in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const formattedCnpj = formatCNPJ(cnpjDigits);

    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("cnpj", formattedCnpj)
      .maybeSingle();

    if (existingCompany) {
      return new Response(
        JSON.stringify({
          error: "cnpj_in_use",
          message: "Este CNPJ ja esta vinculado a uma conta existente. Faca login ou entre em contato com o suporte.",
        }),
        { status: 409, headers: jsonHeaders }
      );
    }

    // Call Minha Receita API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    let apiResponse: Response;
    try {
      apiResponse = await fetch(`${MINHA_RECEITA_BASE}/${cnpjDigits}`, {
        signal: controller.signal,
        headers: { "Accept": "application/json" },
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const isAbort = fetchError instanceof DOMException && fetchError.name === "AbortError";
      return new Response(
        JSON.stringify({
          error: "api_unavailable",
          message: isAbort
            ? "O servico de consulta de CNPJ demorou demais para responder. Tente novamente em alguns minutos."
            : "O servico de consulta de CNPJ esta temporariamente indisponivel. Tente novamente em alguns minutos.",
        }),
        { status: 503, headers: jsonHeaders }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle API error codes
    if (apiResponse.status === 400) {
      return new Response(
        JSON.stringify({ error: "invalid_format", message: "CNPJ com formato invalido na base da Receita Federal." }),
        { status: 400, headers: jsonHeaders }
      );
    }

    if (apiResponse.status === 404) {
      // Recently-opened company gap: minhareceita's monthly dump does not have it
      // yet. Try the live fallback before concluding the CNPJ does not exist.
      const fb = await fetchCnpjaFallback(cnpjDigits);
      if (fb.kind === "ok") {
        return new Response(JSON.stringify({ success: true, data: fb.data }), {
          status: 200,
          headers: jsonHeaders,
        });
      }
      if (fb.kind === "unavailable") {
        return apiUnavailableResponse();
      }
      // "not_found" (both sources miss) or "disabled" (no fallback configured)
      return notFoundResponse();
    }

    if (apiResponse.status === 429) {
      return new Response(
        JSON.stringify({ error: "api_unavailable", message: "O servico de consulta esta temporariamente sobrecarregado. Tente novamente em alguns minutos." }),
        { status: 503, headers: jsonHeaders }
      );
    }

    if (!apiResponse.ok) {
      return new Response(
        JSON.stringify({ error: "api_unavailable", message: "O servico de consulta de CNPJ esta temporariamente indisponivel. Tente novamente em alguns minutos." }),
        { status: 503, headers: jsonHeaders }
      );
    }

    // Parse successful response and map to our format
    const apiData = await apiResponse.json();
    const result = { success: true, data: mapMinhaReceita(apiData, cnpjDigits) };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (err: unknown) {
    console.error("cnpj-lookup error:", err);
    return new Response(
      JSON.stringify({ error: "internal_error", message: "Erro interno ao processar a consulta." }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
