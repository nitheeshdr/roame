import { updateVenueSchema } from '@/lib/validation';
import { venueService } from '@/lib/services/commerce-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  return apiHandler(async () => {
    const { id } = await params;
    return venueService.get(id);
  });
}

export async function PATCH(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { id } = await params;
    const input = await parseJson(request, updateVenueSchema);
    const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(session.role);
    return unwrapResult(await venueService.update(session.id, id, input, isAdmin));
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const { id } = await params;
    const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(session.role);
    return unwrapResult(await venueService.remove(session.id, id, isAdmin));
  });
}
