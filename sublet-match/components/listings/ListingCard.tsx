import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { deleteListing } from "@/services/listingService";
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
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    created_at: string;
    user_id: string;
  };
  currentUserId?: string;
  onDelete?: () => void;
}

export function ListingCard({
  listing,
  currentUserId,
  onDelete,
}: ListingCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwner = currentUserId === listing.user_id;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteListing(listing.id);
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">{listing.title}</h3>
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your listing.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="text-sm">
            ${listing.price}/month
          </Badge>
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(listing.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-sm text-gray-500">{listing.location}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          className="w-full"
          onClick={() => router.push(`/listings/${listing.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
