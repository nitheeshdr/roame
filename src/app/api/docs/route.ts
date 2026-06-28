/**
 * Swagger UI for the Roame API. Loads Swagger UI from a CDN and points it at
 * /api/openapi.json — no heavy bundled dependency, works on Vercel.
 */
const HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Roame API — Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fafafa; }
      .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js" crossorigin></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/api/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          persistAuthorization: true,
          docExpansion: 'none',
          filter: true,
        });
      };
    </script>
  </body>
</html>`;

export function GET() {
  return new Response(HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
