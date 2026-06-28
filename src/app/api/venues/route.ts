import { createVenueSchema, listVenuesQuerySchema } from '@/lib/validation';
import { venueService } from '@/lib/services/commerce-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, parseQuery, unwrapResult } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const query = parseQuery(request, listVenuesQuerySchema);
    return venueService.list(query);
  });
}

export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const input = await parseJson(request, createVenueSchema);
    return unwrapResult(await venueService.create(session.id, input));
  }, { status: 201 });
}
