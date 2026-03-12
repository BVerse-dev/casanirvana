import { readFile } from 'node:fs/promises';

function parseArgs(argv) {
  const args = {
    createdBy: 'codex',
    recordHistory: false,
    skipIfRecorded: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      if (!args.filePath) {
        args.filePath = token;
        continue;
      }
      throw new Error(`Unexpected positional argument: ${token}`);
    }

    const [flag, inlineValue] = token.split('=', 2);
    const nextValue = inlineValue ?? argv[index + 1];

    switch (flag) {
      case '--project-ref':
        args.projectRef = nextValue;
        if (inlineValue === undefined) index += 1;
        break;
      case '--version':
        args.version = nextValue;
        if (inlineValue === undefined) index += 1;
        break;
      case '--name':
        args.name = nextValue;
        if (inlineValue === undefined) index += 1;
        break;
      case '--created-by':
        args.createdBy = nextValue;
        if (inlineValue === undefined) index += 1;
        break;
      case '--record-history':
        args.recordHistory = true;
        break;
      case '--skip-if-recorded':
        args.skipIfRecorded = true;
        break;
      default:
        throw new Error(`Unknown argument: ${flag}`);
    }
  }

  if (!args.filePath) {
    throw new Error('Missing migration file path.');
  }

  return args;
}

function resolveProjectRef(explicitProjectRef) {
  if (explicitProjectRef) return explicitProjectRef;

  if (process.env.SUPABASE_PROJECT_REF) {
    return process.env.SUPABASE_PROJECT_REF;
  }

  const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!rawUrl) {
    throw new Error('Missing Supabase project ref and Supabase URL env.');
  }

  const match = rawUrl.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  if (!match) {
    throw new Error(`Could not derive project ref from URL: ${rawUrl}`);
  }

  return match[1];
}

async function runQuery(projectRef, accessToken, query) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    throw new Error(`Supabase query failed (${response.status}): ${typeof payload === 'string' ? payload : JSON.stringify(payload)}`);
  }

  return payload;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('Missing SUPABASE_ACCESS_TOKEN in environment.');
  }

  const projectRef = resolveProjectRef(args.projectRef);

  if (args.skipIfRecorded && args.version) {
    const existingRows = await runQuery(
      projectRef,
      accessToken,
      `select version, name, created_by
       from supabase_migrations.schema_migrations
       where version::text = '${args.version}';`
    );

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      console.log(JSON.stringify({ skipped: true, reason: 'already_recorded', existingRows }, null, 2));
      return;
    }
  }

  const query = await readFile(args.filePath, 'utf8');
  const applyResult = await runQuery(projectRef, accessToken, query);

  let historyResult = null;
  if (args.recordHistory) {
    if (!args.version || !args.name) {
      throw new Error('Recording migration history requires --version and --name.');
    }

    historyResult = await runQuery(
      projectRef,
      accessToken,
      `insert into supabase_migrations.schema_migrations
         (version, name, statements, created_by, idempotency_key, rollback)
       select
         '${args.version}',
         '${args.name}',
         null,
         '${args.createdBy}',
         null,
         null
       where not exists (
         select 1
         from supabase_migrations.schema_migrations
         where version::text = '${args.version}'
       )
       returning version, name, created_by;`
    );
  }

  console.log(JSON.stringify({
    applied: true,
    projectRef,
    filePath: args.filePath,
    version: args.version ?? null,
    name: args.name ?? null,
    applyResult,
    historyResult,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
