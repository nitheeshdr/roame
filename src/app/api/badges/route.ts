import { badgeService } from '@/lib/badges';
import { apiHandler } from '@/lib/api/handler';

export async function GET() {
  return apiHandler(async () => ({ data: badgeService.catalog() }));
}
