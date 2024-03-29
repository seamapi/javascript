import fs from 'node:fs/promises'
import path from 'node:path'

const submodules = [
  path.join('@seamapi', 'webhook'),
  path.join('@seamapi', 'http'),
]

const sections = await Promise.all(submodules.map(readUsageSection))
await writeReadmeUsage(sections.join('\n'))

async function readUsageSection(modulePath: string): Promise<string> {
  const data = await fs.readFile(
    path.join('node_modules', modulePath, 'README.md'),
    {
      encoding: 'utf-8',
    },
  )

  const regex = /#* Usage\s*([\s\S]*?(?=\n## \w))/
  const matches = regex.exec(data)
  if (matches == null || matches.length !== 2) {
    throw new Error('Missing [## Usage] section')
  }

  const usage = matches[1]
  if (usage == null) {
    throw new Error('Invalid [## Usage] format')
  }

  return usage.trimStart().trimEnd()
}

async function writeReadmeUsage(content: string): Promise<void> {
  const projectReadme = await fs.readFile('README.md', {
    encoding: 'utf-8',
  })

  const usageRegex = /## Usage\s*([\s\S]*?(?=\n## Development))/

  const matches = usageRegex.exec(projectReadme)

  if (matches == null || matches.length !== 2 || matches[1] == null) {
    throw new Error('Invalid README.md format')
  }

  const updatedContent = content
    .replaceAll('@seamapi/webhook', 'seam')
    .replaceAll('@seamapi/http', 'seam')
    .replaceAll('SeamHttp', 'Seam')
    .replaceAll('seam/connect', 'seam')

  const currentUsageSection = matches[1]

  if (
    currentUsageSection
      .replaceAll(/\s/g, '')
      .includes(updatedContent.replaceAll(/\s/g, '')) // Remove all whitespace to ignore formatting changes
  ) {
    return
  }

  const injected = `### Usage

${updatedContent}
`

  const result = projectReadme.replace(usageRegex, injected)

  await fs.writeFile('README.md', result)
}
