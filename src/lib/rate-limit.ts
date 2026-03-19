/**
 * Rate limiter em memória — bom para instância única.
 * Para produção multi-instância: substituir por @upstash/ratelimit + Redis.
 */

type Record = { count: number; resetAt: number };
const store = new Map<string, Record>();

/**
 * Retorna `true` se a requisição for permitida, `false` se bloqueada.
 * @param key       Identificador (ex: "login:email@x.com")
 * @param max       Máximo de tentativas na janela
 * @param windowMs  Tamanho da janela em ms
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const rec = store.get(key);

  if (!rec || now > rec.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (rec.count >= max) return false;

  rec.count++;
  return true;
}

/** Helper para validar e-mail com regex simples */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Escapa caracteres HTML para uso em templates de e-mail */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
