import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useDatos, hoyISO, formatoFecha } from "@/lib/store";

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
      {
        property: "og:description",
        content: "Organiza las citas de tu consultorio veterinario sin cruces de horario.",
      },
    ],
  }),
  component: Agenda,
});

function Agenda() {
  const { citas, mascotas } = useDatos();
  const hoy = hoyISO();
  const delDia = citas
    .filter((c) => c.fecha === hoy)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  return (
    <Layout>
      <section className="card-soft overflow-hidden">
        <div className="btn-primary rounded-none px-5 py-5">
          <p className="text-sm font-semibold opacity-90">Agenda de hoy</p>
          <p className="font-display text-3xl font-extrabold">{formatoFecha(hoy)}</p>
          <p className="mt-1 text-sm opacity-90">
            {delDia.length} {delDia.length === 1 ? "cita programada" : "citas programadas"}
          </p>
        </div>
        <div className="p-4">
          <Link
            to="/nueva-cita"
            className="btn-primary flex w-full items-center justify-center gap-2 px-5 py-4 text-lg"
          >
            + Nueva cita
          </Link>
        </div>
      </section>

      <h2 className="mt-6 mb-3 text-lg font-bold">Citas del día</h2>

      {delDia.length === 0 ? (
        <p className="card-soft p-6 text-center text-sm text-muted-foreground">
          Hoy no hay citas agendadas. Toca “+ Nueva cita” para programar la primera.
        </p>
      ) : (
        <ul className="space-y-3">
          {delDia.map((c) => {
            const m = mascotas.find((x) => x.id === c.mascotaId);
            return (
              <li key={c.id}>
                <Link
                  to="/mascotas/$id"
                  params={{ id: c.mascotaId }}
                  className="card-soft flex gap-4 p-4 transition-colors hover:bg-primary-soft/50"
                >
                  <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-soft py-2">
                    <span className="font-display text-lg font-extrabold text-secondary-foreground">
                      {c.hora}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">
                      {m?.nombre ?? "Mascota"}{" "}
                      <span className="text-sm font-medium text-muted-foreground">
                        · {m?.especie} {m?.raza ? `· ${m.raza}` : ""}
                      </span>
                    </p>
                    <p className="truncate text-sm text-muted-foreground">Dueño: {m?.dueno}</p>
                    <p className="mt-1 truncate text-sm text-secondary-foreground">{c.motivo}</p>
                    <span className="mt-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      {c.veterinario}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Layout>
  );
}
