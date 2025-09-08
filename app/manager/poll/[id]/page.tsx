"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { CountdownTimer } from "@/app/components/CountdownTimer";
import { useErrorHandler } from "@/app/hooks/useErrorHandler";
import { ErrorAlert } from "@/app/components/ErrorAlert";
import {
  AfternoonIcon,
  CopyIcon,
  DashboardIcon,
  EntriesIcon,
  FullDayIcon,
  InfoIcon,
  MorningIcon,
  OverviewIcon,
  ResultsIcon,
  ShareIcon,
  TrophyIcon,
  UserIcon,
} from "@/app/components/Icons";

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
  updated_at?: string;
  manager_id: string;
}

interface PollEntry {
  id: string;
  poll_id: string;
  user_id: string;
  spot_type: "am" | "pm" | "all_day";
  created_at: string;
  users?: {
    name: string;
  };
}

interface PollResult {
  id: string;
  poll_id: string;
  user_id: string;
  spot_type: "am" | "pm" | "all_day";
  created_at: string;
  users?: {
    name: string;
  };
}

export default function PollDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [entries, setEntries] = useState<PollEntry[]>([]);
  const [results, setResults] = useState<PollResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawingResults, setDrawingResults] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "entries" | "results"
  >("overview");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  useEffect(() => {
    if (params.id) {
      fetchPollData();

      // Set up real-time subscription for this poll
      const subscription = supabase
        .channel(`poll_${params.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "polls",
            filter: `id=eq.${params.id}`,
          },
          (payload) => {
            console.log("Poll updated:", payload);
            fetchPollData();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "poll_entries",
            filter: `poll_id=eq.${params.id}`,
          },
          (payload) => {
            console.log("Poll entries updated:", payload);
            fetchPollData();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "poll_results",
            filter: `poll_id=eq.${params.id}`,
          },
          (payload) => {
            console.log("Poll results updated:", payload);
            fetchPollData();
          }
        )
        .subscribe();

      return () => {
        console.log("Cleaning up subscription");
        supabase.removeChannel(subscription);
      };
    }
  }, [params.id]);

  const fetchPollData = async () => {
    if (refreshing) return; // Prevent multiple simultaneous fetches

    try {
      setRefreshing(true);
      clearError();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/manager/login");
        return;
      }

      const [pollRes, entriesRes, resultsRes] = await Promise.all([
        supabase
          .from("polls")
          .select("*")
          .eq("id", params.id)
          .eq("manager_id", user.id)
          .single(),
        supabase
          .from("poll_entries")
          .select(
            `
            *,
            users (
              name
            )
          `
          )
          .eq("poll_id", params.id),
        supabase
          .from("poll_results")
          .select(
            `
            *,
            users (
              name
            )
          `
          )
          .eq("poll_id", params.id),
      ]);

      if (pollRes.error) {
        if (pollRes.error.code === "PGRST116") {
          handleError(
            new Error(
              "Poll not found or you do not have permission to view it."
            )
          );
        } else {
          handleError(pollRes.error);
        }
        return;
      }

      if (pollRes.data) {
        // Check if poll should be marked as expired
        const now = new Date();
        const endTime = new Date(pollRes.data.open_until);

        if (
          endTime <= now &&
          pollRes.data.is_active &&
          !pollRes.data.results_drawn
        ) {
          // Poll has expired but results haven't been drawn - trigger auto-draw
          console.log("Poll has expired, triggering auto-draw...");
          await autoDrawResults(pollRes.data.id);
          // Fetch updated data after auto-draw
          setTimeout(() => fetchPollData(), 1000);
          return;
        }

        setPoll(pollRes.data);
      }
      if (entriesRes.data) setEntries(entriesRes.data);
      if (resultsRes.data) setResults(resultsRes.data);
    } catch (err) {
      handleError(err, "Failed to load poll data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const autoDrawResults = async (pollId: string) => {
    try {
      console.log("Auto-drawing results for expired poll:", pollId);

      const { error } = await supabase.rpc("draw_poll_results", {
        poll_uuid: pollId,
      });

      if (error) {
        console.error("Error auto-drawing results:", error);
      } else {
        console.log("Results auto-drawn successfully");
      }
    } catch (err) {
      console.error("Error in auto-draw:", err);
    }
  };

  const manualDrawResults = async () => {
    if (!poll) return;

    setDrawingResults(true);
    clearError();

    try {
      const { error: drawError } = await supabase.rpc("draw_poll_results", {
        poll_uuid: poll.id,
      });

      if (drawError) {
        handleError(drawError, "Failed to draw results");
      } else {
        console.log("Results drawn successfully");
        // Refresh data after drawing
        await fetchPollData();
      }
    } catch (err) {
      handleError(err, "Failed to draw results");
    } finally {
      setDrawingResults(false);
    }
  };

  const getPollStatus = () => {
    if (!poll)
      return {
        status: "unknown",
        label: "Unknown",
        className: "bg-gray-100 text-gray-900",
      };

    const now = new Date();
    const endTime = new Date(poll.open_until);

    if (poll.results_drawn) {
      return {
        status: "completed",
        label: "🏆 Completed",
        className: "bg-green-100 text-green-800",
        description: "Results have been drawn",
      };
    } else if (endTime <= now) {
      return {
        status: "expired",
        label: "⏰ Expired",
        className: "bg-red-100 text-red-800",
        description: "Poll has closed, results can be drawn",
      };
    } else {
      return {
        status: "active",
        label: "🟢 Active",
        className: "bg-blue-100 text-blue-800",
        description: "Poll is currently accepting entries",
      };
    }
  };

  const copyShareLink = async () => {
    if (!poll) return;

    try {
      const shareUrl = `${window.location.origin}/poll/${poll.share_link}`;
      await navigator.clipboard.writeText(shareUrl);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header Skeleton */}
        <div className="bg-white shadow-sm border-b px-4 py-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-4 space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="bg-white rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center max-w-sm w-full">
          <div className="text-red-500 text-5xl mb-4">😞</div>
          <h1 className="text-xl font-bold mb-2 text-red-800">
            Poll Not Found
          </h1>
          <p className="text-red-600 mb-4 text-sm">
            This poll may have been deleted or you don't have permission to view
            it.
          </p>
          <button
            onClick={() => router.push("/manager/dashboard")}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const pollStatus = getPollStatus();
  const shareUrl = `${window.location.origin}/poll/${poll.share_link}`;
  const pollEndTime = new Date(poll.open_until);
  const isPollActive = pollStatus.status === "active";
  const isPollExpired = pollStatus.status === "expired";
  const isPollCompleted = pollStatus.status === "completed";
  const canDrawResults = isPollExpired && !poll.results_drawn;

  const entriesByType = {
    am: entries.filter((e) => e.spot_type === "am"),
    pm: entries.filter((e) => e.spot_type === "pm"),
    all_day: entries.filter((e) => e.spot_type === "all_day"),
  };

  const resultsByType = {
    am: results.filter((r) => r.spot_type === "am"),
    pm: results.filter((r) => r.spot_type === "pm"),
    all_day: results.filter((r) => r.spot_type === "all_day"),
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg -ml-2"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {poll.title}
                </h1>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${pollStatus.className}`}
                  >
                    {pollStatus.label}
                  </span>
                  {refreshing && (
                    <div className="flex items-center text-xs text-gray-500">
                      <svg
                        className="animate-spin -ml-1 mr-1 h-3 w-3"
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
                      Updating...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg"
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
                  d="M12 5v.01M12 12v.01M12 19v.01"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Action Menu */}
          {showMobileMenu && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
              {canDrawResults && (
                <button
                  onClick={() => {
                    manualDrawResults();
                    setShowMobileMenu(false);
                  }}
                  disabled={drawingResults}
                  className="w-full bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {drawingResults ? (
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
                      Drawing Results...
                    </>
                  ) : (
                    <>🎲 Draw Results</>
                  )}
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    copyShareLink();
                    setShowMobileMenu(false);
                  }}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
                >
                  <InfoIcon /> Copy Link
                </button>
                <Link
                  href={`/poll/${poll.share_link}`}
                  target="_blank"
                  onClick={() => setShowMobileMenu(false)}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium text-center flex items-center justify-center"
                >
                  <InfoIcon /> Preview
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <ErrorAlert error={error} onClose={clearError} />

        {/* Poll Status Card */}
        {isPollExpired && canDrawResults && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">
                  ⏰ Poll Has Expired
                </h3>
                <p className="text-orange-700 text-sm mb-3">
                  This poll closed on {pollEndTime.toLocaleString()}. You can
                  now draw the results.
                </p>
              </div>
            </div>
            <button
              onClick={manualDrawResults}
              disabled={drawingResults}
              className="w-full bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50"
            >
              {drawingResults ? (
                <span className="flex items-center justify-center">
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
                  Drawing Results...
                </span>
              ) : (
                "🎲 Draw Results"
              )}
            </button>
          </div>
        )}

        {/* Active Poll Timer */}
        {isPollActive && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-center">
            <div className="text-center">
              <h3 className="font-semibold text-green-900 mb-2">Poll Active</h3>
              <CountdownTimer targetDate={pollEndTime} size="md" />
            </div>
          </div>
        )}

        {/* Share Link Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-blue-900 flex items-center space-x-2">
            <ShareIcon /> Share with Employees
          </h3>
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full px-3 py-2 bg-white border border-blue-300 rounded text-sm"
            />
            <div className="flex space-x-2">
              <button
                onClick={copyShareLink}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
              >
                <CopyIcon /> Copy
              </button>
              <Link
                href={`/poll/${poll.share_link}`}
                target="_blank"
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm font-medium text-center flex items-center justify-center"
              >
                <InfoIcon /> Preview
              </Link>
            </div>
          </div>
          {isPollExpired && (
            <p className="text-orange-700 text-sm mt-2">
              ⚠️ This poll has expired. The link will show a "Poll Closed"
              message.
            </p>
          )}
        </div>

        {/* Mobile Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === "overview"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center">
                <OverviewIcon className="w-4 h-4 mr-2" />
                Overview
              </div>
            </button>

            <button
              onClick={() => setActiveTab("entries")}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === "entries"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center">
                <EntriesIcon className="w-4 h-4 mr-2" />
                Entries ({entries.length})
              </div>
            </button>

            {isPollCompleted && (
              <button
                onClick={() => setActiveTab("results")}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === "results"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center">
                  <ResultsIcon className="w-4 h-4 mr-2" />
                  Results
                </div>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* Description */}
                {poll.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-600 text-sm">{poll.description}</p>
                  </div>
                )}

                {/* Spot Configuration */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Available Spots
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-blue-900 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          Morning Shift
                        </div>
                        <div className="text-blue-700 text-sm">
                          {entriesByType.am.length} entries
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          {poll.am_spots}
                        </div>
                        <div className="text-blue-600 text-xs">spots</div>
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-orange-900 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                            />
                          </svg>
                          Afternoon Shift
                        </div>
                        <div className="text-orange-700 text-sm">
                          {entriesByType.pm.length} entries
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-orange-600">
                          {poll.pm_spots}
                        </div>
                        <div className="text-orange-600 text-xs">spots</div>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-purple-900 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-purple-600"
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
                          Full Day
                        </div>
                        <div className="text-purple-700 text-sm">
                          {entriesByType.all_day.length} entries
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-purple-600">
                          {poll.all_day_spots}
                        </div>
                        <div className="text-purple-600 text-xs">spots</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Poll Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Poll Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {new Date(poll.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Closes:</span>
                      <div className="text-right">
                        <div className="font-medium">
                          {pollEndTime.toLocaleDateString()}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {pollEndTime.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Total Entries:</span>
                      <span className="font-medium">{entries.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "entries" && (
              <div className="space-y-4">
                {entries.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📭</div>
                    <p className="text-gray-500">No entries yet</p>
                    <p className="text-gray-400 text-sm">
                      {isPollActive
                        ? "Share the poll link to start collecting entries"
                        : "No employees participated"}
                    </p>
                  </div>
                ) : (
                  <>
                    {poll.am_spots > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h4 className="font-medium text-blue-900 flex items-center justify-start mb-2">
                          <MorningIcon className="w-4 h-4 mr-2" />
                          Morning Entries ({entriesByType.am.length})
                        </h4>
                        {entriesByType.am.length > 0 ? (
                          <div className="space-y-1">
                            {entriesByType.am.map((entry, index) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between bg-white rounded p-2"
                              >
                                <div className="flex items-center">
                                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm">
                                    {entry.users?.name}
                                  </span>
                                </div>
                                {isPollCompleted &&
                                  resultsByType.am.some(
                                    (r) => r.user_id === entry.user_id
                                  ) && (
                                    <span className="text-green-600 font-bold">
                                      🏆
                                    </span>
                                  )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-blue-700 text-sm italic">
                            No entries
                          </p>
                        )}
                      </div>
                    )}

                    {poll.pm_spots > 0 && (
                      <div className="bg-orange-50 rounded-lg p-3">
                        <h4 className="font-medium text-orange-900 flex items-center justify-start mb-2">
                          <AfternoonIcon className="w-4 h-4 mr-2" /> Afternoon
                          Entries ({entriesByType.pm.length})
                        </h4>
                        {entriesByType.pm.length > 0 ? (
                          <div className="space-y-1">
                            {entriesByType.pm.map((entry, index) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between bg-white rounded p-2"
                              >
                                <div className="flex items-center">
                                  <span className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm">
                                    {entry.users?.name}
                                  </span>
                                </div>
                                {isPollCompleted &&
                                  resultsByType.pm.some(
                                    (r) => r.user_id === entry.user_id
                                  ) && (
                                    <span className="text-green-600 font-bold">
                                      <TrophyIcon className="w-5 h-5" />
                                    </span>
                                  )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-orange-700 text-sm italic">
                            No entries
                          </p>
                        )}
                      </div>
                    )}

                    {poll.all_day_spots > 0 && (
                      <div className="bg-purple-50 rounded-lg p-3">
                        <h4 className="font-medium text-purple-900 mb-2 flex items-center justify-start">
                          <FullDayIcon className="w-4 h-4 mr-2" />
                          Full Day Entries ({entriesByType.all_day.length})
                        </h4>
                        {entriesByType.all_day.length > 0 ? (
                          <div className="space-y-1">
                            {entriesByType.all_day.map((entry, index) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between bg-white rounded p-2"
                              >
                                <div className="flex items-center">
                                  <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                                    {index + 1}
                                  </span>
                                  <span className="text-sm">
                                    {entry.users?.name}
                                  </span>
                                </div>
                                {isPollCompleted &&
                                  resultsByType.all_day.some(
                                    (r) => r.user_id === entry.user_id
                                  ) && (
                                    <span className="text-green-600 font-bold">
                                      🏆
                                    </span>
                                  )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-purple-700 text-sm italic">
                            No entries
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "results" && isPollCompleted && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <h3 className="font-semibold text-green-800 mb-1 flex items-center justify-start">
                    <TrophyIcon className="w-4 h-4 mr-2" /> Results
                  </h3>
                  <p className="text-green-700 text-sm">
                    Results drawn on{" "}
                    {new Date(
                      poll.updated_at || poll.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                {poll.am_spots > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center justify-start">
                      <MorningIcon className="w-4 h-4 mr-2" /> Morning Winners (
                      {resultsByType.am.length}/{poll.am_spots})
                    </h4>
                    {resultsByType.am.length > 0 ? (
                      <div className="space-y-1">
                        {resultsByType.am.map((result, index) => (
                          <div
                            key={result.id}
                            className="flex items-center bg-white rounded p-2"
                          >
                            <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-green-700">
                              {result.users?.name}
                            </span>
                            <span className="ml-2">🎉</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-blue-700 text-sm italic">
                        No winners drawn
                      </p>
                    )}
                  </div>
                )}

                {poll.pm_spots > 0 && (
                  <div className="bg-orange-50 rounded-lg p-3">
                    <h4 className="font-medium text-orange-900 mb-2 flex items-center justify-start">
                      <AfternoonIcon className="w-4 h-4 mr-2" /> (
                      {resultsByType.pm.length}/{poll.pm_spots})
                    </h4>
                    {resultsByType.pm.length > 0 ? (
                      <div className="space-y-1">
                        {resultsByType.pm.map((result, index) => (
                          <div
                            key={result.id}
                            className="flex items-center bg-white rounded p-2"
                          >
                            <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-green-700">
                              {result.users?.name}
                            </span>
                            <span className="ml-2">🎉</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-orange-700 text-sm italic">
                        No winners drawn
                      </p>
                    )}
                  </div>
                )}

                {poll.all_day_spots > 0 && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <h4 className="font-medium text-purple-900 mb-2 flex items-center justify-start">
                      <FullDayIcon className="w-4 h-4 mr-2" /> (
                      {resultsByType.all_day.length}/{poll.all_day_spots})
                    </h4>
                    {resultsByType.all_day.length > 0 ? (
                      <div className="space-y-1">
                        {resultsByType.all_day.map((result, index) => (
                          <div
                            key={result.id}
                            className="flex items-center bg-white rounded p-2"
                          >
                            <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-green-700">
                              {result.users?.name}
                            </span>
                            <span className="ml-2">🎉</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-purple-700 text-sm italic">
                        No winners drawn
                      </p>
                    )}
                  </div>
                )}

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {results.length} Total Winner
                    {results.length !== 1 ? "s" : ""}
                  </div>
                  <div className="text-sm text-gray-600">
                    Out of {entries.length} participants
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link
              href={`/manager/dashboard`}
              className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 font-medium text-center flex items-center justify-center"
            >
              {/* <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
              </svg> */}
              <DashboardIcon className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>

            <Link
              href="/manager/create-poll"
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium text-center flex items-center justify-center"
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
              Create New Poll
            </Link>

            <Link
              href="/manager/users"
              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium text-center flex items-center justify-center"
            >
              {/* <svg
                className="w-4 h-4 mr-2"
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
              </svg> */}
              <UserIcon className="w-4 h-4 mr-2" />
              Manage Users
            </Link>
          </div>
        </div>

        {/* Desktop View Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 lg:hidden">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-blue-800 text-sm font-medium">💡 Pro Tip</p>
              <p className="text-blue-700 text-sm">
                For a more detailed view with additional features, try accessing
                this page on a desktop or tablet.
              </p>
            </div>
          </div>
        </div>

        {/* Development Debug Info - Only show in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-100 rounded-lg p-4">
            <details>
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                🔧 Debug Info (Development)
              </summary>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Poll ID: {poll.id}</div>
                <div>Status: {pollStatus.status}</div>
                <div>Results Drawn: {poll.results_drawn ? "Yes" : "No"}</div>
                <div>Active: {poll.is_active ? "Yes" : "No"}</div>
                <div>Entries Count: {entries.length}</div>
                <div>Results Count: {results.length}</div>
                <div>Can Draw: {canDrawResults ? "Yes" : "No"}</div>
                <div>End Time: {pollEndTime.toISOString()}</div>
                <div>Active Tab: {activeTab}</div>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Bottom Spacing for Mobile */}
      <div className="h-8"></div>
    </div>
  );
}
