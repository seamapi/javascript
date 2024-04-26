import fs from 'node:fs/promises'
import path from 'node:path'

const readmeName = 'README.md'

interface Submodule {
  heading: string | null
  readmePath: string
}

const submodules: Submodule[] = [
  {
    heading: null,
    readmePath: path.join('node_modules', '@seamapi', 'http', readmeName),
  },
  {
    heading: 'Receiving Webhooks',
    readmePath: path.join('node_modules', '@seamapi', 'webhook', readmeName),
  },
]

const sections = await Promise.all(submodules.map(readUsageSection))
await writeReadmeUsage(sections.join('\n'))

async function readUsageSection({
  readmePath,
  heading,
}: Submodule): Promise<string> {
  const data = await fs.readFile(readmePath)

  const regex = /#* Usage\s*([\s\S]*?(?=\n## \w))/
  const matches = regex.exec(data.toString())
  if (matches == null || matches.length !== 2) {
    throw new Error('Missing [## Usage] section')
  }

  const usage = matches[1]
  if (usage == null) {
    throw new Error('Invalid [## Usage] format')
  }

  const content = usage.trim()

  if (heading == null) return content
  return `### ${heading}\n\n${content}`
}

async function writeReadmeUsage(content: string): Promise<void> {
  const projectReadme = await fs.readFile(readmeName, {
    encoding: 'utf-8',
  })

  const usageRegex = /## Usage\s*([\s\S]*?(?=\n## Development))/

  const matches = usageRegex.exec(projectReadme)

  if (matches == null || matches.length !== 2 || matches[1] == null) {
    throw new Error(`Invalid ${readmeName} format`)
  }

  const updatedContent = content
    .replaceAll('@seamapi/webhook', 'seam')
    .replaceAll('@seamapi/http', 'seam')
    .replaceAll('SeamHttp', 'Seam')
    .replaceAll('SeamRequest', 'SeamHttpRequest')
    .replaceAll('seam/connect', 'seam')

  const currentUsageSection = matches[1]

  if (
    currentUsageSection
      .replaceAll(/\s/g, '')
      .includes(updatedContent.replaceAll(/\s/g, '')) // Remove all whitespace to ignore formatting changes
  ) {
    return
  }

  const injected = `## Usage

${updatedContent}
`

  const result = projectReadme.replace(usageRegex, injected)

  await fs.writeFile('README.md', result)
}
