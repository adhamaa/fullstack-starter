import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as p from '@clack/prompts'
import { printNextSteps, scaffoldProject } from './scaffold.js'
import { resolveTemplateRef } from './template-ref.js'

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string }

async function resolveProjectDir(argv: string[]): Promise<string | null> {
  const arg = argv[0]?.trim()
  if (arg) {
    return resolve(process.cwd(), arg)
  }

  const name = await p.text({
    message: 'Project directory name',
    placeholder: 'my-app',
    validate: (value) => {
      if (!value?.trim()) {
        return 'Directory name is required'
      }
    },
  })

  if (p.isCancel(name)) {
    return null
  }

  return resolve(process.cwd(), String(name).trim())
}

async function main(): Promise<void> {
  p.intro('create-fullstack')

  const projectDir = await resolveProjectDir(process.argv.slice(2))
  if (typeof projectDir !== 'string') {
    p.cancel('Cancelled.')
    process.exit(0)
  }

  if (existsSync(projectDir)) {
    const nonEmpty = existsSync(resolve(projectDir, 'package.json'))
    if (nonEmpty) {
      p.cancel(`Directory already exists: ${projectDir}`)
      process.exit(1)
    }
  }

  const templateRef = resolveTemplateRef(packageJson.version, process.env.TEMPLATE_TAG)

  const spinner = p.spinner()
  spinner.start(`Downloading fullstack-starter@${templateRef}…`)

  try {
    await scaffoldProject({ targetDir: projectDir, templateRef })
    spinner.stop('Template applied.')
  } catch (error) {
    spinner.stop('Download failed.')
    p.log.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  printNextSteps(projectDir)
  p.outro('Done!')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
