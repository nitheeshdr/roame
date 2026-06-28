import { createBookingSchema, paginationQuerySchema } from '@/lib/validation';
import { bookingService } from '@/lib/services/commerce-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, parseQuery, unwrapResult } from '@/lib/api/handler';

export async function GET(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { page, pageSize } = parseQuery(request, paginationQuerySchema);
    return bookingService.list(session.id, page, pageSize);
  });
}

export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const input = await parseJson(request, createBookingSchema);
    return unwrapResult(await bookingService.create(session.id, input));
  }, { status: 201 });
}
