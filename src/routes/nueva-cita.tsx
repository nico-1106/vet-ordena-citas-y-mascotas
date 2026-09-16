import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import {
  useDatos,
  VETERINARIOS,
  HORAS,
  hoyISO,
  horaOcupada,
  crearCita,
  crearMascota,
  formatoFecha,
  type Especie,
} from "@/lib/store";

type Busqueda = { mascota?: string };

export const Route = createFileRoute("/nueva-cita")({
  validateSearch: (search: Record<string, unknown>): Busqueda => ({
    mascota: typeof search['mascota'] === "string" ? (search['mascota'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Nueva cita | VetOrdena" },
      {
        name: "description",
        content:
          "Agenda una cita veterinaria eligiendo mascota, veterinario, fecha y hora, con alerta si el horario ya está ocupado.",
      },
      { property: "og:title", content: "Nueva cita | VetOrdena" },
      {
        property: "og:description",
        content: "Agenda citas sin cruces de horario para cada veterinario.",
      },
    ],
  }),
  component: NuevaCita,
});

function NuevaCita() {
  const { mascotas } = useDatos();
  const { mascota: mascotaInicial } = useSearch({ from: "/nueva-cita" });
  const navigate = useNavigate();

  const [modo, setModo] = useState<"existente" | "nueva">("existente");
  const [mascotaId, setMascotaId] = useState(mascotaInicial ?? mascotas[0]?.id ?? "");
  const [nueva, setNueva] = useState({
    nombre: "",
    especie: "Perro" as Especie,
    raza: "",
    nacimiento: "",
    dueno: "",
    telefono: "",
  });
  const [veterinario, setVeterinario] = useState(VETERINARIOS[0]!);
  const [fecha, setFecha] = useState(hoyISO());
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const choque = hora ? horaOcupada(veterinario, fecha, hora) : undefined;
  const mascotaChoque = choque ? mascotas.find((m) => m.id === choque.mascotaId) : undefined;

  function ocupada(h: string) {
    return Boolean(horaOcupada(veterinario, fecha, h));
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!hora) return setError("Selecciona la hora de la cita.");
    if (choque)
      return setError(
        `${veterinario} ya tiene una cita a las ${hora} el ${formatoFecha(fecha)}. Elige otra hora u otro veterinario.`,
      );
    if (!motivo.trim()) return setError("Escribe el motivo de la consulta.");

    let id = mascotaId;
    if (modo === "nueva") {
      if (!nueva.nombre.trim() || !nueva.dueno.trim())
        return setError("Escribe el nombre de la mascota y del dueño.");
      id = crearMascota({
        nombre: nueva.nombre.trim(),
        especie: nueva.especie,
        raza: nueva.raza.trim() || "Criollo",
        nacimiento: nueva.nacimiento || hoyISO(),
        sexo: "Macho",
        peso: "—",
        dueno: nueva.dueno.trim(),
        telefono: nueva.telefono.trim(),
      });
    } else if (!id) {
      return setError("Selecciona una mascota.");
    }

    crearCita({ mascotaId: id, veterinario, fecha, hora, motivo: motivo.trim() });
    setOk(true);
    setTimeout(() => navigate({ to: "/" }), 900);
  }

  const campo =
    "w-full rounded-xl border border-input bg-card px-4 py-3 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";
  const etiqueta = "mb-1.5 block text-sm font-bold text-secondary-foreground";

  return (
    <Layout>
      <h1 className="text-2xl font-extrabold">Nueva cita</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Agenda una consulta y evita cruces de horario.
      </p>

      <form onSubmit={guardar} className="mt-4 space-y-4">
        <section className="card-soft p-4">
          <p className={etiqueta}>Mascota</p>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {(["existente", "nueva"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModo(m)}
                className={`${modo === m ? "btn-primary" : "btn-outline"} px-3 py-3 text-sm`}
              >
                {m === "existente" ? "Ya está registrada" : "Registrar nueva"}
              </button>
            ))}
          </div>

          {modo === "existente" ? (
            <select
              value={mascotaId}
              onChange={(e) => setMascotaId(e.target.value)}
              className={campo}
            >
              {mascotas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} — {m.dueno}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-3">
              <input
                className={campo}
                placeholder="Nombre de la mascota"
                value={nueva.nombre}
                onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })}
              />
              <select
                className={campo}
                value={nueva.especie}
                onChange={(e) => setNueva({ ...nueva, especie: e.target.value as Especie })}
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>
              <input
                className={campo}
                placeholder="Raza"
                value={nueva.raza}
                onChange={(e) => setNueva({ ...nueva, raza: e.target.value })}
              />
              <div>
                <span className={etiqueta}>Fecha de nacimiento</span>
                <input
                  type="date"
                  className={campo}
                  value={nueva.nacimiento}
                  onChange={(e) => setNueva({ ...nueva, nacimiento: e.target.value })}
                />
              </div>
              <input
                className={campo}
                placeholder="Nombre del dueño"
                value={nueva.dueno}
                onChange={(e) => setNueva({ ...nueva, dueno: e.target.value })}
              />
              <input
                className={campo}
                placeholder="Celular del dueño"
                value={nueva.telefono}
                onChange={(e) => setNueva({ ...nueva, telefono: e.target.value })}
              />
            </div>
          )}
        </section>

        <section className="card-soft space-y-4 p-4">
          <div>
            <label className={etiqueta} htmlFor="vet">Veterinario</label>
            <select
              id="vet"
              className={campo}
              value={veterinario}
              onChange={(e) => setVeterinario(e.target.value)}
            >
              {VETERINARIOS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={etiqueta} htmlFor="fecha">Fecha</label>
            <input
              id="fecha"
              type="date"
              className={campo}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div>
            <p className={etiqueta}>Hora</p>
            <div className="grid grid-cols-4 gap-2">
              {HORAS.map((h) => {
                const libre = !ocupada(h);
                const sel = hora === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHora(h)}
                    className={`rounded-lg px-1 py-3 text-sm font-bold transition-colors ${
                      sel
                        ? "btn-primary"
                        : libre
                          ? "btn-outline"
                          : "border border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Las horas en rojo ya están ocupadas para {veterinario}.
            </p>
          </div>

          <div>
            <label className={etiqueta} htmlFor="motivo">Motivo de la consulta</label>
            <textarea
              id="motivo"
              rows={3}
              className={campo}
              placeholder="Ej: vacunación anual, control de peso, revisión de piel…"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
        </section>

        {choque && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            ⚠️ Hora ocupada: {veterinario} ya atiende a {mascotaChoque?.nombre ?? "otra mascota"} a
            las {hora} el {formatoFecha(fecha)}.
          </p>
        )}

        {error && !choque && (
          <p className="rounded-xl bg-warning-soft px-4 py-3 text-sm font-semibold text-warning">
            {error}
          </p>
        )}

        {ok && (
          <p className="rounded-xl bg-success-soft px-4 py-3 text-sm font-semibold text-success">
            ✅ ¡Cita agendada! Te llevamos a la agenda…
          </p>
        )}

        <button type="submit" className="btn-primary w-full px-5 py-4 text-lg">
          Guardar cita
        </button>
      </form>
    </Layout>
  );
}
