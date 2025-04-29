import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HowItWorks() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">
        How Sublet Match Works
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">For Subletters</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium">Create Your Listing</h3>
                <p className="text-gray-600">
                  Easily create a detailed listing for your apartment, including
                  photos, rent, and available dates.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium">Manage Requests</h3>
                <p className="text-gray-600">
                  Review and respond to sublet requests from interested
                  students.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium">Secure Communication</h3>
                <p className="text-gray-600">
                  Use our built-in messaging system to communicate with
                  potential subletters.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">
            For Students Looking to Sublet
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium">Browse Listings</h3>
                <p className="text-gray-600">
                  Search through available sublets by location, price, and
                  dates.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium">Submit Requests</h3>
                <p className="text-gray-600">
                  Found a place you like? Submit a request to the subletter with
                  your details.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium">Connect & Confirm</h3>
                <p className="text-gray-600">
                  Communicate with subletters and finalize your summer housing
                  plans.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">The Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-medium mb-2">Create or Find</h3>
            <p className="text-gray-600">
              Subletters create listings, students find their perfect summer
              housing.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="font-medium mb-2">Connect</h3>
            <p className="text-gray-600">
              Use our secure messaging system to discuss details and ask
              questions.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h3 className="font-medium mb-2">Confirm</h3>
            <p className="text-gray-600">
              Finalize the agreement and enjoy your summer housing arrangement!
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6">
          Join our community of students and find your perfect summer housing
          match.
        </p>
        <div className="flex justify-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/list"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create a Listing
              </Link>
              <Link
                href="/find"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Find a Sublet
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign In to Get Started
              </Link>
              <Link
                href="/signup"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
