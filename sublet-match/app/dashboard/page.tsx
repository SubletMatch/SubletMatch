"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building,
  ChevronRight,
  Edit,
  Home,
  Inbox,
  LogOut,
  Plus,
  Settings,
  User,
  Search,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userService } from "@/app/services/user";
import { authService } from "@/lib/services/auth";
import { listingService } from "@/app/services/listing";
import { useRouter } from "next/navigation";

// Mock data for messages
const mockMessages = [
  {
    id: 1,
    from: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40&text=SJ",
    message:
      "Hi, I'm interested in your apartment in New York. Is it still available for the dates listed?",
    date: "2 hours ago",
    listing: "Spacious 1BR in Downtown",
    unread: true,
  },
  {
    id: 2,
    from: "Michael Chen",
    avatar: "/placeholder.svg?height=40&width=40&text=MC",
    message:
      "Hello, I was wondering if the price is negotiable for a longer stay?",
    date: "Yesterday",
    listing: "Spacious 1BR in Downtown",
    unread: false,
  },
  {
    id: 3,
    from: "Emma Wilson",
    avatar: "/placeholder.svg?height=40&width=40&text=EW",
    message: "Is parking included with the apartment?",
    date: "3 days ago",
    listing: "Spacious 1BR in Downtown",
    unread: false,
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("listings");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = authService.getToken();
      if (!token) {
        router.push("/signin");
        return;
      }

      try {
        const user = await userService.getCurrentUser(token);
        setUserName(user.name);
        setUserEmail(user.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again.");
        if (error.response?.status === 401) {
          authService.logout();
          router.push("/signin");
        }
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await listingService.getMyListings();
        setListings(data);
      } catch (error: any) {
        console.error("Error fetching listings:", error);
        setError(error.message || "Failed to fetch listings");
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "listings") {
      fetchListings();
    }
  }, [activeTab]);

  const handleLogout = () => {
    authService.logout();
    router.push("/signin");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Building className="h-6 w-6 text-primary" />
            <span>SubletMatch</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 lg:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <div className="flex items-center gap-2 px-2 py-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{userName || "Loading..."}</p>
                <p className="text-xs text-muted-foreground">
                  {userEmail || "Loading..."}
                </p>
              </div>
            </div>
            <Separator />
            <nav className="grid gap-1 py-2">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setActiveTab("listings")}
              >
                <Home className="mr-2 h-4 w-4" />
                My Listings
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setActiveTab("find")}
              >
                <Search className="mr-2 h-4 w-4" />
                Find Listings
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setActiveTab("messages")}
              >
                <Inbox className="mr-2 h-4 w-4" />
                Messages
                <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  1
                </span>
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          <div className="container py-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="listings" className="relative">
                    My Listings
                  </TabsTrigger>
                  <TabsTrigger value="find" className="relative">
                    Find Listings
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="relative">
                    Messages
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      1
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                {activeTab === "listings" && (
                  <Link href="/list">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      New Listing
                    </Button>
                  </Link>
                )}
              </div>

              <TabsContent value="find" className="space-y-6">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-4">
                    Find available listings to sublease
                  </p>
                  <Link href="/find">
                    <Button>
                      <Search className="mr-2 h-4 w-4" />
                      Browse Listings
                    </Button>
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="listings" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500">{error}</div>
                ) : listings.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    You don't have any listings yet. Create your first listing!
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing) => (
                      <Card key={listing.id}>
                        <div className="relative h-48 w-full">
                          <Image
                            src={
                              listing.images && listing.images.length > 0
                                ? `data:image/jpeg;base64,${listing.images[0].image_data}`
                                : "/placeholder.jpg"
                            }
                            alt={listing.title}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                        </div>
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {listing.title}
                              </CardTitle>
                              <CardDescription>
                                {listing.city}, {listing.state}
                              </CardDescription>
                            </div>
                            <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              {listing.host || "Active"}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 pb-2">
                          <div className="text-sm text-muted-foreground">
                            {new Date(
                              listing.available_from
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              listing.available_to
                            ).toLocaleDateString()}
                          </div>
                          <div className="font-medium mt-1">
                            ${listing.price}/month
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-2 flex justify-between">
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/listing/${listing.id}`}>
                              View
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="messages" className="space-y-6">
                <div className="space-y-4">
                  {mockMessages.map((message) => (
                    <Card
                      key={message.id}
                      className={
                        message.unread ? "border-primary/50 shadow-sm" : ""
                      }
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden">
                              <img
                                src={message.avatar || "/placeholder.svg"}
                                alt={message.from}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {message.from}
                              </CardTitle>
                              <CardDescription>
                                Re: {message.listing}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {message.date}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {message.message}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-2 flex justify-end">
                        <Button size="sm">Reply</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account information and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Profile Information</h3>
                      <p className="text-sm text-muted-foreground">
                        Your profile information is used to identify you on the
                        platform.
                      </p>
                      <Button variant="outline">Edit Profile</Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-medium">Notification Preferences</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage how and when you receive notifications.
                      </p>
                      <Button variant="outline">Manage Notifications</Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="font-medium">Payment Methods</h3>
                      <p className="text-sm text-muted-foreground">
                        Add or remove payment methods for your account.
                      </p>
                      <Button variant="outline">Manage Payments</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-5 w-5 text-primary" />
            <p className="font-medium">SubletMatch</p>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} SubletMatch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
