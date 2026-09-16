# Vet Ordena: Citas y Mascotas

Actúa como un diseñador senior experto en desarrollo de aplicaciones web en Colombia, especializado en productos para pequeños negocios.

Crea una aplicación web llamada "VetOrdena" para consultorios veterinarios pequeños en Colombia que todavía llevan las citas y el historial de sus mascotas en cuadernos o en un Excel desordenado, y por eso se les cruzan citas, se les pasan vacunas o pierden información de tratamientos.

Función central: agendar citas sin que se crucen dos a la misma hora con el mismo veterinario, y llevar el historial médico y de vacunación de cada mascota.

Pantallas (solo estas 4):

1. Inicio: agenda del día con las citas ordenadas por hora, mostrando mascota, dueño y veterinario asignado. Arriba, un resumen con el número de citas de hoy y un botón grande "+ Nueva cita".

2. Lista de mascotas: buscador por nombre de mascota o dueño, cada tarjeta muestra especie, raza, edad y si tiene una vacuna próxima a vencer (con una alerta visual).

3. Detalle de mascota: datos básicos, historial de tratamientos y vacunas aplicadas con fecha, y la fecha calculada de la próxima vacuna. Botón "Agendar cita" y "Registrar tratamiento".

4. Formulario de nueva cita: seleccionar mascota existente o registrar una nueva, elegir veterinario, fecha, hora y motivo de la consulta. Si la hora ya está ocupada para ese veterinario, debe mostrar una alerta.

Estilo: limpio y profesional, tonos verdes y blancos que transmitan confianza y cuidado, letras claras y legibles, botones grandes fáciles de tocar, mobile-first — se usará desde el celular o tablet en el mostrador de la clínica.

Todos los textos en español colombiano. Usa datos de ejemplo realistas: mascotas como "Firulais" (perro), "Michi" (gato), "Luna" (perra), dueños como "Carlos Gómez" o "Ana Restrepo", veterinarios como "Dra. Camila Ríos".

NO incluyas: login, pagos en línea, módulo de pedidos a proveedores, acceso para dueños de mascotas, ni reportes de cobros. Eso viene después.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e4a331b5-1fb0-4dcf-9423-4162ff9bb38a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
