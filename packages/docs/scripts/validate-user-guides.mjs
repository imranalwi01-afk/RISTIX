import fs from 'node:fs'
import path from 'node:path'

const docsRoot = path.resolve('docs/user-guides')
const staticRoot = path.resolve('static')

const markdownFiles = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }
    if (entry.isFile() && fullPath.endsWith('.md')) {
      markdownFiles.push(fullPath)
    }
  }
}

function normalizeDocTarget(currentFile, rawTarget) {
  const target = rawTarget.split('#')[0]
  if (!target || target.startsWith('http://') || target.startsWith('https://')) {
    return null
  }
  if (target.startsWith('/img/')) {
    return path.join(staticRoot, target.replace(/^\//, ''))
  }
  if (target.startsWith('/docs/')) {
    const withoutPrefix = target.replace(/^\/docs\//, '')
    return resolveDocLikePath(path.join(path.resolve('docs'), withoutPrefix))
  }
  return resolveDocLikePath(path.resolve(path.dirname(currentFile), target))
}

function resolveDocLikePath(rawPath) {
  if (!rawPath) return rawPath
  if (fs.existsSync(rawPath) && fs.statSync(rawPath).isDirectory()) {
    return path.join(rawPath, 'index.md')
  }
  if (path.extname(rawPath)) return rawPath
  if (fs.existsSync(rawPath) && fs.statSync(rawPath).isFile()) return rawPath
  if (fs.existsSync(`${rawPath}.md`)) return `${rawPath}.md`
  if (fs.existsSync(path.join(rawPath, 'index.md'))) return path.join(rawPath, 'index.md')
  return `${rawPath}.md`
}

function collectMatches(content, regex) {
  const matches = []
  for (const match of content.matchAll(regex)) {
    matches.push(match)
  }
  return matches
}

function shouldRequireCoveredByTests(filePath) {
  const relative = path.relative(path.resolve('docs'), filePath).replaceAll(path.sep, '/')
  if (!relative.startsWith('user-guides/')) return false
  if (/\/index\.md$/.test(relative)) return false
  if (/sidebar-sitemap\.md$/.test(relative)) return false
  if (/iaf-user-role-matrix\.md$/.test(relative)) return false
  if (/uat-execution-pack-template\.md$/.test(relative)) return false
  if (/testing-traceability-matrix\.md$/.test(relative)) return false
  return /user-guides\/(banking|scenarios|qa-uat|troubleshooting)\//.test(relative)
}

walk(docsRoot)

const failures = []

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, 'utf8')

  const imageMatches = collectMatches(content, /!\[[^\]]*]\(([^)]+)\)/g)
  for (const [, rawTarget] of imageMatches) {
    const targetPath = normalizeDocTarget(file, rawTarget)
    if (targetPath && !fs.existsSync(targetPath)) {
      failures.push(`${path.relative(process.cwd(), file)} -> missing image ${rawTarget}`)
    }
  }

  const linkMatches = collectMatches(content, /(?<!!)\[[^\]]*]\(([^)]+)\)/g)
  for (const [, rawTarget] of linkMatches) {
    const targetPath = normalizeDocTarget(file, rawTarget)
    if (!targetPath) continue
    if (rawTarget.startsWith('/img/')) continue
    if (!fs.existsSync(targetPath)) {
      failures.push(`${path.relative(process.cwd(), file)} -> missing link target ${rawTarget}`)
    }
  }

  if (shouldRequireCoveredByTests(file) && !/^## Covered by Tests$/m.test(content)) {
    failures.push(`${path.relative(process.cwd(), file)} -> missing "## Covered by Tests" section`)
  }
}

if (failures.length > 0) {
  console.error('User guide validation failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log(`Validated ${markdownFiles.length} user guide markdown files successfully.`)
