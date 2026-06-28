import { contentService } from '@/lib/services/content-service';
import { apiHandler } from '@/lib/api/handler';

export async function GET() {
  return apiHandler(async () => ({ data: await contentService.cities() }));
}
