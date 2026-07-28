import { FotoPlaceholder } from "@/components/FotoPlaceholder";

// Sem fotos reais ainda (mesma decisão já registrada pro hero e pros
// cards - placeholder honesto em vez de foto de banco genérico). Grade
// do wireframe: foto principal grande + 3 fotos secundárias ao lado, no
// desktop (md:flex-row, coluna secundária com largura fixa). No mobile
// a coluna secundária de largura fixa não cabe - tudo empilha em coluna
// única (foto principal em cima, as 3 secundárias lado a lado embaixo).
const QUANTIDADE_SECUNDARIAS = 3;

export function GaleriaPlaceholder() {
  return (
    <div className="flex flex-col gap-3 md:h-[420px] md:flex-row">
      <FotoPlaceholder className="aspect-[4/3] w-full rounded-2xl md:aspect-auto md:h-full md:flex-1" />

      <div className="grid grid-cols-3 gap-3 md:flex md:w-60 md:shrink-0 md:flex-col">
        {Array.from({ length: QUANTIDADE_SECUNDARIAS }).map((_, indice) => (
          <FotoPlaceholder
            key={indice}
            className="aspect-square w-full rounded-2xl md:aspect-auto md:h-full md:flex-1"
          />
        ))}
      </div>
    </div>
  );
}
