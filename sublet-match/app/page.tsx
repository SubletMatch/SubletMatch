import Link from "next/link";
import {
  ArrowRight,
  Building,
  Calendar,
  MapPin,
  Search,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Building className="h-6 w-6 text-primary" />
            <span>SubletMatch</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/signin"
              className="text-sm font-medium hover:text-primary"
            >
              Find a Sublet
            </Link>
            <Link
              href="/signin"
              className="text-sm font-medium hover:text-primary"
            >
              List Your Sublet
            </Link>
            {/* <Link
              href="/how-it-works"
              className="text-sm font-medium hover:text-primary"
            >
              How It Works
            </Link> */}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/signin">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Find Your Perfect Summer Sublet
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Connect with people who need to sublease their apartment or
                    find your ideal temporary home.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signin">
                    <Button size="lg" className="w-full">
                      List Your Sublet
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button size="lg" variant="outline" className="w-full">
                      Find a Sublet
                      <Search className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 rounded-xl blur-3xl opacity-50" />
                <img
                  alt="Modern apartment living room"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center relative transition-transform duration-300 ease-in-out hover:scale-105"
                  src="/LandingPage_Atm.webp?height=500&width=800"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  How SubletMatch Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Our platform makes it easy to list or find a sublet for your
                  summer plans.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-4">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">List Your Space</h3>
                <p className="text-center text-muted-foreground">
                  Create a detailed listing with photos, pricing, and
                  availability dates.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Find a Sublet</h3>
                <p className="text-center text-muted-foreground">
                  Browse available sublets with filters for location, dates, and
                  budget.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Connect Securely</h3>
                <p className="text-center text-muted-foreground">
                  Message potential sublessors or subletters directly through
                  our platform.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Featured Sublets
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Check out some of our most popular listings.
                </p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 py-8">
              {[1, 2, 3].map((i) => (
                <Link href="/signin" key={i} className="group">
                  <div className="overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md">
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        alt={`Featured Property ${i}`}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        src={
                          i === 1
                            ? "/ovation_madison.jpg"
                            : i === 2
                            ? "/Parkline_miami.jpg"
                            : "/college_apt.jpg"
                        }
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">
                        {i === 1
                          ? "Ovation Madison"
                          : i === 2
                          ? "Parkline Miami"
                          : "College Apartment"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {i === 1
                          ? "Luxury living in Madison"
                          : i === 2
                          ? "Modern apartments in Miami"
                          : "Perfect for students"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Link href="/signin">
                <Button variant="outline" size="lg">
                  View All Listings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="mx-auto lg:mx-0">
                <img
                  alt="Happy subletter"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
                  src="/happy_subletter.jpg?height=400&width=600"
                />
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    Ready to Get Started?
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Join thousands of users who have successfully found their
                    perfect summer sublet.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signin">
                    <Button size="lg" className="w-full">
                      List Your Sublet
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button size="lg" variant="outline" className="w-full">
                      Find a Sublet
                      <Search className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-5 w-5 text-primary" />
            <p className="font-medium">SubletMatch</p>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} SubletMatch. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
