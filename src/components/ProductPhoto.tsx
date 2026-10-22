import Image from "next/image";
import { YarnMark } from "./icons";

/**
 * Foto de uma peça. Sem foto cadastrada, mostra um quadro com a logo no lugar
 * (a Suh pode cadastrar a peça e enviar a foto depois).
 * Precisa estar dentro de um elemento com `position: relative` e tamanho definido.
 */
export default function ProductPhoto({
  src,
  alt,
  sizes,
  priority,
  className = "object-cover",
  compact,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Miniatura pequena (lista do painel): só a logo, sem texto. */
  compact?: boolean;
}) {
  if (src) return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;

  return (
    <div
      role="img"
      aria-label={`${alt} (foto em breve)`}
      className="bg-pontinhos absolute inset-0 flex flex-col items-center justify-center gap-2 bg-palha text-center"
    >
      <YarnMark className={compact ? "size-8 opacity-70" : "size-14 opacity-80"} />
      {!compact && <span className="font-hand text-xl text-cafe">foto em breve</span>}
    </div>
  );
}
