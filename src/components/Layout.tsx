import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { IconAgenda, IconHuella, IconMas } from "@/components/icons";
import { useSesion, cerrarSesion } from "@/lib/auth";

const items = [
  { to: "/", label: "Agenda", Icon: IconAgenda },
  { to: "/mascotas", label: "Mascotas", Icon: IconHuella },
  { to: "/nueva-cita", label: "Nueva cita", Icon: IconMas },
] as const;

function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <IconHuella className="h-4.5 w-4.5" />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-bold tracking-tight text-foreground">Animals</span>
        {!compacta && (
          <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Gestión clínica
          </span>
        )}
      </span>
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { sesion, cargando } = useSesion();

  // Sin sesión no se entra: se manda al login
  useEffect(() => {
    if (!cargando && !sesion) navigate({ to: "/login" });
  }, [cargando, sesion, navigate]);

  async function salir() {
    await cerrarSesion();
    navigate({ to: "/login" });
  }

  if (cargando || !sesion) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Panel lateral — pantallas grandes */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="border-b border-border px-5 py-4">
          <Marca />
        </div>

        <nav className="flex-1 px-3 py-4">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Consultorio
          </p>
          <ul className="space-y-1">
            {items.map(({ to, label, Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  activeOptions={{ exact: to === "/" }}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  activeProps={{ className: "!bg-primary-soft !text-primary" }}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border px-5 py-4 text-[11px] leading-relaxed text-muted-foreground">
          Agenda, historia clínica y vacunación en un solo lugar.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header compacto */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur lg:px-8">
          <div className="lg:hidden">
            <Marca compacta />
          </div>
          <p className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:block">
            Panel del consultorio
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/nueva-cita"
              className="hidden rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:brightness-110 lg:block"
            >
              + Nueva cita
            </Link>
            <button
              type="button"
              onClick={salir}
              className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-5 lg:px-8 lg:pb-10">
          <div
