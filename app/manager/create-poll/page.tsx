"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import { RouteGuard } from "@/app/components/RouteGuard";

function CreatePollContent() {
  // Generate default title based on current date
  const generateDefaultTitle = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = today.toLocaleDateString("en-US", options);
    return `${formattedDate} Flex`;
  };

  const [formData, setFormData] = useState({
    title: generateDefaultTitle(),
    description: "",
    am_spots: 2,
    pm_spots: 2,
    all_day_spots: 1,
  });
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Spot count options (0-20)
  const spotOptions = Array.from({ length: 21 }, (_, i) => i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.title.trim()) {
      setError("Poll title is required");
      return;
    }

    const totalSpots =
      parseInt(String(formData.am_spots), 10) +
      parseInt(String(formData.pm_spots), 10) +
      parseInt(String(formData.all_day_spots), 10);

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
      // Calculate end time based on duration
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
    const { name, value } = e.target;

    console.log(`Input change: ${name} = "${value}" (type: ${typeof value})`);

    // Handle spot count fields (convert to number)
    if (
      name === "am_spots" ||
      name === "pm_spots" ||
      name === "all_day_spots"
    ) {
      const numValue = parseInt(value, 10);
      console.log(`Converting ${name}: "${value}" -> ${numValue}`);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      // Handle text fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Calculate end time for display
  const calculateEndTime = () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + durationMinutes * 60000);
    return endTime.toLocaleString();
  };

  // Format duration display
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hour${hours > 1 ? "s" : ""}`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    }
  };

  // Reset to default title
  const resetToDefaultTitle = () => {
    setFormData((prev) => ({
      ...prev,
      title: generateDefaultTitle(),
    }));
  };

  // Ensure we're working with numbers for the total calculation
  const totalSpots =
    parseInt(String(formData.am_spots), 10) +
    parseInt(String(formData.pm_spots), 10) +
    parseInt(String(formData.all_day_spots), 10);

  console.log("Total calculation:", {
    am_spots: formData.am_spots,
    pm_spots: formData.pm_spots,
    all_day_spots: formData.all_day_spots,
    total: totalSpots,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <button
                onClick={() => router.push("/manager/dashboard")}
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
                <h1 className="text-lg font-semibold text-gray-900">
                  Create New Poll
                </h1>
                <p className="text-sm text-gray-600">
                  Set up a new flex spot poll
                </p>
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
              <button
                onClick={() => router.push("/manager/dashboard")}
                className="w-full bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 font-medium flex items-center justify-center"
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
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                </svg>
                Back to Dashboard
              </button>
              <button
                onClick={() => router.push("/manager/users")}
                className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                Manage Users
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Desktop Header */}
        <div className="hidden sm:block">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Poll
              </h2>
              <p className="text-gray-600">
                Set up flexible work spot allocation
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push("/manager/users")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center"
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                Manage Users
              </button>
              <button
                onClick={() => router.push("/manager/dashboard")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium flex items-center"
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
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                </svg>
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Poll Summary Card */}
        {(formData.title || totalSpots > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center">
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
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
              Poll Preview
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>Title:</strong> {formData.title || "Untitled Poll"}
              </p>
              <p>
                <strong>Total Spots:</strong> {totalSpots}
              </p>
              <p>
                <strong>Duration:</strong> {formatDuration(durationMinutes)}
              </p>
              <p>
                <strong>Closes at:</strong> {calculateEndTime()}
              </p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Poll Configuration
            </h3>
            <p className="text-sm text-gray-600">
              Configure your flex spot poll settings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 text-base">
                Basic Information
              </h4>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Poll Title *
                  </label>
                  <button
                    type="button"
                    onClick={resetToDefaultTitle}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Reset to Today's Date
                  </button>
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white resize-none"
                  placeholder="Add any additional information about this poll..."
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional details about the poll or special instructions
                </p>
              </div>
            </div>

            {/* Spot Configuration */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 text-base">
                Available Spots
              </h4>
              <p className="text-sm text-gray-600">
                Select how many spots are available for each time period
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <label className="block text-sm font-medium text-blue-900 mb-3">
                    <svg
                      className="w-4 h-4 inline mr-1"
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
                    Morning Spots
                  </label>
                  <select
                    name="am_spots"
                    value={formData.am_spots}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    disabled={loading}
                  >
                    {spotOptions.map((num) => (
                      <option key={num} value={num}>
                        {num} spot{num !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-700 mt-2">
                    AM shift availability
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <label className="block text-sm font-medium text-orange-900 mb-3">
                    <svg
                      className="w-4 h-4 inline mr-1"
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
                    Afternoon Spots
                  </label>
                  <select
                    name="pm_spots"
                    value={formData.pm_spots}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                    disabled={loading}
                  >
                    {spotOptions.map((num) => (
                      <option key={num} value={num}>
                        {num} spot{num !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-orange-700 mt-2">
                    PM shift availability
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <label className="block text-sm font-medium text-purple-900 mb-3">
                    <svg
                      className="w-4 h-4 inline mr-1"
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
                    Full Day Spots
                  </label>
                  <select
                    name="all_day_spots"
                    value={formData.all_day_spots}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                    disabled={loading}
                  >
                    {spotOptions.map((num) => (
                      <option key={num} value={num}>
                        {num} spot{num !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-purple-700 mt-2">
                    All-day availability
                  </p>
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
              <h4 className="font-medium text-gray-900 text-base">
                Poll Duration
              </h4>
              <p className="text-sm text-gray-600">
                How long should employees have to enter this poll?
              </p>

              {/* Duration Display */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center border">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatDuration(durationMinutes)}
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Poll will close at:</strong>
                  </p>
                  <p className="text-gray-900 font-medium">
                    {calculateEndTime()}
                  </p>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="range"
                    min="3"
                    max="240"
                    step="1"
                    value={durationMinutes}
                    onChange={(e) =>
                      setDurationMinutes(parseInt(e.target.value))
                    }
                    disabled={loading}
                    className="w-full h-3 bg-blue-100 rounded-lg appearance-none cursor-pointer slider border border-blue-300"
                  />
                </div>

                {/* Quick Duration Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[15, 30, 60, 120, 180, 240].map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setDurationMinutes(minutes)}
                      disabled={loading}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        durationMinutes === minutes
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {formatDuration(minutes)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading || totalSpots === 0}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                >
                  {loading ? (
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
                      Creating Poll...
                    </>
                  ) : (
                    <>
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Tips Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
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
            💡 Poll Creation Tips
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              • The poll title automatically uses today's date - feel free to
              customize it
            </p>
            <p>
              • Use dropdown menus to quickly select the number of spots (0-20)
            </p>
            <p>• Set realistic spot numbers based on your office capacity</p>
            <p>
              • Longer poll durations give employees more time to participate
            </p>
            <p>• Consider your team's time zones when setting poll duration</p>
            <p>• You can manually draw results early if needed</p>
          </div>
        </div>

        {/* Development Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-100 rounded-lg p-4">
            <details>
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                🔧 Debug Info (Development)
              </summary>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Form Data: {JSON.stringify(formData, null, 2)}</div>
                <div>
                  AM Spots (type): {typeof formData.am_spots} ={" "}
                  {formData.am_spots}
                </div>
                <div>
                  PM Spots (type): {typeof formData.pm_spots} ={" "}
                  {formData.pm_spots}
                </div>
                <div>
                  All Day Spots (type): {typeof formData.all_day_spots} ={" "}
                  {formData.all_day_spots}
                </div>
                <div>
                  Total Calculation: {formData.am_spots} + {formData.pm_spots} +{" "}
                  {formData.all_day_spots} = {totalSpots}
                </div>
                <div>Duration Minutes: {durationMinutes}</div>
                <div>Loading: {loading ? "Yes" : "No"}</div>
                <div>Error: {error || "None"}</div>
                <div>End Time: {calculateEndTime()}</div>
                <div>User ID: {user?.id || "Not loaded"}</div>
                <div>Default Title: {generateDefaultTitle()}</div>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Bottom spacing for mobile */}
      <div className="h-8"></div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(
            to right,
            #2563eb 0%,
            #2563eb ${((durationMinutes - 3) / (240 - 3)) * 100}%,
            #e5e7eb ${((durationMinutes - 3) / (240 - 3)) * 100}%,
            #e5e7eb 100%
          );
        }

        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(
            to right,
            #2563eb 0%,
            #2563eb ${((durationMinutes - 3) / (240 - 3)) * 100}%,
            #e5e7eb ${((durationMinutes - 3) / (240 - 3)) * 100}%,
            #e5e7eb 100%
          );
          border: none;
        }

        .slider:focus {
          outline: none;
          ring: 2px;
          ring-color: #2563eb;
        }

        .slider:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
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
