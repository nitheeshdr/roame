import { mapsAdapter } from '@/lib/integrations/maps';
import { apiHandler } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const input = new URL(request.url).searchParams.get('input') ?? '';
    return { data: await mapsAdapter.autocomplete(input) };
  });
}
