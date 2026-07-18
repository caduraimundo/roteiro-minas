/**
 * Minúsculo, sem acento, espaços/símbolos viram hífen - mesmo padrão do
 * slug já usado no seed (ex: "Cachoeira do Tabuleiro - Bate-volta" →
 * "cachoeira-do-tabuleiro-bate-volta").
 */
export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
