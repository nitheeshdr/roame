import { createReportSchema } from '@/lib/validation';
import { reportService } from '@/lib/services/report-service';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function POST(request: Request) {
  return apiHandler(async () => {
    const session = await requireUser(request);
    const input = await parseJson(request, createReportSchema);
    return unwrapResult(await reportService.create(session.id, input));
  }, { status: 201 });
}
