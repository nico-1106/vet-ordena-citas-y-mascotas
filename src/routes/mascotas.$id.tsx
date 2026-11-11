import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, type FormEvent } from "react"; // CAMBIO: se agregó FormEvent
import { Layout } from "@/components/Layout";
import { IconEspecie } from "@/components/icons";
import { Cargando, ErrorCarga } from "@/components/Estado";
import { formatoFecha, hoyISO } from "@/lib/store";
import {
  useMascota,
  useCitasDeMascota,
  useTratamientosDeMascota, // NUEVO
  useCrearTratamiento, // NUEVO
  mensajeError, // NUEVO
  especieUI,
} from "@/lib/db";

export const Route = createFileRoute("/mascotas/$id")({
  head: () => ({
    meta: [
      { title: "Historia clínica de la mascota | VetOrdena" },
      {
        name: "description",
        content:
          "Datos básicos, historial de tratamientos, vacunas aplicadas y fecha de la próxima vacuna.",
      },
      { property: "og:title", content: "Historia clínica de la mascota | VetOrdena" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        property: "og:description",
        content: "Consulta tratamientos y vacunas de cada mascota del consultorio.",
      },
    ],
  }),
  component: Detalle,
});

function Detalle() {
  const { id } = useParams({ from: "/mascotas/$id" });
  const qm = useMascota(id);
  const qc = useCitasDeMascota(id);

  // NUEVO: tratamientos y formulario (los hooks van aquí arriba, antes de los return)
  const qt = useTratamientosDeMascota(id);
  const crear = useCrearTratamiento();
  const [formAbierto, setFormAbierto] = useState(false);
  const [tipo, setTipo] = useState<"vacuna" | "tratamiento">("vacuna");
  const [nombre, setNombre] = useState("");
  const [fechaTrat, setFechaTrat] = useState(hoyISO());
  const [proxima, setProxima] = useState("");
  const [notas, setNotas] = useState("");
  const [errorForm, setErrorForm] = useState<string | null>(null);

  if (qm.isPending) return <Layout><Cargando texto="Cargando mascota…" /></Layout>;
  if (qm.isError)
    return <Layout><ErrorCarga error={qm.error} reintentar={() => qm.refetch()} /></Layout>;

  const m = qm.data;
  if (!m) {
    return (
      <Layout>
        <p className="card-soft p-6 text-center text-sm text-muted-foreground">
          No encontramos esta mascota.{" "}
          <Link to="/mascotas" className="font-bold text-primary">
            Ver todas
          </Link>
        </p>
      </Layout>
    );
  }

  const hoy = hoyISO();
  const citas = qc.data ?? [];
  const proximas = citas.filter((c) => c.fecha >= hoy).reverse();
  const pasadas = citas.filter((c) => c.fecha < hoy);
  const sinDato = "Sin registrar";

  // NUEVO: lista de tratamientos y próxima vacuna
  const tratamientos = qt.data ?? [];
  const proximaVacuna = tratamientos
    .filter((t) => t.tipo === "vacuna" && t.proxima_fecha && t.proxima_fecha >= hoy)
    .sort((a, b) => a.proxima_fecha!.localeCompare(b.proxima_fecha!))[0];
  const hayVacunas = tratamientos.some((t) => t.tipo === "vacuna");

  // NUEVO: guardar el tratamiento
  function guardar(e: FormEvent) {
    e.preventDefault();
    setErrorForm(null);

    if (!nombre.trim()) {
      setErrorForm("Escribe el nombre de la vacuna o del tratamiento.");
      return;
    }
    if (!fechaTrat) {
      setErrorForm("Elige la fecha en que se aplicó.");
      return;
    }
    if (proxima && proxima < fechaTrat) {
      setErrorForm("La próxima fecha no puede ser anterior a la fecha de aplicación.");
      return;
    }

    crear.mutate(
      {
        mascota_id: id,
        tipo,
        nombre: nombre.trim(),
        fecha: fechaTrat,
        notas: notas.trim() || null,
        proxima_fecha: proxima || null,
      },
      {
        onSuccess: () => {
          setNombre("");
          setNotas("");
          setProxima("");
          setFechaTrat(hoyISO());
          setFormAbierto(false);
        },
        onError: (err) => setErrorForm(mensajeError(err)),
      },
    );
  }

  const campo =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

  return (
    <Layout>
      <Link to="/mascotas" className="text-sm font-bold text-primary">
        ← Volver a mascotas
      </Link>

      <section className="card-soft mt-3 p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
            <IconEspecie especie={especieUI(m.especie)} className="h-8 w-8" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold">{m.nombre}</h1>
            <p className="text-sm text-muted-foreground">
              {m.especie ?? "Especie sin registrar"} · {m.raza || "Raza sin registrar"}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {[
            { k: "Dueño", v: m.dueno_nombre || sinDato },
            { k: "Celular", v: m.dueno_telefono || sinDato },
            { k: "Registrada", v: formatoFecha(m.created_at.slice(0, 10)) },
            { k: "Edad / peso", v: sinDato },
          ].map((d) => (
            <div key={d.k} className="rounded-lg bg-muted px-3 py-2">
              <dt className="text-muted-foreground">{d.k}</dt>
              <dd className="font-bold">{d.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          to="/nueva-cita"
          search={{ mascota: m.id }}
          className="btn-primary flex items-center justify-center px-5 py-4 text-base"
        >
          Agendar cita
        </Link>
        <button
          type="button"
          onClick={() => setFormAbierto((v) => !v)} // CAMBIO: antes abría el aviso
          className="btn-outline px-5 py-4 text-base"
        >
          Registrar tratamiento
        </button>
      </div>

      {/* CAMBIO: aquí estaba el aviso de "no disponible"; ahora va el formulario */}
      {formAbierto && (
        <form onSubmit={guardar} className="card-soft mt-3 space-y-3 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-semibold">Tipo</span>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as "vacuna" | "tratamiento")}
                className={campo}
              >
                <option value="vacuna">Vacuna</option>
                <option value="tratamiento">Tratamiento</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold">Nombre</span>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Rabia, desparasitación"
                className={campo}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold">Fecha de aplicación</span>
              <input
                type="date"
                value={fechaTrat}
                onChange={(e) => setFechaTrat(e.target.value)}
                className={campo}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold">Próxima fecha (opcional)</span>
              <input
                type="date"
                value={proxima}
                onChange={(e) => setProxima(e.target.value)}
                className={campo}
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">Notas (opcional)</span>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className={campo}
            />
          </label>

          {errorForm && <p className="text-sm text-red-600">{errorForm}</p>}

          <button
            type="submit"
            disabled={crear.isPending}
            className="btn-primary px-5 py-3 text-base"
          >
            {crear.isPending ? "Guardando…" : "Guardar"}
          </button>
        </form>
      )}

      <h2 className="mt-6 mb-3 text-lg font-bold">Próxima vacuna</h2>
      {/* CAMBIO: ahora muestra la próxima vacuna si existe */}
      {proximaVacuna ? (
        <p className="card-soft p-4 text-sm">
          <span className="font-bold">{proximaVacuna.nombre}</span> ·{" "}
                    {formatoFecha(proximaVacuna.proxima_fecha!)}
        </p>
      ) : (
        <p className="card-soft p-4 text-sm text-muted-foreground">
          {hayVacunas
            ? "No hay una próxima vacuna programada."
            : "Sin vacunas registradas en el sistema."}
        </p>
      )}

      {/* NUEVO: lista de tratamientos y vacunas */}
      <h2 className="mt-6 mb-3 text-lg font-bold">Tratamientos y vacunas</h2>
      {qt.isPending ? (
        <Cargando texto="Cargando tratamientos…" />
      ) : qt.isError ? (
        <ErrorCarga error={qt.error} reintentar={() => qt.refetch()} />
      ) : tratamientos.length === 0 ? (
        <p className="card-soft p-4 text-sm text-muted-foreground">
          Todavía no hay tratamientos ni vacunas registrados.
        </p>
      ) : (
        <ul className="space-y-3">
          {tratamientos.map((t) => (
            <li key={t.id} className="card-soft p-4">
              <p className="text-sm font-bold text-primary">
                {t.tipo === "vacuna" ? "Vacuna" : "Tratamiento"} · {formatoFecha(t.fecha)}
              </p>
              <p className="mt-1 font-semibold">{t.nombre}</p>
              {t.notas && <p className="mt-1 text-sm text-muted-foreground">{t.notas}</p>}
              {t.proxima_fecha && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Próxima dosis: {formatoFecha(t.proxima_fecha)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-6 mb-3 text-lg font-bold">Próximas citas</h2>
      {qc.isPending ? (
        <Cargando texto="Cargando citas…" />
      ) : qc.isError ? (
        <ErrorCarga error={qc.error} reintentar={() => qc.refetch()} />
      ) : proximas.length === 0 ? (
        <p className="card-soft p-4 text-sm text-muted-foreground">No tiene citas próximas.</p>
      ) : (
        <ListaCitas citas={proximas} />
      )}

      <h2 className="mt-6 mb-3 text-lg font-bold">Historial de consultas</h2>
      {qc.isPending ? null : qc.isError ? null : pasadas.length === 0 ? (
        <p className="card-soft p-4 text-sm text-muted-foreground">
          Todavía no hay consultas anteriores.
        </p>
      ) : (
        <ListaCitas citas={pasadas} />
      )}
    </Layout>
  );
}

function ListaCitas({
  citas,
}: {
  citas: { id: number; fecha: string; hora: string; motivo: string | null; veterinario: string | null }[];
}) {
  return (
    <ul className="space-y-3">
      {citas.map((c) => (
        <li key={c.id} className="card-soft p-4">
          <p className="text-sm font-bold text-primary">
            {formatoFecha(c.fecha)} · {c.hora}
          </p>
          <p className="mt-1">{c.motivo || "Sin motivo registrado"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{c.veterinario ?? "Sin veterinario"}</p>
        </li>
      ))}
    </ul>
  );
}
