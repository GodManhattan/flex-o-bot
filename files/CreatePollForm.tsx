// components/CreatePollForm.tsx - Enhanced form with prominent selection type
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

interface CreatePollFormProps {
  onSuccess?: () => void;
}

export const CreatePollForm: React.FC<CreatePollFormProps> = ({
  onSuccess,
}) => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: generateDefaultTitle(),
    description: "",
    am_spots: 2,
    pm_spots: 2,
    all_day_spots: 1,
    selection_type: "random" as "random" | "first_come_first_serve",
  });

  const [durationMinutes, setDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function generateDefaultTitle() {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = today.toLocaleDateString("en-US", options);
    return `${formattedDate} Flex`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      // Validation
      const totalSpots =
        formData.am_spots + formData.pm_spots + formData.all_day_spots;
      if (totalSpots === 0) {
        setError("At least one spot must be available");
        setLoading(false);
        return;
      }

      // Calculate end time
      const now = new Date();
      const endTime = new Date(now.getTime() + durationMinutes * 60000);

      // Generate unique share link
      const shareLink = `poll_${Math.random().toString(36).substr(2, 8)}`;

      const { data, error: insertError } = await supabase
        .from("polls")
        .insert([
          {
            ...formData,
            title: formData.title.trim(),
            description: formData.description.trim(),
            open_until: endTime.toISOString(),
            manager_id: user.id,
            share_link: shareLink,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        onSuccess?.();
        router.push(`/manager/poll/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (
      name === "am_spots" ||
      name === "pm_spots" ||
      name === "all_day_spots"
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const totalSpots =
    formData.am_spots + formData.pm_spots + formData.all_day_spots;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Create New Poll
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poll Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Add any additional information..."
            />
          </div>
        </div>

        {/* PROMINENT SELECTION TYPE SECTION */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-3 text-2xl">⚡</span>
            Choose Poll Type *
          </h4>
          <p className="text-gray-700 mb-6">
            Select how you want to assign the flex spots to your employees:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Random Selection Option */}
            <label
              className={`
              relative flex cursor-pointer rounded-xl border-2 p-6 focus:outline-none transition-all duration-200
              ${
                formData.selection_type === "random"
                  ? "border-purple-500 bg-purple-50 shadow-lg transform scale-105"
                  : "border-gray-300 bg-white hover:bg-gray-50 hover:border-purple-300"
              }
            `}
            >
              <input
                type="radio"
                name="selection_type"
                value="random"
                checked={formData.selection_type === "random"}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="flex flex-col w-full">
                <div className="flex items-center mb-3">
                  <div
                    className={`
                    w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center
                    ${
                      formData.selection_type === "random"
                        ? "border-purple-500 bg-purple-500"
                        : "border-gray-300"
                    }
                  `}
                  >
                    {formData.selection_type === "random" && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-xl font-bold text-purple-700">
                    🎲 Random Selection
                  </span>
                </div>
                <div className="ml-10">
                  <p className="text-gray-700 mb-3 font-medium">
                    <strong>Fair & Traditional:</strong> Everyone gets equal
                    chances
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Employees enter until deadline</li>
                    <li>• Winners randomly chosen when poll closes</li>
                    <li>• Results revealed to everyone simultaneously</li>
                    <li>• Perfect for high-demand spots</li>
                    <li>• Ensures complete fairness</li>
                  </ul>
                  <div className="mt-3 p-2 bg-purple-100 rounded text-xs text-purple-800">
                    <strong>Best for:</strong> Popular flex days, limited spots,
                    ensuring fairness
                  </div>
                </div>
              </div>
            </label>

            {/* First Come First Serve Option */}
            <label
              className={`
              relative flex cursor-pointer rounded-xl border-2 p-6 focus:outline-none transition-all duration-200
              ${
                formData.selection_type === "first_come_first_serve"
                  ? "border-orange-500 bg-orange-50 shadow-lg transform scale-105"
                  : "border-gray-300 bg-white hover:bg-gray-50 hover:border-orange-300"
              }
            `}
            >
              <input
                type="radio"
                name="selection_type"
                value="first_come_first_serve"
                checked={formData.selection_type === "first_come_first_serve"}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="flex flex-col w-full">
                <div className="flex items-center mb-3">
                  <div
                    className={`
                    w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center
                    ${
                      formData.selection_type === "first_come_first_serve"
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-300"
                    }
                  `}
                  >
                    {formData.selection_type === "first_come_first_serve" && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-xl font-bold text-orange-700">
                    ⚡ First Come, First Serve
                  </span>
                </div>
                <div className="ml-10">
                  <p className="text-gray-700 mb-3 font-medium">
                    <strong>Fast & Immediate:</strong> Instant spot confirmation
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Spots awarded immediately upon entry</li>
                    <li>• No waiting for results</li>
                    <li>• Poll closes when spots are full</li>
                    <li>• Quick and decisive</li>
                    <li>• Rewards early action</li>
                  </ul>
                  <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-800">
                    <strong>Best for:</strong> Urgent planning, small teams,
                    quick decisions
                  </div>
                </div>
              </div>
            </label>
          </div>

          {/* Dynamic explanation based on selection */}
          <div
            className={`
            mt-6 p-4 rounded-lg border-2
            ${
              formData.selection_type === "random"
                ? "bg-purple-50 border-purple-200"
                : "bg-orange-50 border-orange-200"
            }
          `}
          >
            <h5
              className={`
              font-bold mb-2 flex items-center
              ${
                formData.selection_type === "random"
                  ? "text-purple-900"
                  : "text-orange-900"
              }
            `}
            >
              <span className="mr-2">
                {formData.selection_type === "random" ? "🎯" : "🚀"}
              </span>
              How{" "}
              {formData.selection_type === "random"
                ? "Random Selection"
                : "First Come, First Serve"}{" "}
              Works:
            </h5>
            <div
              className={`
              text-sm space-y-2
              ${
                formData.selection_type === "random"
                  ? "text-purple-800"
                  : "text-orange-800"
              }
            `}
            >
              {formData.selection_type === "random" ? (
                <div className="space-y-1">
                  <p>
                    <strong>1.</strong> You create the poll with available spots
                  </p>
                  <p>
                    <strong>2.</strong> Employees enter during the open period
                  </p>
                  <p>
                    <strong>3.</strong> When time expires, winners are randomly
                    selected
                  </p>
                  <p>
                    <strong>4.</strong> All participants are notified of results
                  </p>
                  <p className="text-purple-700 font-medium mt-2">
                    ⭐ <em>Everyone has exactly the same chance of winning!</em>
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p>
                    <strong>1.</strong> You create the poll with available spots
                  </p>
                  <p>
                    <strong>2.</strong> First employee to enter gets first spot
                  </p>
                  <p>
                    <strong>3.</strong> Spots are filled in real-time
                  </p>
                  <p>
                    <strong>4.</strong> Poll automatically closes when full
                  </p>
                  <p className="text-orange-700 font-medium mt-2">
                    ⭐ <em>Speed matters - early birds get the spots!</em>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spot Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Available Spots</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Morning Spots
              </label>
              <select
                name="am_spots"
                value={formData.am_spots}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                {[...Array(21)].map((_, i) => (
                  <option key={i} value={i}>
                    {i} spot{i !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <label className="block text-sm font-medium text-orange-900 mb-2">
                Afternoon Spots
              </label>
              <select
                name="pm_spots"
                value={formData.pm_spots}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
              >
                {[...Array(21)].map((_, i) => (
                  <option key={i} value={i}>
                    {i} spot{i !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <label className="block text-sm font-medium text-purple-900 mb-2">
                Full Day Spots
              </label>
              <select
                name="all_day_spots"
                value={formData.all_day_spots}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              >
                {[...Array(21)].map((_, i) => (
                  <option key={i} value={i}>
                    {i} spot{i !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {totalSpots > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm font-medium">
                ✅ Total of {totalSpots} spot{totalSpots !== 1 ? "s" : ""}{" "}
                available
              </p>
            </div>
          )}
        </div>

        {/* Duration Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            {formData.selection_type === "first_come_first_serve"
              ? "Maximum Duration"
              : "Poll Duration"}
          </h4>
          <p className="text-sm text-gray-600">
            {formData.selection_type === "first_come_first_serve"
              ? "Poll will close early if all spots are taken, or at this time limit."
              : "How long employees have to enter the poll before winners are selected."}
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[15, 30, 60, 120, 180, 240].map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => setDurationMinutes(minutes)}
                className={`
                  px-3 py-2 text-xs font-medium rounded-lg border transition-colors
                  ${
                    durationMinutes === minutes
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }
                `}
              >
                {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
              </button>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Poll will close at:</strong>{" "}
              {new Date(Date.now() + durationMinutes * 60000).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">👀</span>
            Poll Preview
          </h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Title:</strong> {formData.title}
            </p>
            <p>
              <strong>Type:</strong>{" "}
              {formData.selection_type === "random"
                ? "🎲 Random Selection"
                : "⚡ First Come, First Serve"}
            </p>
            <p>
              <strong>Total Spots:</strong> {totalSpots}
            </p>
            <p>
              <strong>Duration:</strong>{" "}
              {durationMinutes < 60
                ? `${durationMinutes} minutes`
                : `${durationMinutes / 60} hour${
                    durationMinutes > 60 ? "s" : ""
                  }`}
            </p>
            {formData.selection_type === "first_come_first_serve" && (
              <p className="text-orange-600 font-medium">
                ⚡ Spots will be awarded immediately as employees enter!
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="border-t pt-6">
          <button
            type="submit"
            disabled={loading || totalSpots === 0}
            className={`
              w-full py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${
                formData.selection_type === "random"
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-orange-600 hover:bg-orange-700 text-white"
              }
            `}
          >
            {loading ? (
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
                Creating Poll...
              </span>
            ) : (
              `Create ${
                formData.selection_type === "random"
                  ? "🎲 Random Selection"
                  : "⚡ First Come, First Serve"
              } Poll`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Enhanced poll participation logic for first-come-first-serve
export const handlePollEntry = async (
  pollId: string,
  userId: string,
  spotType: "am" | "pm" | "all_day",
  selectionType: "random" | "first_come_first_serve"
) => {
  if (selectionType === "first_come_first_serve") {
    // For FCFS, we need to check if spots are still available and assign immediately
    const { data: poll } = await supabase
      .from("polls")
      .select("*")
      .eq("id", pollId)
      .single();

    if (!poll) throw new Error("Poll not found");

    // Check current spot count
    const { count } = await supabase
      .from("poll_entries")
      .select("*", { count: "exact", head: true })
      .eq("poll_id", pollId)
      .eq("spot_type", spotType);

    const maxSpots =
      spotType === "am"
        ? poll.am_spots
        : spotType === "pm"
        ? poll.pm_spots
        : poll.all_day_spots;

    if ((count || 0) >= maxSpots) {
      throw new Error("No spots remaining for this time slot");
    }

    // Insert entry and immediately create result
    const { error: entryError } = await supabase
      .from("poll_entries")
      .insert([{ poll_id: pollId, user_id: userId, spot_type: spotType }]);

    if (entryError) throw entryError;

    const { error: resultError } = await supabase
      .from("poll_results")
      .insert([{ poll_id: pollId, user_id: userId, spot_type: spotType }]);

    if (resultError) throw resultError;

    // Check if all spots are now taken
    const { count: totalEntries } = await supabase
      .from("poll_entries")
      .select("*", { count: "exact", head: true })
      .eq("poll_id", pollId);

    const totalSpots = poll.am_spots + poll.pm_spots + poll.all_day_spots;

    if ((totalEntries || 0) >= totalSpots) {
      // All spots taken, close the poll
      await supabase
        .from("polls")
        .update({ is_active: false, results_drawn: true })
        .eq("id", pollId);
    }

    return { success: true, immediate: true };
  } else {
    // Regular random selection - just add entry
    const { error } = await supabase
      .from("poll_entries")
      .insert([{ poll_id: pollId, user_id: userId, spot_type: spotType }]);

    if (error) throw error;

    return { success: true, immediate: false };
  }
};
