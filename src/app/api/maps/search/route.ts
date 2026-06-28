import { mapsAdapter } from '@/lib/integrations/maps';
import { apiHandler } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const q = new URL(request.url).searchParams.get('q') ?? '';
    return { data: await mapsAdapter.search(q) };
  });
}
