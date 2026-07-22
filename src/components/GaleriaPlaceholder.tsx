import { FotoPlaceholder } from "@/components/FotoPlaceholder";

// Sem fotos reais ainda (mesma decisão já registrada pro hero e pros
// cards - placeholder honesto em vez de foto de banco genérico), então
// as "fotos" da galeria são o mesmo placeholder repetido, só pra
// reproduzir o formato de carrossel da referência.
const QUANTIDADE_SLIDES = 3;

export function GaleriaPlaceholder() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full snap-x snap-mandatory gap-0 overflow-x-auto rounded-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {Array.from({ length: QUANTIDADE_SLIDES }).map((_, indice) => (
          <FotoPlaceholder
            key={indice}
            className="h-64 w-full flex-none snap-center sm:h-80"
          />
        ))}
      </div>
      <div className="flex justify-center gap-1.5">
        {Array.from({ length: QUANTIDADE_SLIDES }).map((_, indice) => (
          <span
            key={indice}
            className={`h-1.5 rounded-full transition-all ${
              indice === 0
                ? "bg-terracota w-5"
                : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
