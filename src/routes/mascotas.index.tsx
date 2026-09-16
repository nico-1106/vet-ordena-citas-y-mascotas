import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useDatos, edadTexto, proximaVacuna, formatoFecha } from "@/lib/store";

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
      {
        property: "og:description",
        content: "Historial de mascotas del consultorio con alertas de vacunas.",
      },
    ],
  }),
  component: Mascotas,
});

function Mascotas() {
  const { mascotas } = useDatos();
  const [q, setQ] = useState("");
  const texto = q.trim().toLowerCase();
  const lista = mascotas.filter(
    (m) => m.nombre.toLowerCase().includes(texto) || m.dueno.toLowerCase().includes(texto),
  );

  return (
    <Layout>
      <h1 className="text-2xl font-extrabold">Mascotas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {mascotas.length} mascotas registradas en el consultorio
      </p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por mascota o dueño…"
        className="mt-4 w-full rounded-xl border border-input bg-card px-4 py-3 text-base outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
      />

      <ul className="mt-4 space-y-3">
        {lista.map((m) => {
          const pv = proximaVacuna(m);
          return (
            <li key={m.id}>
              <Link
                to="/mascotas/$id"
                params={{ id: m.id }}
                className="card-soft block p-4 transition-colors hover:bg-primary-soft/50"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-2xl">
                    {m.especie === "Gato" ? "🐈" : "🐕"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-bold">{m.nombre}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {m.especie} · {m.raza} · {edadTexto(m.nacimiento)}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">Dueño: {m.dueno}</p>
                  </div>
                </div>

                {pv && pv.estado !== "al-dia" && (
                  <p
                    className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${
                      pv.estado === "vencida"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning-soft text-warning"
                    }`}
                  >
                    {pv.estado === "vencida"
                      ? `⚠️ Vacuna ${pv.nombre} vencida hace ${Math.abs(pv.dias)} días`
                      : `• Vacuna ${pv.nombre} vence el ${formatoFecha(pv.proxima)} (en ${pv.dias} días)`}
                  </p>
                )}
                {pv && pv.estado === "al-dia" && (
                  <p className="mt-3 rounded-lg bg-success-soft px-3 py-2 text-sm font-semibold text-success">
                    • Vacunas al día · próxima {formatoFecha(pv.proxima)}
                  </p>
                )}
                {!pv && (
                  <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                    Sin vacunas registradas
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {lista.length === 0 && (
        <p className="card-soft mt-4 p-6 text-center text-sm text-muted-foreground">
          No encontramos mascotas con “{q}”.
        </p>
      )}
    </Layout>
  );
}
