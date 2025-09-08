// Script to fetch and parse ZSOP tournament schedule CSV data
const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ZSOP%20Schedule%20-%20Sep%202025%20V%201.5.xlsx%20-%20Schedule%20V%201.5-Q1I6clSMSrPJMAPdlOKLrSXTtB6d8h.csv"

async function parseTournamentData() {
  try {
    console.log("[v0] Fetching CSV data from:", csvUrl)
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("[v0] CSV data fetched successfully")
    console.log("[v0] First 500 characters:", csvText.substring(0, 500))

    // Parse CSV manually (simple approach)
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("[v0] Headers found:", headers)

    const tournaments = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Split by comma but handle quoted values
      const values = []
      let current = ""
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim())

      // Create tournament object
      const tournament = {}
      headers.forEach((header, index) => {
        tournament[header] = values[index] || ""
      })

      // Only include valid tournament entries (skip empty rows and headers)
      if (tournament["Event Name"] && tournament["Event Name"] !== "Event Name" && tournament["#"]) {
        tournaments.push(tournament)
      }
    }

    console.log("[v0] Parsed tournaments:", tournaments.length)
    console.log("[v0] Sample tournament:", tournaments[0])

    // Group tournaments by date
    const tournamentsByDate = {}
    tournaments.forEach((tournament) => {
      const date = tournament["D/M/Y"] || tournament["Date"]
      if (!tournamentsByDate[date]) {
        tournamentsByDate[date] = []
      }
      tournamentsByDate[date].push(tournament)
    })

    console.log("[v0] Tournaments grouped by date:", Object.keys(tournamentsByDate))

    return { tournaments, tournamentsByDate }
  } catch (error) {
    console.error("[v0] Error parsing tournament data:", error)
    return { tournaments: [], tournamentsByDate: {} }
  }
}

// Execute the parsing
parseTournamentData().then((result) => {
  console.log("[v0] Tournament data parsing complete")
  console.log("[v0] Total tournaments:", result.tournaments.length)
})
