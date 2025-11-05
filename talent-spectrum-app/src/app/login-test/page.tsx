// talent-spectrum-app/src/app/dashboard/page.tsx

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Optional: Redirect unauthenticated users back to the login page
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading session...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-red-500">You are not logged in. Redirecting...</p>
      </div>
    );
  }

  // If status is "authenticated", session.user will contain the data
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Your Dashboard!</h1>

        {session?.user ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Hello, <span className="font-semibold">{session.user.name || session.user.email}</span>!
            </p>
            <p className="text-gray-600">
              Your Email: <span className="font-medium">{session.user.email}</span>
            </p>
            <p className="text-gray-600">
              Your Role: <span className="font-medium">{session.user.role}</span>
            </p>
            <p className="text-gray-600">
              Your User ID: <span className="font-medium">{session.user.id}</span>
            </p>
            {/* You can display other session data here */}
          </div>
        ) : (
          <p className="text-lg text-gray-700">Session data not found.</p>
        )}

        <button
          onClick={() => router.push("/")} // Example: Go to home page
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}