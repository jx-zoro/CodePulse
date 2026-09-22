import Link from "next/link";
import { ArrowRight, Activity, Zap, BarChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 border-b flex items-center justify-between px-6 lg:px-12 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2 text-xl font-bold text-primary">
          <Activity className="h-6 w-6 text-info" />
          CodePulse
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Open Workspace</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 flex flex-col items-center text-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-info/20 via-background to-background"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border text-sm text-muted-foreground mb-8">
            <span className="flex h-2 w-2 rounded-full bg-success"></span>
            CodePulse 1.0 is now available
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mb-6">
            Understand Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-info to-primary">API Request.</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Test your APIs, measure performance, identify bottlenecks, and understand what needs to improve — all from one developer workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full gap-2 font-semibold">
                Open Workspace <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full">
                Explore Features
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30 border-t">
          <div className="max-w-6xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need to test APIs</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built by developers, for developers. CodePulse gives you the tools to ensure your endpoints are fast, reliable, and secure.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-background rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-info/10 text-info flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Performance Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Go beyond simple status codes. Measure DNS, TLS, connection, and TTFB times to pinpoint exactly where your API is slowing down.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-background rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-warning/10 text-warning flex items-center justify-center mb-6">
                  <BarChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Actionable Insights</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our insight engine automatically detects common API issues such as missing compression, high latency, and missing cache headers.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-background rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-success/10 text-success flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">History & Collections</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Save your endpoints into organized collections. Review your historical requests to establish performance baselines over time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            <Activity className="h-5 w-5 text-info" />
            CodePulse
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 CodePulse. A developer tool created for performance.
          </p>
        </div>
      </footer>
    </div>
  );
}
