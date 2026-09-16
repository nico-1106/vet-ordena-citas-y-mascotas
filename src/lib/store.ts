import { useSyncExternalStore } from "react";

export type Especie = "Perro" | "Gato";

export type Vacuna = {
  id: string;
  nombre: string;
  fecha: string; // ISO yyyy-mm-dd
  refuerzoMeses: number;
};

export type Tratamiento = {
  id: string;
  fecha: string;
  descripcion: string;
  veterinario: string;
};

export type Mascota = {
  id: string;
  nombre: string;
  especie: Especie;
  raza: string;
  nacimiento: string; // ISO
  sexo: "Macho" | "Hembra";
  peso: string;
  dueno: string;
  telefono: string;
  vacunas: Vacuna[];
  tratamientos: Tratamiento[];
};

export type Cita = {
  id: string;
  mascotaId: string;
  veterinario: string;
  fecha: string; // ISO yyyy-mm-dd
  hora: string; // HH:mm
  motivo: string;
};

export const VETERINARIOS = [
  "Dra. Camila Ríos",
  "Dr. Andrés Betancur",
  "Dra. Valentina Ochoa",
];

export const HORAS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

export function hoyISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function sumarDias(iso: string, dias: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + dias);
  return hoyISO(d);
}

export function sumarMeses(iso: string, meses: number) {
  const d = new Date(iso + "T12:00:00");
  d.setMonth(d.getMonth() + meses);
  return hoyISO(d);
}

export function formatoFecha(iso: string) {
  const meses = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  const [a, m, d] = iso.split("-");
  return `${Number(d)} ${meses[Number(m) - 1]} ${a}`;
}

export function edadTexto(nacimiento: string) {
  const n = new Date(nacimiento + "T12:00:00");
  const hoy = new Date();
  let meses = (hoy.getFullYear() - n.getFullYear()) * 12 + (hoy.getMonth() - n.getMonth());
  if (hoy.getDate() < n.getDate()) meses -= 1;
  const anios = Math.floor(meses / 12);
  const rest = meses % 12;
  if (anios <= 0) return `${meses} ${meses === 1 ? "mes" : "meses"}`;
  if (rest === 0) return `${anios} ${anios === 1 ? "año" : "años"}`;
  return `${anios} ${anios === 1 ? "año" : "años"} y ${rest} ${rest === 1 ? "mes" : "meses"}`;
}

export function diasEntre(desdeISO: string, hastaISO: string) {
  const a = new Date(desdeISO + "T12:00:00").getTime();
  const b = new Date(hastaISO + "T12:00:00").getTime();
  return Math.round((b - a) / 86400000);
}

export type EstadoVacuna = {
  nombre: string;
  proxima: string;
  dias: number;
  estado: "vencida" | "proxima" | "al-dia";
};

export function proximaVacuna(m: Mascota): EstadoVacuna | null {
  if (!m.vacunas.length) return null;
  const hoy = hoyISO();
  const calc = m.vacunas.map((v) => {
    const proxima = sumarMeses(v.fecha, v.refuerzoMeses);
    const dias = diasEntre(hoy, proxima);
    return {
      nombre: v.nombre,
      proxima,
      dias,
      estado: dias < 0 ? "vencida" : dias <= 30 ? "proxima" : "al-dia",
    } as EstadoVacuna;
  });
  calc.sort((a, b) => a.dias - b.dias);
  return calc[0];
}

const HOY = hoyISO();

let mascotas: Mascota[] = [
  {
    id: "m1",
    nombre: "Firulais",
    especie: "Perro",
    raza: "Criollo",
    nacimiento: sumarDias(HOY, -365 * 4 - 40),
    sexo: "Macho",
    peso: "18 kg",
    dueno: "Carlos Gómez",
    telefono: "310 456 7821",
    vacunas: [
      { id: "v1", nombre: "Rabia", fecha: sumarDias(HOY, -350), refuerzoMeses: 12 },
      { id: "v2", nombre: "Polivalente", fecha: sumarDias(HOY, -200), refuerzoMeses: 12 },
    ],
    tratamientos: [
      {
        id: "t1",
        fecha: sumarDias(HOY, -60),
        descripcion: "Desparasitación interna y control de peso.",
        veterinario: "Dra. Camila Ríos",
      },
      {
        id: "t2",
        fecha: sumarDias(HOY, -180),
        descripcion: "Otitis externa, tratamiento con gotas óticas por 7 días.",
        veterinario: "Dr. Andrés Betancur",
      },
    ],
  },
  {
    id: "m2",
    nombre: "Michi",
    especie: "Gato",
    raza: "Criollo pelo corto",
    nacimiento: sumarDias(HOY, -365 * 2 - 100),
    sexo: "Macho",
    peso: "4,2 kg",
    dueno: "Ana Restrepo",
    telefono: "312 998 3344",
    vacunas: [
      { id: "v3", nombre: "Triple felina", fecha: sumarDias(HOY, -380), refuerzoMeses: 12 },
    ],
    tratamientos: [
      {
        id: "t3",
        fecha: sumarDias(HOY, -30),
        descripcion: "Limpieza dental y revisión general.",
        veterinario: "Dra. Valentina Ochoa",
      },
    ],
  },
  {
    id: "m3",
    nombre: "Luna",
    especie: "Perro",
    raza: "Labrador",
    nacimiento: sumarDias(HOY, -365 - 20),
    sexo: "Hembra",
    peso: "24 kg",
    dueno: "Ana Restrepo",
    telefono: "312 998 3344",
    vacunas: [
      { id: "v4", nombre: "Rabia", fecha: sumarDias(HOY, -120), refuerzoMeses: 12 },
      { id: "v5", nombre: "Tos de las perreras", fecha: sumarDias(HOY, -170), refuerzoMeses: 6 },
    ],
    tratamientos: [
      {
        id: "t4",
        fecha: sumarDias(HOY, -15),
        descripcion: "Control de crecimiento, todo normal.",
        veterinario: "Dra. Camila Ríos",
      },
    ],
  },
  {
    id: "m4",
    nombre: "Rocky",
    especie: "Perro",
    raza: "Pitbull",
    nacimiento: sumarDias(HOY, -365 * 6),
    sexo: "Macho",
    peso: "31 kg",
    dueno: "Juliana Mejía",
    telefono: "301 223 7788",
    vacunas: [
      { id: "v6", nombre: "Polivalente", fecha: sumarDias(HOY, -300), refuerzoMeses: 12 },
    ],
    tratamientos: [],
  },
  {
    id: "m5",
    nombre: "Pelusa",
    especie: "Gato",
    raza: "Angora",
    nacimiento: sumarDias(HOY, -365 * 3 - 200),
    sexo: "Hembra",
    peso: "3,8 kg",
    dueno: "Carlos Gómez",
    telefono: "310 456 7821",
    vacunas: [
      { id: "v7", nombre: "Leucemia felina", fecha: sumarDias(HOY, -60), refuerzoMeses: 12 },
    ],
    tratamientos: [
      {
        id: "t5",
        fecha: sumarDias(HOY, -60),
        descripcion: "Vacunación anual y control de pulgas.",
        veterinario: "Dra. Valentina Ochoa",
      },
    ],
  },
];

let citas: Cita[] = [
  { id: "c1", mascotaId: "m1", veterinario: "Dra. Camila Ríos", fecha: HOY, hora: "08:00", motivo: "Control de peso" },
  { id: "c2", mascotaId: "m2", veterinario: "Dr. Andrés Betancur", fecha: HOY, hora: "09:30", motivo: "Vacunación triple felina" },
  { id: "c3", mascotaId: "m3", veterinario: "Dra. Camila Ríos", fecha: HOY, hora: "10:30", motivo: "Revisión de piel" },
  { id: "c4", mascotaId: "m5", veterinario: "Dra. Valentina Ochoa", fecha: HOY, hora: "15:00", motivo: "Corte de uñas y baño medicado" },
  { id: "c5", mascotaId: "m4", veterinario: "Dr. Andrés Betancur", fecha: sumarDias(HOY, 1), hora: "08:30", motivo: "Refuerzo de vacuna" },
];

const listeners = new Set<() => void>();
let snapshot = { mascotas, citas };

function emit() {
  snapshot = { mascotas, citas };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useDatos() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}

export function getMascota(id: string) {
  return snapshot.mascotas.find((m) => m.id === id);
}

export function horaOcupada(veterinario: string, fecha: string, hora: string) {
  return citas.find((c) => c.veterinario === veterinario && c.fecha === fecha && c.hora === hora);
}

export function crearCita(c: Omit<Cita, "id">) {
  citas = [...citas, { ...c, id: `c${Date.now()}` }];
  emit();
}

export function crearMascota(m: Omit<Mascota, "id" | "vacunas" | "tratamientos">) {
  const id = `m${Date.now()}`;
  mascotas = [...mascotas, { ...m, id, vacunas: [], tratamientos: [] }];
  emit();
  return id;
}

export function agregarTratamiento(mascotaId: string, t: Omit<Tratamiento, "id">) {
  mascotas = mascotas.map((m) =>
    m.id === mascotaId
      ? { ...m, tratamientos: [{ ...t, id: `t${Date.now()}` }, ...m.tratamientos] }
      : m,
  );
  emit();
}

export function agregarVacuna(mascotaId: string, v: Omit<Vacuna, "id">) {
  mascotas = mascotas.map((m) =>
    m.id === mascotaId ? { ...m, vacunas: [{ ...v, id: `v${Date.now()}` }, ...m.vacunas] } : m,
  );
  emit();
}
