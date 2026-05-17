import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const win = process.platform === 'win32'
const python = win
  ? path.join(dir, '.venv', 'Scripts', 'python.exe')
  : path.join(dir, '.venv', 'bin', 'python')

if (!fs.existsSync(python)) {
  console.error(
    '[api-python] Missing .venv. From apps/api-python run:\n' +
      '  python -m venv .venv\n' +
      (win
        ? '  .venv\\Scripts\\pip install -r requirements.txt\n'
        : '  .venv/bin/pip install -r requirements.txt\n') +
      '(See repo README — Python API section.)',
  )
  process.exit(1)
}

const child = spawn(python, ['run.py'], { stdio: 'inherit', cwd: dir, env: process.env })
child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0))
})
