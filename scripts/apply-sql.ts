/**
 * Applies the raw SQL files in prisma/rls/* (PostGIS indexes + RLS policies)
 * in lexical order. Run after `prisma migrate`. Idempotent SQL → safe to re-run.
 *
 *   pnpm db:rls
 *
 * Prisma's $executeRawUnsafe sends one command per call (extended protocol), so
 * we split each file into individual statements. The splitter is dollar-quote
 * aware ($$ ... $$ and $tag$ ... $tag$) so function bodies stay intact.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rlsDir = join(__dirname, '..', 'prisma', 'rls');

/** Split SQL into statements, respecting dollar-quoted strings and line comments. */
function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let dollarTag: string | null = null;

  for (const rawLine of sql.split('\n')) {
    // Strip standalone line comments only when not inside a dollar-quoted block.
    const line: string =
      dollarTag === null && rawLine.trimStart().startsWith('--') ? '' : rawLine;
    let i = 0;
    while (i < line.length) {
      const rest = line.slice(i);
      if (dollarTag === null) {
        const match = /^\$[A-Za-z0-9_]*\$/.exec(rest);
        if (match) {
          dollarTag = match[0];
          current += dollarTag;
          i += dollarTag.length;
          continue;
        }
        if (rest.startsWith(';')) {
          const trimmed = current.trim();
          if (trimmed) statements.push(trimmed);
          current = '';
          i += 1;
          continue;
        }
      } else if (rest.startsWith(dollarTag)) {
        current += dollarTag;
        i += dollarTag.length;
        dollarTag = null;
        continue;
      }
      current += rest.charAt(0);
      i += 1;
    }
    current += '\n';
  }
  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

async function main() {
  const prisma = new PrismaClient();
  const files = readdirSync(rlsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No SQL files found in prisma/rls.');
    return;
  }

  try {
    for (const file of files) {
      const sql = readFileSync(join(rlsDir, file), 'utf8');
      const statements = splitStatements(sql);
      process.stdout.write(`Applying ${file} (${statements.length} statements) ... `);
      for (const statement of statements) {
        await prisma.$executeRawUnsafe(statement);
      }
      console.log('done');
    }
    console.log(`\n✔ Applied ${files.length} SQL file(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n✖ Failed to apply SQL:', err);
  process.exit(1);
});
