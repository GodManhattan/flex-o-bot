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
  updated_at: string;
  selection_type: "random" | "first_come_first_serve";
  created_at: string;
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
  const [autoDrawing, setAutoDrawing] = useState(false); // NEW: Track auto-drawing state
  const [activeTab, setActiveTab] = useState<
    "overview" | "entries" | "results"
  >("overview");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  // Enhanced fetchPollData with better error handling and state management
  const fetchPollData = useCallback(async () => {
    // Prevent multiple simultaneous fetches, but allow when auto-drawing
    if (refreshing && !autoDrawing) return;

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

      console.log("🔍 Fetching poll data for:", params.id);

      const [pollRes, entriesRes, resultsRes] = await Promise.all([
        supabase
          .from("polls")
          .select("*")
          .eq("id", params.id)
          .eq("manager_id", user.id)
          .single(),
        supabase
          .from("poll_entries")
          .select(`*, users (name)`)
          .eq("poll_id", params.id),
        supabase
          .from("poll_results")
          .select(`*, users (name)`)
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
        const pollData = pollRes.data;
        console.log("📊 Poll data received:", {
          id: pollData.id,
          title: pollData.title,
          results_drawn: pollData.results_drawn,
          is_active: pollData.is_active,
          selection_type: pollData.selection_type,
          open_until: pollData.open_until,
        });

        // Check if poll should be auto-drawn
        const now = new Date();
        const endTime = new Date(pollData.open_until);
        const hasExpired = endTime <= now;

        // Only trigger auto-draw if poll is expired, active, and results not drawn
        if (
          hasExpired &&
          pollData.is_active &&
          !pollData.results_drawn &&
          !autoDrawing
        ) {
          console.log("⚡ Poll has expired and needs auto-drawing");
          setAutoDrawing(true);

          try {
            await autoDrawResults(pollData.id, pollData.selection_type);
            // Refresh data after auto-draw with a longer delay
            setTimeout(() => {
              setAutoDrawing(false);
              fetchPollData();
            }, 2000);
            return;
          } catch (autoDrawError) {
            console.error("❌ Auto-draw failed:", autoDrawError);
            setAutoDrawing(false);
            // Continue with current data even if auto-draw fails
          }
        }

        setPoll(pollData);
      }

      if (entriesRes.data) setEntries(entriesRes.data);
      if (resultsRes.data) {
        console.log("🏆 Results data:", resultsRes.data.length, "results");
        setResults(resultsRes.data);
      }
    } catch (err) {
      console.error("❌ Error in fetchPollData:", err);
      handleError(err, "Failed to load poll data");
    } finally {
      setLoading(false);
      // Only set refreshing to false if we're not auto-drawing
      if (!autoDrawing) {
        setRefreshing(false);
      }
    }
  }, [params.id, router, handleError, clearError, refreshing, autoDrawing]);

  const getStatusIndicator = () => {
    if (!poll) return null;

    const now = new Date();
    const endTime = new Date(poll.open_until);
    const hasExpired = endTime <= now;

    // If poll is completed (results drawn), don't show any status
    if (poll.results_drawn) {
      return null;
    }

    // If currently auto-drawing, show processing
    if (autoDrawing) {
      return (
        <div className="flex items-center text-xs text-blue-600">
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing Results...
        </div>
      );
    }

    // If poll is expired but results not drawn, show waiting
    if (hasExpired && !poll.results_drawn) {
      return (
        <div className="flex items-center text-xs text-orange-600">
          <svg
            className="animate-pulse -ml-1 mr-1 h-3 w-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          Awaiting Results...
        </div>
      );
    }

    // If currently refreshing data and poll is active
    if (refreshing && poll.is_active) {
      return (
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Updating...
        </div>
      );
    }

    // Don't show status for completed or stable states
    return null;
  };

  // Enhanced autoDrawResults function
  const autoDrawResults = async (
    pollId: string,
    selectionType: "random" | "first_come_first_serve"
  ) => {
    try {
      console.log(`🎯 Auto-drawing results for ${selectionType} poll:`, pollId);

      if (selectionType === "first_come_first_serve") {
        console.log("⚡ FCFS poll - marking as completed");

        const { error: updateError } = await supabase
          .from("polls")
          .update({
            is_active: false,
            results_drawn: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", pollId);

        if (updateError) {
          console.error("❌ Error updating FCFS poll status:", updateError);
          throw updateError;
        }
      } else {
        console.log("🎲 Random poll - calling draw function");

        const { data, error } = await supabase.rpc("draw_poll_results", {
          poll_uuid: pollId,
        });

        if (error) {
          console.error("❌ Error in draw_poll_results RPC:", error);
          throw error;
        }

        console.log("✅ Draw results RPC response:", data);
      }

      console.log("✅ Auto-draw completed successfully");
      return { success: true };
    } catch (err) {
      console.error("❌ Auto-draw failed:", err);
      throw err;
    }
  };

  const manualDrawResults = async (poll: Poll) => {
    setDrawingResults(true);
    clearError();

    try {
      console.log(
        `🎯 Manually drawing results for ${poll.selection_type} poll:`,
        poll.id
      );

      if (poll.selection_type === "first_come_first_serve") {
        console.log(
          "⚡ FCFS poll - marking as completed (results already exist)"
        );

        const { error: updateError } = await supabase
          .from("polls")
          .update({
            is_active: false,
            results_drawn: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", poll.id);

        if (updateError) {
          handleError(updateError, "Failed to finalize FCFS poll");
          return;
        }
      } else {
        console.log("🎲 Random poll - calling draw function");

        const { error: drawError } = await supabase.rpc("draw_poll_results", {
          poll_uuid: poll.id,
        });

        if (drawError) {
          handleError(drawError, "Failed to draw random poll results");
          return;
        }
      }

      // Refresh data after manual draw
      setTimeout(() => fetchPollData(), 1000);

      console.log(
        `✅ Manual ${poll.selection_type} poll processed successfully`
      );
    } catch (err) {
      handleError(err, `Failed to process ${poll.selection_type} poll`);
    } finally {
      setDrawingResults(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (params.id) {
      fetchPollData();

      // Set up real-time subscription for this poll with smarter updates
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
            console.log("🔔 Poll updated via subscription:", payload);

            // Only refresh if meaningful changes occurred
            const oldRecord = payload.old as Poll;
            const newRecord = payload.new as Poll;

            // Check for significant changes that warrant a refresh
            const significantChange =
              oldRecord?.results_drawn !== newRecord?.results_drawn ||
              oldRecord?.is_active !== newRecord?.is_active ||
              payload.eventType === "INSERT" ||
              payload.eventType === "DELETE";

            if (significantChange && !autoDrawing) {
              console.log("📡 Significant poll change detected, refreshing...");
              fetchPollData();
            }
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
            console.log("🔔 Poll entries updated via subscription:", payload);

            if (!autoDrawing && !refreshing) {
              console.log("📡 Entry change detected, refreshing entries...");
              // For entries, we can just refetch entries without full poll refresh
              fetchEntries();
            }
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
            console.log("🔔 Poll results updated via subscription:", payload);

            if (!autoDrawing) {
              console.log("🏆 Results change detected, refreshing results...");
              // Results changed - this is important, always refresh
              fetchResults();

              // Also update poll status if results were just drawn
              if (payload.eventType === "INSERT") {
                fetchPollData();
              }
            }
          }
        )
        .subscribe();

      return () => {
        console.log("🧹 Cleaning up subscription");
        supabase.removeChannel(subscription);
      };
    }
  }, [params.id, autoDrawing]);

  const fetchEntries = useCallback(async () => {
    if (!poll) return;

    try {
      const { data, error } = await supabase
        .from("poll_entries")
        .select(`*, users (name)`)
        .eq("poll_id", poll.id);

      if (error) {
        console.error("Error fetching entries:", error);
      } else if (data) {
        setEntries(data);
      }
    } catch (error) {
      console.error("Error in fetchEntries:", error);
    }
  }, [poll]);

  const fetchResults = useCallback(async () => {
    if (!poll) return;

    try {
      const { data, error } = await supabase
        .from("poll_results")
        .select(`*, users (name)`)
        .eq("poll_id", poll.id);

      if (error) {
        console.error("Error fetching results:", error);
      } else if (data) {
        console.log("🏆 Results updated:", data.length, "results");
        setResults(data);
      }
    } catch (error) {
      console.error("Error in fetchResults:", error);
    }
  }, [poll]);

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

  // Enhanced loading state with auto-drawing indicator
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

        {/* Content with status indicator */}
        <div className="p-4 space-y-4">
          {autoDrawing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
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
                <div>
                  <p className="text-blue-800 font-medium">
                    Processing Poll Results
                  </p>
                  <p className="text-blue-600 text-sm">
                    The poll has expired and results are being drawn...
                  </p>
                </div>
              </div>
            </div>
          )}

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
    <div className="min-h-screen bg-gray-50">
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
                  {getStatusIndicator()}
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
              {canDrawResults && !drawingResults && !autoDrawing && (
                <button
                  onClick={() => {
                    manualDrawResults(poll);
                    setShowMobileMenu(false);
                  }}
                  disabled={drawingResults || autoDrawing}
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
                  <CopyIcon className="w-4 h-4 mr-1" />
                  Copy Link
                </button>
                <Link
                  href={`/poll/${poll.share_link}`}
                  target="_blank"
                  onClick={() => setShowMobileMenu(false)}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium text-center flex items-center justify-center"
                >
                  <InfoIcon className="w-4 h-4 mr-1" />
                  Preview
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <ErrorAlert error={error} onClose={clearError} />

        {/* Auto-drawing status indicator */}
        {autoDrawing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
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
              <div>
                <p className="text-blue-800 font-medium">
                  Processing Poll Results
                </p>
                <p className="text-blue-600 text-sm">
                  The poll has expired and results are being drawn. This may
                  take a few moments...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Poll Status Card */}
        {isPollExpired && canDrawResults && !autoDrawing && (
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
              onClick={() => poll && manualDrawResults(poll)}
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
            <ShareIcon className="w-4 h-4" />
            <span>Share with Employees</span>
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
                <CopyIcon className="w-4 h-4 mr-1" />
                Copy
              </button>
              <Link
                href={`/poll/${poll.share_link}`}
                target="_blank"
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm font-medium text-center flex items-center justify-center"
              >
                <InfoIcon className="w-4 h-4 mr-1" />
                Preview
              </Link>
            </div>
            {isPollExpired && (
              <p className="text-orange-700 text-sm mt-2">
                ⚠️ This poll has expired. The link will show a "Poll Closed"
                message.
              </p>
            )}
          </div>
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
                {/* Poll Type Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                      poll.selection_type === "random"
                        ? "bg-purple-100 text-purple-800 border-purple-200"
                        : "bg-orange-100 text-orange-800 border-orange-200"
                    }`}
                  >
                    <span className="mr-2">
                      {poll.selection_type === "random" ? "🎲" : "⚡"}
                    </span>
                    {poll.selection_type === "random"
                      ? "Random Selection"
                      : "First Come, First Serve"}
                  </span>
                </div>

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
                    {poll.am_spots > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium text-blue-900 flex items-center">
                            <MorningIcon className="w-5 h-5 mr-2 text-blue-600" />
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
                    )}

                    {poll.pm_spots > 0 && (
                      <div className="bg-orange-50 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium text-orange-900 flex items-center">
                            <AfternoonIcon className="w-5 h-5 mr-2 text-orange-600" />
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
                    )}

                    {poll.all_day_spots > 0 && (
                      <div className="bg-purple-50 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium text-purple-900 flex items-center">
                            <FullDayIcon className="w-5 h-5 mr-2 text-purple-600" />
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
                    )}
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
                      <span className="text-gray-600">
                        {poll.selection_type === "first_come_first_serve"
                          ? "Max Duration:"
                          : "Closes:"}
                      </span>
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
                    <div className="text-gray-400 text-4xl mb-2">🔭</div>
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
                          <AfternoonIcon className="w-4 h-4 mr-2" />
                          Afternoon Entries ({entriesByType.pm.length})
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
                    <TrophyIcon className="w-4 h-4 mr-2" />
                    Results
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
                      <MorningIcon className="w-4 h-4 mr-2" />
                      Morning Winners ({resultsByType.am.length}/{poll.am_spots}
                      )
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
                      <AfternoonIcon className="w-4 h-4 mr-2" />
                      Afternoon Winners ({resultsByType.pm.length}/
                      {poll.pm_spots})
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
                      <FullDayIcon className="w-4 h-4 mr-2" />
                      Full Day Winners ({resultsByType.all_day.length}/
                      {poll.all_day_spots})
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
              href="/manager/dashboard"
              className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 font-medium text-center flex items-center justify-center"
            >
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
              <UserIcon className="w-4 h-4 mr-2" />
              Manage Users
            </Link>
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
                <div>Selection Type: {poll.selection_type}</div>
                <div>Entries Count: {entries.length}</div>
                <div>Results Count: {results.length}</div>
                <div>Can Draw: {canDrawResults ? "Yes" : "No"}</div>
                <div>Auto Drawing: {autoDrawing ? "Yes" : "No"}</div>
                <div>Drawing Results: {drawingResults ? "Yes" : "No"}</div>
                <div>Refreshing: {refreshing ? "Yes" : "No"}</div>
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
