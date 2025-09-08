"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

interface Tournament {
  Day: string
  Date: string
  "D/M/Y": string
  "Start time": string
  "#": string
  "Event Name": string
  Trophy: string
  GTD: string
  "≈  USD": string
  TWD: string
  "Buy-in": string
  Fee: string
  Stack: string
  BB: string
  "Level (Mins)": string
  "REG End Close": string
  "Blind Stucture": string
}

export function TournamentTabs() {
  const [activeTab, setActiveTab] = useState("events")
  const [currency, setCurrency] = useState<"USD" | "TWD">("USD")
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    gameType: [] as string[],
    eventType: [] as string[],
    buyInRange: [0, 30000] as [number, number],
    minBuyIn: 0,
    maxBuyIn: 30000,
  })

  const fetchTournamentData = async () => {
    try {
      const csvUrl =
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ZSOP%20Schedule%20-%20Sep%202025%20V%201.5.xlsx%20-%20Schedule%20V%201.5-Q1I6clSMSrPJMAPdlOKLrSXTtB6d8h.csv"
      const response = await fetch(csvUrl)
      const csvText = await response.text()

      const lines = csvText.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

      const parsedTournaments: Tournament[] = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values: string[] = []
        let current = ""
        let inQuotes = false

        for (let j = 0; j < line.length; j++) {
          const char = line[j]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === "," && !inQuotes) {
            values.push(current.trim().replace(/"/g, ""))
            current = ""
          } else {
            current += char
          }
        }
        values.push(current.trim().replace(/"/g, ""))

        const tournament: any = {}
        headers.forEach((header, index) => {
          tournament[header] = values[index] || ""
        })

        if (tournament["Event Name"] && tournament["Event Name"] !== "Event Name" && tournament["#"]) {
          parsedTournaments.push(tournament as Tournament)
        }
      }

      setTournaments(parsedTournaments)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching tournament data:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTournamentData()
  }, [])

  const convertCurrency = (usdAmount: string) => {
    const amount = Number.parseInt(usdAmount.replace(/[$,]/g, ""))
    if (currency === "TWD") {
      return `NT$${(amount * 31).toLocaleString()}`
    }
    return `$${amount.toLocaleString()}`
  }

  const toggleCurrency = () => {
    setCurrency(currency === "USD" ? "TWD" : "USD")
  }

  const downloadSchedule = () => {
    const imageUrl =
      "https://zodiacseriesofpoker.com/wp-content/uploads/2025/05/ZSOP-Full-Schedule-SEP-2025-1-scaled.jpg"
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = "ZSOP-Full-Schedule-SEP-2025.jpg"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleFilter = (category: "gameType" | "eventType", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }))
  }

  const updateBuyInRange = (range: [number, number]) => {
    setFilters((prev) => ({
      ...prev,
      buyInRange: range,
      minBuyIn: range[0],
      maxBuyIn: range[1],
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      gameType: [],
      eventType: [],
      buyInRange: [0, 30000],
      minBuyIn: 0,
      maxBuyIn: 30000,
    })
  }

  const applyFilters = () => {
    setShowFilters(false)
  }

  const filteredTournaments = tournaments.filter((tournament) => {
    const eventName = tournament["Event Name"].toLowerCase()
    const buyIn = Number.parseInt(tournament["≈  USD"]?.replace(/[,$]/g, "") || "0")
    const eventNumber = tournament["#"]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        eventName.includes(query) ||
        eventNumber.includes(query) ||
        tournament["D/M/Y"].toLowerCase().includes(query) ||
        tournament["Start time"].includes(query)

      if (!matchesSearch) return false
    }

    if (filters.gameType.length > 0) {
      const hasGameType = filters.gameType.some((type) => {
        if (type === "Hold'em")
          return (
            eventName.includes("holdem") ||
            eventName.includes("nlhe") ||
            (!eventName.includes("omaha") && !eventName.includes("plo"))
          )
        if (type === "Omaha") return eventName.includes("omaha") || eventName.includes("plo")
        if (type === "Other")
          return (
            !eventName.includes("holdem") &&
            !eventName.includes("omaha") &&
            !eventName.includes("nlhe") &&
            !eventName.includes("plo")
          )
        return false
      })
      if (!hasGameType) return false
    }

    if (filters.eventType.length > 0) {
      const hasEventType = filters.eventType.some((type) => {
        if (type === "Main") return eventName.includes("main")
        if (type === "High Roller") return eventName.includes("high roller") || eventName.includes("hr")
        if (type === "Featured") return eventName.includes("featured") || eventName.includes("bounty")
        if (type === "Womens") return eventName.includes("women") || eventName.includes("ladies")
        if (type === "Satellites") return eventName.includes("satellite") || eventName.includes("sat")
        return false
      })
      if (!hasEventType) return false
    }

    if (buyIn < filters.buyInRange[0] || buyIn > filters.buyInRange[1]) {
      return false
    }

    return true
  })

  const groupedEvents = filteredTournaments.reduce(
    (acc, tournament) => {
      const date = tournament["D/M/Y"]
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(tournament)
      return acc
    },
    {} as Record<string, Tournament[]>,
  )

  const events = Object.entries(groupedEvents).map(([date, dayTournaments]) => {
    const dayName = dayTournaments[0]?.Date || "Tournament Day"
    return {
      date: date,
      day: dayName,
      tournaments: dayTournaments.map((tournament) => ({
        time: tournament["Start time"],
        eventNumber: `#${tournament["#"]}`,
        name: tournament["Event Name"],
        gtd: tournament.GTD ? `TWD ${tournament.GTD}` : "",
        regCloses: tournament["REG End Close"],
        buyInUSD: tournament["≈  USD"],
        buyInTWD: tournament["TWD"],
        prizePool: tournament["≈  USD"] ? `$${tournament["≈  USD"]}` : "",
        status: "Scheduled",
      })),
    }
  })

  return (
    <section className="container mx-auto px-4 py-8">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex space-x-1 bg-card rounded-lg p-1">
          <Button
            variant={activeTab === "events" ? "default" : "ghost"}
            onClick={() => setActiveTab("events")}
            className={
              activeTab === "events"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }
          >
            Events
          </Button>
          <Button
            variant={activeTab === "info" ? "default" : "ghost"}
            onClick={() => {
              window.open("https://zodiacseriesofpoker.com/zodiac-series-of-poker-the-final-snake/", "_blank")
            }}
            className={
              activeTab === "info"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }
          >
            Key Info
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="border-border hover:bg-accent bg-transparent"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-border hover:bg-accent bg-transparent"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleCurrency}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            {currency}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-border hover:bg-accent bg-transparent"
            onClick={downloadSchedule}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Input */}
      {showSearch && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tournaments, events, dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Filters</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Game Type */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Game Type</h4>
                <div className="flex flex-wrap gap-2">
                  {["Hold'em", "Omaha", "Other"].map((type) => (
                    <Button
                      key={type}
                      variant={filters.gameType.includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter("gameType", type)}
                      className="text-xs"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Event Type */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Event Type</h4>
                <div className="flex flex-wrap gap-2">
                  {["Main", "High Roller", "Featured", "Womens", "Satellites"].map((type) => (
                    <Button
                      key={type}
                      variant={filters.eventType.includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFilter("eventType", type)}
                      className="text-xs"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Buy-in Price Range */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Buy-in Price Range</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>USD 0</span>
                    <span>USD 30,000</span>
                  </div>
                  <Slider
                    value={filters.buyInRange}
                    onValueChange={(value) => updateBuyInRange(value as [number, number])}
                    max={30000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Min (USD)</label>
                      <Input
                        type="number"
                        value={filters.minBuyIn}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value) || 0
                          updateBuyInRange([value, filters.maxBuyIn])
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Max (USD)</label>
                      <Input
                        type="number"
                        value={filters.maxBuyIn}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value) || 30000
                          updateBuyInRange([filters.minBuyIn, value])
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <Button variant="ghost" onClick={clearAllFilters} className="text-muted-foreground hover:text-foreground">
                Clear all
              </Button>
              <Button onClick={applyFilters} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Events Content */}
      {activeTab === "events" && (
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading tournament schedule...</div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                {searchQuery ? `No tournaments found for "${searchQuery}"` : "No tournaments scheduled"}
              </div>
            </div>
          ) : (
            events.map((day) => (
              <div key={day.date}>
                <div className="flex items-center space-x-4 mb-4">
                  <h3 className="text-xl font-bold text-foreground">{day.date}</h3>
                </div>

                <div className="grid gap-4">
                  {day.tournaments.map((tournament, index) => (
                    <Card key={index} className="bg-card border-border hover:border-secondary transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="text-2xl font-bold text-foreground">{tournament.time}</div>
                          <Badge variant="outline" className="border-border text-muted-foreground">
                            {tournament.status}
                          </Badge>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-semibold text-foreground text-balance leading-tight">
                            {tournament.eventNumber} {tournament.name} {tournament.gtd && `- ${tournament.gtd} GTD`}
                          </h4>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-muted-foreground mb-1">Reg Closes</div>
                            <div className="font-medium text-foreground">{tournament.regCloses || "TBA"}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground mb-1">Buy-in</div>
                            <div className="font-medium text-foreground">
                              {tournament.buyInUSD
                                ? currency === "TWD"
                                  ? `NT$${tournament.buyInTWD || tournament.buyInUSD}`
                                  : `$${tournament.buyInUSD}`
                                : "TBA"}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground mb-1">Prize Pool</div>
                            <div className="font-medium text-foreground">-</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  )
}
