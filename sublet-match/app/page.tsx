"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building,
  Calendar,
  MapPin,
  Search,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";

import { Button } from "@/components/ui/button";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(!!authService.getToken());
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <span
            className="flex items-center gap-2 font-bold text-xl cursor-pointer"
            onClick={() => {
              if (isAuthenticated) {
                router.push("/dashboard");
              } else {
                router.push("/");
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                if (isAuthenticated) {
                  router.push("/dashboard");
                } else {
                  router.push("/");
                }
              }
            }}
            aria-label="LeaseLink Home or Dashboard"
          >
            <Building className="h-6 w-6 text-primary" />
            <span>LeaseLink</span>
          </span>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/find"
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
                  <Link href="/find">
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
                  How LeaseLink Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Our platform makes it easy to list or find a sublet for your
                  summer plans.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              {/* Card 1 - List Your Space */}
              <div className="h-full">
                <Link href="/signin?redirect=listings" className="h-full">
                  <div className="flex h-full flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">List Your Space</h3>
                    <p className="text-center text-muted-foreground">
                      Create a detailed listing with photos, pricing, and
                      availability dates.
                    </p>
                  </div>
                </Link>
              </div>

              {/* Card 2 - Find a Sublet */}
              <div className="h-full">
                <Link href="/find" className="h-full">
                  <div className="flex h-full flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Find a Sublet</h3>
                    <p className="text-center text-muted-foreground">
                      Browse available sublets with filters for location, dates,
                      and budget.
                    </p>
                  </div>
                </Link>
              </div>

              {/* Card 3 - Connect Securely (static) */}
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
                  <Link href="/find">
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
            <p className="font-medium">LeaseLink</p>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} LeaseLink. All rights reserved.
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
