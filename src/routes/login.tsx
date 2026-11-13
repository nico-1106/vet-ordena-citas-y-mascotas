import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { iniciarSesion } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Iniciar sesión | VetOrdena" }],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!correo.trim() || !clave) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }
    setCargando(true);
    try {
      await iniciarSesion(correo.trim(), clave);
      navigate({ to: "/" });
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  }

  const campo = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

  return (
    <main className="mx-auto flex min-h-screen max-w-sm items-center px-4">
      <form onSubmit={enviar} className="card-soft w-full space-y-3 p-6">
        <h1 className="text-2xl font-extrabold">VetOrdena</h1>
        <p className="text-sm text-muted-foreground">
          Inicia sesión para entrar a la agenda.
        </p>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Correo</span>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className={campo}
            autoComplete="email"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Contraseña</span>
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className={campo}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          className="btn-primary w-full px-5 py-3 text-base"
        >
          {cargando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
