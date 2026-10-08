
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import {
  VETERINARIOS,
  HORAS,
  hoyISO,
  formatoFecha,
  type Especie,
} from "@/lib/store";
import {
  useMascotas,
  useCitasDelDia,
  useCrearCita,
  mensajeError,
} from "@/lib/db";

type Busqueda = { mascota?: string | undefined };

export const Route = createFileRoute("/nueva-cita")({
  validateSearch: (search: Record<string, unknown>): Busqueda => ({
    mascota:
      typeof search["mascota"] === "string"
        ? (search["mascota"] as string)
        : undefined,
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
  const { mascota: mascotaInicial } = useSearch({
    from: "/nueva-cita",
  });
  const navigate = useNavigate();

  const [modo, setModo] = useState<"existente" | "nueva">("existente");
  const [mascotaId, setMascotaId] = useState(mascotaInicial ?? "");

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

  const {
    data: mascotas = [],
    isLoading: cargandoMascotas,
    error: errorMascotas,
    refetch: reintentarMascotas,
  } = useMascotas();

  const {
    data: citasDia = [],
    isLoading: cargandoCitas,
    error: errorCitas,
    refetch: reintentarCitas,
  } = useCitasDelDia(fecha);

  const crearCitaDB = useCrearCita();

  useEffect(() => {
    if (
      mascotaInicial &&
      mascotas.some((m) => m.id === mascotaInicial)
    ) {
      setMascotaId(mascotaInicial);
    } else if (
      !mascotaId &&
      mascotas.length > 0
    ) {
      setMascotaId(mascotas[0].id);
    }
  }, [mascotaInicial, mascotaId, mascotas]);

  const choque = hora
    ? citasDia.find(
        (c) =>
          c.veterinario === veterinario &&
          c.hora === hora,
      )
    : undefined;

  const mascotaChoque = choque?.mascotas ?? undefined;

  function ocupada(h: string) {
    return citasDia.some(
      (c) =>
        c.veterinario === veterinario &&
        c.hora === h,
    );
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk(false);

    if (cargandoMascotas || cargandoCitas) {
      setError("Espera mientras cargamos los datos.");
      return;
    }

    if (errorMascotas || errorCitas) {
      setError(
        "No pudimos cargar los datos. Usa el botón Reintentar e inténtalo de nuevo.",
      );
      return;
    }

    if (!hora) {
      setError("Selecciona la hora de la cita.");
      return;
    }

    if (choque) {
      setError(
        `${veterinario} ya tiene una cita a las ${hora} el ${formatoFecha(fecha)}. Elige otra hora u otro veterinario.`,
      );
      return;
    }

    if (!motivo.trim()) {
      setError("Escribe el motivo de la consulta.");
      return;
    }

    if (modo === "existente" && !mascotaId) {
      setError("Selecciona una mascota.");
      return;
    }

    if (
      modo === "nueva" &&
      (!nueva.nombre.trim() || !nueva.dueno.trim())
    ) {
      setError("Escribe el nombre de la mascota y del dueño.");
      return;
    }

    try {
      await crearCitaDB.mutateAsync({
        mascotaId:
          modo === "existente" ? mascotaId : undefined,

        nuevaMascota:
          modo === "nueva"
            ? {
                nombre: nueva.nombre.trim(),
                especie: nueva.especie,
                raza: nueva.raza.trim() || null,
                dueno_nombre: nueva.dueno.trim(),
                dueno_telefono: nueva.telefono.trim() || null,
              }
            : undefined,

        veterinario,
        fecha,
        hora,
        motivo: motivo.trim(),
      });

      setOk(true);
      setTimeout(() => navigate({ to: "/" }), 900);
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  const campo =
    "w-full rounded-xl border border-input bg-card px-4 py-3 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

  const etiqueta =
    "mb-1.5 block text-sm font-bold text-secondary-foreground";

  const errorCarga = errorMascotas || errorCitas;

  return (
    <Layout>
      <h1 className="text-2xl font-extrabold">Nueva cita</h1>

      <p className="mt-1 text-sm text-muted-foreground">
        Agenda una consulta y evita cruces de horario.
      </p>

      {errorCarga && (
        <div
          className="mt-4 rounded-xl bg-warning-soft px-4 py-3 text-sm"
          role="alert"
        >
          <p className="font-semibold">
            {mensajeError(errorMascotas ?? errorCitas)}
          </p>

          <button
            type="button"
            className="btn-outline mt-2 px-3 py-2 text-sm"
            onClick={() => {
              void reintentarMascotas();
              void reintentarCitas();
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      <form onSubmit={guardar} className="mt-4 space-y-4">
        <section className="card-soft p-4">
          <p className={etiqueta}>Mascota</p>

          <div className="mb-3 grid grid-cols-2 gap-2">
            {(["existente", "nueva"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setModo(m);
                  setError("");
                }}
                className={`${
                  modo === m ? "btn-primary" : "btn-outline"
                } px-3 py-3 text-sm`}
              >
                {m === "existente"
                  ? "Ya está registrada"
                  : "Registrar nueva"}
              </button>
            ))}
          </div>

          {modo === "existente" ? (
            <>
              {cargandoMascotas ? (
                <p className="text-sm text-muted-foreground">
                  Cargando mascotas...
                </p>
              ) : mascotas.length === 0 && !errorMascotas ? (
                <p className="text-sm text-muted-foreground">
                  No hay mascotas registradas. Selecciona
                  «Registrar nueva» para agregar una.
                </p>
              ) : (
                <select
                  value={mascotaId}
                  onChange={(e) => setMascotaId(e.target.value)}
                  className={campo}
                  disabled={Boolean(errorMascotas)}
                >
                  <option value="">Selecciona una mascota</option>

                  {mascotas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} —{" "}
                      {m.dueno_nombre ?? "Dueño sin registrar"}
                    </option>
                  ))}
                </select>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <input
                className={campo}
                placeholder="Nombre de la mascota"
                value={nueva.nombre}
                onChange={(e) =>
                  setNueva({ ...nueva, nombre: e.target.value })
                }
                required
              />

              <select
                className={campo}
                value={nueva.especie}
                onChange={(e) =>
                  setNueva({
                    ...nueva,
                    especie: e.target.value as Especie,
                  })
                }
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>

              <input
                className={campo}
                placeholder="Raza"
                value={nueva.raza}
                onChange={(e) =>
                  setNueva({ ...nueva, raza: e.target.value })
                }
              />

              <div>
                <label className={etiqueta} htmlFor="nacimiento">
                  Fecha de nacimiento
                </label>
                <input
                  id="nacimiento"
                  type="date"
                  className={campo}
                  value={nueva.nacimiento}
                  onChange={(e) =>
                    setNueva({
                      ...nueva,
                      nacimiento: e.target.value,
                    })
                  }
                />
              </div>

              <input
                className={campo}
                placeholder="Nombre del dueño"
                value={nueva.dueno}
                onChange={(e) =>
                  setNueva({ ...nueva, dueno: e.target.value })
                }
                required
              />

              <input
                className={campo}
                type="tel"
                placeholder="Celular del dueño"
                value={nueva.telefono}
                onChange={(e) =>
                  setNueva({
                    ...nueva,
                    telefono: e.target.value,
                  })
                }
              />
            </div>
          )}
        </section>

        <section className="card-soft space-y-4 p-4">
          <div>
            <label className={etiqueta} htmlFor="vet">
              Veterinario
            </label>

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
            <label className={etiqueta} htmlFor="fecha">
              Fecha
            </label>

            <input
              id="fecha"
              type="date"
              className={campo}
              value={fecha}
              onChange={(e) => {
                setFecha(e.target.value);
                setHora("");
                setError("");
              }}
              required
            />
          </div>

          <div>
            <p className={etiqueta}>Hora</p>

            {cargandoCitas ? (
              <p className="text-sm text-muted-foreground">
                Consultando horarios...
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {HORAS.map((h) => {
                  const libre = !ocupada(h);
                  const sel = hora === h;

                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={Boolean(errorCitas)}
                      onClick={() => {
                        setHora(h);
                        setError("");
                      }}
                      aria-pressed={sel}
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
            )}

            <p className="mt-2 text-xs text-muted-foreground">
              Las horas en rojo ya están ocupadas para {veterinario}.
            </p>
          </div>

          <div>
            <label className={etiqueta} htmlFor="motivo">
              Motivo de la consulta
            </label>

            <textarea
              id="motivo"
              rows={3}
              className={campo}
              placeholder="Ej: vacunación anual, control de peso, revisión de piel…"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>
        </section>

        {choque && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            ⚠️ Hora ocupada: {veterinario} ya atiende a{" "}
            {mascotaChoque?.nombre ?? "otra mascota"} a las {hora} el{" "}
            {formatoFecha(fecha)}.
          </p>
        )}

        {error && (
          <p
            className="rounded-xl bg-warning-soft px-4 py-3 text-sm font-semibold text-warning"
            role="alert"
          >
            {error}
          </p>
        )}

        {ok && (
          <p className="rounded-xl bg-success-soft px-4 py-3 text-sm font-semibold text-success">
            ¡Cita agendada! Te llevamos a la agenda…
          </p>
        )}

        <button
          type="submit"
          disabled={
            crearCitaDB.isPending ||
            cargandoMascotas ||
            cargandoCitas ||
            Boolean(errorMascotas) ||
            Boolean(errorCitas) ||
            ok
          }
          className="btn-primary w-full px-5 py-4 text-lg disabled:opacity-50"
        >
          {crearCitaDB.isPending
            ? "Guardando cita..."
            : "Guardar cita"}
        </button>
      </form>
    </Layout>
  );
}
