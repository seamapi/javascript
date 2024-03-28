import fs from 'node:fs/promises'
import path from 'node:path'

const readUsageSection = async (modulePath: string): Promise<string> => {
  const data = await fs.readFile(
    path.join('node_modules', modulePath, 'README.md'),
    {
      encoding: 'utf-8',
    },
  )

  const regex = /\s\S*#* Usage\s*([^#]*)/
  const matches = regex.exec(data)
  if (matches == null || matches.length !== 2) {
    throw new Error('Missing [## Usage] section')
  }

  const usage = matches[1]?.replace(/^\s+|\s+$/g, '') // trim any trailing whitespace

  if (usage == null) {
    throw new Error('Invalid [## Usage] format')
  }

  return usage
}

// just leave out @seamapi/types and assume missing usage section is always an error
// since we will just add it here if we want to include it later.
// Should greatly simplify all the null conditionals
const submodules = [
  path.join('@seamapi', 'webhook'),
  path.join('@seamapi', 'http'),
]

const writeReadmeUsage = async (content: string): Promise<void> => {
  const projectReadme = await fs.readFile('./README.md', {
    encoding: 'utf-8',
  })

  const usageRegex = /### Usage\s*([\s\S]*?(?=\n## Development))/

  const matches = usageRegex.exec(projectReadme)

  if (matches == null || matches.length !== 2 || matches[1] == null) {
    throw new Error('Invalid README.md format')
  }

  const updatedContent = content
    .replace('@seamapi/webhook', 'seam')
    .replace('@seamapi/http', 'seam')

  const currentUsage = matches[1]
  if (currentUsage.includes(updatedContent)) {
    return
  }

  const injected = `### Usage

${currentUsage}
${content}
`

  const result = projectReadme.replace(usageRegex, injected)

  await fs.writeFile('./README.md', result)
}

const sections = await Promise.all(submodules.map(readUsageSection))
await writeReadmeUsage(sections.join('\n'))
