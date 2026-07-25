export function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarData(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Versão curta (dd/mm) pra contextos compactos - cards e tabelas do
 * admin. `data` vem sempre como "AAAA-MM-DD" (coluna date do
 * Postgres), parseado por string em vez de Date pra não depender de
 * fuso só pra extrair dia/mês.
 */
export function formatarDataCurta(data: string) {
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}

/**
 * CPF é salvo no banco como 11 dígitos crus, sem pontuação
 * (confirmado via SQL antes de escrever isso). Mascara tudo exceto os
 * últimos 4 dígitos, depois aplica a pontuação padrão (XXX.XXX.XXX-XX)
 * sobre a string já mascarada - não tenta alinhar a máscara com os
 * grupos do CPF, só limita o que fica visível.
 */
export function mascararCpf(cpf: string) {
  if (cpf.length !== 11) {
    return "*".repeat(Math.max(cpf.length - 4, 0)) + cpf.slice(-4);
  }

  const mascarado = "*".repeat(7) + cpf.slice(-4);
  return `${mascarado.slice(0, 3)}.${mascarado.slice(3, 6)}.${mascarado.slice(6, 9)}-${mascarado.slice(9, 11)}`;
}
