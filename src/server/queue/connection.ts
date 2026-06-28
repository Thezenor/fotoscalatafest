import type { ConnectionOptions } from "bullmq";

/**
 * Opciones de conexión Redis para BullMQ (cola y worker). Se pasan como objeto
 * (no instancia) para que BullMQ gestione su propio cliente y evitar choques de
 * tipos entre copias de ioredis. `family: 0` es necesario en la red privada de
 * Railway (resuelve IPv4/IPv6). Devuelve null si no hay REDIS_URL → modo inline.
 */
export function queueConnection(): ConnectionOptions | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port || 6379),
    username: u.username || undefined,
    password: u.password ? decodeURIComponent(u.password) : undefined,
    maxRetriesPerRequest: null,
    family: 0,
    ...(u.protocol === "rediss:" ? { tls: {} } : {}),
  } as ConnectionOptions;
}

export const QUEUE_NAME = "photo-processing";
