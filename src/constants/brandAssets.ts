/**
 * Brand Assets — URLs públicas das logos no Supabase Storage (bucket: brand-assets)
 * Bucket criado em: sql/migrations/032_create_brand_assets_bucket.sql
 *
 * Uso:
 *   import { BRAND_ASSETS } from '@/constants/brandAssets';
 *   <img src={BRAND_ASSETS.logoHorizontalColor} alt="RecrutaRS" />
 */

const BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/brand-assets/logos`;

export const BRAND_ASSETS = {
  /** Logo horizontal com ícone + texto, versão colorida (navy + cyan) */
  logoHorizontalColor: `${BASE}/logo-horizontal-color.png`,

  /** Logo horizontal, versão monocromática (preto e cinza) */
  logoHorizontalMono: `${BASE}/logo-horizontal-mono.png`,

  /** Logo horizontal, versão monocromática clara (cinza claro) */
  logoHorizontalMonoLight: `${BASE}/logo-horizontal-mono-light.png`,

  /** Logo vertical (ícone sobre texto), versão colorida */
  logoVerticalColor: `${BASE}/logo-vertical-color.png`,

  /** Logo vertical, versão monocromática */
  logoVerticalMono: `${BASE}/logo-vertical-mono.png`,

  /** Logo vertical, versão monocromática clara */
  logoVerticalMonoLight: `${BASE}/logo-vertical-mono-light.png`,

  /** Ícone isolado (sem texto), versão colorida */
  logoIconColor: `${BASE}/logo-icon-color.png`,

  /** Ícone isolado, versão monocromática */
  logoIconMono: `${BASE}/logo-icon-mono.png`,

  /** Ícone isolado, versão monocromática clara */
  logoIconMonoLight: `${BASE}/logo-icon-mono-light.png`,

  /** Imagem artística de pessoas/rede — uso em banners e hero sections */
  brandPeopleNetwork: `${BASE}/brand-people-network.jpg`,
} as const;

export type BrandAssetKey = keyof typeof BRAND_ASSETS;
