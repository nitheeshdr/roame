import { createAnnouncementSchema } from '@/lib/validation';
import { contentService } from '@/lib/services/content-service';
import { requireAdmin } from '@/lib/auth';
import { apiHandler, parseJson, unwrapResult } from '@/lib/api/handler';

export async function GET() {
  return apiHandler(async () => {
    await requireAdmin();
    return { data: await contentService.adminAnnouncements() };
  });
}

export async function POST(request: Request) {
  return apiHandler(async () => {
    const admin = await requireAdmin();
    const input = await parseJson(request, createAnnouncementSchema);
    return unwrapResult(await contentService.createAnnouncement(admin.id, input));
  }, { status: 201 });
}
