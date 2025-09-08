"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import { User } from "@/app/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", pin: "" });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  // Fetch users data
  const fetchUsers = async () => {
    try {
      console.log("👥 Fetching users...");
      setError(""); // Clear any previous errors

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("name");

      if (error) {
        console.error("❌ Error fetching users:", error);
        throw error;
      }

      console.log("✅ Users fetched successfully:", data?.length);
      if (data) setUsers(data);
    } catch (err: any) {
      console.error("❌ Failed to load users:", err);
      setError("Failed to load users: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch - only run when auth is ready and user is available
  useEffect(() => {
    if (authLoading) {
      console.log("⏳ Auth still loading, waiting...");
      return;
    }

    if (!authUser) {
      console.log("❌ No authenticated user");
      setLoading(false);
      return;
    }

    console.log("✅ Auth ready, fetching users for:", authUser.id);
    fetchUsers();
  }, [authUser, authLoading]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newUser.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!newUser.pin || newUser.pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    // Check if PIN already exists
    const existingUser = users.find((user) => user.pin === newUser.pin);
    if (existingUser) {
      setError("This PIN is already in use. Please choose a different one.");
      return;
    }

    try {
      const { error } = await supabase.from("users").insert([
        {
          name: newUser.name.trim(),
          pin: newUser.pin,
        },
      ]);

      if (error) throw error;

      setNewUser({ name: "", pin: "" });
      setShowAddForm(false);
      setSuccess("User added successfully!");
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to add user");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase.from("users").delete().eq("id", userId);
      if (error) throw error;

      setSuccess(`${userName} has been deleted`);
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  };

  const handleBulkUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess("");

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const validUsers = results.data
            .filter(
              (row: any) =>
                row.name && row.pin && row.pin.toString().length === 4
            )
            .map((row: any) => ({
              name: row.name.trim(),
              pin: row.pin.toString().padStart(4, "0"),
            }));

          if (validUsers.length === 0) {
            setError("No valid users found in CSV. Please check the format.");
            setUploading(false);
            return;
          }

          // Check for duplicate PINs within the upload
          const pins = validUsers.map((u) => u.pin);
          const duplicatePins = pins.filter(
            (pin, index) => pins.indexOf(pin) !== index
          );
          if (duplicatePins.length > 0) {
            setError(
              `Duplicate PINs found in upload: ${duplicatePins.join(", ")}`
            );
            setUploading(false);
            return;
          }

          // Check for existing PINs in database
          const existingPins = users.map((u) => u.pin);
          const conflictingPins = validUsers.filter((u) =>
            existingPins.includes(u.pin)
          );
          if (conflictingPins.length > 0) {
            setError(
              `These PINs already exist: ${conflictingPins
                .map((u) => u.pin)
                .join(", ")}`
            );
            setUploading(false);
            return;
          }

          const { error } = await supabase.from("users").insert(validUsers);
          if (error) throw error;

          setSuccess(`Successfully added ${validUsers.length} users`);
          fetchUsers();
          setShowBulkUpload(false);
        } catch (err: any) {
          setError(err.message || "Failed to upload users");
        } finally {
          setUploading(false);
        }
      },
      error: () => {
        setError("Failed to parse CSV file");
        setUploading(false);
      },
    });

    // Reset file input
    event.target.value = "";
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.pin.includes(searchTerm)
  );

  // Show loading only when auth is loading OR when we're fetching users
  if (authLoading || (loading && authUser)) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header Skeleton */}
        <div className="bg-white shadow-sm border-b px-4 py-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-4 space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="bg-white rounded-lg p-4 h-32"></div>
            <div className="bg-white rounded-lg p-4 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  // If no auth user after loading is done, let the RouteGuard handle it
  if (!authLoading && !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Authentication required</p>
        </div>
      </div>
    );
  }

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
                  Manage Users
                </h1>
                <p className="text-sm text-gray-600">
                  {users.length} employee{users.length !== 1 ? "s" : ""}
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
                onClick={() => {
                  setShowAddForm(true);
                  setShowMobileMenu(false);
                }}
                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add User
              </button>

              <button
                onClick={() => {
                  setShowBulkUpload(true);
                  setShowMobileMenu(false);
                }}
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Bulk Upload
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Desktop Action Bar */}
        <div className="hidden sm:flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Employee Management
            </h2>
            <p className="text-gray-600">
              Add, remove, and manage employee access
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowBulkUpload(true)}
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Bulk Upload
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add User
            </button>
          </div>
        </div>

        {/* Alert Messages */}
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

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-green-800 font-medium">Success</p>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
              <button
                onClick={() => setSuccess("")}
                className="ml-auto text-green-400 hover:text-green-600"
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

        {/* Add User Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New User
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
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

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    4-Digit PIN
                  </label>
                  <input
                    type="text"
                    value={newUser.pin}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                      setNewUser((prev) => ({ ...prev, pin: value }));
                    }}
                    maxLength={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white font-mono"
                    placeholder="1234"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for poll entry verification
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 sm:flex-none bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bulk Upload Form */}
        {showBulkUpload && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Bulk Upload Users
              </h3>
              <button
                onClick={() => setShowBulkUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
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

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  CSV Format Requirements
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    • CSV file must have columns: <strong>name</strong> and{" "}
                    <strong>pin</strong>
                  </p>
                  <p>
                    • Example:{" "}
                    <code className="bg-blue-100 px-1 rounded">
                      John Doe,1234
                    </code>
                  </p>
                  <p>• PINs must be exactly 4 digits</p>
                  <p>• Each PIN must be unique</p>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleBulkUpload}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                {uploading && (
                  <div className="flex items-center text-blue-600 text-sm">
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
                    Processing CSV file...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Employee List ({filteredUsers.length})
                </h3>
                <p className="text-sm text-gray-600">
                  Manage employee access and PINs
                </p>
              </div>

              {/* Search */}
              {users.length > 0 && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or PIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                  <svg
                    className="w-4 h-4 text-gray-400 absolute right-3 top-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No employees yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Add employees to start creating polls and managing flex spots
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add First Employee
                </button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🔍</div>
                <p className="text-gray-500">No employees match your search</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-blue-600 hover:underline text-sm"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="block sm:hidden space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {user.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            PIN: •••{user.pin.slice(-1)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Added{" "}
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {deleteConfirm === user.id ? (
                        <div className="space-y-2">
                          <p className="text-sm text-red-700">
                            Are you sure you want to delete {user.name}?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleDeleteUser(user.id, user.name)
                              }
                              className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700"
                            >
                              Yes, Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700"
                        >
                          Delete Employee
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-medium text-gray-900">
                          Employee Name
                        </th>
                        <th className="text-left py-3 font-medium text-gray-900">
                          PIN
                        </th>
                        <th className="text-left py-3 font-medium text-gray-900">
                          Date Added
                        </th>
                        <th className="text-right py-3 font-medium text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-medium text-sm">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">
                                {user.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm">
                              •••{user.pin.slice(-1)}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-right">
                            {deleteConfirm === user.id ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-sm text-red-700 mr-2">
                                  Delete {user.name}?
                                </span>
                                <button
                                  onClick={() =>
                                    handleDeleteUser(user.id, user.name)
                                  }
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(user.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => router.push("/manager/dashboard")}
              className="flex items-center justify-center bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 font-medium transition-colors"
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
              onClick={() => router.push("/manager/create-poll")}
              className="flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Poll
            </button>

            {users.length > 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center justify-center bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Add Another User
              </button>
            )}
          </div>
        </div>

        {/* Statistics Card */}
        {users.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
            <h3 className="font-medium text-gray-900 mb-4">
              Employee Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {users.length}
                </div>
                <div className="text-sm text-gray-600">Total Employees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {
                    users.filter(
                      (u) =>
                        new Date(u.created_at) >
                        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Added This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {
                    users.filter(
                      (u) =>
                        new Date(u.created_at) >
                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Added This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(users.map((u) => u.pin)).size}
                </div>
                <div className="text-sm text-gray-600">Unique PINs</div>
              </div>
            </div>
          </div>
        )}

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
            💡 Management Tips
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              • Use the bulk upload feature to add multiple employees at once
              from a CSV file
            </p>
            <p>• PINs should be unique and easy for employees to remember</p>
            <p>• Consider using employee ID numbers or birthdays as PINs</p>
            <p>
              • Regularly review and remove access for employees who have left
            </p>
          </div>
        </div>

        {/* Development Debug Info - Only show in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-100 rounded-lg p-4">
            <details>
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                🔧 Debug Info (Development)
              </summary>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Auth User: {authUser?.id?.slice(0, 8) || "None"}</div>
                <div>Auth Loading: {authLoading ? "Yes" : "No"}</div>
                <div>Page Loading: {loading ? "Yes" : "No"}</div>
                <div>Total Users: {users.length}</div>
                <div>Filtered Users: {filteredUsers.length}</div>
                <div>Search Term: "{searchTerm}"</div>
                <div>Show Add Form: {showAddForm ? "Yes" : "No"}</div>
                <div>Show Bulk Upload: {showBulkUpload ? "Yes" : "No"}</div>
                <div>Delete Confirm: {deleteConfirm || "None"}</div>
                <div>Uploading: {uploading ? "Yes" : "No"}</div>
                <div>Current Error: {error || "None"}</div>
                <div>Current Success: {success || "None"}</div>
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Bottom spacing for mobile */}
      <div className="h-8"></div>
    </div>
  );
}
