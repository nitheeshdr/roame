import { storageAdapter } from '@/lib/integrations/storage';
import { requireUser } from '@/lib/auth';
import { apiHandler } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  return apiHandler(async () => {
    await requireUser(request);
    const { id } = await params;
    await storageAdapter.remove(id);
    return { ok: true };
  });
}
