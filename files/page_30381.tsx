// app/manager/create-poll/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import { RouteGuard } from "@/app/components/RouteGuard";
import { Icons } from "@/app/components/icons/PollIcons";
import { SelectionTypeCard } from "@/app/components/poll/SelectionTypeCard";
import { SpotCounter } from "@/app/components/poll/SpotCounter";
import { DurationSelector } from "@/app/components/poll/DurationSelector";
import { PollPreviewCard } from "@/app/components/poll/PollPreviewCard";

function CreatePollContent() {
  const generateDefaultTitle = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return `${today.toLocaleDateString("en-US", options)} Flex`;
  };

  const [formData, setFormData] = useState({
    title: generateDefaultTitle(),
    description: "",
    am_spots: 0,
    pm_spots: 0,
    all_day_spots: 0,
    selection_type: "random" as "random" | "first_come_first_serve",
  });

  const [durationMinutes, setDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const totalSpots =
    formData.am_spots + formData.pm_spots + formData.all_day_spots;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title.trim()) {
      setError("Poll title is required");
      return;
    }

    if (totalSpots === 0) {
      setError("At least one spot must be available");
      return;
    }

    if (durationMinutes < 3) {
      setError("Poll duration must be at least 3 minutes");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + durationMinutes * 60000);
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
      if (data) router.push(`/manager/poll/${data.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20 lg:pb-8 ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50 ">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8 ">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <button
                onClick={() => router.push("/manager/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Create New Poll
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Set up a new flex spot poll
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <button
                onClick={() => router.push("/manager/users")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center transition-colors"
              >
                <Icons.Users className="w-4 h-4 mr-2" />
                Manage Users
              </button>
              <button
                onClick={() => router.push("/manager/dashboard")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium flex items-center transition-colors"
              >
                <Icons.Dashboard className="w-4 h-4 mr-2" />
                Dashboard
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icons.Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Action Menu */}
          {showMobileMenu && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 sm:hidden">
              <button
                onClick={() => router.push("/manager/dashboard")}
                className="w-full bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 font-medium flex items-center justify-center transition-colors"
              >
                <Icons.Dashboard className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => router.push("/manager/users")}
                className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center transition-colors"
              >
                <Icons.Users className="w-4 h-4 mr-2" />
                Manage Users
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 ">
        <form onSubmit={handleSubmit} className="space-y-6 border rounded-xl ">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <Icons.AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => setError("")}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Main Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Poll Configuration
              </h3>
              <p className="text-sm text-gray-600">
                Configure your flex spot poll settings
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-base flex items-center">
                  <Icons.Check className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h4>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Poll Title *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          title: generateDefaultTitle(),
                        }))
                      }
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Reset to Today's Date
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white"
                    placeholder="e.g., Monday January 15th, 2025 Flex"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default format: "Day Month Date, Year Flex" - you can
                    customize this
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white resize-none"
                    placeholder="Add any additional information about this poll..."
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional details about the poll or special instructions
                  </p>
                </div>
              </div>

              {/* Selection Type */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-base flex items-center">
                  <Icons.Dice className="w-5 h-5 mr-2 text-blue-600" />
                  Selection Method *
                </h4>
                <p className="text-sm text-gray-600">
                  Choose how spots will be assigned to employees
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <SelectionTypeCard
                    type="random"
                    selected={formData.selection_type === "random"}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        selection_type: "random",
                      }))
                    }
                  />
                  <SelectionTypeCard
                    type="first_come_first_serve"
                    selected={
                      formData.selection_type === "first_come_first_serve"
                    }
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        selection_type: "first_come_first_serve",
                      }))
                    }
                  />
                </div>
              </div>

              {/* Available Spots */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-base flex items-center">
                  <Icons.Users className="w-5 h-5 mr-2 text-blue-600" />
                  Available Spots
                </h4>
                <p className="text-sm text-gray-600">
                  Select how many spots are available for each time period
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <SpotCounter
                    label="Morning Spots"
                    icon={Icons.Sun}
                    value={formData.am_spots}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, am_spots: value }))
                    }
                    color="blue"
                    disabled={loading}
                  />
                  <SpotCounter
                    label="Afternoon Spots"
                    icon={Icons.Moon}
                    value={formData.pm_spots}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, pm_spots: value }))
                    }
                    color="orange"
                    disabled={loading}
                  />
                  <SpotCounter
                    label="Full Day Spots"
                    icon={Icons.Clock}
                    value={formData.all_day_spots}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, all_day_spots: value }))
                    }
                    color="purple"
                    disabled={loading}
                  />
                </div>

                {totalSpots > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm font-medium flex items-center">
                      <Icons.Check className="w-4 h-4 mr-2" />
                      Total of {totalSpots} spot{totalSpots !== 1 ? "s" : ""}{" "}
                      available
                    </p>
                  </div>
                )}
              </div>

              {/* Duration */}
              <DurationSelector
                durationMinutes={durationMinutes}
                onDurationChange={setDurationMinutes}
                disabled={loading}
                selectionType={formData.selection_type}
              />

              {/* Form Actions */}
              <div className="border-t pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading || totalSpots === 0}
                    className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                      formData.selection_type === "random"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-orange-600 hover:bg-orange-700 text-white"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Icons.Spinner className="w-4 h-4 mr-2" />
                        Creating Poll...
                      </>
                    ) : (
                      <>
                        <Icons.Plus className="w-4 h-4 mr-2" />
                        Create Poll
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/manager/dashboard")}
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center"
                  >
                    <Icons.X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {" "}
            {/* Poll Preview */}
            <PollPreviewCard
              title={formData.title}
              selectionType={formData.selection_type}
              totalSpots={totalSpots}
              durationMinutes={durationMinutes}
            />
            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center text-sm sm:text-base">
                <Icons.Info className="w-5 h-5 mr-2" />
                Poll Creation Tips
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-blue-800">
                <p className="flex items-start">
                  <Icons.Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span>
                    <strong>Poll Type:</strong> Choose Random for fairness, FCFS
                    for speed
                  </span>
                </p>
                <p className="flex items-start">
                  <Icons.Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span>
                    <strong>Title:</strong> Automatically uses today's date -
                    feel free to customize
                  </span>
                </p>
                <p className="flex items-start">
                  <Icons.Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span>
                    <strong>Spots:</strong> Set realistic numbers based on your
                    office capacity
                  </span>
                </p>
                <p className="flex items-start">
                  <Icons.Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span>
                    <strong>Duration:</strong> Longer durations give more
                    employees time to participate
                  </span>
                </p>
                {formData.selection_type === "first_come_first_serve" && (
                  <p className="flex items-start text-orange-700 font-medium">
                    <Icons.Lightning className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>FCFS:</strong> Poll will close automatically when
                      all spots are taken
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreatePollPage() {
  return (
    <RouteGuard requireAuth={true}>
      <CreatePollContent />
    </RouteGuard>
  );
}
