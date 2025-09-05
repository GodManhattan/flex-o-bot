import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Flex Spot Lottery System
          </h1>
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
            Fair and transparent lottery system for flexible work schedule
            assignments. Employees enter with their PIN, and winners are
            randomly selected.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <div className="text-4xl mb-4">👩‍💼</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                For Managers
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Create polls, manage employees, and draw lottery results with
                our easy-to-use dashboard.
              </p>
              <div className="space-y-3">
                <Link
                  href="/manager/login"
                  className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                >
                  Manager Login
                </Link>
                <Link
                  href="/manager/register"
                  className="block w-full bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold shadow-sm"
                >
                  Manager Registration
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <div className="text-4xl mb-4">👥</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                For Employees
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Join polls using your secure PIN and select your preferred flex
                schedule spots.
              </p>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 text-sm">
                  <strong className="text-blue-800">Need a poll link?</strong>
                  <br />
                  <span className="text-blue-700">
                    Your manager will provide you with a unique poll link to
                    participate.
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 border-2 border-blue-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-700">1</span>
                </div>
                <h4 className="font-semibold mb-2 text-gray-900">
                  Manager Creates Poll
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Set available spots for AM, PM, and All-day shifts
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 border-2 border-green-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-700">2</span>
                </div>
                <h4 className="font-semibold mb-2 text-gray-900">
                  Employees Enter
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Use PIN to verify identity and select preferred spots
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 border-2 border-purple-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-700">3</span>
                </div>
                <h4 className="font-semibold mb-2 text-gray-900">
                  Random Drawing
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Fair lottery selects winners for each spot type
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
