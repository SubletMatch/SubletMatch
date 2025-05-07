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
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";

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
import { listingService } from "@/lib/services/listing";
import { useRouter } from "next/navigation";
import { messagesService } from "@/lib/services/messages";
import { Conversation } from "@/lib/services/messages";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import KeyManager from "@/components/key_manager";



interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  available_from: string;
  available_to: string;
  images: { image_url: string }[];
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("listings");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [userId, setUserId] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);



  useEffect(() => {
    // Check for tab parameter in URL
    const tab = searchParams.get("tab");
    if (tab && ["listings", "find", "messages", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
        setUserId(user.id);
        localStorage.setItem("userId", user.id); // Optional if you want to use it elsewhere

      } catch (error: unknown) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again.");

        // Type guard to check if error is an AxiosError
        if (error instanceof Error && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            authService.logout();
            router.push("/signin");
          }
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
      } catch (error: unknown) {
        console.error("Error fetching listings:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch listings"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "listings") {
      fetchListings();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const result = await messagesService.getConversations();
        if (result.success && "data" in result) {
          const convos = result.data as Conversation[];
          setConversations(convos);
    
          // Calculate total unread messages
          const totalUnread = convos.reduce(
            (sum, convo) => sum + (convo.unreadCount || 0),
            0
          );
          setUnreadCount(totalUnread);
        } else {
          setError(result.error || "Failed to fetch conversations");
        }
      } catch (error: any) {
        console.error("Error fetching conversations:", error);
        setError(error.message || "Failed to fetch conversations");
      } finally {
        setIsLoading(false);
      }
    };
    

    if (activeTab === "messages") {
      fetchConversations();
    }
  }, [activeTab]);

  const handleLogout = () => {
    authService.logout();
    router.push("/signin");
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      await listingService.deleteListing(listingId);
      // Refresh listings after deletion
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingId
      );
      setListings(updatedListings);
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <>
    {userId && <KeyManager userId={userId} />}
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <Building className="h-6 w-6 text-primary" />
            <span>LeaseLink</span>
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
                {unreadCount > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {unreadCount}
                  </span>
                )}
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
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {unreadCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                {activeTab === "listings" && (
                  <Link href="/list">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Listing
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
                {listings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      You haven't created any listings yet.
                    </p>
                    <Button onClick={() => router.push("/list")}>
                      Add Your First Listing
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <Card key={listing.id} className="overflow-hidden">
                        <div className="aspect-video relative">
                          <Image
                            src={
                              listing.images && listing.images.length > 0
                                ? listing.images[0].image_url
                                : "/placeholder.svg"
                            }
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold line-clamp-1">
                                {listing.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {listing.address}, {listing.city},{" "}
                                {listing.state}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>${listing.price}/month</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{listing.property_type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Bed className="h-4 w-4 text-muted-foreground" />
                                <span>{listing.bedrooms} beds</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Bath className="h-4 w-4 text-muted-foreground" />
                                <span>{listing.bathrooms} baths</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(
                                  new Date(listing.available_from),
                                  "MMM d"
                                )}{" "}
                                -{" "}
                                {format(
                                  new Date(listing.available_to),
                                  "MMM d, yyyy"
                                )}
                              </span>
                            </div>

                            <div className="flex gap-2 pt-2 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() =>
                                  router.push(`/listing/${listing.id}/edit`)
                                }
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1"
                                onClick={() =>
                                  router.push(`/listing/${listing.id}`)
                                }
                              >
                                View
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete your listing.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteListing(listing.id)
                                      }
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="messages" className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500">{error}</div>
                ) : conversations.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    No messages yet. Start a conversation by messaging a listing
                    owner!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversations.map((conversation) => {
                      // Always show the other participant's username
                      const currentUserId = localStorage.getItem("userId");
                      const otherParticipant = conversation.participants.find(
                        (p) => p.id !== currentUserId
                      );

                      if (!otherParticipant) return null;

                      return (
                        <Card
                          key={conversation.id}
                          className={
                            conversation.unreadCount > 0
                              ? "border-primary/50 shadow-sm"
                              : ""
                          }
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary font-medium">
                                    {otherParticipant.username[0].toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <CardTitle className="text-base">
                                    {otherParticipant.username}
                                  </CardTitle>
                                  <CardDescription>
                                    {conversation.listing_title ||
                                      conversation.listing_id}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(
                                  conversation.lastMessage.timestamp
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2 pb-2">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {conversation.lastMessage.content}
                            </p>
                          </CardContent>
                          <CardFooter className="p-4 pt-2 flex justify-end">
                            <Link
                              href={`/messages?conversation=${conversation.id}`}
                            >
                              <Button size="sm">View Conversation</Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
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
            <p className="font-medium">LeaseLink</p>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} LeaseLink. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}
