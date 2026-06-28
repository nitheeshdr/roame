import { mapsAdapter } from '@/lib/integrations/maps';
import { apiHandler } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const p = new URL(request.url).searchParams;
    return mapsAdapter.reverseGeocode(Number(p.get('lat')), Number(p.get('lng')));
  });
}
