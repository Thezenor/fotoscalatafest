import { Worker } from "bullmq";
import { queueConnection, QUEUE_NAME } from "./connection";
import { processPhoto } from "./processor";

/**
 * Worker que procesa la cola de fotos. Se arranca una vez desde
 * instrumentation.ts al iniciar el servidor (mismo proceso que la app).
 */
let worker: Worker | null = null;

export function startPhotoWorker() {
  if (worker) return;
  const connection = queueConnection();
  if (!connection) {
    console.log("[queue] sin REDIS_URL: procesado en modo inline");
    return;
  }
  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      await processPhoto(job.data.photoId as string);
    },
    { connection, concurrency: 3 },
  );
  worker.on("failed", (job, err) =>
    console.error("[queue] job falló", job?.id, err?.message),
  );
  console.log("[queue] worker de fotos iniciado");
}
