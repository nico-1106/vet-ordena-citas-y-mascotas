import { useState, type FormEvent } from "react";
import { consultarAsistenteIA } from "@/lib/ai";

export function AsistenteIA() {
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!pregunta.trim()) return;
    setCargando(true);
    setError(null);
    setRespuesta("");
    try {
      setRespuesta(await consultarAsistenteIA(pregunta.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="card-soft mt-8 p-4">
      <h2 className="mb-3 text-lg font-bold">Asistente de VetOrdena</h2>
      <form onSubmit={enviar} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder="Ej: ¿Qué citas pendientes hay hoy?"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={cargando}
          className="btn-primary px-5 py-2 text-base"
        >
          {cargando ? "Consultando…" : "Preguntar"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {respuesta && (
        <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">{respuesta}</p>
      )}
    </section>
  );
}
