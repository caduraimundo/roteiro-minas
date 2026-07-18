// Nome passado pra window.open() na página de login e usado como
// detector confiável de "isto é a pop-up de login" em qualquer arquivo
// que precise dessa checagem - window.name sobrevive à navegação
// cross-origin e não é afetado pelo Cross-Origin-Opener-Policy do Google
// (diferente de window.opener). Compartilhado pra não divergir entre
// arquivos.
export const NOME_JANELA_POPUP = "google-login";
