import fs from 'node:fs'

interface GetUsageSectionOptions<TNullable = false> {
  isNullable?: TNullable
}

const getUsageSection = <TNullable = false>(
  readmePath: string,
  options: GetUsageSectionOptions<TNullable> = {},
): TNullable extends true ? string | null : string => {
  const { isNullable = false } = options

  try {
    return readUsageSection(readmePath)
  } catch (error) {
    if (isNullable === true) {
      return null as any
    }

    throw error
  }
}

const readUsageSection = (readmePath: string): string => {
  const data = fs.readFileSync(readmePath, {
    encoding: 'utf-8',
  })

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

const webhookReadme = getUsageSection(
  './node_modules/@seamapi/webhook/README.md',
).replace('@seamapi/webhook', 'seam')
const httpReadme = getUsageSection(
  './node_modules/@seamapi/http/README.md',
).replace('@seamapi/http', 'seam')

const typesReadme = getUsageSection('./node_modules/@seamapi/types/README.md', {
  isNullable: true,
})?.replace('@seamapi/types', 'seam')

const projectReadme = fs.readFileSync('./README.md', {
  encoding: 'utf-8',
})

const result = projectReadme.replace(
  '### Usage\n',
  `### Usage

#### Receiving Webhooks

${webhookReadme}

#### Using HTTP client

${httpReadme}${typesReadme != null ? `\n\n#### Types\n\n${typesReadme}` : ''}
`,
)

fs.writeFileSync('./README.md', result)