import * as React from 'react';
import { ENDPOINTS } from '@/lib/openapi';
import { EndpointsList } from './endpoints-list';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'API Endpoints · Roame Admin' };

export default async function EndpointsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-h2 font-semibold tracking-tight">API Endpoints</h2>
        <p className="mt-1 text-caption text-muted-foreground">
          View, filter, and search all public and private endpoints declared in the OpenAPI specification.
        </p>
      </div>

      <EndpointsList endpoints={ENDPOINTS} />
    </div>
  );
}
