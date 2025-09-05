"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { CountdownTimer } from "@/app/components/CountdownTimer";
import { useErrorHandler } from "@/app/hooks/useErrorHandler";
import { ErrorAlert } from "@/app/components/ErrorAlert";

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
        className: "bg-gray-100 text-gray-600",
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
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-red-800">
            Poll Not Found
          </h1>
          <p className="text-red-600 mb-6">
            This poll may have been deleted or you don't have permission to view
            it.
          </p>
          <button
            onClick={() => router.push("/manager/dashboard")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
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
  const now = new Date();
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-4 flex items-center"
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{poll.title}</h1>
            {poll.description && (
              <p className="text-gray-600 mb-4">{poll.description}</p>
            )}
          </div>

          <div className="flex flex-col items-end space-y-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${pollStatus.className}`}
            >
              {pollStatus.label}
            </span>
            <p className="text-sm text-gray-600 text-right">
              {pollStatus.description}
            </p>

            {isPollActive && (
              <div className="bg-white border border-green-200 rounded-lg px-4 py-3">
                <CountdownTimer targetDate={pollEndTime} size="md" />
              </div>
            )}

            {refreshing && (
              <div className="flex items-center text-sm text-gray-600">
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
                Refreshing...
              </div>
            )}
          </div>
        </div>
      </div>

      <ErrorAlert error={error} onClose={clearError} />

      {/* Action Buttons for Expired Polls */}
      {isPollExpired && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                ⏰ Poll Has Expired
              </h3>
              <p className="text-orange-700 mb-4">
                This poll closed on {pollEndTime.toLocaleString()}.
                {canDrawResults
                  ? " You can now draw the lottery results."
                  : " Results have already been drawn."}
              </p>
            </div>

            {canDrawResults && (
              <button
                onClick={manualDrawResults}
                disabled={drawingResults}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {drawingResults ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                  "🎲 Draw Lottery Results"
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Share Link Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h3 className="font-semibold mb-2 text-blue-900">
          📤 Share with Employees
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm"
          />
          <div className="flex space-x-2">
            <button
              onClick={copyShareLink}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm whitespace-nowrap"
            >
              📋 Copy
            </button>
            <Link
              href={`/poll/${poll.share_link}`}
              target="_blank"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm whitespace-nowrap"
            >
              👁️ Preview
            </Link>
          </div>
        </div>
        {isPollExpired && (
          <p className="text-orange-700 text-sm mt-2">
            ⚠️ This poll has expired. The link will show a "Poll Closed" message
            to employees.
          </p>
        )}
      </div>

      {/* Poll Stats Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            📊 Poll Configuration
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">🌅 AM Spots:</span>
              <span className="font-medium text-blue-600">{poll.am_spots}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">🌇 PM Spots:</span>
              <span className="font-medium text-orange-600">
                {poll.pm_spots}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">🌅🌇 All Day Spots:</span>
              <span className="font-medium text-purple-600">
                {poll.all_day_spots}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">📅 Created:</span>
              <span className="font-medium">
                {new Date(poll.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">⏰ Closes:</span>
              <span className="font-medium">
                {pollEndTime.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            👥 Participation Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Entries:</span>
              <span className="font-medium text-lg">{entries.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">🌅 AM Entries:</span>
              <span className="font-medium text-blue-600">
                {entriesByType.am.length}
                {poll.am_spots > 0 && ` / ${poll.am_spots}`}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">🌇 PM Entries:</span>
              <span className="font-medium text-orange-600">
                {entriesByType.pm.length}
                {poll.pm_spots > 0 && ` / ${poll.pm_spots}`}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">🌅🌇 All Day Entries:</span>
              <span className="font-medium text-purple-600">
                {entriesByType.all_day.length}
                {poll.all_day_spots > 0 && ` / ${poll.all_day_spots}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {isPollCompleted && (
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
            <h3 className="text-xl font-semibold text-green-800 flex items-center">
              🏆 Lottery Results
            </h3>
            <p className="text-green-700 text-sm mt-1">
              Results drawn on{" "}
              {new Date(poll.updated_at || poll.created_at).toLocaleString()}
            </p>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-blue-900 flex items-center">
                  🌅 AM Winners ({resultsByType.am.length}/{poll.am_spots})
                </h4>
                {resultsByType.am.length > 0 ? (
                  <ul className="space-y-2">
                    {resultsByType.am.map((result, index) => (
                      <li
                        key={result.id}
                        className="flex items-center text-green-700"
                      >
                        <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                          {index + 1}
                        </span>
                        <span className="font-medium">
                          {result.users?.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No winners drawn
                  </p>
                )}
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-orange-900 flex items-center">
                  🌇 PM Winners ({resultsByType.pm.length}/{poll.pm_spots})
                </h4>
                {resultsByType.pm.length > 0 ? (
                  <ul className="space-y-2">
                    {resultsByType.pm.map((result, index) => (
                      <li
                        key={result.id}
                        className="flex items-center text-green-700"
                      >
                        <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                          {index + 1}
                        </span>
                        <span className="font-medium">
                          {result.users?.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No winners drawn
                  </p>
                )}
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-purple-900 flex items-center">
                  🌅🌇 All Day Winners ({resultsByType.all_day.length}/
                  {poll.all_day_spots})
                </h4>
                {resultsByType.all_day.length > 0 ? (
                  <ul className="space-y-2">
                    {resultsByType.all_day.map((result, index) => (
                      <li
                        key={result.id}
                        className="flex items-center text-green-700"
                      >
                        <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                          {index + 1}
                        </span>
                        <span className="font-medium">
                          {result.users?.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    No winners drawn
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Entries Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold flex items-center">
            📝 All Entries ({entries.length})
          </h3>
        </div>
        <div className="p-6">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">No entries yet</p>
              <p className="text-gray-400 text-sm">
                {isPollActive
                  ? "Share the poll link with employees to start collecting entries"
                  : "No employees participated in this poll"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-blue-900">
                  🌅 AM Entries ({entriesByType.am.length})
                </h4>
                {entriesByType.am.length > 0 ? (
                  <ul className="space-y-1">
                    {entriesByType.am.map((entry, index) => (
                      <li key={entry.id} className="text-sm flex items-center">
                        <span className="text-blue-600 mr-2 text-xs">
                          #{index + 1}
                        </span>
                        <span>{entry.users?.name}</span>
                        {isPollCompleted &&
                          resultsByType.am.some(
                            (r) => r.user_id === entry.user_id
                          ) && (
                            <span className="ml-auto text-green-600 font-bold">
                              🏆
                            </span>
                          )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">No entries</p>
                )}
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-orange-900">
                  🌇 PM Entries ({entriesByType.pm.length})
                </h4>
                {entriesByType.pm.length > 0 ? (
                  <ul className="space-y-1">
                    {entriesByType.pm.map((entry, index) => (
                      <li key={entry.id} className="text-sm flex items-center">
                        <span className="text-orange-600 mr-2 text-xs">
                          #{index + 1}
                        </span>
                        <span>{entry.users?.name}</span>
                        {isPollCompleted &&
                          resultsByType.pm.some(
                            (r) => r.user_id === entry.user_id
                          ) && (
                            <span className="ml-auto text-green-600 font-bold">
                              🏆
                            </span>
                          )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">No entries</p>
                )}
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-purple-900">
                  🌅🌇 All Day Entries ({entriesByType.all_day.length})
                </h4>
                {entriesByType.all_day.length > 0 ? (
                  <ul className="space-y-1">
                    {entriesByType.all_day.map((entry, index) => (
                      <li key={entry.id} className="text-sm flex items-center">
                        <span className="text-purple-600 mr-2 text-xs">
                          #{index + 1}
                        </span>
                        <span>{entry.users?.name}</span>
                        {isPollCompleted &&
                          resultsByType.all_day.some(
                            (r) => r.user_id === entry.user_id
                          ) && (
                            <span className="ml-auto text-green-600 font-bold">
                              🏆
                            </span>
                          )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">No entries</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
