import { checkinSchema } from '@/lib/validation';
import { participantService } from '@/lib/services/participant-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { id } = await params;
    const input = await parseJson(request, checkinSchema);
    return unwrapResult(await participantService.checkin(session.id, id, input));
  });
}
