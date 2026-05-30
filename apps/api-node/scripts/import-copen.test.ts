import { describe, expect, it } from 'vitest'
import { parseCopenOcr } from './import-copen.js'

describe('parseCopenOcr', () => {
  it('parses clean "name rate [page]" lines under a body-system header', () => {
    const sample = `===== PDF page 3 =====
No. Page

EARS, NOSE AND THROAT
Common Cold G/17
Hay Fever G/19 81
Sneezing and Coryza L/15 108
Nasal Passages (Irritations) L/23 116

STOMACH
Stomach R/5 12
Nausea R/47 54
Travel Sickness C/11 174
`

    expect(parseCopenOcr(sample)).toEqual([
      { name: 'Common Cold', bodySystem: 'EARS, NOSE AND THROAT', rateValue: 'G/17' },
      {
        name: 'Hay Fever',
        bodySystem: 'EARS, NOSE AND THROAT',
        rateValue: 'G/19',
        sourcePage: '81',
      },
      {
        name: 'Sneezing and Coryza',
        bodySystem: 'EARS, NOSE AND THROAT',
        rateValue: 'L/15',
        sourcePage: '108',
      },
      {
        name: 'Nasal Passages (Irritations)',
        bodySystem: 'EARS, NOSE AND THROAT',
        rateValue: 'L/23',
        sourcePage: '116',
      },
      { name: 'Stomach', bodySystem: 'STOMACH', rateValue: 'R/5', sourcePage: '12' },
      { name: 'Nausea', bodySystem: 'STOMACH', rateValue: 'R/47', sourcePage: '54' },
      { name: 'Travel Sickness', bodySystem: 'STOMACH', rateValue: 'C/11', sourcePage: '174' },
    ])
  })

  it('prefers the SC prefix over a bare C rate', () => {
    const sample = `GENERALITIES
Insect Bites SC/15 200
`

    expect(parseCopenOcr(sample)).toEqual([
      { name: 'Insect Bites', bodySystem: 'GENERALITIES', rateValue: 'SC/15', sourcePage: '200' },
    ])
  })

  it('skips index-style lines where the rate precedes the name', () => {
    const sample = `===== PDF page 11 =====
FORMULAS
R/1 Inflamm. of Glands 8
R/5 Stomach 12
`

    expect(parseCopenOcr(sample)).toEqual([])
  })

  it('skips rate lines that are not under a body-system header', () => {
    const sample = `Common Cold G/17
Hay Fever G/19 81
`

    expect(parseCopenOcr(sample)).toEqual([])
  })

  it('ignores OCR rate typos that use letters instead of digits', () => {
    const sample = `STOMACH
Skin Eruptions C/l4 17
`

    expect(parseCopenOcr(sample)).toEqual([])
  })
})
