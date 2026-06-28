import { chatService } from '@/lib/services/chat-service';
import { requireUser } from '@/lib/auth';
import { apiHandler } from '@/lib/api/handler';

type Params = { params: Promise<{ activityId: string }> };

/** Resolve (and join) the activity's chat for the current user. */
export async function GET(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { activityId } = await params;
    return chatService.getActivityChat(session.id, activityId);
  });
}
