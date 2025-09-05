"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { signOut } from "@/app/utils/auth";
import { useAutoDrawResults } from "@/app/hooks/useAutoDrawResults";
import { CountdownTimer } from "@/app/components/CountdownTimer";

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
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/manager/login");
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [pollsRes, usersRes] = await Promise.all([
        supabase
          .from("polls")
          .select("*")
          .eq("manager_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("users").select("*").order("name"),
      ]);

      if (pollsRes.data) {
        // Check and update poll status based on current time
        const updatedPolls = pollsRes.data.map((poll) => {
          const now = new Date();
          const endTime = new Date(poll.open_until);
          const shouldBeInactive = endTime <= now;

          // If poll should be inactive but isn't marked as such, update it
          if (shouldBeInactive && poll.is_active && !poll.results_drawn) {
            // This will trigger the auto-draw
            return { ...poll, is_active: false };
          }

          return poll;
        });

        setPolls(updatedPolls);
      }
      if (usersRes.data) setUsers(usersRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-draw results when polls expire
  useAutoDrawResults(polls, fetchData);

  useEffect(() => {
    checkAuth();
    fetchData();

    // Set up real-time subscription for poll updates
    const pollsSubscription = supabase
      .channel("polls_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "polls" },
        (payload) => {
          console.log("Poll updated:", payload);
          fetchData(); // Refresh data when polls change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pollsSubscription);
    };
  }, [checkAuth, fetchData]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const manualDrawResults = async (pollId: string) => {
    setDrawingResults(pollId);

    try {
      const { error } = await supabase.rpc("draw_poll_results", {
        poll_uuid: pollId,
      });

      if (error) {
        console.error("Error drawing results:", error);
        alert(`Error drawing results: ${error.message}`);
      } else {
        console.log("Results drawn successfully");
        fetchData(); // Refresh data
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred while drawing results.");
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
        label: "🏆 Completed",
        className: "bg-gray-100 text-gray-600",
        canDraw: false,
      };
    } else if (endTime <= now) {
      return {
        status: "expired",
        label: "⏰ Expired",
        className: "bg-red-100 text-red-600",
        canDraw: true,
      };
    } else {
      return {
        status: "active",
        label: "🟢 Active",
        className: "bg-green-100 text-green-600",
        canDraw: false,
      };
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <div className="space-x-4">
          <Link
            href="/manager/users"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            👥 Manage Users
          </Link>
          <Link
            href="/manager/create-poll"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Create Poll
          </Link>
          <button
            onClick={handleSignOut}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Polls Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Polls ({polls.length})</h2>
          {polls.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg mb-2">No polls created yet</p>
              <p className="text-gray-400 text-sm mb-4">
                Create your first poll to get started
              </p>
              <Link
                href="/manager/create-poll"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create First Poll
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => {
                const pollStatus = getPollStatus(poll);
                const endTime = new Date(poll.open_until);
                const isActive = pollStatus.status === "active";

                return (
                  <div
                    key={poll.id}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">
                          {poll.title}
                        </h3>
                        {poll.description && (
                          <p className="text-gray-600 text-sm mb-2">
                            {poll.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${pollStatus.className}`}
                      >
                        {pollStatus.label}
                      </span>
                    </div>

                    {/* Poll Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="text-center bg-blue-50 rounded p-2">
                        <div className="font-semibold text-blue-600">
                          {poll.am_spots}
                        </div>
                        <div className="text-blue-700">AM Spots</div>
                      </div>
                      <div className="text-center bg-orange-50 rounded p-2">
                        <div className="font-semibold text-orange-600">
                          {poll.pm_spots}
                        </div>
                        <div className="text-orange-700">PM Spots</div>
                      </div>
                      <div className="text-center bg-purple-50 rounded p-2">
                        <div className="font-semibold text-purple-600">
                          {poll.all_day_spots}
                        </div>
                        <div className="text-purple-700">All Day</div>
                      </div>
                    </div>

                    {/* Countdown Timer for Active Polls */}
                    {isActive && (
                      <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                        <CountdownTimer
                          targetDate={endTime}
                          size="sm"
                          className="justify-center"
                        />
                      </div>
                    )}

                    {/* Poll Details */}
                    <div className="text-sm text-gray-500 mb-4">
                      <p>
                        Created: {new Date(poll.created_at).toLocaleString()}
                      </p>
                      <p>Closes: {endTime.toLocaleString()}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/manager/poll/${poll.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        📊 View Details
                      </Link>

                      {pollStatus.canDraw && (
                        <button
                          onClick={() => manualDrawResults(poll.id)}
                          disabled={drawingResults === poll.id}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-medium disabled:opacity-50"
                        >
                          {drawingResults === poll.id ? (
                            <span className="flex items-center">
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
                            </span>
                          ) : (
                            "🎲 Draw Results"
                          )}
                        </button>
                      )}

                      <Link
                        href={`/poll/${poll.share_link}`}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
                        target="_blank"
                      >
                        👁️ Employee View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Users Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Employees ({users.length})
          </h2>
          {users.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <p className="text-gray-500 text-lg mb-2">
                No employees added yet
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Add employees to start creating polls
              </p>
              <Link
                href="/manager/users"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Add Employees
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Recent Employees</span>
                  <Link
                    href="/manager/users"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              <div className="divide-y">
                {users.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="p-4 flex justify-between items-center hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-500">
                        Added {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="font-mono text-sm text-gray-400">••••</div>
                  </div>
                ))}
                {users.length > 5 && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    And {users.length - 5} more employees...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
