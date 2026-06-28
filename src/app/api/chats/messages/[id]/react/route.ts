import { reactMessageSchema } from '@/lib/validation';
import { chatService } from '@/lib/services/chat-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { id } = await params;
    const input = await parseJson(request, reactMessageSchema);
    return unwrapResult(await chatService.react(session.id, id, input));
  });
}
