// Textura de fundo estilo curva de nível (linhas finas em ocre) - base do
// design system, ainda não aplicada em nenhuma tela (Home/Agenda/Detalhe/
// Checkout ficam pros próximos cards). Server Component puro: o padrão vai
// embutido como SVG num data URI de background-image, sem <pattern> vivo
// no DOM (evita colisão de id se o componente for usado mais de uma vez
// na mesma página) e sem JS no client.
//
// Hex duplicado do token --color-ocre (globals.css) de propósito - um SVG
// em data URI não consegue ler custom properties da página de forma
// confiável entre navegadores. Se o tom de ocre mudar, atualizar os dois
// lugares.
const OCRE = "#E7A15C";

const SVG_CURVA_DE_NIVEL = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="140">
    <path d="M0 70 Q 55 10 110 70 T 220 70" fill="none" stroke="${OCRE}" stroke-width="1" opacity="0.35" />
    <path d="M0 105 Q 55 45 110 105 T 220 105" fill="none" stroke="${OCRE}" stroke-width="1" opacity="0.25" />
    <path d="M0 35 Q 55 -25 110 35 T 220 35" fill="none" stroke="${OCRE}" stroke-width="1" opacity="0.2" />
  </svg>`,
);

const BACKGROUND_CURVA_DE_NIVEL = `url("data:image/svg+xml,${SVG_CURVA_DE_NIVEL}")`;

/**
 * Textura decorativa de curvas de nível, em ocre, opacidade baixa - não
 * deve competir com texto por cima. Duas variantes:
 * - "fundo": preenche o container pai (precisa de `relative` no pai,
 *   já que esse componente é `absolute inset-0`) - uso pretendido: hero.
 * - "divisor": faixa fina (altura fixa), pra usar entre seções.
 *
 * `aria-hidden` porque é puramente decorativo - não deve ser anunciado
 * por leitor de tela nem atrapalhar a ordem de foco/leitura.
 */
export function TexturaTopografica({
  variant = "fundo",
  className = "",
}: {
  variant?: "fundo" | "divisor";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 w-full bg-repeat ${
        variant === "divisor" ? "h-16" : "h-full"
      } ${className}`}
      style={{ backgroundImage: BACKGROUND_CURVA_DE_NIVEL }}
    />
  );
}
