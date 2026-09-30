import {cp, readFile, rm, writeFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDirectory = join(projectRoot, 'public')
const buildDirectory = join(projectRoot, 'build')
const blogSource = join(projectRoot, 'content/blog/cuda-streams.md')
const blogPage = join(publicDirectory, 'blog/cuda-streams/index.html')

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const renderInline = (value) => {
  const escaped = escapeHtml(value)
  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const external = href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${href}"${external}>${label}</a>`
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

const highlightRust = (source) => {
  const tokenPattern = /(\/\/[^\n]*|"(?:\\.|[^"\\])*"|'[A-Za-z_][A-Za-z0-9_]*|\b(?:fn|let|mut|move|match|return|async|await|impl|self|Self)\b|\b(?:Pin|Context|Poll|Option|Result|Batch|State|JoinHandle)\b|\b(?:Ready|Pending|Some|Ok|Err|Aggregating)\b|\b[a-z_][a-z0-9_]*!|\b[a-z_][a-z0-9_]*(?=\()|\b\d+\b)/g
  let output = ''
  let cursor = 0

  for (const match of source.matchAll(tokenPattern)) {
    const token = match[0]
    output += escapeHtml(source.slice(cursor, match.index))
    let kind = 'number'
    if (token.startsWith('//')) kind = 'comment'
    else if (token.startsWith('"') || token.startsWith("'")) kind = 'string'
    else if (/^(fn|let|mut|move|match|return|async|await|impl|self|Self)$/.test(token)) kind = 'keyword'
    else if (/^(Pin|Context|Poll|Option|Result|Batch|State|JoinHandle)$/.test(token)) kind = 'type'
    else if (/^(Ready|Pending|Some|Ok|Err|Aggregating)$/.test(token)) kind = 'variant'
    else if (token.endsWith('!')) kind = 'macro'
    else if (/^[a-z_]/.test(token)) kind = 'function'
    output += `<span class="syntax-${kind}">${escapeHtml(token)}</span>`
    cursor = match.index + token.length
  }

  return output + escapeHtml(source.slice(cursor))
}

const parseFrontmatter = (source) => {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error(`missing frontmatter in ${blogSource}`)

  const metadata = Object.fromEntries(
    match[1]
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(':')
        if (separator === -1) throw new Error(`invalid frontmatter line: ${line}`)
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
      }),
  )
  return {metadata, markdown: match[2].trim()}
}

const isTableSeparator = (line) =>
  /^\|(?:\s*:?-+:?\s*\|)+$/.test(line.trim())

const tableCells = (line) =>
  line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim())

const renderMarkdown = (markdown, {wrapSections = true} = {}) => {
  const lines = markdown.split('\n')
  const output = []
  let sectionOpen = false
  let index = 0

  const closeSection = () => {
    if (sectionOpen) output.push('</section>')
    sectionOpen = false
  }

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()
    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3)
      const code = []
      index += 1
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index])
        index += 1
      }
      index += 1
      const source = code.join('\n')
      const rendered = language === 'rust' ? highlightRust(source) : escapeHtml(source)
      output.push(`<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ''}>${rendered}</code></pre>`)
      continue
    }

    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (image) {
      const [, alt, src] = image
      const dimensions = src.includes('profile-before')
        ? ' width="3226" height="900"'
        : src.includes('profile-after')
          ? ' width="3224" height="864"'
          : ''
      output.push(`<figure class="wide-figure profile-comparison"><a class="profile-shot" href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer"><img src="${escapeHtml(src)}"${dimensions} alt="${escapeHtml(alt)}" loading="lazy" /></a></figure>`)
      index += 1
      continue
    }

    const heading = trimmed.match(/^(#{2,3})\s+(.+)$/)
    if (heading) {
      const [, marks, text] = heading
      if (marks.length === 2) {
        if (wrapSections) {
          closeSection()
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
          output.push(`<section id="${id}"><h2>${renderInline(text)}</h2>`)
          sectionOpen = true
        } else {
          output.push(`<h2>${renderInline(text)}</h2>`)
        }
      } else {
        output.push(`<h3>${renderInline(text)}</h3>`)
      }
      index += 1
      continue
    }

    if (trimmed.startsWith('> ')) {
      const quote = []
      while (index < lines.length && lines[index].trim().startsWith('> ')) {
        quote.push(lines[index].trim().slice(2))
        index += 1
      }
      output.push(`<div class="takeaway"><p>${renderInline(quote.join(' '))}</p></div>`)
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = []
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''))
        index += 1
      }
      output.push(`<ol class="steps">${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ol>`)
      continue
    }

    if (/^\([a-z]\)\s+/.test(trimmed)) {
      const items = []
      while (index < lines.length && /^\([a-z]\)\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\([a-z]\)\s+/, ''))
        index += 1
      }
      output.push(`<ol class="goals-list">${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ol>`)
      continue
    }

    if (trimmed.startsWith('- ')) {
      const items = []
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(lines[index].trim().slice(2))
        index += 1
      }
      output.push(`<ul class="metrics-list">${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`)
      continue
    }

    if (trimmed.startsWith('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const headers = tableCells(trimmed)
      index += 2
      const rows = []
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(tableCells(lines[index]))
        index += 1
      }
      output.push(
        `<div class="table-wrap"><table><thead><tr>${headers.map((cell) => `<th>${renderInline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
      )
      continue
    }

    const paragraph = [trimmed]
    index += 1
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index].trim()
      if (
        next.startsWith('#') ||
        next.startsWith('```') ||
        next.startsWith('> ') ||
        next.startsWith('- ') ||
        /^\d+\.\s+/.test(next) ||
        /^\([a-z]\)\s+/.test(next) ||
        next.startsWith('|') ||
        next.startsWith('![')
      ) break
      paragraph.push(next)
      index += 1
    }
    output.push(`<p>${renderInline(paragraph.join(' '))}</p>`)
  }

  closeSection()
  return output.join('\n')
}

const replaceRegion = (page, name, content) => {
  const start = `<!-- ${name}_START -->`
  const end = `<!-- ${name}_END -->`
  if (!page.includes(start) || !page.includes(end)) {
    throw new Error(`missing ${name} markers in ${blogPage}`)
  }
  return page.replace(new RegExp(`${start}[\\s\\S]*?${end}`), `${start}\n${content}\n${end}`)
}

const splitOnce = (value, marker) => {
  const parts = value.split(marker)
  if (parts.length !== 2) throw new Error(`expected exactly one ${marker} placeholder`)
  return parts.map((part) => part.trim())
}

const renderBlog = async () => {
  const source = await readFile(blogSource, 'utf8')
  const {metadata, markdown} = parseFrontmatter(source)
  const [beforeSingleStreamFigure, afterSingleStreamFigure] = splitOnce(
    markdown,
    '{{single_stream_animation}}',
  )
  const currentModelStart = beforeSingleStreamFigure.indexOf('\n## ')
  if (currentModelStart === -1) {
    throw new Error('expected the current model section before the single-stream animation')
  }
  const intro = beforeSingleStreamFigure.slice(0, currentModelStart).trim()
  const currentModel = beforeSingleStreamFigure.slice(currentModelStart).trim()

  const [beforeRuntimeFigure, afterRuntimeFigure] = splitOnce(
    afterSingleStreamFigure,
    '{{tokio_poll_animation}}',
  )
  const runtimeStart = beforeRuntimeFigure.indexOf('\n## ')
  if (runtimeStart === -1) {
    throw new Error('expected the runtime section before the Tokio animation')
  }
  const currentModelContinuation = beforeRuntimeFigure.slice(0, runtimeStart).trim()
  const runtime = beforeRuntimeFigure.slice(runtimeStart).trim()

  const [middle, outro] = splitOnce(
    afterRuntimeFigure,
    '{{multi_stream_animation}}',
  )

  const date = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${metadata.date}T00:00:00Z`))
  const subtitle = metadata.subtitle
    ? `\n  <p class="dek">${escapeHtml(metadata.subtitle)}</p>`
    : ''
  const header = `<header>
  <p class="eyebrow">${date.toLowerCase()}</p>
  <h1>${escapeHtml(metadata.title)}</h1>${subtitle}
</header>`

  let page = await readFile(blogPage, 'utf8')
  page = page.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(metadata.title)} — jayant shrivastava</title>`)
  page = page.replace(
    /(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/,
    `$1${escapeHtml(metadata.description)}$2`,
  )
  page = replaceRegion(page, 'GENERATED_HEADER', header)
  page = replaceRegion(page, 'GENERATED_INTRO', renderMarkdown(intro))
  page = replaceRegion(
    page,
    'GENERATED_CURRENT_MODEL',
    renderMarkdown(currentModel, {wrapSections: false}),
  )
  page = replaceRegion(
    page,
    'GENERATED_CURRENT_MODEL_CONTINUATION',
    renderMarkdown(currentModelContinuation, {wrapSections: false}),
  )
  page = replaceRegion(page, 'GENERATED_RUNTIME', renderMarkdown(runtime, {wrapSections: false}))
  page = replaceRegion(page, 'GENERATED_MIDDLE', renderMarkdown(middle, {wrapSections: false}))
  page = replaceRegion(page, 'GENERATED_OUTRO', renderMarkdown(outro))
  await writeFile(blogPage, page)

  const homePage = join(publicDirectory, 'index.html')
  const home = await readFile(homePage, 'utf8')
  const updatedHome = home.replace(
    /(<a href="blog\/cuda-streams\/">)[\s\S]*?(<\/a>)/,
    `$1${escapeHtml(metadata.title.toLowerCase())}$2`,
  )
  await writeFile(homePage, updatedHome)
}

await renderBlog()

await rm(buildDirectory, {recursive: true, force: true})
await cp(publicDirectory, buildDirectory, {recursive: true})

console.log('rendered Markdown posts and copied public/ to build/')
