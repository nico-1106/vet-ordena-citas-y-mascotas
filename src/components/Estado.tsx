import { mensajeError } from "@/lib/db";

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <p className="card-soft p-6 text-center text-sm text-muted-foreground" role="status">
      {texto}
    </p>
  );
}

export function ErrorCarga({ error, reintentar }: { error: unknown; reintentar?: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-xl bg-destructive/10 px-4 py-4 text-sm font-medium text-destructive"
    >
      <p>{mensajeError(error)}</p>
      {reintentar && (
        <button type="button" onClick={reintentar} className="btn-outline mt-3 px-4 py-2 text-sm">
          Reintentar
        </button>
      )}
    </div>
  );
}
