import Redis from "ioredis";

/**
 * Rate-limiting sencillo con Redis (ventana fija por clave). Anti-spam para
 * subida y solicitudes de retirada. Fail-open: si Redis no está disponible,
 * NO bloquea (no queremos tumbar la subida del festival por un fallo de cache).
 */

let redis: Redis | null = null;
let redisDisabled = false;

function getRedis(): Redis | null {
  if (redisDisabled) return null;
  if (!process.env.REDIS_URL) {
    redisDisabled = true;
    return null;
  }
  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        // Cola de comandos activa: esperan a que la conexión esté lista (evita
        // fail-open durante el arranque). Si Redis está caído, fallan tras los
        // reintentos y se aplica fail-open en el catch de rateLimit().
        maxRetriesPerRequest: 2,
        connectTimeout: 2000,
      });
      redis.on("error", () => {
        /* silencioso: fail-open */
      });
    } catch {
      redisDisabled = true;
      return null;
    }
  }
  return redis;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
}

/**
 * Devuelve {ok:false} si se supera `max` peticiones en `windowSec` para `key`.
 */
export async function rateLimit(
  key: string,
  max: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const r = getRedis();
  if (!r) return { ok: true, remaining: max }; // fail-open
  try {
    const redisKey = `rl:${key}`;
    const count = await r.incr(redisKey);
    if (count === 1) await r.expire(redisKey, windowSec);
    return { ok: count <= max, remaining: Math.max(0, max - count) };
  } catch {
    return { ok: true, remaining: max }; // fail-open ante error
  }
}

/** IP del cliente a partir de las cabeceras (Railway usa x-forwarded-for). */
export function clientIpFrom(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
