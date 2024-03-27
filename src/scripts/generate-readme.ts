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

void (async () => {
  const webhookReadme = getUsageSection(
    './node_modules/@seamapi/webhook/README.md',
  ).replace('@seamapi/webhook', 'seam')
  const httpReadme = getUsageSection(
    './node_modules/@seamapi/http/README.md',
  ).replace('@seamapi/http', 'seam')

  const typesReadme = getUsageSection(
    './node_modules/@seamapi/types/README.md',
    {
      isNullable: true,
    },
  )?.replace('@seamapi/types', 'seam')

  const projectReadme = fs.readFileSync('./README.md', {
    encoding: 'utf-8',
  })

  const usageRegex = /### Usage\s*([\s\S]*?(?=\n## Development))/

  const matches = usageRegex.exec(projectReadme)

  if (matches == null || matches.length !== 2) {
    throw new Error('Invalid README.md format')
  }

  const currentUsage = matches[1]

  if (
    currentUsage != null &&
    currentUsage.includes(webhookReadme) &&
    currentUsage.includes(httpReadme) &&
    currentUsage.includes(typesReadme ?? '')
  ) {
    return
  }

  let injected = `### Usage

  ${currentUsage}
  #### Receiving Webhooks

  ${webhookReadme}

  #### Using HTTP client

  ${httpReadme}
  `

  if (typesReadme != null) {
    injected += `

  #### Types

  ${typesReadme}
  `
  }

  const result = projectReadme.replace(usageRegex, injected)

  fs.writeFileSync('./README.md', result)
})()
