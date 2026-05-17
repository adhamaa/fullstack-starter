import { copyFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { downloadTemplate } from 'giget'

const TEMPLATE_REPO = 'github:adhamaa/fullstack-starter'

const ENV_COPIES: Array<{ from: string; to: string }> = [
  { from: '.env.example', to: '.env' },
  { from: 'apps/web/.env.local.example', to: 'apps/web/.env.local' },
  { from: 'apps/mobile/.env.example', to: 'apps/mobile/.env' },
]

async function copyIfExists(root: string, from: string, to: string): Promise<void> {
  try {
    await copyFile(join(root, from), join(root, to))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
}

export async function scaffoldProject(options: {
  targetDir: string
  templateRef: string
}): Promise<string> {
  const source = `${TEMPLATE_REPO}#${options.templateRef}`
  const { dir } = await downloadTemplate(source, {
    dir: options.targetDir,
    force: true,
  })

  await rm(join(dir, '.git'), { recursive: true, force: true })

  for (const { from, to } of ENV_COPIES) {
    await copyIfExists(dir, from, to)
  }

  return dir
}

export function printNextSteps(projectDir: string): void {
  const rel = projectDir.replace(/\\/g, '/')
  console.log(`
Created ${rel}

Next steps:

  cd ${rel}
  corepack enable
  corepack prepare pnpm@10.33.4 --activate
  pnpm install
  pnpm infra:up
  pnpm --filter api-node db:migrate
  pnpm dev

See the project README for URLs, Keycloak demo credentials, and Windows notes.
`)
}
