import type { DB } from './db.js';
import { distanceKm, interestsOf, type UserRow } from './util.js';

export interface Match {
  score: number;
  reasons: string[];
}

/**
 * Compatibility score (0–99) between two students.
 *  - shared interests carry most of the weight (Jaccard similarity)
 *  - same study schedule ("Bir xil soat")
 *  - physical proximity ("Yaqin hudud")
 *  - same current subject ("Bir xil fan")
 */
export function matchScore(db: DB, me: UserRow, other: UserRow): Match {
  const a = new Set(interestsOf(db, me.id).map((t) => t.toLowerCase()));
  const b = new Set(interestsOf(db, other.id).map((t) => t.toLowerCase()));
  const shared = [...a].filter((t) => b.has(t)).length;
  const union = new Set([...a, ...b]).size || 1;
  const reasons: string[] = [];

  let score = 22 + (shared / union) * 45;

  if (me.schedule === other.schedule) {
    score += 10;
    reasons.push('Bir xil soat');
  }
  if (shared >= 2 || (me.subject && me.subject.toLowerCase() === other.subject.toLowerCase())) {
    score += 6;
    reasons.push('Bir xil fan');
  }
  if (me.lat != null && me.lng != null && other.lat != null && other.lng != null && other.share_location) {
    const d = distanceKm(me.lat, me.lng, other.lat, other.lng);
    if (d < 5) {
      score += 8;
      reasons.push('Yaqin hudud');
    } else if (d < 15) {
      score += 4;
    }
  }
  if (me.city && me.city === other.city) score += 2;
  if (other.place_type === 'online') reasons.push('Online');

  const labels: Record<string, string> = { morning: 'Ertalab', day: 'Kunduz', evening: 'Kechqurun' };
  if (!reasons.includes('Bir xil soat') && labels[other.schedule]) reasons.push(labels[other.schedule]);

  return { score: Math.max(1, Math.min(99, Math.round(score))), reasons: reasons.slice(0, 3) };
}
