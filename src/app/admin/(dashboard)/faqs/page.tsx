import * as React from 'react';
import { contentService } from '@/lib/services/content-service';
import { FaqsManager, type FaqRow } from './faqs-manager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'FAQs · Roame Admin' };

export default async function FaqsPage() {
  const rows = (await contentService.adminFaqs()) as unknown as FaqRow[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-semibold tracking-tight">FAQs</h2>
        <p className="mt-1 text-caption text-muted-foreground">
          Manage the help content shown to users.
        </p>
      </div>
      <FaqsManager rows={rows} />
    </div>
  );
}
