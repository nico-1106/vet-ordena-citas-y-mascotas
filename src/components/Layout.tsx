import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

function IconAgenda({ activo }: { activo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={activo ? 2.4 : 1.8} stroke="currentColor" className="h-6 w-6">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function IconHuella({ activo }: { activo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={activo ? 2.4 : 1.8} stroke="currentColor" className="h-6 w-6">
      <ellipse cx="7" cy="8" rx="2" ry="2.6" />
      <ellipse cx="12" cy="6.4" rx="2" ry="2.8" />
      <ellipse cx="17" cy="8" rx="2" ry="2.6" />
      <path d="M12 11c3 0 5 2.2 5 4.6 0 2-1.6 3.4-3.4 3.4-1.1 0-1.1-.6-1.6-.6s-.5.6-1.6.6C8.6 19 7 17.6 7 15.6 7 13.2 9 11 12 11Z" />
    </svg>
  );
}

function IconMas({ activo }: { activo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={activo ? 2.6 : 2} stroke="currentColor" className="h-6 w-6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const items = [
    { to: "/", label: "Agenda", Icon: IconAgenda },
    { to: "/mascotas", label: "Mascotas", Icon: IconHuella },
    { to: "/nueva-cita", label: "Nueva cita", Icon: IconMas },
  ] as const;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl btn-primary text-base">🐾</span>
          <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
            VetOrdena
          </span>
        </Link>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-2xl -translate-x-1/2 border-t border-border bg-card px-2 pb-[env(safe-area-inset-bottom)]">
        <ul className="grid grid-cols-3">
          {items.map(({ to, label, Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex flex-col items-center gap-1 py-3 text-xs font-semibold text-muted-foreground transition-colors"
                activeProps={{ className: "!text-primary" }}
              >
                {({ isActive }) => (
                  <>
                    <Icon activo={isActive} />
                    {label}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
