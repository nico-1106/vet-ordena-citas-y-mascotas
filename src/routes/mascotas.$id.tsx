import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { IconEspecie } from "@/components/icons";
import { Cargando, ErrorCarga } from "@/components/Estado";
import { formatoFecha, hoyISO } from "@/lib/store";
import { useMascota, useCitasDeMascota, especieUI } from "@/lib/db";

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
  const [aviso, setAviso] = useState(false);

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
          onClick={() => setAviso((v) => !v)}
          className="btn-outline px-5 py-4 text-base"
        >
          Registrar tratamiento
        </button>
      </div>

      {aviso && (
        <p className="card-soft mt-3 p-4 text-sm text-muted-foreground">
          El registro de tratamientos y vacunas todavía no está disponible: la base de datos aún
          no tiene una tabla para guardarlos. Por ahora, anota el motivo al agendar la cita.
        </p>
      )}

      <h2 className="mt-6 mb-3 text-lg font-bold">Próxima vacuna</h2>
      <p className="card-soft p-4 text-sm text-muted-foreground">
        Sin vacunas registradas en el sistema.
      </p>

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
