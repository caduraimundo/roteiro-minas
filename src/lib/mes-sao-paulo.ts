// Brasil não observa horário de verão desde 2019 - offset fixo de -03:00
// em todo o território, o que torna seguro calcular os limites do mês em
// America/Sao_Paulo sem biblioteca de timezone. Compartilhado entre
// /api/admin/relatorio e /api/admin/custos - mesmo critério de mês pros
// dois, não duplicar.
const OFFSET_SAO_PAULO_MS = 3 * 60 * 60 * 1000;

export function mesAtualSaoPaulo(): string {
  const agoraSp = new Date(Date.now() - OFFSET_SAO_PAULO_MS);
  const ano = agoraSp.getUTCFullYear();
  const mes = String(agoraSp.getUTCMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

export function hojeSaoPaulo(): string {
  const agoraSp = new Date(Date.now() - OFFSET_SAO_PAULO_MS);
  const ano = agoraSp.getUTCFullYear();
  const mes = String(agoraSp.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(agoraSp.getUTCDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function intervaloMesSaoPaulo(mes: string) {
  const [anoStr, mesStr] = mes.split("-");
  const ano = Number(anoStr);
  const mesNum = Number(mesStr);

  const inicio = new Date(Date.UTC(ano, mesNum - 1, 1, 3, 0, 0));
  const fim = new Date(Date.UTC(ano, mesNum, 1, 3, 0, 0));

  return { inicio, fim };
}

export function mesValido(mes: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(mes);
}

export function arredondar(valor: number) {
  return Math.round(valor * 100) / 100;
}
