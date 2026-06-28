// Lógica de "me gusta" en cliente: evita votos repetidos del mismo dispositivo
// (no es a prueba de fraude, pero suficiente para el público de un festival) y
// llama a la API. Devuelve el nuevo total o null si ya había votado/falló.

const KEY = "cf_liked";

export function hasLiked(id: string): boolean {
  try {
    return (JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]).includes(id);
  } catch {
    return false;
  }
}

function markLiked(id: string) {
  try {
    const set = new Set<string>(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    set.add(id);
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* almacenamiento no disponible */
  }
}

export async function likePhotoClient(id: string): Promise<number | null> {
  if (hasLiked(id)) return null;
  markLiked(id);
  try {
    const res = await fetch(`/api/photos/${id}/like`, { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.likes === "number" ? data.likes : null;
  } catch {
    return null;
  }
}
