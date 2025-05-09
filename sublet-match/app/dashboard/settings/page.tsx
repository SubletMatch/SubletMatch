"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
//import { authService } from "@/app/services/auth";
import { authService } from "@/lib/services/auth";
import { userService } from "@/app/services/user";
import { User } from "lucide-react";

export default function EditProfilePage() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = authService.getToken();
        if (!token) {
          router.push("/signin");
          return;
        }
        const user = await userService.getCurrentUser(token);
        setUserName(user.name);
        setEmail(user.email);
        setCurrentUserName(user.name);
        setCurrentEmail(user.email);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = authService.getToken();
      if (!token) {
        router.push("/signin");
        return;
      }
      await userService.updateProfile(token, { name: userName, email: email });
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 py-8 px-2">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 rounded-full p-4 mb-3">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-1">Edit Profile</h2>
          <p className="text-muted-foreground text-center mb-2">
            Update your account information below.
          </p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 mb-6 text-sm text-gray-700 flex flex-col gap-1">
          <div>
            <span className="font-semibold">Current Username:</span>{" "}
            {currentUserName || (
              <span className="italic text-gray-400">Not set</span>
            )}
          </div>
          <div>
            <span className="font-semibold">Current Email:</span>{" "}
            {currentEmail || (
              <span className="italic text-gray-400">Not set</span>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium text-gray-800">
              Username
            </label>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="bg-gray-50 border border-gray-300 focus:border-primary focus:ring-primary"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-800">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-50 border border-gray-300 focus:border-primary focus:ring-primary"
              placeholder="Enter your email"
            />
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="w-full py-3 text-lg rounded-lg mt-4 bg-primary hover:bg-primary/90 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
