// Enhanced Dashboard Component with Safe Navigation - WITH SORT & FILTER
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import { usePollNavigation } from "@/app/components/PollErrorBoundary";

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
  selection_type: "random" | "first_come_first_serve";
  created_at: string;
}

interface PollWithResults extends Poll {
  winners?: { user_id: string; spot_type: string }[];
}

interface User {
  id: string;
  name: string;
  pin: string;
}

type SortOption = "date-desc" | "date-asc" | "title-asc" | "title-desc";
type FilterOption = "all" | "active" | "completed" | "expired";

export default function EnhancedDashboard() {
  const [polls, setPolls] = useState<PollWithResults[]>([]);
  const [filteredPolls, setFilteredPolls] = useState<PollWithResults[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [navigationLoading, setNavigationLoading] = useState<string | null>(
    null
  );

  // Filter and Sort States
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [selectedWinner, setSelectedWinner] = useState<string>("");

  const { user: authUser } = useAuth();
  const router = useRouter();
  const { navigateWithRetry } = usePollNavigation();

  useEffect(() => {
    if (authUser) {
      fetchDashboardData();
    }
  }, [authUser]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [polls, sortBy, filterBy, selectedWinner]);

  const fetchDashboardData = async () => {
    if (!authUser) return;

    try {
      const [pollsRes, usersRes] = await Promise.all([
        supabase
          .from("polls")
          .select("*")
          .eq("manager_id", authUser.id)
          .order("created_at", { ascending: false }),
        supabase.from("users").select("*").order("name"),
      ]);

      if (pollsRes.data) {
        // Fetch results for each poll
        const pollsWithResults = await Promise.all(
          pollsRes.data.map(async (poll) => {
            const { data: results } = await supabase
              .from("poll_results")
              .select("user_id, spot_type")
              .eq("poll_id", poll.id);

            return {
              ...poll,
              winners: results || [],
            };
          })
        );

        setPolls(pollsWithResults);
      }
      if (usersRes.data) setUsers(usersRes.data);
    } catch (err: any) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...polls];

    // Filter by status
    if (filterBy !== "all") {
      result = result.filter((poll) => {
        const status = getPollStatus(poll).status;
        return status === filterBy;
      });
    }

    // Filter by winner
    if (selectedWinner) {
      result = result.filter((poll) =>
        poll.winners?.some((w) => w.user_id === selectedWinner)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "date-asc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    setFilteredPolls(result);
  };

  const handlePollNavigation = async (pollId: string) => {
    setNavigationLoading(pollId);
    try {
      console.log("🧭 Navigating to poll:", pollId);
      await navigateWithRetry(`/manager/poll/${pollId}`);
    } catch (error) {
      console.error("❌ Navigation failed:", error);
      setError("Failed to open poll. Please try again.");
    } finally {
      setNavigationLoading(null);
    }
  };

  const getPollStatus = (poll: Poll) => {
    const now = new Date();
    const endTime = new Date(poll.open_until);

    if (poll.results_drawn) {
      return {
        status: "completed" as const,
        label: "Completed",
        className: "bg-gray-100 text-gray-800",
        description:
          poll.selection_type === "first_come_first_serve"
            ? "All spots filled"
            : "Results drawn",
      };
    } else if (endTime <= now || !poll.is_active) {
      return {
        status: "expired" as const,
        label: "Expired",
        className: "bg-red-100 text-red-800",
        description: "Poll has ended",
      };
    } else {
      return {
        status: "active" as const,
        label: "Active",
        className: "bg-green-100 text-green-800",
        description:
          poll.selection_type === "first_come_first_serve"
            ? "Accepting entries (instant results)"
            : "Accepting entries",
      };
    }
  };

  const getPollTypeInfo = (
    selectionType: "random" | "first_come_first_serve"
  ) => {
    return selectionType === "random"
      ? {
          icon: "🎲",
          label: "Random",
          className: "bg-purple-100 text-purple-800 border-purple-200",
          description: "Winners selected randomly",
        }
      : {
          icon: "⚡",
          label: "First Come First Serve",
          className: "bg-orange-100 text-orange-800 border-orange-200",
          description: "Instant spot allocation",
        };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pollStats = {
    total: polls.length,
    active: polls.filter((p) => getPollStatus(p).status === "active").length,
    completed: polls.filter((p) => getPollStatus(p).status === "completed")
      .length,
    random: polls.filter((p) => p.selection_type === "random").length,
    fcfs: polls.filter((p) => p.selection_type === "first_come_first_serve")
      .length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manager Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your flex spot polls and employees
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/manager/users"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
              >
                Manage Users
              </Link>
              <Link
                href="/manager/create-poll"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Poll
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start justify-between">
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-red-600"
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
        )}

        {/* Enhanced Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dashboard Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {pollStats.total}
              </div>
              <div className="text-sm text-gray-600">Total Polls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {pollStats.active}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {pollStats.completed}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {pollStats.random}
              </div>
              <div className="text-sm text-gray-600">Random</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {pollStats.fcfs}
              </div>
              <div className="text-sm text-gray-600">FCFS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {users.length}
              </div>
              <div className="text-sm text-gray-600">Employees</div>
            </div>
          </div>
        </div>

        {/* Sort and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Winner Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Winner
              </label>
              <select
                value={selectedWinner}
                onChange={(e) => setSelectedWinner(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Winners</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Polls Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Polls</h2>
          <Link
            href="/manager/create-poll"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Create New Poll
          </Link>
        </div>

        {filteredPolls.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {polls.length === 0
                ? "No polls created yet"
                : "No polls match your filters"}
            </h3>
            <p className="text-gray-600 mb-6">
              {polls.length === 0
                ? "Create your first poll to start managing flex spots"
                : "Try adjusting your filters to see more polls"}
            </p>
            {polls.length === 0 && (
              <Link
                href="/manager/create-poll"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Your First Poll
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPolls.map((poll) => {
              const pollStatus = getPollStatus(poll);
              const pollTypeInfo = getPollTypeInfo(poll.selection_type);
              const endTime = new Date(poll.open_until);
              const isNavigating = navigationLoading === poll.id;

              return (
                <div
                  key={poll.id}
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header with Title and Status */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {poll.title}
                      </h3>
                      {poll.description && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {poll.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${pollStatus.className} whitespace-nowrap`}
                    >
                      {pollStatus.label}
                    </span>
                  </div>

                  {/* Poll Type Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${pollTypeInfo.className}`}
                    >
                      {pollTypeInfo.icon} {pollTypeInfo.label}
                    </span>
                  </div>

                  {/* Spot Distribution */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center bg-blue-50 rounded-lg p-3">
                      <div className="font-semibold text-blue-600 text-lg">
                        {poll.am_spots}
                      </div>
                      <div className="text-blue-700 text-xs font-medium">
                        Morning
                      </div>
                    </div>
                    <div className="text-center bg-orange-50 rounded-lg p-3">
                      <div className="font-semibold text-orange-600 text-lg">
                        {poll.pm_spots}
                      </div>
                      <div className="text-orange-700 text-xs font-medium">
                        Afternoon
                      </div>
                    </div>
                    <div className="text-center bg-purple-50 rounded-lg p-3">
                      <div className="font-semibold text-purple-600 text-lg">
                        {poll.all_day_spots}
                      </div>
                      <div className="text-purple-700 text-xs font-medium">
                        All Day
                      </div>
                    </div>
                  </div>

                  {/* Poll Details */}
                  <div className="text-sm text-gray-600 space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">
                        {new Date(poll.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {poll.selection_type === "first_come_first_serve"
                          ? "Max Duration:"
                          : "Closes:"}
                      </span>
                      <div className="text-right">
                        <div className="font-medium">
                          {endTime.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {endTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Status Messages */}
                  {poll.selection_type === "first_come_first_serve" &&
                    pollStatus.status === "active" && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-orange-800 text-sm">
                          <span className="mr-2">⚡</span>
                          <span className="font-medium">
                            Live FCFS Poll - Spots filling automatically!
                          </span>
                        </div>
                      </div>
                    )}

                  {poll.selection_type === "random" &&
                    pollStatus.status === "expired" &&
                    !poll.results_drawn && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-yellow-800 text-sm">
                          <span className="mr-2">⏰</span>
                          <span className="font-medium">
                            Ready to draw results!
                          </span>
                        </div>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handlePollNavigation(poll.id)}
                      disabled={isNavigating}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isNavigating ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-2"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        "View Details"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
// End of Enhanced Dashboard Component
