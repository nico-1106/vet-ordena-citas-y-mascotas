import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { IconEspecie } from "@/components/icons";
import { hoyISO, formatoFecha } from "@/lib/store";
import { useCitasDelDia, especieUI } from "@/lib/db";
import { Cargando, ErrorCarga } from "@/components/Estado";
import { EstadoCitaSelect } from "@/components/EstadoCitaSelect";
import { AsistenteIA } from "@/components/AsistenteIA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agenda del día | VetOrdena" },
      {
        name: "description",
        content:
          "Agenda del día para consultorios veterinarios: citas por hora con mascota, dueño y veterinario asignado.",
      },
      { property: "og:title", content: "Agenda del día | VetOrdena" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        property: "og:description",
        content: "Organiza las citas de tu consultorio veterinario sin cruces de horario.",
      },
    ],
  }),
  component: Agenda,
});

function moverDia(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function Agenda() {
  const hoy = hoyISO();
  const [fecha, setFecha] = useState(hoy);
  const q = useCitasDelDia(fecha);
  const delDia = q.data ?? [];

  const vets = new Set(delDia.map((c) => c.veterinario));
  const proxima = delDia[0];

  return (
    <Layout>
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Agenda del día — Clinica Veterinaria NS
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{formatoFecha(fecha)}</h1>
        </div>
        <Link
          to="/nueva-cita"
          className="btn-primary px-5 py-3 text-base lg:hidden"
        >
          + Nueva cita
        </Link>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFecha(moverDia(fecha, -1))}
          className="btn-outline px-3 py-2 text-sm"
        >
          ← Anterior
        </button>
        <input
          type="date"
          value={fecha}
          onChange={(e) => {
            if (e.target.value) setFecha(e.target.value);
          }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => setFecha(moverDia(fecha, 1))}
          className="btn-outline px-3 py-2 text-sm"
        >
          Siguiente →
        </button>
        {fecha !== hoy && (
          <button
            type="button"
            onClick={() => setFecha(hoy)}
            className="btn-primary px-3 py-2 text-sm"
          >
            Hoy
          </button>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-3 divide-x divide-border border-b border-border">
        {[
          { k: fecha === hoy ? "Citas de hoy" : "Citas del día", v: q.data ? String(delDia.length) : "—" },
          { k: "Veterinarios", v: q.data ? String(vets.size) : "—" },
          { k: "Primera cita", v: proxima?.hora ?? "—" },
        ].map((s) => (
          <div key={s.k} className="px-1 py-4 first:pl-0 lg:px-5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {s.k}
            </dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{s.v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-7 mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Citas programadas
      </h2>

      {q.isPending ? (
        <Cargando texto="Cargando citas…" />
      ) : q.isError ? (
        <ErrorCarga error={q.error} reintentar={() => q.refetch()} />
      ) : delDia.length === 0 ? (
        <p className="card-soft p-6 text-center text-sm text-muted-foreground">
          No hay citas agendadas para este día. Toca "+ Nueva cita" para programar una.
        </p>
      ) : (
        <ul className="card-soft divide-y divide-border overflow-hidden">
          {delDia.map((c) => {
            const m = c.mascotas;
            return (
              <li
                key={c.id}
                className="flex items-center transition-colors hover:bg-muted/60"
              >
                <Link
                  to="/mascotas/$id"
                  params={{ id: c.mascota_id }}
                  className="flex min-w-0 flex-1 items-center gap-4 px-4 py-4 lg:px-5"
                >
                  <div className="w-16 shrink-0 border-r border-border pr-4 text-right lg:w-20">
                    <p className="text-2xl font-bold tabular-nums tracking-tight lg:text-3xl">
                      {c.hora}
                    </p>
                  </div>

                  <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground sm:flex">
                    <IconEspecie especie={especieUI(m?.especie ?? null)} className="h-6 w-6" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xl font-bold tracking-tight lg:text-2xl">
                      {m?.nombre ?? "Mascota"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {m?.especie ?? "Especie sin registrar"}
                      {m?.raza ? ` · ${m.raza}` : ""} · Dueño: {m?.dueno_nombre ?? "—"}
                    </p>
                    <p className="mt-1.5 truncate text-sm text-secondary-foreground">
                      {c.motivo || "Sin motivo registrado"}
                    </p>
                  </div>

                  <span className="hidden shrink-0 rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground md:block">
                    {c.veterinario ?? "Sin veterinario"}
                  </span>
                </Link>

                <div className="shrink-0 pr-4 lg:pr-5">
                  <EstadoCitaSelect id={c.id} estado={c.estado} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AsistenteIA />
    </Layout>
  );
}
