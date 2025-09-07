"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { supabase } from "@/app/lib/supabase";
import { User } from "@/app/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", pin: "" });
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/manager/login");
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*").order("name");

    if (data) setUsers(data);
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("users").insert([newUser]);

    if (!error) {
      setNewUser({ name: "", pin: "" });
      setShowAddForm(false);
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const { error } = await supabase.from("users").delete().eq("id", userId);

      if (!error) {
        fetchUsers();
      }
    }
  };

  const handleBulkUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validUsers = results.data
          .filter((row: any) => row.name && row.pin && row.pin.length === 4)
          .map((row: any) => ({
            name: row.name.trim(),
            pin: row.pin.toString().padStart(4, "0"),
          }));

        if (validUsers.length > 0) {
          const { error } = await supabase.from("users").insert(validUsers);

          if (!error) {
            fetchUsers();
            setShowBulkUpload(false);
          }
        }
        setUploading(false);
      },
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">Manage Users</h1>
        </div>
        <div className="space-x-4">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Bulk Upload
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New User</h2>
          <form onSubmit={handleAddUser} className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                4-Digit PIN
              </label>
              <input
                type="text"
                value={newUser.pin}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, pin: e.target.value }))
                }
                maxLength={4}
                pattern="[0-9]{4}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234"
                required
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add User
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Upload Form */}
      {showBulkUpload && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Bulk Upload Users</h2>
          <div className="mb-4">
            <p className="text-sm text-gray-900 mb-2">
              Upload a CSV file with columns: <strong>name, pin</strong>
            </p>
            <p className="text-xs text-gray-900">Example: John Doe, 1234</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              disabled={uploading}
              className="flex-1"
            />
            <button
              onClick={() => setShowBulkUpload(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
          {uploading && (
            <p className="text-blue-600 text-sm mt-2">Uploading users...</p>
          )}
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Users ({users.length})</h2>
        </div>
        <div className="p-6">
          {users.length === 0 ? (
            <p className="text-gray-900 text-center py-8">
              No users added yet. Add users to start creating polls.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">PIN</th>
                    <th className="text-left py-2">Added</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-2">{user.name}</td>
                      <td className="py-2 font-mono">****</td>
                      <td className="py-2 text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
