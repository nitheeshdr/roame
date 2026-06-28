import { messagesQuerySchema, sendMessageSchema } from '@/lib/validation';
import { chatService } from '@/lib/services/chat-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, parseQuery, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ activityId: string }> };

export async function GET(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { activityId } = await params;
    const { page, pageSize } = parseQuery(request, messagesQuerySchema);
    return chatService.listMessages(session.id, activityId, page, pageSize);
  });
}

export async function POST(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { activityId } = await params;
    const input = await parseJson(request, sendMessageSchema);
    return unwrapResult(await chatService.send(session.id, activityId, input));
  }, { status: 201 });
}
