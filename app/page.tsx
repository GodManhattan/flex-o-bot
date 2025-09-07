"use client";

import Link from "next/link";

export default function HomePage() {
  console.log("🏠 HomePage: Rendering Flex-O-Bot home page at root /");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                <svg
                  className="h-4 w-4 sm:h-6 sm:w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Flex-O-Bot
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/manager/login"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
              >
                Login
              </Link>
              <Link
                href="/manager/register"
                className="bg-blue-600 text-white px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm sm:text-base"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12 sm:py-16 lg:py-20">
          <div className="mb-6 sm:mb-8">
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
              <svg
                className="h-8 w-8 sm:h-12 sm:w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            <span className="text-blue-600">Flex-O-Bot</span>
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 mb-6 sm:mb-8">
            Fair Flex Spot Management Made Simple
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
            Manage open flex spots and ensure fair access for all employees. Our
            intelligent system eliminates bias and creates transparency in
            flexible workspace allocation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 px-4">
            <Link
              href="/manager/register"
              className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
            >
              Start Managing Flex Spots
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors text-center"
            >
              See How It Works
            </Link>
          </div>
        </div>

        {/* Problem & Solution */}
        <div className="py-8 sm:py-16 bg-white rounded-2xl shadow-sm mb-8 sm:mb-16 mx-4 sm:mx-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">
                  😤 The Problem
                </h3>
                <ul className="space-y-3 text-gray-700 text-sm sm:text-base">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2 flex-shrink-0">❌</span>
                    <span>
                      First-come-first-served creates unfair advantages
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2 flex-shrink-0">❌</span>
                    <span>Manual spot allocation is time-consuming</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2 flex-shrink-0">❌</span>
                    <span>
                      Employees frustrated with flex spot distribution
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2 flex-shrink-0">❌</span>
                    <span>No transparency in selection process</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-green-600 mb-4">
                  ✅ The Solution
                </h3>
                <ul className="space-y-3 text-gray-700 text-sm sm:text-base">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 flex-shrink-0">
                      ✅
                    </span>
                    <span>Fair system gives everyone equal chances</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 flex-shrink-0">
                      ✅
                    </span>
                    <span>Automated process saves management time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 flex-shrink-0">
                      ✅
                    </span>
                    <span>Happy employees with transparent selection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 flex-shrink-0">
                      ✅
                    </span>
                    <span>Complete visibility into who entered and won</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="py-8 sm:py-16 px-4 sm:px-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-16">
            Why Flex-O-Bot Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"
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
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">
                🎯 Smart System
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Random selection ensures fairness. No more favoritism or timing
                advantages - everyone gets an equal shot at their preferred flex
                spots.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">
                ⚡ Instant & Automated
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Set it and forget it. Create polls, let employees enter, and
                results are automatically drawn when time's up.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">
                👁️ Complete Transparency
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Everyone can see who entered, when polls close, and who won. No
                hidden processes - just pure transparency.
              </p>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div
          id="how-it-works"
          className="py-12 sm:py-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mx-4 sm:mx-0"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-16">
              How Flex-O-Bot Works
            </h2>
            <div className="space-y-8 sm:space-y-12">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
                <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    🏢 Manager Creates Flex Poll
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
                    Set up available spots for AM shift, PM shift, or all-day
                    work. Choose how long employees have to enter the .
                  </p>
                </div>
                <div className="hidden md:block w-20 h-16 sm:w-32 sm:h-20 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl">📊</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
                <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    👥 Employees Enter
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
                    Team members use their secure PIN to enter for their
                    preferred time slots. Watch live participation updates in
                    real-time.
                  </p>
                </div>
                <div className="hidden md:block w-20 h-16 sm:w-32 sm:h-20 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl">🎫</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
                <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                    🎲 Automatic Fair Drawing
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
                    When time's up, Flex-O-Bot randomly selects winners. Results
                    are instantly shared with everyone - completely transparent!
                  </p>
                </div>
                <div className="hidden md:block w-20 h-16 sm:w-32 sm:h-20 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl">🏆</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="py-8 sm:py-16 px-4 sm:px-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Perfect For Your Team
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md">
              <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-3 sm:mb-4">
                👩‍💼 For Managers
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                <li>• Save hours of manual spot allocation</li>
                <li>• Eliminate employee complaints about fairness</li>
                <li>• Get real-time insights into flex space demand</li>
                <li>• Easy setup - polls created in under 2 minutes</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md">
              <h3 className="text-lg sm:text-xl font-bold text-green-600 mb-3 sm:mb-4">
                👨‍💻 For Employees
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                <li>• Fair chance at preferred work arrangements</li>
                <li>• Simple PIN-based entry system</li>
                <li>• See live countdown and participation</li>
                <li>• Instant notification of results</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-12 sm:py-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white mx-4 sm:mx-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 px-4">
            Ready to Make Flex Spots Fair?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto opacity-90 px-4">
            Join forward-thinking companies using Flex-O-Bot to create happier,
            more engaged remote teams.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 px-4">
            <Link
              href="/manager/register"
              className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:bg-gray-100 transition-colors shadow-lg text-center"
            >
              Start Your Free Trial
            </Link>
            <Link
              href="/manager/login"
              className="w-full sm:w-auto bg-transparent text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold border-2 border-white hover:bg-white hover:text-blue-600 transition-colors text-center"
            >
              Existing Manager? Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                <svg
                  className="h-3 w-3 sm:h-5 sm:w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold">Flex-O-Bot</span>
            </div>
            <p className="text-gray-400 mb-4 text-sm sm:text-base px-4">
              Making flex spot management fair, transparent, and effortless.
            </p>
            <p className="text-gray-500 text-xs sm:text-sm px-4">
              © 2025 Marlon Martinez. marlondevcomp@gmail.com. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
