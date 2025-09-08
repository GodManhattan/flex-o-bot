"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import { signOut } from "@/app/utils/auth";
import { useAutoDrawResults } from "@/app/hooks/useAutoDrawResults";
import { CountdownTimer } from "@/app/components/CountdownTimer";
import { UserIcon } from "@/app/components/Icons";

interface Poll {
  id: string;
  title: string;
  description: string;
  am_spots: number;
  pm_spots: number;
  all_day_spots: number;
  open_until: string;
  share_link: string;
  results_drawn: boolean;
  is_active: boolean;
  created_at: string;
  manager_id: string;
}

interface User {
  id: string;
  name: string;
  pin: string;
  created_at: string;
}

export default function DashboardPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawingResults, setDrawingResults] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const fetchData = useCallback(async () => {
    if (!authUser) {
      console.log("📊 No authenticated user, skipping data fetch");
      setLoading(false);
      return;
    }

    try {
      console.log("📊 Fetching dashboard data for user:", authUser.id);
      setError("");

      const [pollsRes, usersRes] = await Promise.all([
        supabase
          .from("polls")
          .select("*")
          .eq("manager_id", authUser.id)
          .order("created_at", { ascending: false }),
        supabase.from("users").select("*").order("name"),
      ]);

      console.log("📊 Fetch results:", {
        pollsError: pollsRes.error,
        pollsCount: pollsRes.data?.length,
        usersError: usersRes.error,
        usersCount: usersRes.data?.length,
      });

      if (pollsRes.error) {
        console.error("❌ Error fetching polls:", pollsRes.error);
        setError("Failed to load polls: " + pollsRes.error.message);
      } else if (pollsRes.data) {
        const updatedPolls = pollsRes.data.map((poll) => {
          const now = new Date();
          const endTime = new Date(poll.open_until);
          const shouldBeInactive = endTime <= now;

          if (shouldBeInactive && poll.is_active && !poll.results_drawn) {
            return { ...poll, is_active: false };
          }

          return poll;
        });

        setPolls(updatedPolls);
      }

      if (usersRes.error) {
        console.error("❌ Error fetching users:", usersRes.error);
        setError("Failed to load users: " + usersRes.error.message);
      } else if (usersRes.data) {
        setUsers(usersRes.data);
      }
    } catch (err: any) {
      console.error("❌ Error fetching data:", err);
      setError(
        "Failed to load dashboard data: " + (err.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useAutoDrawResults(polls, fetchData);

  // Initial data fetch - only when auth is ready
  useEffect(() => {
    if (authLoading) {
      console.log("⏳ Auth still loading, waiting...");
      return;
    }

    if (!authUser) {
      console.log("❌ No authenticated user");
      setLoading(false);
      return;
    }

    console.log("✅ Auth ready, fetching dashboard data");
    fetchData();
  }, [authUser, authLoading, fetchData]);

  // Set up real-time subscriptions only when we have auth user
  useEffect(() => {
    if (!authUser) return;

    console.log("📡 Setting up real-time subscriptions");

    const pollsSubscription = supabase
      .channel("polls_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "polls" },
        (payload) => {
          console.log("📡 Poll updated:", payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      console.log("📡 Cleaning up subscriptions");
      supabase.removeChannel(pollsSubscription);
    };
  }, [authUser, fetchData]);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      setLoading(false);
    }
  };

  const manualDrawResults = async (pollId: string) => {
    setDrawingResults(pollId);

    try {
      const { error } = await supabase.rpc("draw_poll_results", {
        poll_uuid: pollId,
      });

      if (error) {
        console.error("Error drawing results:", error);
        setError(`Error drawing results: ${error.message}`);
      } else {
        console.log("Results drawn successfully");
        fetchData();
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred while drawing results.");
    } finally {
      setDrawingResults(null);
    }
  };

  const getPollStatus = (poll: Poll) => {
    const now = new Date();
    const endTime = new Date(poll.open_until);

    if (poll.results_drawn) {
      return {
        status: "completed",
        label: "Completed",
        className: "bg-gray-100 text-gray-800",
        canDraw: false,
      };
    } else if (endTime <= now) {
      return {
        status: "expired",
        label: "Expired",
        className: "bg-red-100 text-red-800",
        canDraw: true,
      };
    } else {
      return {
        status: "active",
        label: "Active",
        className: "bg-green-100 text-green-800",
        canDraw: false,
      };
    }
  };

  // Show loading when auth is loading OR when fetching data
  if (authLoading || (loading && authUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authLoading
              ? "Checking authentication..."
              : "Loading dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  // If no auth user after loading is done, let the RouteGuard handle it
  if (!authLoading && !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Authentication required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-800 text-sm">{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b lg:hidden">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="mt-4 pb-4 border-t pt-4 space-y-3">
              <Link
                href="/manager/users"
                className="flex items-center w-full text-left px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                onClick={() => setShowMobileMenu(false)}
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Manage Users
              </Link>
              <Link
                href="/manager/create-poll"
                className="flex items-center w-full text-left px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setShowMobileMenu(false)}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Poll
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center w-full text-left px-3 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Manager Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/manager/users"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                Manage Users
              </Link>
              <Link
                href="/manager/create-poll"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Poll
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm sm:text-base flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Mobile-Optimized Header and Stats */}
        <div className="space-y-4 mb-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Polls ({polls.length})
            </h2>

            {/* Mobile Create Button - Always visible on mobile */}
            <div className="flex sm:hidden">
              <Link
                href="/manager/create-poll"
                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium text-center flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Poll
              </Link>
            </div>

            {/* Desktop Create Button - Hidden on mobile since it's in the header */}
            <div className="hidden sm:block lg:hidden">
              <Link
                href="/manager/create-poll"
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Poll
              </Link>
            </div>
          </div>

          {/* Quick Stats Bar - Professional Design */}
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            {/* Mobile: 2x2 Grid, Tablet+: Single Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              {/* Total Polls */}
              <div className="text-center p-3 sm:p-0">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {polls.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-tight font-medium">
                  Total
                  <br className="sm:hidden" /> Polls
                </div>
              </div>

              {/* Active Polls */}
              <div className="text-center p-3 sm:p-0">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {
                    polls.filter((p) => getPollStatus(p).status === "active")
                      .length
                  }
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-tight font-medium">
                  Active
                  <br className="sm:hidden" /> Polls
                </div>
              </div>

              {/* Completed Polls */}
              <div className="text-center p-3 sm:p-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-600">
                  {
                    polls.filter((p) => getPollStatus(p).status === "completed")
                      .length
                  }
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-tight font-medium">
                  Completed
                </div>
              </div>

              {/* Employees */}
              <div className="text-center p-3 sm:p-0">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {users.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-tight font-medium">
                  <span className="block sm:inline">Employees</span>
                  <Link
                    href="/manager/users"
                    className="block sm:inline text-purple-600 hover:underline font-semibold mt-1 sm:mt-0 sm:ml-1"
                  >
                    (Manage)
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Action Bar - Professional Quick Access */}
            <div className="flex sm:hidden mt-4 pt-4 border-t border-gray-200 gap-2">
              <Link
                href="/manager/users"
                className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs font-medium text-center border border-green-200 hover:bg-green-100 flex items-center justify-center gap-1"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                Users
              </Link>
              <Link
                href="/manager/create-poll"
                className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium text-center border border-blue-200 hover:bg-blue-100 flex items-center justify-center gap-1"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Poll
              </Link>
              <button
                onClick={handleSignOut}
                className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium text-center border border-gray-200 hover:bg-gray-100 flex items-center justify-center gap-1"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Exit
              </button>
            </div>
          </div>
        </div>

        {/* Polls Section - Full Width Grid */}
        {polls.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <p className="text-gray-700 text-lg mb-2">No polls created yet</p>
            <p className="text-gray-600 text-sm mb-6">
              Create your first poll to get started with flexible work
              scheduling
            </p>
            <Link
              href="/manager/create-poll"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-base font-medium transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create First Poll
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {polls.map((poll) => {
              const pollStatus = getPollStatus(poll);
              const endTime = new Date(poll.open_until);
              const isActive = pollStatus.status === "active";

              return (
                <div
                  key={poll.id}
                  className="bg-white rounded-lg shadow-sm border border-l-4 border-l-blue-500 p-6 hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  {/* Header Section - Fixed Height */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
                        {poll.title}
                      </h3>
                      {/* Conditional description with consistent spacing */}
                      <div className="min-h-[2.5rem] flex items-start">
                        {poll.description ? (
                          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                            {poll.description}
                          </p>
                        ) : (
                          <p className="text-gray-400 text-sm italic">
                            No description provided
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${pollStatus.className}`}
                      >
                        {pollStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Poll Stats - Consistent Layout */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center bg-blue-50 rounded-lg p-3">
                      <div className="font-semibold text-blue-600 text-lg">
                        {poll.am_spots}
                      </div>
                      <div className="text-blue-700 text-sm font-medium">
                        Morning
                      </div>
                    </div>
                    <div className="text-center bg-orange-50 rounded-lg p-3">
                      <div className="font-semibold text-orange-600 text-lg">
                        {poll.pm_spots}
                      </div>
                      <div className="text-orange-700 text-sm font-medium">
                        Afternoon
                      </div>
                    </div>
                    <div className="text-center bg-purple-50 rounded-lg p-3">
                      <div className="font-semibold text-purple-600 text-lg">
                        {poll.all_day_spots}
                      </div>
                      <div className="text-purple-700 text-xs font-medium">
                        Full Day
                      </div>
                    </div>
                  </div>

                  {/* Countdown Timer for Active Polls */}
                  {isActive && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-center text-green-800 text-sm font-medium">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <CountdownTimer
                          targetDate={endTime}
                          size="sm"
                          className="justify-center"
                        />
                      </div>
                    </div>
                  )}

                  {/* Poll Details - Flex Grow to Push Actions to Bottom */}
                  <div className="text-sm text-gray-600 mb-4 space-y-2 flex-grow">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">
                        Created:
                      </span>
                      <span className="font-semibold">
                        {new Date(poll.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 font-medium">Closes:</span>
                      <div className="text-right">
                        <div className="font-semibold text-xs leading-tight">
                          {endTime.toLocaleDateString()}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {endTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Professional Design */}
                  <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-gray-100">
                    <Link
                      href={`/manager/poll/${poll.id}`}
                      className="group bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium text-center transition-all duration-200 flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      View Details
                    </Link>

                    <div className="flex gap-2">
                      {pollStatus.canDraw && (
                        <button
                          onClick={() => manualDrawResults(poll.id)}
                          disabled={drawingResults === poll.id}
                          className="group flex-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
                        >
                          {drawingResults === poll.id ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Drawing...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                              Draw Results
                            </>
                          )}
                        </button>
                      )}

                      <Link
                        href={`/poll/${poll.share_link}`}
                        className="group flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium text-center transition-all duration-200 flex items-center justify-center"
                        target="_blank"
                      >
                        <svg
                          className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        Preview
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Development Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <details>
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                🔧 Dashboard Debug Info (Development)
              </summary>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Auth User: {authUser?.id?.slice(0, 8) || "None"}</div>
                <div>Auth Loading: {authLoading ? "Yes" : "No"}</div>
                <div>Page Loading: {loading ? "Yes" : "No"}</div>
                <div>Polls Count: {polls.length}</div>
                <div>Users Count: {users.length}</div>
                <div>Drawing Results: {drawingResults || "None"}</div>
                <div>Show Mobile Menu: {showMobileMenu ? "Yes" : "No"}</div>
                <div>Current Error: {error || "None"}</div>
                <div>
                  Active Polls:{" "}
                  {
                    polls.filter((p) => getPollStatus(p).status === "active")
                      .length
                  }
                </div>
                <div>
                  Completed Polls:{" "}
                  {
                    polls.filter((p) => getPollStatus(p).status === "completed")
                      .length
                  }
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
