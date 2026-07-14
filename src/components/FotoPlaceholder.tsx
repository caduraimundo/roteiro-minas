export function FotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 ${className ?? ""}`}
    >
      <span className="text-sm">Foto em breve</span>
    </div>
  );
}
