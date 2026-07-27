// Textura de fundo estilo curva de nível (linhas finas em verde-mata) -
// base do design system. Server Component puro: o padrão vai embutido
// como SVG num data URI de background-image, sem <pattern> vivo no DOM
// (evita colisão de id se o componente for usado mais de uma vez na
// mesma página) e sem JS no client.
//
// Hex duplicado do token --color-verde-mata (globals.css) de propósito
// - um SVG em data URI não consegue ler custom properties da página de
// forma confiável entre navegadores. Se o tom de verde-mata mudar,
// atualizar os dois lugares.
//
// Cor trocada de um fallback verde-claro (#C3CEBD) escolhido numa sessão
// anterior por causa do baixo contraste do ocre no branco - na prática
// ficou estranho, sem relação com a paleta. Verde-mata (#5E6E4F) já é a
// cor de marca usada em headings/texto por todo o site, então a linha
// decorativa lê como um traço discreto da marca em vez de uma cor solta
// - contraste ok tanto no branco quanto no overlay escuro do hero
// (único uso variant="fundo").
const VERDE_MATA = "#5E6E4F";

const SVG_CURVA_DE_NIVEL = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="140">
    <path d="M0 70 Q 55 10 110 70 T 220 70" fill="none" stroke="${VERDE_MATA}" stroke-width="1" opacity="0.35" />
    <path d="M0 105 Q 55 45 110 105 T 220 105" fill="none" stroke="${VERDE_MATA}" stroke-width="1" opacity="0.25" />
    <path d="M0 35 Q 55 -25 110 35 T 220 35" fill="none" stroke="${VERDE_MATA}" stroke-width="1" opacity="0.2" />
  </svg>`,
);

// Tile baixo (48px de altura, uma curva só) pensado pra caber sem cortar
// nos wrappers finos usados como divisor entre seções (h-12 = 48px) -
// o tile de 140px da variante "fundo" era alto demais pra esse uso e
// ficava cortado, misturando pedaços de duas ondas na faixa fina.
const SVG_CURVA_DIVISOR = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="48">
    <path d="M0 24 Q 40 4 80 24 T 160 24" fill="none" stroke="${VERDE_MATA}" stroke-width="1" opacity="0.3" />
  </svg>`,
);

const BACKGROUND_CURVA_DE_NIVEL = `url("data:image/svg+xml,${SVG_CURVA_DE_NIVEL}")`;
const BACKGROUND_CURVA_DIVISOR = `url("data:image/svg+xml,${SVG_CURVA_DIVISOR}")`;

/**
 * Textura decorativa de curvas de nível, em verde-mata, opacidade baixa
 * - não deve competir com texto por cima. `absolute inset-0` sem altura
 * própria em nenhuma variante - acompanha exatamente a altura que o
 * container pai (`relative`) definir, nunca descasa de tamanho com ele
 * (antes a variante "divisor" forçava h-16 fixo nela mesma, estourando
 * containers menores como h-12 usados em várias páginas).
 * - "fundo": tile de 220x140 (três curvas) - preenche o container pai
 *   por completo - uso pretendido: hero.
 * - "divisor": tile de 160x48 (uma curva só, baixa) - pensado pra um
 *   wrapper baixo (faixa fina, ~48px) entre seções - o tile de "fundo"
 *   cortava e misturava ondas nessa altura. A altura real em ambas
 *   variantes vem sempre do wrapper, o SVG só muda de proporção.
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
      className={`pointer-events-none absolute inset-0 h-full w-full bg-repeat ${className}`}
      style={{
        backgroundImage:
          variant === "divisor"
            ? BACKGROUND_CURVA_DIVISOR
            : BACKGROUND_CURVA_DE_NIVEL,
      }}
    />
  );
}
