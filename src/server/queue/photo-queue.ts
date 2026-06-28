import { Queue } from "bullmq";
import { queueConnection, QUEUE_NAME } from "./connection";

/**
 * Cola de procesado de fotos. Si no hay Redis, enqueue devuelve false y la
 * subida procesa en modo inline.
 */
let queue: Queue | null = null;

function getQueue(): Queue | null {
  const connection = queueConnection();
  if (!connection) return null;
  if (!queue) queue = new Queue(QUEUE_NAME, { connection });
  return queue;
}

export async function enqueuePhotoProcessing(photoId: string): Promise<boolean> {
  const q = getQueue();
  if (!q) return false;
  try {
    await q.add(
      "process",
      { photoId },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 3000 },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    );
    return true;
  } catch {
    return false;
  }
}
