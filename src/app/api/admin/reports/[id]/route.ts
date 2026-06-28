import { resolveReportSchema } from '@/lib/validation';
import { reportService } from '@/lib/services/report-service';
import { requireModerator } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  return apiHandler(async () => {
    const mod = await requireModerator(request);
    const { id } = await params;
    const input = await parseJson(request, resolveReportSchema);
    return unwrapResult(await reportService.resolve(mod, id, input));
  });
}
