import { aiAdapter } from '@/lib/integrations/ai';
import { apiHandler } from '@/lib/api/handler';

/** Recommended activities (heuristic; upgrades to AI when a key is configured). */
export async function GET() {
  return apiHandler(() => aiAdapter.recommendActivities(15));
}
