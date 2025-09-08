import { TournamentHeader } from "@/components/tournament-header"
import { TournamentHero } from "@/components/tournament-hero"
import { TournamentTabs } from "@/components/tournament-tabs"

export default function TournamentPage() {
  return (
    <div className="min-h-screen bg-background">
      <TournamentHeader />
      <TournamentHero />
      <TournamentTabs />
    </div>
  )
}
