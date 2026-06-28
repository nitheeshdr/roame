import { mapsAdapter } from '@/lib/integrations/maps';
import { apiHandler } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const p = new URL(request.url).searchParams;
    return {
      data: await mapsAdapter.nearby(
        Number(p.get('lat')),
        Number(p.get('lng')),
        p.get('category') ?? undefined,
      ),
    };
  });
}
