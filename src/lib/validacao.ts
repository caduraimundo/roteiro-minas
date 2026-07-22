export function apenasDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

export function formatarCPFInput(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 11);

  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function validarCPF(valor: string) {
  const cpf = apenasDigitos(valor);

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (base: string) => {
    let total = 0;
    let fator = base.length + 1;

    for (const digito of base) {
      total += parseInt(digito, 10) * fator;
      fator -= 1;
    }

    const resto = total % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const digito1 = calcularDigito(cpf.slice(0, 9));
  const digito2 = calcularDigito(cpf.slice(0, 9) + digito1);

  return cpf === cpf.slice(0, 9) + String(digito1) + String(digito2);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(valor: string) {
  return EMAIL_REGEX.test(valor.trim());
}

export function formatarTelefoneInput(valor: string) {
  const digitos = apenasDigitos(valor).slice(0, 11);

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 6) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  }
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export function validarTelefone(valor: string) {
  const digitos = apenasDigitos(valor);
  return digitos.length === 10 || digitos.length === 11;
}

export function validarCEP(valor: string) {
  return apenasDigitos(valor).length === 8;
}

const UFS_VALIDAS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

export function validarUF(valor: string) {
  return UFS_VALIDAS.has(valor.trim().toUpperCase());
}

/**
 * Só formato (YYYY-MM-DD, data real) e não estar no futuro - checagem de
 * maioridade ou faixa etária mínima não foi pedida, fica pra quando isso
 * virar exigência de fato.
 */
export function validarDataNascimento(valor: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

  const data = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(data.getTime())) return false;

  return data.getTime() <= Date.now();
}
