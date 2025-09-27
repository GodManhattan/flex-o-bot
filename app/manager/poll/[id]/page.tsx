"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Type Definitions
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
  updated_at: string;
  manager_id: string;
}

interface PollEntry {
  id: string;
  user_id: string;
  spot_type: "am" | "pm" | "all_day";
  users?: {
    name: string;
  };
}

interface PollResult {
  id: string;
  user_id: string;
  spot_type: "am" | "pm" | "all_day";
  users?: {
    name: string;
  };
}

interface PollStatus {
  status: "active" | "completed" | "unknown";
  label: string;
  className: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const CountdownTimer: React.FC<{ targetDate: Date; size?: string }> = ({
  targetDate,
  size,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining => {
      const now = new Date();
      const total = targetDate.getTime() - now.getTime();

      if (total <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      const seconds = Math.floor((total / 1000) % 60);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      const days = Math.floor(total / (1000 * 60 * 60 * 24));

      return { days, hours, minutes, seconds, total };
    };

    const initial = calculateTimeRemaining();
    setTimeRemaining(initial);

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const getDisplayText = () => {
    if (timeRemaining.total <= 0) {
      return { main: "Poll Closed", sub: "Time expired" };
    }

    const parts: string[] = [];
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}d`);
    if (timeRemaining.hours > 0 || timeRemaining.days > 0)
      parts.push(`${timeRemaining.hours}h`);
    if (
      timeRemaining.minutes > 0 ||
      timeRemaining.hours > 0 ||
      timeRemaining.days > 0
    )
      parts.push(`${timeRemaining.minutes}m`);
    parts.push(`${timeRemaining.seconds}s`);

    return { main: parts.join(" "), sub: "remaining" };
  };

  const display = getDisplayText();

  return (
    <div className="text-center">
      <div
        className={`text-2xl font-bold ${
          timeRemaining.total <= 0 ? "text-red-600" : "text-blue-600"
        }`}
      >
        {display.main}
      </div>
      <div className="text-sm text-gray-600">{display.sub}</div>
    </div>
  );
};

// Professional Vector Icons (keeping existing icons)
const Icons = {
  ArrowLeft: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
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
  ),
  Menu: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
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
  ),
  Lightning: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  Dice: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={2} />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  Clock: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6l4 2"
      />
    </svg>
  ),
  Trophy: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 21h8M12 3v18M7 8V6a1 1 0 011-1h8a1 1 0 011 1v2M7 8l-2 9h14l-2-9H7z"
      />
    </svg>
  ),
  Sun: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" strokeWidth={2} />
      <path
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        strokeWidth={2}
      />
    </svg>
  ),
  Moon: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
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
  ),
  Calendar: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
      <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
      <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
      <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
    </svg>
  ),
  Share: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  ),
  Copy: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth={2} />
      <path
        d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
        strokeWidth={2}
      />
    </svg>
  ),
  Users: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  Dashboard: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={2} />
    </svg>
  ),
  Warning: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  Spinner: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={`${className} animate-spin`}
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
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  ),
  Stop: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <line x1="15" y1="9" x2="9" y2="15" strokeWidth={2} />
      <line x1="9" y1="9" x2="15" y2="15" strokeWidth={2} />
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Plus: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19" strokeWidth={2} />
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth={2} />
    </svg>
  ),
  Refresh: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
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
  ),
  Download: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  ),
};

// Components (keeping existing but adding types properly)
const StatusBadge: React.FC<{
  status: string;
  label: string;
  className: string;
  isProcessing?: boolean;
}> = ({ status, label, className, isProcessing = false }) => (
  <div
    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}
  >
    {isProcessing && <Icons.Spinner className="w-4 h-4 mr-2" />}
    {status === "completed" && <Icons.CheckCircle className="w-4 h-4 mr-2" />}
    {status === "expired" && <Icons.Clock className="w-4 h-4 mr-2" />}
    {status === "active" && (
      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
    )}
    {label}
  </div>
);

const PollTypeBadge: React.FC<{
  selectionType: "random" | "first_come_first_serve";
}> = ({ selectionType }) => {
  const isRandom = selectionType === "random";
  return (
    <div
      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border-2 ${
        isRandom
          ? "bg-purple-50 text-purple-800 border-purple-200"
          : "bg-orange-50 text-orange-800 border-orange-200"
      }`}
    >
      {isRandom ? (
        <Icons.Dice className="w-5 h-5 mr-2" />
      ) : (
        <Icons.Lightning className="w-5 h-5 mr-2" />
      )}
      {isRandom ? "Random Selection" : "First Come, First Serve"}
    </div>
  );
};

// Main Poll Details Page Component
export default function PollDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [entries, setEntries] = useState<PollEntry[]>([]);
  const [results, setResults] = useState<PollResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForceEndConfirm, setShowForceEndConfirm] = useState(false);

  // Fetch poll data from Supabase
  const fetchPollData = useCallback(async () => {
    if (!params.id) return;

    try {
      setLoading(true);
      setError(null);

      // Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/manager/login");
        return;
      }

      // Fetch poll, entries, and results in parallel
      const [pollRes, entriesRes, resultsRes] = await Promise.all([
        supabase
          .from("polls")
          .select("*")
          .eq("id", params.id)
          .eq("manager_id", user.id)
          .single(),
        supabase
          .from("poll_entries")
          .select("*, users(name)")
          .eq("poll_id", params.id),
        supabase
          .from("poll_results")
          .select("*, users(name)")
          .eq("poll_id", params.id),
      ]);

      if (pollRes.error) {
        if (pollRes.error.code === "PGRST116") {
          setError("Poll not found or you don't have permission to view it.");
        } else {
          setError(pollRes.error.message);
        }
        return;
      }

      setPoll(pollRes.data);
      setEntries(entriesRes.data || []);
      setResults(resultsRes.data || []);
    } catch (err: any) {
      console.error("Error fetching poll data:", err);
      setError(err.message || "Failed to load poll data");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  // Real-time subscriptions
  useEffect(() => {
    if (!params.id) return;

    fetchPollData();

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
        () => fetchPollData()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poll_entries",
          filter: `poll_id=eq.${params.id}`,
        },
        () => fetchPollData()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poll_results",
          filter: `poll_id=eq.${params.id}`,
        },
        () => fetchPollData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [params.id, fetchPollData]);

  // Draw results function
  const handleDrawResults = async () => {
    if (!poll) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: drawError } = await supabase.rpc(
        "draw_poll_results_with_rules",
        {
          poll_uuid: poll.id,
        }
      );

      if (drawError) throw drawError;

      await fetchPollData();
    } catch (err: any) {
      setError(err.message || "Failed to draw results");
    } finally {
      setProcessing(false);
    }
  };

  // Force end poll function
  const handleForceEnd = async () => {
    if (!poll) return;

    setProcessing(true);
    setError(null);

    try {
      if (poll.selection_type === "first_come_first_serve") {
        // For FCFS polls, just mark as completed
        const { error: updateError } = await supabase
          .from("polls")
          .update({
            is_active: false,
            results_drawn: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", poll.id);

        if (updateError) throw updateError;
      } else {
        // For random polls, use the working draw function
        const { error: drawError } = await supabase.rpc("draw_poll_results", {
          poll_uuid: poll.id,
        });

        if (drawError) throw drawError;
      }

      await fetchPollData();
    } catch (err: any) {
      setError(err.message || "Failed to force end poll");
    } finally {
      setProcessing(false);
    }
  };

  const getPollStatus = (poll: Poll) => {
    const now = new Date();
    const endTime = new Date(poll.open_until);
    const hasEnded = endTime <= now;

    // If poll has ended (by time or results drawn), it's completed
    if (hasEnded || poll.results_drawn || !poll.is_active) {
      return {
        status: "completed",
        label: "Completed",
        className: "bg-gray-100 text-gray-800",
        description: poll.results_drawn
          ? poll.selection_type === "first_come_first_serve"
            ? "All spots filled"
            : "Results drawn"
          : "Poll has ended",
      };
    }

    // Otherwise poll is active
    return {
      status: "active",
      label: "Active",
      className: "bg-green-100 text-green-800",
      description:
        poll.selection_type === "first_come_first_serve"
          ? "Accepting entries (instant results)"
          : "Accepting entries",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icons.Spinner className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading poll details...</p>
        </div>
      </div>
    );
  }

  if (!poll || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md w-full">
          <Icons.Warning className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-4 text-red-800">
            {error || "Poll Not Found"}
          </h1>
          <p className="text-red-600 mb-6 text-sm">
            {error ||
              "This poll may have been deleted or you don't have permission to view it."}
          </p>
          <button
            onClick={() => router.push("/manager/dashboard")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <Icons.Dashboard className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const pollStatus = getPollStatus(poll);
  const shareUrl = `${window.location.origin}/poll/${poll.share_link}`;
  const pollEndTime = new Date(poll.open_until);
  const isPollActive = pollStatus.status === "active";
  const isPollCompleted = pollStatus.status === "completed";
  const canForceEnd =
    poll &&
    poll.is_active &&
    !poll.results_drawn &&
    new Date(poll.open_until) > new Date();
  const needsResultsDraw =
    isPollCompleted && !poll.results_drawn && poll.selection_type === "random";
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <Icons.ArrowLeft />
            </button>
            <div className="flex items-center space-x-3">
              <StatusBadge
                status={pollStatus.status}
                label={pollStatus.label}
                className={pollStatus.className}
                isProcessing={processing}
              />
              <PollTypeBadge selectionType={poll.selection_type} />

              {/* Force End Button for Active Polls */}
              {canForceEnd && (
                <button
                  onClick={() => setShowForceEndConfirm(true)}
                  disabled={processing}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center text-sm"
                >
                  <Icons.Stop className="w-4 h-4 mr-2" />
                  Force End Poll
                </button>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {poll.title}
          </h1>
          {poll.description && (
            <p className="text-gray-600">{poll.description}</p>
          )}
        </div>

        {/* Force End Confirmation Modal */}
        {showForceEndConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex border items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Force End Poll Confirmation
              </h3>
              <div className="mb-6 space-y-3">
                <p className="text-gray-700">
                  This will immediately close the poll and draw results based on
                  current entries.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Employees will no longer be able to enter</li>
                  <li>
                    Results will be drawn from current {entries.length} entries
                  </li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    setShowForceEndConfirm(false);
                    await handleForceEnd();
                  }}
                  disabled={processing}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center justify-center"
                >
                  {processing ? (
                    <Icons.Spinner className="w-4 h-4 mr-2" />
                  ) : (
                    <Icons.Stop className="w-4 h-4 mr-2" />
                  )}
                  Yes, Force End
                </button>
                <button
                  onClick={() => setShowForceEndConfirm(false)}
                  disabled={processing}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-6">
          {/* Timer */}
          {isPollActive && (
            <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
              <CountdownTimer targetDate={pollEndTime} />
            </div>
          )}
          {/* Share Link */}
          <div className="bg-blue-50 border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Icons.Share className="w-5 h-5 mr-2" />
              Share with Employees
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(shareUrl);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
              >
                <Icons.Copy className="w-4 h-4 mr-2" />
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 ">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-sm text-gray-600 mb-2">Total Entries</h3>
            <p className="text-3xl font-bold text-blue-600">{entries.length}</p>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-sm text-gray-600 mb-2">Winners Selected</h3>
            <p className="text-3xl font-bold text-green-600">
              {results.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-sm text-gray-600 mb-2">Available Spots</h3>
            <p className="text-3xl font-bold text-purple-600">
              {poll.am_spots + poll.pm_spots + poll.all_day_spots}
            </p>
          </div>
        </div>

        {/* Entries */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Icons.Users className="w-5 h-5 mr-2" />
            Entries ({entries.length})
          </h3>
          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No entries yet</p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">
                    {entry.users?.name || "Unknown"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {entry.spot_type === "am"
                      ? "Morning"
                      : entry.spot_type === "pm"
                      ? "Afternoon"
                      : "Full Day"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {poll.results_drawn && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Icons.Trophy className="w-5 h-5 mr-2" />
              Results ({results.length})
            </h3>
            {results.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No winners</p>
            ) : (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Icons.Trophy className="w-5 h-5 text-yellow-500 mr-3" />
                      <span className="font-medium text-green-800">
                        {result.users?.name || "Unknown"}
                      </span>
                    </div>
                    <span className="text-sm text-green-600">
                      {result.spot_type === "am"
                        ? "Morning"
                        : result.spot_type === "pm"
                        ? "Afternoon"
                        : "Full Day"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <Link
            href="/manager/dashboard"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 inline-flex items-center"
          >
            <Icons.Dashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
          <Link
            href="/manager/create-poll"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Create New Poll
          </Link>
        </div>
      </div>
    </div>
  );
}
