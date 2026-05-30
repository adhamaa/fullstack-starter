import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import pg from 'pg'
import { env } from '../env.js'
import {
  bodySystems,
  clinicalConditions,
  formulaRemedies,
  formulas,
  modalities,
  mentalSymptoms,
  potencies,
  radionicRates,
  rateBanks,
  remedyConditions,
  remedyPotencies,
  remedyRelationships,
  remedySymptoms,
  remedies,
  symptoms,
} from './schema/index.js'

async function run() {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL })
  const db = drizzle(pool)

  console.log('Seeding database...')

  const bodySystemRows = await db
    .insert(bodySystems)
    .values([
      { name: 'Nervous System', description: 'Brain, nerves, and neurological functions' },
      { name: 'Respiratory System', description: 'Lungs, bronchi, and breathing' },
      { name: 'Digestive System', description: 'Stomach, intestines, liver, and digestion' },
      { name: 'Musculoskeletal System', description: 'Muscles, bones, joints, and connective tissue' },
      { name: 'Skin', description: 'Integumentary system including skin, hair, nails' },
      { name: 'Mind', description: 'Mental and emotional symptoms' },
      { name: 'Head', description: 'Head, face, and related symptoms' },
    ])
    .onConflictDoNothing()
    .returning()

  const potencyRows = await db
    .insert(potencies)
    .values([
      { name: '6C', scale: 'Centesimal', dilutionFactor: 100, description: 'Low potency' },
      { name: '30C', scale: 'Centesimal', dilutionFactor: 100, description: 'Medium potency' },
      { name: '200C', scale: 'Centesimal', dilutionFactor: 100, description: 'High potency' },
      { name: '1M', scale: 'Centesimal', dilutionFactor: 100, description: 'Very high potency' },
      { name: '6X', scale: 'Decimal', dilutionFactor: 10, description: 'Low decimal potency' },
      { name: 'LM1', scale: 'LM', dilutionFactor: 50000, description: 'First LM potency' },
    ])
    .onConflictDoNothing()
    .returning()

  const remedyRows = await db
    .insert(remedies)
    .values([
      {
        name: 'Arnica Montana',
        commonName: "Leopard's Bane",
        abbreviation: 'Arn.',
        source: 'Vegetable',
        description:
          'The great remedy for trauma, bruising, shock, and soreness. Used extensively for injuries, surgery, and overexertion.',
        characteristics:
          'Feels bruised and sore all over. Says nothing is wrong and sends doctor away.',
      },
      {
        name: 'Aconitum Napellus',
        commonName: 'Monkshood',
        abbreviation: 'Acon.',
        source: 'Vegetable',
        description: 'For sudden, violent complaints with fear and anxiety.',
        characteristics: 'Sudden onset. Great fear and anxiety. Restlessness.',
      },
      {
        name: 'Belladonna',
        commonName: 'Deadly Nightshade',
        abbreviation: 'Bell.',
        source: 'Vegetable',
        description: 'For intense, violent symptoms with heat, redness, and throbbing.',
        characteristics: 'Sudden violent onset. Burning heat. Throbbing pains.',
      },
      {
        name: 'Bryonia Alba',
        commonName: 'Wild Hops',
        abbreviation: 'Bry.',
        source: 'Vegetable',
        description: 'For conditions made worse by any motion.',
        characteristics: 'Worse from slightest motion. Better from pressure and lying still.',
      },
      {
        name: 'Chamomilla',
        commonName: 'German Chamomile',
        abbreviation: 'Cham.',
        source: 'Vegetable',
        description: 'For pain that is unbearable, especially in children.',
        characteristics: 'Extreme irritability. Nothing pleases.',
      },
    ])
    .onConflictDoNothing()
    .returning()

  const conditionRows = await db
    .insert(clinicalConditions)
    .values([
      { name: 'Trauma', description: 'Physical injuries, bruising, shock', category: 'Acute' },
      { name: 'Anxiety', description: 'Nervousness, worry, fear', category: 'Chronic' },
      { name: 'Headache', description: 'Various types of head pain', category: 'Acute' },
      { name: 'Migraine', description: 'Severe recurring headache', category: 'Acute' },
    ])
    .onConflictDoNothing()
    .returning()

  const arnica = remedyRows.find((r) => r.name === 'Arnica Montana') ?? (await db.select().from(remedies).where(eq(remedies.name, 'Arnica Montana')))[0]
  const aconite = remedyRows.find((r) => r.name === 'Aconitum Napellus') ?? (await db.select().from(remedies).where(eq(remedies.name, 'Aconitum Napellus')))[0]
  const belladonna = remedyRows.find((r) => r.name === 'Belladonna') ?? (await db.select().from(remedies).where(eq(remedies.name, 'Belladonna')))[0]
  const musculo = bodySystemRows.find((b) => b.name === 'Musculoskeletal System') ?? (await db.select().from(bodySystems).where(eq(bodySystems.name, 'Musculoskeletal System')))[0]
  const nervous = bodySystemRows.find((b) => b.name === 'Nervous System') ?? (await db.select().from(bodySystems).where(eq(bodySystems.name, 'Nervous System')))[0]
  const skin = bodySystemRows.find((b) => b.name === 'Skin') ?? (await db.select().from(bodySystems).where(eq(bodySystems.name, 'Skin')))[0]

  if (arnica && musculo && nervous && skin) {
    const symptomRows = await db
      .insert(symptoms)
      .values([
        {
          bodySystemId: musculo.id,
          description: 'Soreness and bruised feeling all over body',
          location: 'Generalized',
          severity: 'Moderate',
        },
        {
          bodySystemId: musculo.id,
          description: 'Pain from overexertion',
          location: 'Muscles',
          severity: 'Moderate',
        },
        {
          bodySystemId: nervous.id,
          description: 'Fear of being touched due to pain',
          location: 'General',
          severity: 'Moderate',
        },
        {
          bodySystemId: skin.id,
          description: 'Black and blue spots, bruising',
          location: 'Skin',
          severity: 'Mild',
        },
      ])
      .returning()

    for (const [symptom, grade] of [
      [symptomRows[0], 4],
      [symptomRows[1], 3],
      [symptomRows[2], 3],
      [symptomRows[3], 2],
    ] as const) {
      if (symptom) {
        await db.insert(remedySymptoms).values({ remedyId: arnica.id, symptomId: symptom.id, grade }).onConflictDoNothing()
      }
    }

    await db.insert(modalities).values([
      { remedyId: arnica.id, type: 'Worse from', description: 'Touch', category: 'Physical' },
      { remedyId: arnica.id, type: 'Worse from', description: 'Motion', category: 'Physical' },
      { remedyId: arnica.id, type: 'Better from', description: 'Lying down', category: 'Position' },
    ])

    await db.insert(mentalSymptoms).values([
      { remedyId: arnica.id, description: 'Says nothing is wrong, sends doctor away', intensity: 'Strong' },
    ])
  }

  if (aconite) {
    await db.insert(mentalSymptoms).values([
      { remedyId: aconite.id, description: 'Fear and anxiety, predicts death', intensity: 'Very Strong' },
    ])
  }

  const potency30 = potencyRows.find((p) => p.name === '30C') ?? (await db.select().from(potencies).where(eq(potencies.name, '30C')))[0]
  const potency200 = potencyRows.find((p) => p.name === '200C') ?? (await db.select().from(potencies).where(eq(potencies.name, '200C')))[0]

  if (arnica && potency30) {
    await db.insert(remedyPotencies).values({ remedyId: arnica.id, potencyId: potency30.id, recommended: true, notes: 'Most commonly used for acute trauma' }).onConflictDoNothing()
  }
  if (arnica && potency200) {
    await db.insert(remedyPotencies).values({ remedyId: arnica.id, potencyId: potency200.id, recommended: true }).onConflictDoNothing()
  }

  const trauma = conditionRows.find((c) => c.name === 'Trauma') ?? (await db.select().from(clinicalConditions).where(eq(clinicalConditions.name, 'Trauma')))[0]
  const anxiety = conditionRows.find((c) => c.name === 'Anxiety') ?? (await db.select().from(clinicalConditions).where(eq(clinicalConditions.name, 'Anxiety')))[0]

  if (arnica && trauma) {
    await db.insert(remedyConditions).values({ remedyId: arnica.id, conditionId: trauma.id, indicationStrength: 'Primary', notes: 'First remedy to consider' }).onConflictDoNothing()
  }
  if (aconite && anxiety) {
    await db.insert(remedyConditions).values({ remedyId: aconite.id, conditionId: anxiety.id, indicationStrength: 'Primary' }).onConflictDoNothing()
  }

  if (arnica && belladonna) {
    await db.insert(remedyRelationships).values({
      remedyId: arnica.id,
      relatedRemedyId: belladonna.id,
      relationshipType: 'Complementary',
      notes: 'Can follow Arnica in some cases',
    })
  }

  const bankRows = await db
    .insert(rateBanks)
    .values([
      { name: 'Copen', description: 'Bruce Copen radionic instrument rates', sourceRef: 'Homeopathic Materia Medica Vol. 1' },
      { name: 'Kelly', description: 'Kelly rate catalogue', sourceRef: 'Kelly Radionic Rates' },
      { name: 'Delawarr', description: 'Delawarr radionic rates', sourceRef: 'Delawarr Laboratory' },
    ])
    .onConflictDoNothing()
    .returning()

  const copen = bankRows.find((b) => b.name === 'Copen') ?? (await db.select().from(rateBanks).where(eq(rateBanks.name, 'Copen')))[0]

  const formulaRows = await db
    .insert(formulas)
    .values([
      {
        name: 'Migraine and Neuralgia',
        indication: 'Migraine, neuralgia, nervous headache',
        description: 'Copen composite formula for head and nerve pain',
        bodySystem: 'Head',
        category: 'Copen Formula',
      },
      {
        name: 'Trauma and Shock',
        indication: 'Injury, bruising, shock after accident',
        description: 'Composite trauma support formula',
        bodySystem: 'Musculoskeletal System',
        category: 'Copen Formula',
      },
    ])
    .onConflictDoNothing()
    .returning()

  const migraineFormula = formulaRows.find((f) => f.name === 'Migraine and Neuralgia') ?? (await db.select().from(formulas).where(eq(formulas.name, 'Migraine and Neuralgia')))[0]
  const traumaFormula = formulaRows.find((f) => f.name === 'Trauma and Shock') ?? (await db.select().from(formulas).where(eq(formulas.name, 'Trauma and Shock')))[0]

  if (migraineFormula && belladonna) {
    await db.insert(formulaRemedies).values({ formulaId: migraineFormula.id, remedyId: belladonna.id, proportion: '1x', notes: 'Primary component' }).onConflictDoNothing()
  }
  if (traumaFormula && arnica) {
    await db.insert(formulaRemedies).values({ formulaId: traumaFormula.id, remedyId: arnica.id, proportion: '1x' }).onConflictDoNothing()
  }

  if (copen && arnica) {
    await db.insert(radionicRates).values([
      { bankId: copen.id, value: 'SC/3', rateableType: 'remedy', rateableId: arnica.id, category: 'Trauma', sourcePage: 'p.3' },
      { bankId: copen.id, value: 'G/21', rateableType: 'remedy', rateableId: arnica.id, category: 'General', notes: 'Arnica broadcast rate' },
    ]).onConflictDoNothing()
  }

  if (copen && migraineFormula) {
    await db.insert(radionicRates).values([
      { bankId: copen.id, value: 'C/15', rateableType: 'formula', rateableId: migraineFormula.id, category: 'Head', sourcePage: 'p.5' },
      { bankId: copen.id, value: 'SC/12', rateableType: 'formula', rateableId: migraineFormula.id, category: 'Neuralgia' },
    ]).onConflictDoNothing()
  }

  if (copen && traumaFormula) {
    await db.insert(radionicRates).values({ bankId: copen.id, value: 'G/6', rateableType: 'formula', rateableId: traumaFormula.id, category: 'Trauma' }).onConflictDoNothing()
  }

  console.log('Seed complete')
  await pool.end()
}

run().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
