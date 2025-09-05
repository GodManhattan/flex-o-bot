// useAutoDrawResults.ts - Fixed version
import { useEffect } from "react";
import { supabase } from "@/app/lib/supabase";

interface Poll {
  id: string;
  open_until: string;
  is_active: boolean;
  results_drawn: boolean;
}

export const useAutoDrawResults = (polls: Poll[], onPollUpdate: () => void) => {
  useEffect(() => {
    const checkAndDrawExpiredPolls = async () => {
      const now = new Date();

      for (const poll of polls) {
        const endTime = new Date(poll.open_until);
        const hasExpired = endTime <= now;

        // If poll has expired but results haven't been drawn
        if (hasExpired && poll.is_active && !poll.results_drawn) {
          console.log(`Auto-drawing results for expired poll: ${poll.id}`);

          try {
            // Call the draw function
            const { error } = await supabase.rpc("draw_poll_results", {
              poll_uuid: poll.id,
            });

            if (error) {
              console.error("Error auto-drawing results:", error);
            } else {
              console.log("Results auto-drawn successfully for poll:", poll.id);

              // Update the poll to mark as inactive and results drawn
              const { error: updateError } = await supabase
                .from("polls")
                .update({
                  is_active: false,
                  results_drawn: true,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", poll.id);

              if (updateError) {
                console.error("Error updating poll status:", updateError);
              }

              // Trigger refresh
              onPollUpdate();
            }
          } catch (err) {
            console.error("Unexpected error in auto-draw:", err);
          }
        }
      }
    };

    // Check immediately
    checkAndDrawExpiredPolls();

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkAndDrawExpiredPolls, 30000);

    return () => clearInterval(interval);
  }, [polls, onPollUpdate]);
};

// Alternative: Manual draw function for testing
export const manualDrawPollResults = async (pollId: string) => {
  try {
    console.log("Manually drawing results for poll:", pollId);

    const { error } = await supabase.rpc("draw_poll_results", {
      poll_uuid: pollId,
    });

    if (error) {
      console.error("Error drawing results:", error);
      throw error;
    }

    // Update poll status
    const { error: updateError } = await supabase
      .from("polls")
      .update({
        is_active: false,
        results_drawn: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pollId);

    if (updateError) {
      console.error("Error updating poll:", updateError);
      throw updateError;
    }

    console.log("Results drawn and poll updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Failed to draw results:", error);
    throw error;
  }
};
