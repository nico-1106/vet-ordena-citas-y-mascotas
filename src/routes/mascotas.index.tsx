import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { IconEspecie } from "@/components/icons";
import { useMascotas, especieUI } from "@/lib/db";
import { Cargando, ErrorCarga } from "@/components/Estado";

export const Route = createFileRoute("/mascotas/")({
  head: () => ({
    meta: [
      { title: "Mascotas registradas | VetOrdena" },
      {
        name: "description",
        content:
          "Busca mascotas por nombre o dueño y revisa especie, raza, edad y vacunas próximas a vencer.",
      },
      { property: "og:title", content: "Mascotas registradas | VetOrdena" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        property: "og:description",
        content: "Historial de mascotas del consultorio con alertas de vacunas.",
      },
    ],
  }),
  component: Mascotas,
});

function Mascotas() {
  const qm = useMascotas();
  const mascotas = qm.data ?? [];
  const [q, setQ] = useState("");
  const texto = q.trim().toLowerCase();

  const lista = mascotas.filter(
    (m) =>
      m.nombre.toLowerCase().includes(texto) ||
      (m.dueno_nombre ?? "").toLowerCase().includes(texto),
  );

  return (
    <Layout>
      <header className="border-b border-border pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Pacientes
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Mascotas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {qm.data ? `${mascotas.length} mascotas registradas en el consultorio` : "Consultando registros…"}
        </p>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por mascota o dueño…"
        className="mt-5 w-full rounded-lg border border-input bg-card px-4 py-3 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
      />

      {qm.isPending ? (
        <div className="mt-4"><Cargando texto="Cargando mascotas…" /></div>
      ) : qm.isError ? (
        <div className="mt-4"><ErrorCarga error={qm.error} reintentar={() => qm.refetch()} /></div>
      ) : (
        <>
          <ul className="card-soft mt-4 divide-y divide-border overflow-hidden">
            {lista.map((m) => (
              <li key={m.id}>
                <Link
                  to="/mascotas/$id"
                  params={{ id: m.id }}
                  className="block px-4 py-4 transition-colors hover:bg-muted/60 lg:px-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <IconEspecie especie={especieUI(m.especie)} className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-bold tracking-tight">{m.nombre}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {m.especie ?? "Especie sin registrar"} · {m.raza || "Raza sin registrar"}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        Dueño: {m.dueno_nombre ?? "—"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                    Edad y vacunas aún no se registran en el sistema
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {lista.length === 0 && (
            <p className="card-soft mt-4 p-6 text-center text-sm text-muted-foreground">
              {mascotas.length === 0
                ? "Todavía no hay mascotas registradas. Regístrala al crear una nueva cita."
                : `No encontramos mascotas con "${q}".`}
            </p>
          )}
        </>
      )}
    </Layout>
  );
}
