// useAutoDrawResults.ts - Fixed version with FCFS support
import { useEffect } from "react";
import { supabase } from "@/app/lib/supabase";

interface Poll {
  id: string;
  open_until: string;
  is_active: boolean;
  results_drawn: boolean;
  selection_type: "random" | "first_come_first_serve";
}

export const useAutoDrawResults = (polls: Poll[], onPollUpdate: () => void) => {
  useEffect(() => {
    const checkAndDrawExpiredPolls = async () => {
      const now = new Date();

      for (const poll of polls) {
        const endTime = new Date(poll.open_until);
        const hasEnded = endTime <= now;

        // If poll has ended but results haven't been drawn
        if (hasEnded && poll.is_active && !poll.results_drawn) {
          console.log(
            `Auto-processing ended ${poll.selection_type} poll: ${poll.id}`
          );

          try {
            if (poll.selection_type === "first_come_first_serve") {
              // For FCFS polls, results already exist - just mark as completed
              console.log("FCFS poll ended - marking as completed");

              const { error: updateError } = await supabase
                .from("polls")
                .update({
                  is_active: false,
                  results_drawn: true,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", poll.id);

              if (updateError) {
                console.error("Error updating FCFS poll status:", updateError);
              } else {
                console.log("FCFS poll marked as completed");
                onPollUpdate();
              }
            } else {
              // For random polls, call the draw function
              console.log("Random poll ended - drawing results");

              const { error: drawError } = await supabase.rpc(
                "draw_poll_results",
                {
                  poll_uuid: poll.id,
                }
              );

              if (drawError) {
                console.error("Error drawing results:", drawError);
              } else {
                console.log("Results drawn successfully");
                onPollUpdate();
              }
            }
          } catch (err) {
            console.error("Error processing ended poll:", err);
          }
        }
      }
    };

    checkAndDrawExpiredPolls();
    const interval = setInterval(checkAndDrawExpiredPolls, 30000);
    return () => clearInterval(interval);
  }, [polls, onPollUpdate]);
};

// Enhanced manual draw function that handles both poll types
export const manualDrawPollResults = async (
  pollId: string,
  selectionType: "random" | "first_come_first_serve"
) => {
  try {
    console.log(`Manually processing ${selectionType} poll:`, pollId);

    if (selectionType === "first_come_first_serve") {
      // For FCFS, just mark as completed since results already exist
      console.log("Marking FCFS poll as completed");

      const { error: updateError } = await supabase
        .from("polls")
        .update({
          is_active: false,
          results_drawn: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pollId);

      if (updateError) {
        console.error("Error updating FCFS poll:", updateError);
        throw updateError;
      }
    } else {
      // For random polls, call the draw function
      console.log("Drawing random poll results");

      const { error: drawError } = await supabase.rpc("draw_poll_results", {
        poll_uuid: pollId,
      });

      if (drawError) {
        console.error("Error drawing random poll results:", drawError);
        throw drawError;
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
        console.error("Error updating random poll:", updateError);
        throw updateError;
      }
    }

    console.log(`${selectionType} poll processed successfully`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to process ${selectionType} poll:`, error);
    throw error;
  }
};

// Utility function to check if a poll has existing results (for FCFS)
export const checkExistingResults = async (pollId: string) => {
  try {
    const { data, error } = await supabase
      .from("poll_results")
      .select("id")
      .eq("poll_id", pollId);

    if (error) {
      console.error("Error checking existing results:", error);
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch (error) {
    console.error("Error in checkExistingResults:", error);
    return false;
  }
};
