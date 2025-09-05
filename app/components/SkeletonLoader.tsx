// components/SkeletonLoader.tsx
export const PollCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
    <div className="flex space-x-2">
      <div className="h-8 bg-gray-200 rounded w-20"></div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

export const UserRowSkeleton = () => (
  <tr className="border-b animate-pulse">
    <td className="py-2">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </td>
    <td className="py-2">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="py-2">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="py-2 text-right">
      <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
    </td>
  </tr>
);
