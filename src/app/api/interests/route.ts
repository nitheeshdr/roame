import { contentService } from '@/lib/services/content-service';
import { apiHandler } from '@/lib/api/handler';

/** Public interests catalog (used by the profile interests picker). */
export async function GET() {
  return apiHandler(async () => ({ data: await contentService.interests() }));
}
