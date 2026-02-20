import { execSync } from 'node:child_process'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')

const cwd = process.cwd()
const dbmlDir = join(cwd, 'static', 'dbml')

const dbdocsCli = process.env.DBDOCS_CLI || 'npx --yes dbdocs'
const dbdocsToken = process.env.DBDOCS_TOKEN

const targets = [
  {
    label: 'tenant',
    file: join(dbmlDir, 'ifrspro_tenant_iaf.dbml'),
    project: process.env.DBDOCS_PROJECT_TENANT || 'ifrspro_tenant_iaf',
  },
  {
    label: 'platform',
    file: join(dbmlDir, 'ifrspro_platform_admin.dbml'),
    project: process.env.DBDOCS_PROJECT_PLATFORM || 'ifrspro_platform_admin',
  },
  {
    label: 'architecture',
    file: join(dbmlDir, 'ifrs9-dbdocs-publish.dbml'),
    project: process.env.DBDOCS_PROJECT_ARCHITECTURE || 'ifrs9-architecture',
  },
]

function run(command, env = process.env) {
  if (dryRun) {
    console.log(`[dry-run] ${command}`)
    return
  }
  execSync(command, {
    stdio: 'inherit',
    cwd,
    env,
  })
}

if (!dryRun && !dbdocsToken) {
  console.error('Missing DBDOCS_TOKEN. Set DBDOCS_TOKEN before publishing.')
  process.exit(1)
}

console.log('Building DBML artifacts...')
run('node ./scripts/build-dbml-artifacts.mjs')

for (const target of targets) {
  console.log(`Publishing ${target.label}: ${target.file} -> ${target.project}`)
  const cmd = `${dbdocsCli} build "${target.file}" --project "${target.project}"`
  run(cmd, {
    ...process.env,
    DBDOCS_TOKEN: dbdocsToken || '',
  })
}

console.log('DBDocs publish flow completed.')
