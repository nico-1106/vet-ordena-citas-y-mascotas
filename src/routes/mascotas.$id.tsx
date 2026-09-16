import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import {
  useDatos,
  edadTexto,
  proximaVacuna,
  formatoFecha,
  hoyISO,
  agregarTratamiento,
  VETERINARIOS,
  sumarMeses,
} from "@/lib/store";

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
  const { mascotas } = useDatos();
  const m = mascotas.find((x) => x.id === id);
  const [abierto, setAbierto] = useState(false);
  const [desc, setDesc] = useState("");
  const [vet, setVet] = useState(VETERINARIOS[0]!);

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

  const pv = proximaVacuna(m);

  return (
    <Layout>
      <Link to="/mascotas" className="text-sm font-bold text-primary">
        ← Volver a mascotas
      </Link>

      <section className="card-soft mt-3 p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-3xl">
            {m.especie === "Gato" ? "🐈" : "🐕"}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold">{m.nombre}</h1>
            <p className="text-sm text-muted-foreground">
              {m.especie} · {m.raza} · {m.sexo}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted px-3 py-2">
            <dt className="text-muted-foreground">Edad</dt>
            <dd className="font-bold">{edadTexto(m.nacimiento)}</dd>
          </div>
          <div className="rounded-lg bg-muted px-3 py-2">
            <dt className="text-muted-foreground">Peso</dt>
            <dd className="font-bold">{m.peso}</dd>
          </div>
          <div className="rounded-lg bg-muted px-3 py-2">
            <dt className="text-muted-foreground">Dueño</dt>
            <dd className="font-bold">{m.dueno}</dd>
          </div>
          <div className="rounded-lg bg-muted px-3 py-2">
            <dt className="text-muted-foreground">Celular</dt>
            <dd className="font-bold">{m.telefono || "—"}</dd>
          </div>
        </dl>
      </section>

      {pv && (
        <p
          className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
            pv.estado === "vencida"
              ? "bg-destructive/10 text-destructive"
              : pv.estado === "proxima"
                ? "bg-warning-soft text-warning"
                : "bg-success-soft text-success"
          }`}
        >
          {pv.estado === "vencida"
            ? `⚠️ La vacuna ${pv.nombre} está vencida desde el ${formatoFecha(pv.proxima)}.`
            : `Próxima vacuna: ${pv.nombre} el ${formatoFecha(pv.proxima)} (en ${pv.dias} días).`}
        </p>
      )}

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
          onClick={() => setAbierto((v) => !v)}
          className="btn-outline px-5 py-4 text-base"
        >
          Registrar tratamiento
        </button>
      </div>

      {abierto && (
        <div className="card-soft mt-3 space-y-3 p-4">
          <textarea
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="¿Qué se le hizo hoy a la mascota?"
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          <select
            value={vet}
            onChange={(e) => setVet(e.target.value)}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-base outline-none focus:border-ring"
          >
            {VETERINARIOS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-primary w-full px-5 py-3"
            onClick={() => {
              if (!desc.trim()) return;
              agregarTratamiento(m.id, {
                fecha: hoyISO(),
                descripcion: desc.trim(),
                veterinario: vet,
              });
              setDesc("");
              setAbierto(false);
            }}
          >
            Guardar tratamiento
          </button>
        </div>
      )}

      <h2 className="mt-6 mb-3 text-lg font-bold">Vacunas aplicadas</h2>
      {m.vacunas.length === 0 ? (
        <p className="card-soft p-4 text-sm text-muted-foreground">Sin vacunas registradas.</p>
      ) : (
        <ul className="space-y-3">
          {m.vacunas.map((v) => (
            <li key={v.id} className="card-soft p-4">
              <p className="font-bold">{v.nombre}</p>
              <p className="text-sm text-muted-foreground">Aplicada el {formatoFecha(v.fecha)}</p>
              <p className="text-sm text-secondary-foreground">
                Refuerzo: {formatoFecha(sumarMeses(v.fecha, v.refuerzoMeses))}
              </p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-6 mb-3 text-lg font-bold">Historial de tratamientos</h2>
      {m.tratamientos.length === 0 ? (
        <p className="card-soft p-4 text-sm text-muted-foreground">
          Todavía no hay tratamientos registrados.
        </p>
      ) : (
        <ul className="space-y-3">
          {m.tratamientos.map((t) => (
            <li key={t.id} className="card-soft p-4">
              <p className="text-sm font-bold text-primary">{formatoFecha(t.fecha)}</p>
              <p className="mt-1">{t.descripcion}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.veterinario}</p>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
