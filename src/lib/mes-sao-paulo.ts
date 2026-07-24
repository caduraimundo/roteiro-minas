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

// Semana atual (segunda a domingo) em America/Sao_Paulo - mesmo padrão
// de offset fixo -03:00 usado no resto do arquivo. `fim` é exclusivo
// (início da segunda seguinte), pra combinar com `.lt("created_at", ...)`
// do mesmo jeito que intervaloMesSaoPaulo.
export function intervaloSemanaSaoPaulo() {
  const agoraSp = new Date(Date.now() - OFFSET_SAO_PAULO_MS);
  const diaDaSemana = agoraSp.getUTCDay(); // 0 (domingo) .. 6 (sábado)
  const diasDesdeSegunda = diaDaSemana === 0 ? 6 : diaDaSemana - 1;

  const inicio = new Date(
    Date.UTC(
      agoraSp.getUTCFullYear(),
      agoraSp.getUTCMonth(),
      agoraSp.getUTCDate() - diasDesdeSegunda,
      3,
      0,
      0,
    ),
  );
  const fim = new Date(inicio.getTime() + 7 * 24 * 60 * 60 * 1000);

  return { inicio, fim };
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
