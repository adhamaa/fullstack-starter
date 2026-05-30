import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { formulas, radionicRates, rateBanks } from '../src/db/schema/index.js'
import { env } from '../src/env.js'

// Radionic codes look like G/17, C/2, R/47, SC/12, L/15, P/36. SC is listed
// before the single-letter banks so the alternation prefers the two-letter
// prefix when both could match.
const RATE_PATTERN = /\b(SC|C|G|R|L|P)\/\d{1,2}\b/
const PAGE_SEPARATOR = /^=====\s*PDF page/i

const COPEN_BANK = {
  name: 'Copen',
  description: 'Bruce Copen radionic instrument rates',
  sourceRef: 'Homeopathic Materia Medica Vol. 1',
} as const

const DATA_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../data/copen-formulas.ocr.txt')

export interface CopenRecord {
  name: string
  bodySystem: string
  rateValue: string
  sourcePage?: string
}

// Body-system headers are ALL CAPS lines (e.g. "STOMACH", "EARS, NOSE AND
// THROAT"). They contain at least one letter, no lowercase letters, and no
// radionic rate of their own.
function isBodySystemHeader(line: string): boolean {
  if (!/[A-Z]/.test(line)) return false
  if (/[a-z]/.test(line)) return false
  if (RATE_PATTERN.test(line)) return false
  return true
}

/**
 * Parse the cleaned Copen OCR text into formula + rate records.
 *
 * The OCR is messy: only lines of the form `<name> <RATE> [page]` that sit
 * under a current ALL-CAPS body-system header are extracted. Index pages put
 * the rate before the name, and other pages split names, rates, and page
 * numbers into misaligned column blocks; both are skipped rather than guessed.
 */
export function parseCopenOcr(text: string): CopenRecord[] {
  const records: CopenRecord[] = []
  let currentBodySystem: string | null = null

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line === '') continue

    if (PAGE_SEPARATOR.test(line)) {
      currentBodySystem = null
      continue
    }

    if (isBodySystemHeader(line)) {
      currentBodySystem = line.replace(/\s+/g, ' ').trim()
      continue
    }

    if (!currentBodySystem) continue

    const match = RATE_PATTERN.exec(line)
    if (!match) continue

    const rateValue = match[0]
    const name = line.slice(0, match.index).replace(/\s+/g, ' ').trim()
    // A missing name means the rate led the line (index pages) or sat in a
    // detached rate-only column block — neither is reliably parseable.
    if (name === '') continue

    const after = line.slice(match.index + rateValue.length)
    const pageMatch = after.match(/\d{1,3}/)

    const record: CopenRecord = { name, bodySystem: currentBodySystem, rateValue }
    if (pageMatch) record.sourcePage = pageMatch[0]
    records.push(record)
  }

  return records
}

function summarize(records: CopenRecord[]) {
  return {
    total: records.length,
    distinctFormulas: new Set(records.map((r) => r.name)).size,
    distinctRates: new Set(records.map((r) => r.rateValue)).size,
  }
}

async function importToDb(records: CopenRecord[]) {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL })
  const db = drizzle(pool)

  try {
    await db.insert(rateBanks).values(COPEN_BANK).onConflictDoNothing()
    const copen = (await db.select().from(rateBanks).where(eq(rateBanks.name, COPEN_BANK.name)))[0]
    if (!copen) throw new Error('Failed to find or create the Copen rate bank')

    let insertedFormulas = 0
    let insertedRates = 0

    for (const record of records) {
      const insertedFormula = await db
        .insert(formulas)
        .values({ name: record.name, bodySystem: record.bodySystem, category: 'Copen Formula' })
        .onConflictDoNothing()
        .returning()
      if (insertedFormula[0]) insertedFormulas += 1

      const formula =
        insertedFormula[0] ??
        (await db.select().from(formulas).where(eq(formulas.name, record.name)))[0]
      if (!formula) continue

      const insertedRate = await db
        .insert(radionicRates)
        .values({
          bankId: copen.id,
          value: record.rateValue,
          rateableType: 'formula',
          rateableId: formula.id,
          category: record.bodySystem,
          sourcePage: record.sourcePage,
        })
        .onConflictDoNothing()
        .returning()
      if (insertedRate[0]) insertedRates += 1
    }

    return { insertedFormulas, insertedRates }
  } finally {
    await pool.end()
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const records = parseCopenOcr(readFileSync(DATA_PATH, 'utf8'))
  const summary = summarize(records)

  if (dryRun) {
    for (const record of records) {
      const page = record.sourcePage ? ` (p.${record.sourcePage})` : ''
      console.log(`[${record.bodySystem}] ${record.name} -> ${record.rateValue}${page}`)
    }
    console.log('\n--- dry run summary ---')
    console.log(`Total parsed records: ${summary.total}`)
    console.log(`Distinct formulas: ${summary.distinctFormulas}`)
    console.log(`Distinct rates: ${summary.distinctRates}`)
    return
  }

  console.log(
    `Parsed ${summary.total} records (${summary.distinctFormulas} formulas, ${summary.distinctRates} rates)`,
  )
  const result = await importToDb(records)
  console.log(
    `Inserted ${result.insertedFormulas} new formulas and ${result.insertedRates} new rates`,
  )
  console.log('Copen import complete')
}

function isMainModule(): boolean {
  const entry = process.argv[1]
  if (!entry) return false
  return resolve(fileURLToPath(import.meta.url)).toLowerCase() === resolve(entry).toLowerCase()
}

if (isMainModule()) {
  main().catch((error) => {
    console.error('Copen import failed:', error)
    process.exit(1)
  })
}
