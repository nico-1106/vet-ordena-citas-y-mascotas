import { useActualizarEstadoCita, mensajeError, type EstadoCita } from "@/lib/db";

export function EstadoCitaSelect({
  id,
  estado,
}: {
  id: number;
  estado: EstadoCita;
}) {
  const actualizar = useActualizarEstadoCita();

  return (
    <div className="flex flex-col gap-1">
      <select
        value={estado}
        disabled={actualizar.isPending}
        onChange={(e) =>
          actualizar.mutate({ id, estado: e.target.value as EstadoCita })
        }
        className="rounded-md border px-2 py-1 text-sm"
      >
        <option value="pendiente">Pendiente</option>
        <option value="atendida">Atendida</option>
        <option value="cancelada">Cancelada</option>
      </select>
      {actualizar.isError && (
        <span className="text-xs text-red-600">
          {mensajeError(actualizar.error)}
        </span>
      )}
    </div>
  );
}
