export function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">How It Works</h1>
        <p className="text-muted-foreground mt-2">
          Learn how Job Finder helps you find and track job opportunities
        </p>
      </div>

      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4 py-2">
          <h3 className="font-semibold text-lg">1. Submit Job Listings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add job URLs or let our automated scraper find opportunities for you
          </p>
        </div>

        <div className="border-l-4 border-primary pl-4 py-2">
          <h3 className="font-semibold text-lg">2. AI Analysis</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Our AI analyzes job requirements and matches them to your experience
          </p>
        </div>

        <div className="border-l-4 border-primary pl-4 py-2">
          <h3 className="font-semibold text-lg">3. Get Matched</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Review match scores and generate custom application materials
          </p>
        </div>

        <div className="border-l-4 border-primary pl-4 py-2">
          <h3 className="font-semibold text-lg">4. Track Progress</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your applications and interview pipeline in one place
          </p>
        </div>
      </div>
    </div>
  )
}
