/**
 * Application constants
 * PRD-003: Header e Footer com Glassmorphism
 * PRD-044: Pagina "Sobre" e Tooltip de Versao
 */

export const APP_VERSION = "1.31.1";
export const APP_CODENAME = "Insight";
export const APP_NAME = "RecrutaRS";
export const APP_COMPANY = "AILA - Sistemas Inteligentes";
export const APP_COMPANY_URL = "https://ailainteligente.com";

/**
 * Retorna a URL base canônica da aplicação.
 * Usa VITE_APP_URL (variável de ambiente) se definida,
 * caso contrário usa o origin atual do browser.
 */
export function getAppBaseUrl(): string {
  return (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, '') || window.location.origin;
}
