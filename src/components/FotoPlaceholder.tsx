export function FotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`bg-pedra-sabao text-verde-mata/60 flex items-center justify-center ${className ?? ""}`}
    >
      <span className="font-body text-sm">Foto em breve</span>
    </div>
  );
}
