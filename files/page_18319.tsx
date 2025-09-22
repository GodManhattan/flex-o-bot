"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { Poll, User } from "@/app/types";
import { handlePollEntry } from "@/app/utils/pollHelpers";

interface PollEntry {
  id: string;
  spot_type: "am" | "pm" | "all_day";
  users: { name: string } | null;
}

interface PollResult {
  id: string;
  spot_type: "am" | "pm" | "all_day";
  user_id: string;
  users: { name: string } | null;
}

export default function PollParticipationPage() {
  const params = useParams();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [pin, setPin] = useState("");
  const [spotType, setSpotType] = useState<"am" | "pm" | "all_day" | "">("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Enhanced state for live updates
  const [entries, setEntries] = useState<PollEntry[]>([]);
  const [results, setResults] = useState<PollResult[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [pollEnded, setPollEnded] = useState(false);
  const [resultsDrawn, setResultsDrawn] = useState(false);
  const [checkingResults, setCheckingResults] = useState(false);
  const [lastResultCheck, setLastResultCheck] = useState<Date | null>(null);

  // Fetch poll data
  const fetchPollData = useCallback(async () => {
    try {
      const [pollRes, usersRes] = await Promise.all([
        supabase
          .from("polls")
          .select("*")
          .eq("share_link", params.shareLink)
          .single(),
        supabase.from("users").select("*").order("name"),
      ]);

      if (pollRes.data) {
        setPoll(pollRes.data);

        console.log("Poll data loaded:", {
          id: pollRes.data.id,
          results_drawn: pollRes.data.results_drawn,
          is_active: pollRes.data.is_active,
          open_until: pollRes.data.open_until,
        });

        // Check if results are already drawn
        if (pollRes.data.results_drawn) {
          console.log("Results already drawn, setting state");
          setResultsDrawn(true);
        }

        // Check if poll has ended
        const now = new Date();
        const endTime = new Date(pollRes.data.open_until);
        if (endTime <= now) {
          console.log("Poll has ended");
          setPollEnded(true);
        }
      }
      if (usersRes.data) setUsers(usersRes.data);
    } catch (error) {
      console.error("Error fetching poll data:", error);
    } finally {
      setLoading(false);
    }
  }, [params.shareLink]);

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    if (!poll) return;

    try {
      const { data, error } = await supabase
        .from("poll_entries")
        .select(
          `
          id,
          spot_type,
          users!poll_entries_user_id_fkey ( name )
        `
        )
        .eq("poll_id", poll.id);

      if (error) {
        console.error("Error fetching entries:", error);
      } else if (data) {
        // Fix the type mismatch by ensuring proper data structure
        const formattedEntries: PollEntry[] = data.map((entry) => ({
          id: entry.id,
          spot_type: entry.spot_type,
          users: Array.isArray(entry.users)
            ? entry.users.length > 0
              ? entry.users[0]
              : null
            : entry.users,
        }));
        setEntries(formattedEntries);
      }
    } catch (error) {
      console.error("Error in fetchEntries:", error);
    }
  }, [poll]);

  // Fetch results
  const fetchResults = useCallback(async () => {
    if (!poll) return;

    try {
      console.log("Fetching results for poll:", poll.id);

      // Try multiple query methods to ensure we get results
      const queries = [
        // Method 1: Simple query
        supabase.from("poll_results").select("*").eq("poll_id", poll.id),

        // Method 2: With user join
        supabase
          .from("poll_results")
          .select(
            `
            id,
            spot_type,
            user_id,
            users!poll_results_user_id_fkey ( name )
          `
          )
          .eq("poll_id", poll.id),
      ];

      const [simpleQuery, joinQuery] = await Promise.all(queries);

      console.log("Results query responses:", {
        simple: { data: simpleQuery.data, error: simpleQuery.error },
        join: { data: joinQuery.data, error: joinQuery.error },
      });

      // Use the query that worked
      let resultData = null;
      if (!joinQuery.error && joinQuery.data) {
        resultData = joinQuery.data;
      } else if (!simpleQuery.error && simpleQuery.data) {
        // If join failed, use simple query and fetch user names separately
        resultData = simpleQuery.data;

        // Fetch user names for simple results
        if (resultData.length > 0) {
          const userIds = resultData.map((r) => r.user_id);
          const { data: userData } = await supabase
            .from("users")
            .select("id, name")
            .in("id", userIds);

          // Map user names to results
          resultData = resultData.map((result) => ({
            ...result,
            users: userData?.find((u) => u.id === result.user_id) || null,
          }));
        }
      }

      if (resultData) {
        console.log("Successfully fetched results:", resultData);
        setResults(resultData);
        setLastResultCheck(new Date());

        if (resultData.length > 0) {
          setResultsDrawn(true);
        }
      } else {
        console.log("No results found or query failed");
      }
    } catch (error) {
      console.error("Error in fetchResults:", error);
    }
  }, [poll]);

  // Trigger auto-draw
  const triggerAutoDraw = useCallback(
    async (
      pollId: string,
      selectionType: "random" | "first_come_first_serve"
    ) => {
      try {
        console.log(`Triggering auto-draw for ${selectionType} poll:`, pollId);

        if (selectionType === "first_come_first_serve") {
          // For FCFS polls, results already exist - just mark as completed
          console.log("FCFS poll expired - marking as completed");

          const { error: updateError } = await supabase
            .from("polls")
            .update({
              is_active: false,
              results_drawn: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", pollId);

          if (updateError) {
            console.error("Error updating FCFS poll status:", updateError);
            throw updateError;
          }

          console.log("FCFS poll marked as completed successfully");
        } else {
          // For random polls, call the draw function
          console.log("Drawing random poll results");

          const { data, error } = await supabase.rpc("draw_poll_results", {
            poll_uuid: pollId,
          });

          if (error) {
            console.error("Error in random poll auto-draw:", error);
            throw error;
          }

          console.log("Random poll auto-draw successful:", data);
        }

        // Force refresh all data after processing
        await Promise.all([fetchPollData(), fetchResults(), fetchEntries()]);

        return { success: true };
      } catch (error) {
        console.error(`Auto-draw failed for ${selectionType} poll:`, error);
        throw error;
      }
    },
    [fetchPollData, fetchResults, fetchEntries]
  );

  // Enhanced result checking when poll ends
  const checkForResults = useCallback(async () => {
    if (checkingResults || !poll) return;

    setCheckingResults(true);
    console.log("Checking for results...");

    try {
      // First check if poll status has been updated
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .select("results_drawn, is_active, open_until, selection_type")
        .eq("id", poll.id)
        .single();

      if (pollError) {
        console.error("Error checking poll status:", pollError);
        return;
      }

      console.log("Poll status check:", pollData);

      // Check if poll has ended and results not drawn
      const now = new Date();
      const endTime = new Date(pollData.open_until);
      const hasExpired = endTime <= now;

      if (hasExpired && !pollData.results_drawn) {
        console.log(
          `${pollData.selection_type} poll has expired and no results drawn - triggering auto-draw!`
        );

        try {
          await triggerAutoDraw(poll.id, pollData.selection_type);
          console.log("Auto-draw completed successfully");
          setResultsDrawn(true);
        } catch (drawError) {
          console.error("Auto-draw failed:", drawError);

          // Continue checking even if draw failed
          setTimeout(() => {
            setCheckingResults(false);
            if (!resultsDrawn) {
              checkForResults();
            }
          }, 3000);
          return;
        }
      } else if (pollData.results_drawn) {
        console.log("Results have been drawn! Fetching...");
        setResultsDrawn(true);
        await fetchResults();
      } else {
        console.log("Poll not expired yet or results already drawn");
        // Continue checking
        setTimeout(() => {
          setCheckingResults(false);
          if (!resultsDrawn && hasExpired) {
            checkForResults();
          }
        }, 2000);
        return;
      }
    } catch (error) {
      console.error("Error in checkForResults:", error);
    }

    setCheckingResults(false);
  }, [checkingResults, poll, resultsDrawn, fetchResults, triggerAutoDraw]);

  // Initial data fetch
  useEffect(() => {
    if (params.shareLink) {
      fetchPollData();
    }
  }, [params.shareLink, fetchPollData]);

  // Fetch entries and results when we reach step 3
  useEffect(() => {
    if (step === 3 && poll) {
      fetchEntries();
      fetchResults();
    }
  }, [step, poll, fetchEntries, fetchResults]);

  // Set up real-time subscriptions when user reaches confirmation step
  useEffect(() => {
    if (step === 3 && poll) {
      console.log("Setting up real-time subscriptions for poll:", poll.id);

      const subscription = supabase
        .channel(`poll_participation_${poll.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "poll_entries",
            filter: `poll_id=eq.${poll.id}`,
          },
          (payload) => {
            console.log("Poll entries updated:", payload);
            fetchEntries();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "poll_results",
            filter: `poll_id=eq.${poll.id}`,
          },
          (payload) => {
            console.log("Poll results updated:", payload);
            fetchResults();
            setResultsDrawn(true);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "polls",
            filter: `id=eq.${poll.id}`,
          },
          (payload) => {
            console.log("Poll updated:", payload);
            if (payload.new.results_drawn) {
              console.log("Poll marked as results drawn!");
              setResultsDrawn(true);
              fetchResults();
              fetchPollData();
            }
          }
        )
        .subscribe();

      return () => {
        console.log("Cleaning up subscription");
        supabase.removeChannel(subscription);
      };
    }
  }, [step, poll, fetchEntries, fetchResults, fetchPollData]);

  // Enhanced countdown timer with result checking
  useEffect(() => {
    if (poll && step === 3) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const endTime = new Date(poll.open_until).getTime();
        const distance = endTime - now;

        if (distance > 0) {
          const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
          setPollEnded(false);
        } else {
          setTimeRemaining("Poll has ended");
          if (!pollEnded) {
            console.log("Poll just ended, starting result checks");
            setPollEnded(true);
          }
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [poll, step, pollEnded]);

  // Start checking for results when poll ends
  useEffect(() => {
    if (pollEnded && !resultsDrawn && step === 3) {
      console.log("Poll ended, starting result checking");
      checkForResults();
    }
  }, [pollEnded, resultsDrawn, step, checkForResults]);

  // Periodic result checking when poll has ended
  useEffect(() => {
    if (pollEnded && !resultsDrawn && step === 3) {
      const interval = setInterval(() => {
        console.log("Periodic result check...");
        checkForResults();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [pollEnded, resultsDrawn, step, checkForResults]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const user = users.find((u) => u.id === selectedUser);
    if (!user || user.pin !== pin) {
      setError("Invalid user or PIN");
      return;
    }

    // Check if user already entered
    const { data: existingEntry } = await supabase
      .from("poll_entries")
      .select("id")
      .eq("poll_id", poll?.id)
      .eq("user_id", selectedUser)
      .single();

    if (existingEntry) {
      setError("You have already entered this poll");
      return;
    }

    setStep(2);
  };

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poll || !selectedUser || !spotType) return;

    console.log("🎯 Starting poll submission:", {
      pollId: poll.id,
      pollType: poll.selection_type,
      userId: selectedUser,
      spotType: spotType,
      pollActive: poll.is_active,
      resultsDrawn: poll.results_drawn,
    });

    setSubmitting(true);
    setError("");

    try {
      if (poll.selection_type === "first_come_first_serve") {
        console.log("🏃 Handling FCFS poll entry");

        const maxSpots = getMaxSpotsForType(poll, spotType);
        console.log(`📊 Max spots for ${spotType}: ${maxSpots}`);

        // Call the database function
        const { data, error: rpcError } = await supabase.rpc(
          "handle_fcfs_entry",
          {
            p_poll_id: poll.id,
            p_user_id: selectedUser,
            p_spot_type: spotType,
            p_max_spots: maxSpots,
          }
        );

        console.log("📡 RPC Response:", { data, error: rpcError });

        if (rpcError) {
          console.error("❌ FCFS RPC Error:", rpcError);
          setError(`Failed to submit entry: ${rpcError.message}`);
          return;
        }

        // Handle the response - it might be an array or direct object
        let result = data;
        if (Array.isArray(data) && data.length > 0) {
          result = data[0];
        }

        console.log("🎲 Processed result:", result);

        if (!result || !result.success) {
          const errorMsg =
            result?.message || "Failed to secure spot - unknown error";
          console.error("❌ FCFS failed:", errorMsg);
          setError(errorMsg);
          return;
        }

        console.log("✅ FCFS Success! Moving to results page");

        // Success! User got the spot
        setSuccess(true);
        setStep(3);

        // For FCFS, results are immediate
        setResultsDrawn(true);

        // If poll is full, mark it as ended
        if (result.poll_full) {
          console.log("🔒 Poll is now full - marking as ended");
          setPollEnded(true);
        }

        // Refresh data to show the new entry and result
        console.log("🔄 Refreshing poll data...");
        setTimeout(async () => {
          try {
            await Promise.all([
              fetchEntries(),
              fetchResults(),
              fetchPollData(),
            ]);
            console.log("✅ Data refreshed successfully");
          } catch (refreshError) {
            console.error("❌ Error refreshing data:", refreshError);
          }
        }, 500);
      } else {
        console.log("🎲 Handling random poll entry");

        // For random polls, use the existing logic
        const { error } = await supabase.from("poll_entries").insert([
          {
            poll_id: poll.id,
            user_id: selectedUser,
            spot_type: spotType,
          },
        ]);

        if (error) {
          console.error("❌ Random poll entry error:", error);
          throw error;
        }

        console.log("✅ Random poll entry successful");
        setSuccess(true);
        setStep(3);
      }
    } catch (err: any) {
      console.error("💥 Submit entry error:", err);
      setError(err.message || "Failed to submit entry");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get max spots for a spot type
  const getMaxSpotsForType = (
    poll: any,
    spotType: "am" | "pm" | "all_day"
  ): number => {
    const spots =
      {
        am: poll.am_spots,
        pm: poll.pm_spots,
        all_day: poll.all_day_spots,
      }[spotType] || 0;

    console.log(`📈 getMaxSpotsForType(${spotType}) = ${spots}`);
    return spots;
  };

  // Also add this debugging to your component to see the poll state
  useEffect(() => {
    if (poll) {
      console.log("🔍 Current poll state:", {
        id: poll.id,
        title: poll.title,
        selection_type: poll.selection_type,
        is_active: poll.is_active,
        results_drawn: poll.results_drawn,
        open_until: poll.open_until,
        spots: {
          am: poll.am_spots,
          pm: poll.pm_spots,
          all_day: poll.all_day_spots,
        },
      });
    }
  }, [poll]);

  // Manual refresh function for debugging
  const manualRefresh = async () => {
    console.log("Manual refresh triggered");
    await Promise.all([fetchPollData(), fetchEntries(), fetchResults()]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading poll...</p>
        </div>
      </div>
    );
  }

  // Poll not found
  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Poll Not Found</h1>
          <p className="text-gray-900">
            This poll may have expired or been removed.
          </p>
        </div>
      </div>
    );
  }

  // Poll closed (only show if user hasn't entered yet)
  if (new Date(poll.open_until) < new Date() && step !== 3) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Poll Closed</h1>
          <p className="text-gray-900">
            This poll closed on {new Date(poll.open_until).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  const availableSpots = [
    ...(poll.am_spots > 0
      ? [{ value: "am", label: `AM Shift (${poll.am_spots} spots)` }]
      : []),
    ...(poll.pm_spots > 0
      ? [{ value: "pm", label: `PM Shift (${poll.pm_spots} spots)` }]
      : []),
    ...(poll.all_day_spots > 0
      ? [{ value: "all_day", label: `All Day (${poll.all_day_spots} spots)` }]
      : []),
  ];

  // Group entries by spot type
  const entriesByType = {
    am: entries.filter((e) => e.spot_type === "am"),
    pm: entries.filter((e) => e.spot_type === "pm"),
    all_day: entries.filter((e) => e.spot_type === "all_day"),
  };

  // Group results by spot type
  const resultsByType = {
    am: results.filter((r) => r.spot_type === "am"),
    pm: results.filter((r) => r.spot_type === "pm"),
    all_day: results.filter((r) => r.spot_type === "all_day"),
  };

  const currentUser = users.find((u) => u.id === selectedUser);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">{poll.title}</h1>
            {poll.description && (
              <p className="text-gray-900 mb-4">{poll.description}</p>
            )}
            <p className="text-sm text-gray-900">
              Closes: {new Date(poll.open_until).toLocaleString()}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleAuth} className="space-y-4">
              <h2 className="text-lg font-semibold">Verify Your Identity</h2>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Your Name
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose your name...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Enter Your 4-Digit PIN
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  pattern="[0-9]{4}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
                  placeholder="****"
                  required
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmitEntry} className="space-y-4">
              <h2 className="text-lg font-semibold">
                Choose Your Preferred Spot
              </h2>

              <div className="space-y-3">
                {availableSpots.map((spot) => (
                  <label
                    key={spot.value}
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="spotType"
                      value={spot.value}
                      checked={spotType === spot.value}
                      onChange={(e) => setSpotType(e.target.value as any)}
                      className="mr-3"
                      required
                    />
                    <span className="text-sm font-medium">{spot.label}</span>
                  </label>
                ))}
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Entry"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && success && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-green-600 mb-2">
                  Entry Submitted!
                </h2>
                <p className="text-gray-900">
                  Hi {currentUser?.name}! Your entry for the{" "}
                  <strong>{spotType?.replace("_", " ")} spot</strong> has been
                  recorded.
                </p>
              </div>

              {/* Countdown Timer */}
              <div
                className={`text-center p-4 rounded-lg ${
                  pollEnded
                    ? "bg-red-50 border border-red-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <h3
                  className={`font-semibold mb-2 ${
                    pollEnded ? "text-red-800" : "text-blue-800"
                  }`}
                >
                  {pollEnded ? "Poll Ended" : "Time Remaining"}
                </h3>
                <div
                  className={`text-2xl font-bold ${
                    pollEnded ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {timeRemaining}
                </div>
                {pollEnded && !resultsDrawn && (
                  <div className="text-red-700 text-sm mt-2">
                    {checkingResults ? (
                      <div className="flex items-center justify-center">
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
                        Checking for results...
                      </div>
                    ) : (
                      <div>
                        <div>Waiting for results to be drawn...</div>
                        {lastResultCheck && (
                          <div className="text-xs mt-1">
                            Last checked: {lastResultCheck.toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Live Participation Stats */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-gray-800">
                  Current Participation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {poll.am_spots > 0 && (
                    <div className="text-center bg-blue-100 rounded-lg p-3">
                      <div className="text-lg font-bold text-blue-700">
                        {entriesByType.am.length}
                      </div>
                      <div className="text-sm text-blue-600">AM Entries</div>
                      <div className="text-xs text-blue-500">
                        {poll.am_spots} spots available
                      </div>
                    </div>
                  )}

                  {poll.pm_spots > 0 && (
                    <div className="text-center bg-orange-100 rounded-lg p-3">
                      <div className="text-lg font-bold text-orange-700">
                        {entriesByType.pm.length}
                      </div>
                      <div className="text-sm text-orange-600">PM Entries</div>
                      <div className="text-xs text-orange-500">
                        {poll.pm_spots} spots available
                      </div>
                    </div>
                  )}

                  {poll.all_day_spots > 0 && (
                    <div className="text-center bg-purple-100 rounded-lg p-3">
                      <div className="text-lg font-bold text-purple-700">
                        {entriesByType.all_day.length}
                      </div>
                      <div className="text-sm text-purple-600">
                        All Day Entries
                      </div>
                      <div className="text-xs text-purple-500">
                        {poll.all_day_spots} spots available
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-center">
                  <div className="text-sm text-gray-900">
                    Total Participants: <strong>{entries.length}</strong>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              {resultsDrawn && results.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-green-800 flex items-center">
                    Results
                    <span className="ml-2 text-xs bg-green-200 px-2 py-1 rounded">
                      {results.length} winner{results.length !== 1 ? "s" : ""}
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {poll.am_spots > 0 && (
                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-medium text-blue-900 mb-2">
                          AM Winners ({resultsByType.am.length}/{poll.am_spots})
                        </h4>
                        {resultsByType.am.length > 0 ? (
                          <ul className="space-y-1">
                            {resultsByType.am.map((result, index) => (
                              <li
                                key={result.id}
                                className={`flex items-center text-sm ${
                                  result.users?.name === currentUser?.name
                                    ? "font-bold text-green-700 bg-green-100 px-2 py-1 rounded"
                                    : "text-gray-700"
                                }`}
                              >
                                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2">
                                  {index + 1}
                                </span>
                                {result.users?.name || "Unknown User"}
                                {result.users?.name === currentUser?.name && (
                                  <span className="ml-2">🎉</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-900 text-sm italic">
                            No winners
                          </p>
                        )}
                      </div>
                    )}

                    {poll.pm_spots > 0 && (
                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-medium text-orange-900 mb-2">
                          PM Winners ({resultsByType.pm.length}/{poll.pm_spots})
                        </h4>
                        {resultsByType.pm.length > 0 ? (
                          <ul className="space-y-1">
                            {resultsByType.pm.map((result, index) => (
                              <li
                                key={result.id}
                                className={`flex items-center text-sm ${
                                  result.users?.name === currentUser?.name
                                    ? "font-bold text-green-700 bg-green-100 px-2 py-1 rounded"
                                    : "text-gray-700"
                                }`}
                              >
                                <span className="bg-orange-100 text-orange-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2">
                                  {index + 1}
                                </span>
                                {result.users?.name || "Unknown User"}
                                {result.users?.name === currentUser?.name && (
                                  <span className="ml-2">🎉</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-900 text-sm italic">
                            No winners
                          </p>
                        )}
                      </div>
                    )}

                    {poll.all_day_spots > 0 && (
                      <div className="bg-white rounded-lg p-3">
                        <h4 className="font-medium text-purple-900 mb-2">
                          All Day Winners ({resultsByType.all_day.length}/
                          {poll.all_day_spots})
                        </h4>
                        {resultsByType.all_day.length > 0 ? (
                          <ul className="space-y-1">
                            {resultsByType.all_day.map((result, index) => (
                              <li
                                key={result.id}
                                className={`flex items-center text-sm ${
                                  result.users?.name === currentUser?.name
                                    ? "font-bold text-green-700 bg-green-100 px-2 py-1 rounded"
                                    : "text-gray-700"
                                }`}
                              >
                                <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2">
                                  {index + 1}
                                </span>
                                {result.users?.name || "Unknown User"}
                                {result.users?.name === currentUser?.name && (
                                  <span className="ml-2">🎉</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-900 text-sm italic">
                            No winners
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Check if current user won */}
                  {results.some((r) => r.users?.name === currentUser?.name) && (
                    <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center">
                      <p className="text-yellow-800 font-semibold">
                        Congratulations! You won a flex spot!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Information Message */}
              {!resultsDrawn && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Keep this page open to see live updates and results when
                    they're drawn!
                    {pollEnded && " The  will be drawn shortly."}
                  </p>
                </div>
              )}

              {/* Debug info for development */}
              {process.env.NODE_ENV === "development" && (
                <div className="bg-gray-100 p-3 rounded text-xs">
                  <details>
                    <summary className="cursor-pointer font-medium">
                      Debug Info
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {JSON.stringify(
                        {
                          pollId: poll.id,
                          pollEnded,
                          resultsDrawn,
                          resultsCount: results.length,
                          checkingResults,
                          pollResultsDrawnFromDB: poll.results_drawn,
                          lastResultCheck: lastResultCheck?.toISOString(),
                          timeRemaining,
                          stepNumber: step,
                        },
                        null,
                        2
                      )}
                    </pre>
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => fetchResults()}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                      >
                        Force Refresh Results
                      </button>
                      <button
                        onClick={manualRefresh}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                      >
                        Refresh All Data
                      </button>
                      <button
                        onClick={checkForResults}
                        className="px-2 py-1 bg-purple-600 text-white rounded text-xs"
                      >
                        Check for Results
                      </button>
                    </div>
                  </details>
                </div>
              )}

              {/* Enhanced Debug Component for Production Testing */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-yellow-900">Live Status</h4>
                  <button
                    onClick={manualRefresh}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm"
                  >
                    Refresh Status
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Frontend State:</div>
                    <div>Results Drawn: {resultsDrawn ? "Yes" : "No"}</div>
                    <div>Results Count: {results.length}</div>
                    <div>Poll Ended: {pollEnded ? "Yes" : "No"}</div>
                    <div>Checking: {checkingResults ? "Yes" : "No"}</div>
                  </div>
                  <div>
                    <div className="font-medium">Database State:</div>
                    <div>
                      DB Results Flag: {poll.results_drawn ? "True" : "False"}
                    </div>
                    <div>DB Active: {poll.is_active ? "True" : "False"}</div>
                    {lastResultCheck && (
                      <div>
                        Last Check: {lastResultCheck.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>

                {pollEnded && !resultsDrawn && (
                  <div className="mt-3 p-2 bg-orange-100 rounded text-center">
                    <div className="text-orange-800 font-medium">
                      Actively monitoring for results...
                    </div>
                    <div className="text-orange-600 text-xs mt-1">
                      Checking every 5 seconds • Real-time subscriptions active
                    </div>
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
