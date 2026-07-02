import { activityService } from '@/lib/services/activity-service';
import { apiHandler } from '@/lib/api/handler';

/** Activity points (lat/lng) for a map view. Public. */
export async function GET() {
  return apiHandler(async () => ({ data: await activityService.mapPoints(300) }));
}
