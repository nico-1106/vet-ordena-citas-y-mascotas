import { obtenerDatosParaIA } from "@/lib/db";
import { hoyISO } from "@/lib/store";
const MODELO = "gemini-3-flash-preview";

export async function consultarAsistenteIA(pregunta: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar la llave de Gemini en las variables de entorno.");
  }

  // 1. Consultar la base (sin datos de dueños)
  const datos = await obtenerDatosParaIA(pregunta, hoyISO());

  // 2. Armar el prompt en tres partes
  const instruccion =
    "Eres el asistente de vet-ordena, la app de un consultorio veterinario pequeño. " +
    "Hablas cercano y respetuoso, de tú, y nunca regañas. " +
    "Tu tarea es responder preguntas sobre las citas, vacunas y tratamientos de las mascotas, " +
    "y resumir la agenda de un día en máximo 3 líneas cuando te lo pidan. " +
    "Usas ÚNICAMENTE los datos que te paso; si un dato no está, dices que no lo tienes " +
    "y nunca lo inventas. " +
    "Solo hablas de las citas, vacunas y tratamientos de las mascotas del consultorio. " +
    "No das diagnósticos ni consejos médicos veterinarios, ni opinas de otros temas.";

  const contexto =
    `Hoy es ${hoyISO()}. Todas las horas están en hora de Colombia.\n\n` +
    `CITAS:\n${JSON.stringify(datos.citas)}\n\n` +
    `TRATAMIENTOS Y VACUNAS:\n${JSON.stringify(datos.tratamientos)}`;

  const prompt = `${instruccion}\n\n${contexto}\n\nPREGUNTA DEL USUARIO: ${pregunta}`;

  // 3. Llamar a Gemini
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "No pudimos comunicarnos con el asistente de IA.");
  }

  const json = await res.json();
  const texto = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) throw new Error("El asistente no devolvió una respuesta válida.");
  return texto;
}
