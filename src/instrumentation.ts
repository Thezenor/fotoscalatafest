/**
 * Hook de instrumentación de Next: se ejecuta una vez al arrancar el servidor.
 * Arranca el worker de la cola de fotos (solo en runtime Node, no en Edge).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startPhotoWorker } = await import("./server/queue/worker");
    startPhotoWorker();
  }
}
