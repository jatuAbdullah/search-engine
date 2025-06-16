import fs from 'fs'
import Papa from 'papaparse'

// Mapping CSV columns to clean JSON keys
const FIELD_MAP = {
  _AIRBYTE_RAW_ID: 'id',
  ID: 'productId',
  TAGS: 'tags',
  TITLE: 'title',
  HANDLE: 'handle',
  STATUS: 'status',
  VENDOR: 'vendor',
  BODY_HTML: 'description',
  PRICE_RANGE_V2: 'priceRange',
  ONLINE_STORE_URL: 'url',
  TOTAL_INVENTORY: 'inventory',
  FEATURED_IMAGE: 'featuredImage' // Add this to process image
}

const REQUIRED_COLUMNS = Object.keys(FIELD_MAP)

function extractColumnsFromCSV(csvText) {
  const { data, errors } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length > 0) {
    console.error('CSV Parse Errors:', errors)
    return []
  }

  return data.map((row) => {
    const result = {}

    for (const col of REQUIRED_COLUMNS) {
      const key = FIELD_MAP[col]
      const value = row[col]

      if (value !== undefined && value !== '') {
        try {
          const parsed = JSON.parse(value)

          // Get price from min_variant_price.amount
          if (key === 'priceRange' && parsed?.min_variant_price?.amount) {
            result['price'] = parseFloat(parsed.min_variant_price.amount)
            result[key] = parsed
          }

          // Get image URL
          else if (key === 'featuredImage' && parsed?.url) {
            result['image'] = parsed.url
          }

          else {
            result[key] = parsed
          }
        } catch {
          result[key] = value
        }
      } else {
        result[key] =
          key === 'tags'
            ? []
            : key === 'inventory'
            ? 0
            : key === 'priceRange'
            ? { min: 0, currency: 'GBP' }
            : null
      }
    }

    return result
  })
}

const inputCsvFile = './csv-files/products.csv'
const outputJsonFile = './public/products.json'

fs.readFile(inputCsvFile, 'utf8', (err, csvData) => {
  if (err) {
    console.error('❌ Failed to read CSV file:', err)
    return
  }

  const jsonData = extractColumnsFromCSV(csvData)

  fs.writeFile(outputJsonFile, JSON.stringify(jsonData, null, 2), err => {
    if (err) {
      console.error('❌ Failed to write JSON file:', err)
    } else {
      // console.log(`✅ JSON data saved to ${outputJsonFile}`)
    }
  })
})
