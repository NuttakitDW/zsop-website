export function TournamentHeader() {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/zsop-logo.png" alt="ZSOP - Zodiac Series of Poker" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-foreground font-bold text-lg">ZODIAC SERIES</h1>
              <p className="text-secondary text-sm font-semibold">OF POKER</p>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
