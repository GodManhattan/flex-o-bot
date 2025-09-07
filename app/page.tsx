"use client";

import Link from "next/link";

export default function HomePage() {
  console.log("🏠 HomePage: Rendering Flex-O-Bot home page at root /");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="h-6 w-6 text-white"
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
              <h1 className="text-3xl font-bold text-gray-900">Flex-O-Bot</h1>
            </div>
            <div className="space-x-4">
              <Link
                href="/manager/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Manager Login
              </Link>
              <Link
                href="/manager/register"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <div className="mb-8">
            <div className="h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg
                className="h-12 w-12 text-white"
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

          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Flex-O-Bot</span>
          </h1>
          <h2 className="text-3xl font-semibold text-gray-700 mb-8">
            Fair Flex Spot Management Made Simple
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Manage open flex spots and ensure fair access for all employees. Our
            intelligent lottery system eliminates bias and creates transparency
            in flexible workspace allocation.
          </p>

          <div className="space-x-6">
            <Link
              href="/manager/register"
              className="bg-blue-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Managing Flex Spots
            </Link>
            <Link
              href="#how-it-works"
              className="bg-white text-blue-600 px-10 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>

        {/* Problem & Solution */}
        <div className="py-16 bg-white rounded-2xl shadow-sm mb-16">
          <div className="max-w-5xl mx-auto px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-red-600 mb-4">
                  😤 The Problem
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    First-come-first-served creates unfair advantages
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    Manual spot allocation is time-consuming
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    Employees frustrated with flex spot distribution
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">❌</span>
                    No transparency in selection process
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-green-600 mb-4">
                  ✅ The Solution
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    Fair lottery system gives everyone equal chances
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    Automated process saves management time
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    Happy employees with transparent selection
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✅</span>
                    Complete visibility into who entered and won
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="py-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Flex-O-Bot Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                🎯 Smart Lottery System
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Random selection ensures fairness. No more favoritism or timing
                advantages - everyone gets an equal shot at their preferred flex
                spots.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-green-600"
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
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                ⚡ Instant & Automated
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Set it and forget it. Create polls, let employees enter, and
                results are automatically drawn when time's up.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-purple-600"
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
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                👁️ Complete Transparency
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Everyone can see who entered, when polls close, and who won. No
                hidden processes - just pure transparency.
              </p>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div
          id="how-it-works"
          className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl"
        >
          <div className="max-w-5xl mx-auto px-8">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              How Flex-O-Bot Works
            </h2>
            <div className="space-y-12">
              <div className="flex items-center space-x-8">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    🏢 Manager Creates Flex Poll
                  </h3>
                  <p className="text-gray-700 text-lg">
                    Set up available spots for AM shift, PM shift, or all-day
                    work. Choose how long employees have to enter the lottery.
                  </p>
                </div>
                <div className="hidden md:block w-32 h-20 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="flex-shrink-0 w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    👥 Employees Enter Lottery
                  </h3>
                  <p className="text-gray-700 text-lg">
                    Team members use their secure PIN to enter for their
                    preferred time slots. Watch live participation updates in
                    real-time.
                  </p>
                </div>
                <div className="hidden md:block w-32 h-20 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <span className="text-3xl">🎫</span>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="flex-shrink-0 w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    🎲 Automatic Fair Drawing
                  </h3>
                  <p className="text-gray-700 text-lg">
                    When time's up, Flex-O-Bot randomly selects winners. Results
                    are instantly shared with everyone - completely transparent!
                  </p>
                </div>
                <div className="hidden md:block w-32 h-20 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <span className="text-3xl">🏆</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="py-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Perfect For Your Team
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-blue-600 mb-4">
                👩‍💼 For Managers
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Save hours of manual spot allocation</li>
                <li>• Eliminate employee complaints about fairness</li>
                <li>• Get real-time insights into flex space demand</li>
                <li>• Easy setup - polls created in under 2 minutes</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-xl font-bold text-green-600 mb-4">
                👨‍💻 For Employees
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Fair chance at preferred work arrangements</li>
                <li>• Simple PIN-based entry system</li>
                <li>• See live countdown and participation</li>
                <li>• Instant notification of results</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Make Flex Spots Fair?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join forward-thinking companies using Flex-O-Bot to create happier,
            more engaged remote teams.
          </p>
          <div className="space-x-6">
            <Link
              href="/manager/register"
              className="bg-white text-blue-600 px-10 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Your Free Trial
            </Link>
            <Link
              href="/manager/login"
              className="bg-white text-blue-600 px-10 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Existing Manager? Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="h-5 w-5 text-white"
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
              <span className="text-xl font-bold">Flex-O-Bot</span>
            </div>
            <p className="text-gray-400 mb-4">
              Making flex spot management fair, transparent, and effortless.
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 Marlon Martinez. marlondevcomp@gmail.com. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
