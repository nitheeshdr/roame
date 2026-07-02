import * as React from 'react';
import { contentService } from '@/lib/services/content-service';
import { AnnouncementsManager, type AnnouncementRow } from './announcements-manager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Announcements · Roame Admin' };

export default async function AnnouncementsPage() {
  const rows = (await contentService.adminAnnouncements()) as unknown as AnnouncementRow[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-semibold tracking-tight">Announcements</h2>
        <p className="mt-1 text-caption text-muted-foreground">
          Publish updates to everyone or a specific audience.
        </p>
      </div>
      <AnnouncementsManager rows={rows} />
    </div>
  );
}
