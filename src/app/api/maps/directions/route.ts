import { mapsAdapter } from '@/lib/integrations/maps';
import { apiHandler } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const p = new URL(request.url).searchParams;
    return mapsAdapter.directions(p.get('from') ?? '', p.get('to') ?? '');
  });
}
