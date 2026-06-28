import { createSupportTicketSchema } from '@/lib/validation';
import { contentService } from '@/lib/services/content-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const input = await parseJson(request, createSupportTicketSchema);
    return unwrapResult(await contentService.createTicket(session.id, input));
  }, { status: 201 });
}
