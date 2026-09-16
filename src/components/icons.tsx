import type { Especie } from "@/lib/store";

type Props = { className?: string };

export function IconAgenda({ className = "h-5 w-5" }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} stroke="currentColor" className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
      <path d="M12 13v5M9.5 15.5h5" strokeLinecap="round" />
    </svg>
  );
}

export function IconHuella({ className = "h-5 w-5" }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} stroke="currentColor" className={className}>
      <ellipse cx="7" cy="8" rx="2" ry="2.6" />
      <ellipse cx="12" cy="6.4" rx="2" ry="2.8" />
      <ellipse cx="17" cy="8" rx="2" ry="2.6" />
      <path d="M12 11c3 0 5 2.2 5 4.6 0 2-1.6 3.4-3.4 3.4-1.1 0-1.1-.6-1.6-.6s-.5.6-1.6.6C8.6 19 7 17.6 7 15.6 7 13.2 9 11 12 11Z" />
    </svg>
  );
}

export function IconMas({ className = "h-5 w-5" }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.9} stroke="currentColor" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

function IconPerro({ className = "h-5 w-5" }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.5 6.5 4 11c0 1.4.7 2.3 1.6 2.9v3.4c0 1 .8 1.7 1.8 1.7h9.2c1 0 1.8-.7 1.8-1.7v-3.6c1-.7 1.6-1.7 1.6-3.1l-.5-4.1c-.1-.7-.9-1-1.4-.5l-2.2 2.2H8.1L5.9 6C5.4 5.5 4.6 5.8 4.5 6.5Z" />
      <path d="M9.5 12.5h.01M14.5 12.5h.01" />
      <path d="M12 15.2c-.7 0-1.2.4-1.2 1s.5 1 1.2 1 1.2-.4 1.2-1-.5-1-1.2-1Z" />
    </svg>
  );
}

function IconGato({ className = "h-5 w-5" }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.6 5.2 5 10.2c-.3.8-.4 1.6-.4 2.4 0 3.4 3.3 6 7.4 6s7.4-2.6 7.4-6c0-.8-.1-1.6-.4-2.4l.4-5c0-.6-.7-.9-1.1-.5l-3 2.7a10 10 0 0 0-3.3-.5c-1.2 0-2.3.2-3.3.5l-3-2.7c-.4-.4-1.1-.1-1.1.5Z" />
      <path d="M9.3 11.6h.01M14.7 11.6h.01" />
      <path d="M12 14.1v1.2M12 15.3c-.5.7-1.3 1-2.1.8M12 15.3c.5.7 1.3 1 2.1.8" />
      <path d="M4.9 13.9 2.6 13M4.9 15.6l-2.2.9M19.1 13.9l2.3-.9M19.1 15.6l2.2.9" />
    </svg>
  );
}

export function IconEspecie({ especie, className }: { especie: Especie; className?: string }) {
  return especie === "Gato" ? <IconGato className={className} /> : <IconPerro className={className} />;
}
