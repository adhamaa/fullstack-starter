import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, getClient } from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Import remedies and related data from JSON file
 * 
 * Expected JSON structure:
 * {
 *   "remedies": [
 *     {
 *       "name": "Remedy Name",
 *       "common_name": "Common Name",
 *       "abbreviation": "Abbr.",
 *       "source": "Vegetable|Mineral|Animal",
 *       "description": "Description text",
 *       "characteristics": "Key characteristics",
 *       "symptoms": [...],
 *       "modalities": [...],
 *       "mental_symptoms": [...],
 *       "potencies": [...]
 *     }
 *   ]
 * }
 */

async function importData(filePath) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    // Read data file
    const dataPath = path.join(__dirname, '..', filePath);
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log(`Importing ${data.remedies.length} remedies...`);
    
    for (const remedyData of data.remedies) {
      console.log(`\nProcessing: ${remedyData.name}`);
      
      // Insert remedy
      const remedyResult = await client.query(
        `INSERT INTO remedies (name, common_name, abbreviation, source, description, characteristics)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name) DO UPDATE SET
           common_name = EXCLUDED.common_name,
           abbreviation = EXCLUDED.abbreviation,
           source = EXCLUDED.source,
           description = EXCLUDED.description,
           characteristics = EXCLUDED.characteristics,
           updated_at = CURRENT_TIMESTAMP
         RETURNING id`,
        [
          remedyData.name,
          remedyData.common_name || null,
          remedyData.abbreviation || null,
          remedyData.source || null,
          remedyData.description || null,
          remedyData.characteristics || null
        ]
      );
      
      const remedyId = remedyResult.rows[0].id;
      console.log(`  Remedy ID: ${remedyId}`);
      
      // Import symptoms
      if (remedyData.symptoms && remedyData.symptoms.length > 0) {
        console.log(`  Importing ${remedyData.symptoms.length} symptoms...`);
        
        for (const symptomData of remedyData.symptoms) {
          // Get or create body system
          let bodySystemId = null;
          if (symptomData.body_system) {
            const bodySystemResult = await client.query(
              `INSERT INTO body_systems (name) VALUES ($1)
               ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
               RETURNING id`,
              [symptomData.body_system]
            );
            bodySystemId = bodySystemResult.rows[0].id;
          }
          
          // Insert symptom
          const symptomResult = await client.query(
            `INSERT INTO symptoms (body_system_id, description, location, modality, severity)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [
              bodySystemId,
              symptomData.description,
              symptomData.location || null,
              symptomData.modality || null,
              symptomData.severity || null
            ]
          );
          
          const symptomId = symptomResult.rows[0].id;
          
          // Link symptom to remedy
          await client.query(
            `INSERT INTO remedy_symptoms (remedy_id, symptom_id, grade, notes)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (remedy_id, symptom_id) DO UPDATE SET
               grade = EXCLUDED.grade,
               notes = EXCLUDED.notes`,
            [remedyId, symptomId, symptomData.grade || 2, symptomData.notes || null]
          );
        }
      }
      
      // Import modalities
      if (remedyData.modalities && remedyData.modalities.length > 0) {
        console.log(`  Importing ${remedyData.modalities.length} modalities...`);
        
        for (const modalityData of remedyData.modalities) {
          await client.query(
            `INSERT INTO modalities (remedy_id, type, description, category)
             VALUES ($1, $2, $3, $4)`,
            [
              remedyId,
              modalityData.type,
              modalityData.description,
              modalityData.category || null
            ]
          );
        }
      }
      
      // Import mental symptoms
      if (remedyData.mental_symptoms && remedyData.mental_symptoms.length > 0) {
        console.log(`  Importing ${remedyData.mental_symptoms.length} mental symptoms...`);
        
        for (const mentalData of remedyData.mental_symptoms) {
          await client.query(
            `INSERT INTO mental_symptoms (remedy_id, description, intensity)
             VALUES ($1, $2, $3)`,
            [remedyId, mentalData.description, mentalData.intensity || null]
          );
        }
      }
      
      // Import potencies
      if (remedyData.potencies && remedyData.potencies.length > 0) {
        console.log(`  Linking ${remedyData.potencies.length} potencies...`);
        
        for (const potencyName of remedyData.potencies) {
          // Get potency ID
          const potencyResult = await client.query(
            `SELECT id FROM potencies WHERE name = $1`,
            [potencyName]
          );
          
          if (potencyResult.rows.length > 0) {
            const potencyId = potencyResult.rows[0].id;
            const recommended = ['30C', '200C'].includes(potencyName);
            
            await client.query(
              `INSERT INTO remedy_potencies (remedy_id, potency_id, recommended)
               VALUES ($1, $2, $3)
               ON CONFLICT (remedy_id, potency_id) DO UPDATE SET
                 recommended = EXCLUDED.recommended`,
              [remedyId, potencyId, recommended]
            );
          }
        }
      }
      
      // Import clinical conditions
      if (remedyData.conditions && remedyData.conditions.length > 0) {
        console.log(`  Linking ${remedyData.conditions.length} conditions...`);
        
        for (const conditionData of remedyData.conditions) {
          // Get or create condition
          const conditionResult = await client.query(
            `INSERT INTO clinical_conditions (name, description, category)
             VALUES ($1, $2, $3)
             ON CONFLICT (name) DO UPDATE SET
               description = EXCLUDED.description,
               category = EXCLUDED.category
             RETURNING id`,
            [
              conditionData.name,
              conditionData.description || null,
              conditionData.category || null
            ]
          );
          
          const conditionId = conditionResult.rows[0].id;
          
          // Link condition to remedy
          await client.query(
            `INSERT INTO remedy_conditions (remedy_id, condition_id, indication_strength, notes)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (remedy_id, condition_id) DO UPDATE SET
               indication_strength = EXCLUDED.indication_strength,
               notes = EXCLUDED.notes`,
            [
              remedyId,
              conditionId,
              conditionData.indication_strength || 'Secondary',
              conditionData.notes || null
            ]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Import completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run import
const filePath = process.argv[2] || 'data/remedies.json';

console.log(`Starting import from: ${filePath}\n`);

importData(filePath)
  .then(() => {
    console.log('\nImport process finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nImport process failed:', error);
    process.exit(1);
  });
