"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/contexts/AuthContext";
import { RouteGuard } from "@/app/components/RouteGuard";

function CreatePollContent() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    am_spots: 0,
    pm_spots: 0,
    all_day_spots: 0,
  });
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    // Calculate end time based on duration
    const now = new Date();
    const endTime = new Date(now.getTime() + durationMinutes * 60000);

    // Generate unique share link
    const shareLink = `poll_${Math.random().toString(36).substr(2, 8)}`;

    const { data, error } = await supabase
      .from("polls")
      .insert([
        {
          ...formData,
          open_until: endTime.toISOString(),
          manager_id: user.id,
          share_link: shareLink,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      router.push(`/manager/poll/${data.id}`);
    }

    setLoading(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push("/manager/dashboard")}
          className="text-blue-600 hover:underline mb-4 flex items-center"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Poll</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Poll Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                AM Spots
              </label>
              <input
                type="number"
                name="am_spots"
                value={formData.am_spots}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                PM Spots
              </label>
              <input
                type="number"
                name="pm_spots"
                value={formData.pm_spots}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                All Day Spots
              </label>
              <input
                type="number"
                name="all_day_spots"
                value={formData.all_day_spots}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-4 text-gray-900">
              Poll Duration
            </label>

            {/* Duration Display */}
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatDuration(durationMinutes)}
              </div>
              <div className="text-sm text-gray-900">
                Poll will close at: {calculateEndTime()}
              </div>
            </div>

            {/* Slider */}
            <div className="relative mb-6">
              <input
                type="range"
                min="3"
                max="240"
                step="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #2563eb 0%, #2563eb ${
                    ((durationMinutes - 3) / (240 - 3)) * 100
                  }%, #e5e7eb ${
                    ((durationMinutes - 3) / (240 - 3)) * 100
                  }%, #e5e7eb 100%)`,
                }}
              />

              {/* Slider markers */}
              <div className="flex justify-between text-xs text-gray-900 mt-2">
                <span>3 min</span>
                <span>1 hr</span>
                <span>2 hrs</span>
                <span>3 hrs</span>
                <span>4 hrs</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating Poll..." : "Create Poll"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/manager/dashboard")}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Custom CSS for slider styling */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: transparent;
        }

        input[type="range"]::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: transparent;
          border: none;
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
