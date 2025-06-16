import { NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

export async function GET() {
  try {
    let csvContent = ""
    let fileName = ""

    // First try to read from local csv-files directory
    const csvDir = join(process.cwd(), "csv-files")
    const possibleFiles = ["products.csv", "export.csv", "shopify-export.csv", "sample.csv"]

    let csvFilePath: string | null = null

    // Find the first available CSV file locally
    for (const file of possibleFiles) {
      const filePath = join(csvDir, file)
      if (existsSync(filePath)) {
        csvFilePath = filePath
        fileName = file
        break
      }
    }

    // If no local file found, look for any .csv file
    if (!csvFilePath) {
      try {
        const fs = require("fs")
        const files = fs.readdirSync(csvDir)
        const csvFiles = files.filter((file: string) => file.toLowerCase().endsWith(".csv"))

        if (csvFiles.length > 0) {
          csvFilePath = join(csvDir, csvFiles[0])
          fileName = csvFiles[0]
        }
      } catch (error) {
        // Directory might not exist
      }
    }

    if (csvFilePath) {
      // Read local CSV file
      csvContent = readFileSync(csvFilePath, "utf8")
    } else {
      // Fallback: fetch from the provided URL
      const csvUrl =
        "add online uploaded csv url here"

      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`)
      }
      csvContent = await response.text()
      fileName = "sample.csv (from URL)"
    }

    if (!csvContent || csvContent.trim().length === 0) {
      throw new Error("CSV file is empty")
    }

    // Get first few lines to debug
    const lines = csvContent.split("\n").slice(0, 5)
    const headers = lines[0] ? lines[0].split("\t") : []

    return NextResponse.json({
      fileName,
      fileSize: `${(csvContent.length / 1024 / 1024).toFixed(2)} MB`,
      totalLines: csvContent.split("\n").length,
      headers: headers.slice(0, 20), // First 20 headers
      sampleLines: lines.slice(1, 3), // First 2 data lines
      headerCount: headers.length,
    })
  } catch (error) {
    console.error("❌ Debug error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
