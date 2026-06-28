import { participantService } from '@/lib/services/participant-service';
import { apiHandler } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return apiHandler(async () => {
    const { id } = await params;
    return { data: await participantService.listParticipants(id) };
  });
}
