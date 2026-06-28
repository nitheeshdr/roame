import { z } from 'zod';
import { aiAdapter } from '@/lib/integrations/ai';
import { requireUser } from '@/lib/auth';
import { apiHandler, parseJson } from '@/lib/api/handler';

const schema = z.object({ text: z.string().min(1).max(20000) });

export async function POST(request: Request) {
  return apiHandler(async () => {
    await requireUser(request);
    const { text } = await parseJson(request, schema);
    return aiAdapter.summarize(text);
  });
}
