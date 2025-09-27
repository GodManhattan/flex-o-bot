// utils/pollHelpers.ts - Fixed to properly handle database function response
import { supabase } from "@/app/lib/supabase";

export interface PollEntryResponse {
  success: boolean;
  message: string;
  isWinner?: boolean;
  pollClosed?: boolean;
}

/**
 * Handle poll entry for both random and FCFS polls
 */
export const handlePollEntry = async (
  pollId: string,
  userId: string,
  spotType: "am" | "pm" | "all_day"
): Promise<PollEntryResponse> => {
  try {
    // First get poll details to determine type and check availability
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("*")
      .eq("id", pollId)
      .single();

    if (pollError || !poll) {
      throw new Error("Poll not found");
    }

    // CRITICAL: Check if results have been drawn (including force draw by manager)
    if (poll.results_drawn) {
      return {
        success: false,
        message: "Poll is closed - results have already been drawn",
      };
    }

    // Check if poll is still active
    if (!poll.is_active) {
      return {
        success: false,
        message: "Poll is no longer active",
      };
    }

    // Check if poll has expired
    const now = new Date();
    const endTime = new Date(poll.open_until);
    if (endTime <= now) {
      return {
        success: false,
        message: "Poll has expired",
      };
    }

    // Check if user already entered this poll
    const { data: existingEntry } = await supabase
      .from("poll_entries")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", userId)
      .single();

    if (existingEntry) {
      return {
        success: false,
        message: "You have already entered this poll",
      };
    }

    if (poll.selection_type === "first_come_first_serve") {
      return await handleFCFSEntry(poll, userId, spotType);
    } else {
      return await handleRandomEntry(poll, userId, spotType);
    }
  } catch (error) {
    console.error("Error in handlePollEntry:", error);
    return {
      success: false,
      message: "An error occurred while processing your entry",
    };
  }
};

/**
 * Handle FCFS poll entry with immediate spot allocation
 */
async function handleFCFSEntry(
  poll: any,
  userId: string,
  spotType: "am" | "pm" | "all_day"
): Promise<PollEntryResponse> {
  try {
    // Use database function to ensure atomicity
    const { data, error } = await supabase.rpc("handle_fcfs_entry_with_rules", {
      p_poll_id: poll.id,
      p_user_id: userId,
      p_spot_type: spotType,
      p_max_spots: getMaxSpotsForType(poll, spotType),
    });

    if (error) {
      console.error("FCFS entry error:", error);
      if (error.message?.includes("no spots available")) {
        return {
          success: false,
          message: "No spots remaining for this time slot",
        };
      }
      // Return the specific error message from the database function
      return {
        success: false,
        message: error.message || "Failed to secure spot",
      };
    }

    // FIX: The data from supabase.rpc() is directly the result, not wrapped in an array
    // The original code was trying to access data[0] which was undefined
    const result = data;

    console.log("Database function result:", result);

    if (!result || !result.success) {
      return {
        success: false,
        message: result?.message || "Failed to secure spot",
      };
    }

    // Check if all spots are now taken and close poll if needed
    if (result.poll_full) {
      await supabase
        .from("polls")
        .update({ is_active: false, results_drawn: true })
        .eq("id", poll.id);

      return {
        success: true,
        isWinner: true,
        message:
          "Congratulations! You got the spot. Poll is now closed as all spots are taken.",
        pollClosed: true,
      };
    }

    return {
      success: true,
      isWinner: true,
      message: "Congratulations! You secured a spot immediately.",
    };
  } catch (error) {
    console.error("Error in handleFCFSEntry:", error);
    return {
      success: false,
      message: "An error occurred while securing your spot",
    };
  }
}

/**
 * Handle random poll entry (no immediate results)
 */
async function handleRandomEntry(
  poll: any,
  userId: string,
  spotType: "am" | "pm" | "all_day"
): Promise<PollEntryResponse> {
  try {
    // Use the rule-checking database function
    const { data, error } = await supabase.rpc("handle_poll_entry_with_rules", {
      p_poll_id: poll.id,
      p_user_id: userId,
      p_spot_type: spotType,
    });

    if (error) {
      console.error("Random entry error:", error);
      return {
        success: false,
        message: error.message || "Failed to enter poll",
      };
    }

    const result = data;

    if (!result || !result.success) {
      return {
        success: false,
        message: result?.message || "Failed to enter poll",
      };
    }

    return {
      success: true,
      message:
        result.message ||
        "Entry submitted! Results will be announced when the poll closes.",
    };
  } catch (error) {
    console.error("Error in handleRandomEntry:", error);
    return {
      success: false,
      message: "An error occurred while submitting your entry",
    };
  }
}

/**
 * Get maximum spots for a given spot type
 */
function getMaxSpotsForType(
  poll: any,
  spotType: "am" | "pm" | "all_day"
): number {
  switch (spotType) {
    case "am":
      return poll.am_spots;
    case "pm":
      return poll.pm_spots;
    case "all_day":
      return poll.all_day_spots;
    default:
      return 0;
  }
}
