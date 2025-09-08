"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TournamentHero() {
  return (
    <div>
      <section className="relative h-[250px] sm:h-[350px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/zsop-snake-tournament.jpeg')] bg-contain bg-center bg-no-repeat md:bg-cover" />
      </section>

      <section className="bg-background border-t border-border">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                ZSOP Snake - The Final 2025
              </h1>
              <p className="text-secondary text-lg sm:text-xl font-semibold">11 September to 22 September</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Prize Pool</p>
                <p className="text-secondary text-xl sm:text-2xl font-bold">GTD 35,000,000 TWD</p>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Venue</p>
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-secondary hover:bg-muted p-0 h-auto justify-start text-left text-sm sm:text-base"
                  onClick={() => window.open("https://maps.app.goo.gl/raH9Ns4vj97VKc4h6", "_blank")}
                >
                  Asia Poker Arena @CTP Club, Taipei <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
