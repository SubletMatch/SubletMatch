"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveListing, unsaveListing } from "@/lib/services/saved";

interface SaveButtonProps {
  userId: string;
  listingId: string;
  initiallySaved: boolean;
}

export function SaveButton({ userId, listingId, initiallySaved }: SaveButtonProps) {
  const [saved, setSaved] = useState(initiallySaved);
  const [loading, setLoading] = useState(false);

  const toggleSave = async () => {
    setLoading(true);
    try {
      if (saved) {
        await unsaveListing(userId, listingId);
      } else {
        await saveListing(userId, listingId);
      }
      setSaved(!saved);
    } catch (err) {
      console.error("Save toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={toggleSave} disabled={loading}>
      <Heart className="mr-1 h-4 w-4" fill={saved ? "red" : "none"} />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
