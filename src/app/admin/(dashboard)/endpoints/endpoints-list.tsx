'use client';

import * as React from 'react';
import { Search, Shield, ShieldAlert, Key, Unlock, ExternalLink, HelpCircle, Code, Copy, Check } from 'lucide-react';
import { Badge, Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import type { Ep } from '@/lib/openapi';

interface EndpointsListProps {
  endpoints: Ep[];
}

export function EndpointsList({ endpoints }: EndpointsListProps) {
  const [search, setSearch] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState<string>('all');
  const [selectedTag, setSelectedTag] = React.useState<string>('all');
  const [selectedAuth, setSelectedAuth] = React.useState<string>('all');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Extract all unique tags
  const tags = React.useMemo(() => {
    const allTags = endpoints.map((ep) => ep.tag);
    return ['all', ...Array.from(new Set(allTags))].sort();
  }, [endpoints]);

  // Filtered endpoints list
  const filteredEndpoints = React.useMemo(() => {
    return endpoints.filter((ep) => {
      const matchesSearch =
        ep.path.toLowerCase().includes(search.toLowerCase()) ||
        ep.summary.toLowerCase().includes(search.toLowerCase());
      const matchesMethod = selectedMethod === 'all' || ep.method === selectedMethod;
      const matchesTag = selectedTag === 'all' || ep.tag === selectedTag;
      const matchesAuth =
        selectedAuth === 'all' ||
        (selectedAuth === 'public' && !ep.auth) ||
        (selectedAuth === 'auth' && !!ep.auth) ||
        ep.auth === selectedAuth;

      return matchesSearch && matchesMethod && matchesTag && matchesAuth;
    });
  }, [endpoints, search, selectedMethod, selectedTag, selectedAuth]);

  // Method variants mapping for Badges
  const getMethodBadgeVariant = (method: string) => {
    switch (method.toLowerCase()) {
      case 'get':
        return 'primary';
      case 'post':
        return 'success';
      case 'patch':
        return 'warning';
      case 'delete':
        return 'destructive';
      default:
        return 'neutral';
    }
  };

  // Auth Badge color & icon helpers
  const getAuthDetails = (auth?: Ep['auth']) => {
    if (!auth) {
      return {
        label: 'Public',
        icon: Unlock,
        variant: 'neutral' as const,
        className: 'text-muted-foreground bg-secondary',
      };
    }
    switch (auth) {
      case 'admin':
        return {
          label: 'Admin Only',
          icon: ShieldAlert,
          variant: 'destructive' as const,
          className: 'text-destructive bg-destructive/10',
        };
      case 'mod':
        return {
          label: 'Moderator',
          icon: Shield,
          variant: 'warning' as const,
          className: 'text-warning bg-warning/10',
        };
      case 'user':
        return {
          label: 'User Session',
          icon: Key,
          variant: 'primary' as const,
          className: 'text-primary bg-primary/10',
        };
    }
  };

  // Copy Curl Command helper
  const copyCurl = (ep: Ep, id: string) => {
    const headers = ep.auth ? ` -H "Authorization: Bearer <your_token>"` : '';
    const bodyStr = ep.body ? ` -H "Content-Type: application/json" -d '{"key": "value"}'` : '';
    const curlCommand = `curl -X ${ep.method.toUpperCase()} "http://localhost:3000/api${ep.path}"${headers}${bodyStr}`;
    
    navigator.clipboard.writeText(curlCommand);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate Swagger URL
  const getSwaggerLink = (ep: Ep) => {
    // Swagger UI anchors are formed as #/{tag}/{operationId}
    // where operationId defaults to {method}_api_{path} with non-alphanumerics converted to underscores
    const sanitizedPath = `/api${ep.path}`.replace(/[\/\{\}]/g, '_').replace(/_+/g, '_').replace(/_$/, '');
    return `/api/docs#/${ep.tag}/${ep.method}${sanitizedPath}`;
  };

  // Stats calculation
  const stats = React.useMemo(() => {
    const total = endpoints.length;
    const publicCount = endpoints.filter((e) => !e.auth).length;
    const authCount = total - publicCount;
    return { total, publicCount, authCount };
  }, [endpoints]);

  const handleReset = () => {
    setSearch('');
    setSelectedMethod('all');
    setSelectedTag('all');
    setSelectedAuth('all');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-label text-muted-foreground font-medium">Total Endpoints</p>
          <p className="mt-1 text-h2 font-semibold tabular-nums text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-label text-muted-foreground font-medium">Matching Filters</p>
          <p className="mt-1 text-h2 font-semibold tabular-nums text-primary">{filteredEndpoints.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-label text-muted-foreground font-medium">Public Access</p>
          <p className="mt-1 text-h2 font-semibold tabular-nums text-success">{stats.publicCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-label text-muted-foreground font-medium">Auth Required</p>
          <p className="mt-1 text-h2 font-semibold tabular-nums text-warning">{stats.authCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar Panel */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search endpoints by path or summary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {(search || selectedMethod !== 'all' || selectedTag !== 'all' || selectedAuth !== 'all') && (
            <Button variant="outline" onClick={handleReset} className="md:w-auto w-full">
              Reset Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Method Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label font-medium text-muted-foreground">HTTP Method</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-body shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            >
              <option value="all">All Methods</option>
              <option value="get">GET</option>
              <option value="post">POST</option>
              <option value="patch">PATCH</option>
              <option value="delete">DELETE</option>
            </select>
          </div>

          {/* Auth Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label font-medium text-muted-foreground">Authentication</label>
            <select
              value={selectedAuth}
              onChange={(e) => setSelectedAuth(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-body shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            >
              <option value="all">All Access</option>
              <option value="public">Public (None)</option>
              <option value="auth">Authenticated (Any)</option>
              <option value="user">User Session</option>
              <option value="mod">Moderator Only</option>
              <option value="admin">Admin Only</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label font-medium text-muted-foreground">Module Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-body shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            >
              <option value="all">All Tags</option>
              {tags.filter((t) => t !== 'all').map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Endpoints List Table */}
      {filteredEndpoints.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-12 text-center">
          <HelpCircle className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-body font-medium text-foreground">No endpoints found</p>
          <p className="mt-1 text-caption text-muted-foreground">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Method</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Authentication</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEndpoints.map((ep, idx) => {
                const epId = `${ep.method}-${ep.path}-${idx}`;
                const isExpanded = expandedId === epId;
                const auth = getAuthDetails(ep.auth);
                const AuthIcon = auth.icon;

                return (
                  <React.Fragment key={epId}>
                    <TableRow
                      onClick={() => setExpandedId(isExpanded ? null : epId)}
                      className="cursor-pointer transition-colors hover:bg-secondary/40"
                    >
                      <TableCell>
                        <Badge variant={getMethodBadgeVariant(ep.method)} className="w-[70px] justify-center uppercase">
                          {ep.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-caption font-semibold text-foreground">
                        {ep.path}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ep.tag}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-label font-medium ${auth.className}`}>
                          <AuthIcon className="h-3.5 w-3.5" />
                          {auth.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{ep.summary}</TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="bg-secondary/20 hover:bg-secondary/20">
                        <TableCell colSpan={5} className="p-5 border-t border-border">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <h4 className="text-body font-semibold text-foreground">
                                  Endpoint Details
                                </h4>
                                <p className="text-caption text-muted-foreground mt-0.5">
                                  Quick reference card for local development and testing.
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyCurl(ep, epId);
                                  }}
                                  className="flex items-center gap-1.5"
                                >
                                  {copiedId === epId ? (
                                    <>
                                      <Check className="h-4 w-4 text-success" />
                                      Copied Curl
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-4 w-4" />
                                      Copy Curl
                                    </>
                                  )}
                                </Button>
                                <a
                                  href={getSwaggerLink(ep)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 text-caption font-medium transition-colors hover:bg-secondary"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Test in Swagger UI
                                </a>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {/* Curl and Parameters Box */}
                              <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center gap-2 text-caption font-semibold text-foreground mb-2">
                                  <Code className="h-4 w-4 text-primary" />
                                  Curl Command
                                </div>
                                <pre className="overflow-x-auto rounded bg-secondary p-3 text-label font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap select-all">
                                  {`curl -X ${ep.method.toUpperCase()} "http://localhost:3000/api${ep.path}"${
                                    ep.auth ? ` \\\n  -H "Authorization: Bearer <your_token>"` : ''
                                  }${ep.body ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '{"key": "value"}'` : ''}`}
                                </pre>
                              </div>

                              {/* Schema details box */}
                              <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
                                <div>
                                  <span className="text-caption font-semibold text-foreground block">
                                    Expected Content-Type
                                  </span>
                                  <span className="text-label text-muted-foreground font-mono mt-0.5 block">
                                    {ep.body ? 'application/json' : 'None (No request body)'}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-caption font-semibold text-foreground block">
                                    Base Target Endpoint URL
                                  </span>
                                  <span className="text-label text-muted-foreground font-mono mt-0.5 block">
                                    /api{ep.path}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-caption font-semibold text-foreground block">
                                    Path Parameters
                                  </span>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {ep.path.includes('{') ? (
                                      [...ep.path.matchAll(/\{(\w+)\}/g)].map((m) => (
                                        <Badge key={m[1]} variant="neutral" className="font-mono">
                                          {m[1]}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-label text-muted-foreground italic">
                                        No dynamic parameters in path.
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
