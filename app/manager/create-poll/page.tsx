// app/manager/create-poll/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import { RouteGuard } from "@/app/components/RouteGuard";
import { Icons } from "@/app/components/icons/PollIcons";
import { SelectionTypeCard } from "@/app/components/poll/SelectionTypeCard";
import { SpotCounter } from "@/app/components/poll/SpotCounter";
import { DurationSelector } from "@/app/components/poll/DurationSelector";
import { PollPreviewCard } from "@/app/components/poll/PollPreviewCard";
import { useFormValidation } from "@/app/hooks/useFormValidation";
interface User {
  id: string;
  name: string;
  pin: string;
  created_at: string;
}
interface RecentWinner {
  user_id: string;
  name: string;
  pollTitle: string;
  wonAt: string;
}
interface PollRulesProps {
  allUsers: User[];
  pollRules: PollRules;
  setPollRules: (rules: any) => void;
  recentWinners: any[];
  loadingRecentWinners: boolean;
}
interface PollRules {
  excludeSpecificUsers: string[]; // Array of user IDs to exclude
  excludeRecentWinners: boolean; // Whether to exclude recent winners
  recentWinnerTimeframe: "day" | "week" | "month" | null; // Timeframe for recent winners
  // Add more rule types as needed
}
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
    open_until: "",
    selection_type: "random" as "random" | "first_come_first_serve",
  });
  // Poll rules state
  const [pollRules, setPollRules] = useState<PollRules>({
    excludeSpecificUsers: [],
    excludeRecentWinners: false,
    recentWinnerTimeframe: null,
  });
  // UI state for rules section
  const [showUserExclusion, setShowUserExclusion] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  const [durationMinutes, setDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [recentWinners, setRecentWinners] = useState<RecentWinner[]>([]);
  const [loadingRecentWinners, setLoadingRecentWinners] = useState(false);
  const totalSpots =
    formData.am_spots + formData.pm_spots + formData.all_day_spots;

  // Form validation
  const validationRules = {
    title: [
      {
        validator: (value: string) => value.trim().length > 0,
        message: "Title is required",
      },
      {
        validator: (value: string) => value.trim().length <= 100,
        message: "Title must be 100 characters or less",
      },
    ],
    // description: [
    //   {
    //     validator: (value: string) => value.trim().length > 0,
    //     message: "Description is required",
    //   },
    //   {
    //     validator: (value: string) => value.trim().length <= 500,
    //     message: "Description must be 500 characters or less",
    //   },
    // ],
    spots: [
      {
        validator: () =>
          formData.am_spots + formData.pm_spots + formData.all_day_spots > 0,
        message: "At least one spot must be available",
      },
    ],
    open_until: [
      {
        validator: (value: string) => value.length > 0,
        message: "End time is required",
      },
      {
        validator: (value: string) => new Date(value) > new Date(),
        message: "End time must be in the future",
      },
    ],
  };
  const { errors, validateAll, clearErrors } =
    useFormValidation(validationRules);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("name");

      if (error) throw error;
      setAllUsers(data || []);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    }
  };
  const fetchRecentWinners = async (timeframe: "day" | "week" | "month") => {
    try {
      setLoadingRecentWinners(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let startDate: Date;
      const now = new Date();

      switch (timeframe) {
        case "day":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data, error } = await supabase
        .from("poll_results")
        .select(
          `
          user_id,
          users!poll_results_user_id_fkey ( id, name ),
          polls!poll_results_poll_id_fkey ( title, created_at )
        `
        )
        .gte("polls.created_at", startDate.toISOString())
        .eq("polls.manager_id", user.id);

      if (error) throw error;

      // Group by user to avoid duplicates
      const uniqueWinners =
        data?.reduce((acc: RecentWinner[], result: any) => {
          const existingUser = acc.find((w) => w.user_id === result.user_id);
          if (!existingUser && result.users) {
            acc.push({
              user_id: result.user_id,
              name: result.users.name,
              pollTitle: result.polls?.title || "Unknown Poll",
              wonAt: result.polls?.created_at || "",
            });
          }
          return acc;
        }, []) || [];

      setRecentWinners(uniqueWinners);
    } catch (err: any) {
      console.error("Error fetching recent winners:", err);
    } finally {
      setLoadingRecentWinners(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch recent winners when rule is enabled
  useEffect(() => {
    if (pollRules.excludeRecentWinners && pollRules.recentWinnerTimeframe) {
      fetchRecentWinners(pollRules.recentWinnerTimeframe);
    } else {
      setRecentWinners([]);
    }
  }, [pollRules.excludeRecentWinners, pollRules.recentWinnerTimeframe]);
  // Filter users for exclusion selection (exclude already selected users)
  const availableUsersForExclusion = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) &&
      !pollRules.excludeSpecificUsers.includes(user.id)
  );

  // Get user names for display
  const getExcludedUserNames = () => {
    return pollRules.excludeSpecificUsers
      .map((id) => allUsers.find((u) => u.id === id)?.name)
      .filter(Boolean);
  };

  // Calculate rule impact
  const calculateRuleImpact = () => {
    let excludedCount = pollRules.excludeSpecificUsers.length;

    if (pollRules.excludeRecentWinners) {
      // Add recent winners to exclusion count (avoid double counting)
      const recentWinnerIds = recentWinners.map((w) => w.user_id);
      const uniqueExclusions = new Set([
        ...pollRules.excludeSpecificUsers,
        ...recentWinnerIds,
      ]);
      excludedCount = uniqueExclusions.size;
    }

    return {
      totalUsers: allUsers.length,
      excludedUsers: excludedCount,
      eligibleUsers: Math.max(0, allUsers.length - excludedCount),
    };
  };

  const ruleImpact = calculateRuleImpact();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
    clearErrors();
  };

  const handleExcludeUser = (userId: string) => {
    setPollRules((prev) => ({
      ...prev,
      excludeSpecificUsers: [...prev.excludeSpecificUsers, userId],
    }));
    setUserSearchTerm("");
  };

  const handleRemoveExcludedUser = (userId: string) => {
    setPollRules((prev) => ({
      ...prev,
      excludeSpecificUsers: prev.excludeSpecificUsers.filter(
        (id) => id !== userId
      ),
    }));
  };

  const handleRecentWinnerExclusion = (
    enabled: boolean,
    timeframe?: "day" | "week" | "month"
  ) => {
    setPollRules((prev) => ({
      ...prev,
      excludeRecentWinners: enabled,
      recentWinnerTimeframe: enabled ? timeframe || "week" : null,
    }));
  };

  const generateShareLink = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate basic form data
    // if (!validateAll(formData)) {
    //   setError("Please fix the validation errors above");
    //   return;
    // }

    // Check if rules would exclude everyone
    if (ruleImpact.eligibleUsers === 0) {
      setError(
        "Your rules would exclude all users. Please adjust the rules or no one will be able to participate."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/manager/login");
        return;
      }
      if (!formData.open_until) {
        // Calculate end time based on duration
        const now = new Date();
        const calculatedEndTime = new Date(
          now.getTime() + durationMinutes * 60000
        );
        formData.open_until = calculatedEndTime.toISOString().slice(0, 16); // Format for datetime-local
      }

      const endTime = new Date(formData.open_until);

      const shareLink = `poll_${generateShareLink()}`;

      // Insert poll with rules
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
            // Rules data
            excluded_user_ids:
              pollRules.excludeSpecificUsers.length > 0
                ? pollRules.excludeSpecificUsers
                : null,
            exclude_recent_winners: pollRules.excludeRecentWinners,
            exclude_timeframe: pollRules.recentWinnerTimeframe,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        // Redirect to poll details page
        router.push(`/manager/poll/${data.id}`);
      }
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ">
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
              {/* Poll Rules Section */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Participation Rules (Optional)
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Configure rules to control who can participate in this poll
                </p>

                {/* Exclude Specific Users */}
                <div className="mb-6">
                  <label className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={showUserExclusion}
                      onChange={(e) => setShowUserExclusion(e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Exclude Specific Users
                    </span>
                  </label>

                  {showUserExclusion && (
                    <div className="ml-6 space-y-4">
                      {/* Show currently excluded users */}
                      {pollRules.excludeSpecificUsers.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Excluded Users:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {getExcludedUserNames().map((userName, index) => {
                              const userId =
                                pollRules.excludeSpecificUsers[index];
                              return (
                                <span
                                  key={userId}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                >
                                  {userName}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveExcludedUser(userId)
                                    }
                                    className="ml-2 text-red-600 hover:text-red-800"
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* User search and selection */}
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <input
                          type="text"
                          placeholder="Search users to exclude..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                        />
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {availableUsersForExclusion.length > 0 ? (
                            availableUsersForExclusion.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => handleExcludeUser(user.id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center justify-between"
                              >
                                <span>{user.name}</span>
                                <span className="text-red-500">Exclude</span>
                              </button>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                              {userSearchTerm
                                ? "No matching users found"
                                : "No more users to exclude"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Exclude Recent Winners */}
                <div className="mb-6">
                  <label className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={pollRules.excludeRecentWinners}
                      onChange={(e) =>
                        handleRecentWinnerExclusion(e.target.checked, "week")
                      }
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Exclude Recent Winners
                    </span>
                  </label>

                  {pollRules.excludeRecentWinners && (
                    <div className="ml-6 space-y-4">
                      <p className="text-sm text-gray-600 mb-3">
                        Exclude users who won a poll in the selected timeframe:
                      </p>
                      <div className="space-y-2">
                        {["day", "week", "month"].map((timeframe) => (
                          <label key={timeframe} className="flex items-center">
                            <input
                              type="radio"
                              name="recentWinnerTimeframe"
                              value={timeframe}
                              checked={
                                pollRules.recentWinnerTimeframe === timeframe
                              }
                              onChange={(e) =>
                                handleRecentWinnerExclusion(
                                  true,
                                  e.target.value as any
                                )
                              }
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-sm text-gray-700 capitalize">
                              Past {timeframe}
                            </span>
                          </label>
                        ))}
                      </div>

                      {/* Show recent winners */}
                      {pollRules.recentWinnerTimeframe && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          {loadingRecentWinners ? (
                            <div className="flex items-center text-sm text-orange-800">
                              <div className="animate-spin h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full mr-2"></div>
                              Loading recent winners...
                            </div>
                          ) : recentWinners.length > 0 ? (
                            <div>
                              <h4 className="text-sm font-medium text-orange-900 mb-2">
                                Recent Winners ({recentWinners.length}) - Will
                                be excluded:
                              </h4>
                              <div className="space-y-1">
                                {recentWinners.slice(0, 5).map((winner) => (
                                  <div
                                    key={winner.user_id}
                                    className="text-xs text-orange-800"
                                  >
                                    • {winner.name} - won "{winner.pollTitle}"
                                  </div>
                                ))}
                                {recentWinners.length > 5 && (
                                  <div className="text-xs text-orange-700">
                                    ... and {recentWinners.length - 5} more
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-orange-800">
                              No recent winners found in the past{" "}
                              {pollRules.recentWinnerTimeframe}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Rule Impact Preview */}
                {(pollRules.excludeSpecificUsers.length > 0 ||
                  pollRules.excludeRecentWinners) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      Rule Impact Preview:
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {ruleImpact.totalUsers}
                        </div>
                        <div className="text-xs text-gray-600">Total Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {ruleImpact.excludedUsers}
                        </div>
                        <div className="text-xs text-gray-600">Excluded</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {ruleImpact.eligibleUsers}
                        </div>
                        <div className="text-xs text-gray-600">Eligible</div>
                      </div>
                    </div>

                    {ruleImpact.eligibleUsers === 0 && (
                      <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
                        ⚠️ Warning: All users are excluded! No one will be able
                        to participate.
                      </div>
                    )}
                    {ruleImpact.eligibleUsers < 3 &&
                      ruleImpact.eligibleUsers > 0 && (
                        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                          ⚠️ Warning: Very few users ({ruleImpact.eligibleUsers}
                          ) will be eligible to participate.
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* <div className="grid grid-cols-2 gap-4">
            {" "}
            {/* Poll Preview */}
          {/* <PollPreviewCard
              title={formData.title}
              selectionType={formData.selection_type}
              totalSpots={totalSpots}
              durationMinutes={durationMinutes}
            /> */}
          {/* Tips Card */}
          {/* <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
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
            </div> */}
          {/* </div> */}
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
