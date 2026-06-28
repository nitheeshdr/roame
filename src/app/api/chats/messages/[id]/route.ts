import { z } from 'zod';
import { chatService } from '@/lib/services/chat-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };
const editSchema = z.object({ body: z.string().trim().min(1).max(4000) });

export async function PATCH(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { id } = await params;
    const { body } = await parseJson(request, editSchema);
    return unwrapResult(await chatService.edit(session.id, id, body));
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { id } = await params;
    return unwrapResult(await chatService.remove(session.id, id));
  });
}
