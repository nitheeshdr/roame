import { NextResponse } from 'next/server';
import { buildOpenApiSpec } from '@/lib/openapi';

/** Machine-readable OpenAPI 3.0 spec for the whole Roame API. */
export function GET() {
  return NextResponse.json(buildOpenApiSpec());
}
