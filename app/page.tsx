import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          {/* Logo/Brand section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl float">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl blur opacity-30 animate-pulse"></div>
            </div>
          </div>

          <h1 className="text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text">FlexSpot</span>
            <br />
            <span className="text-gray-800">Lottery System</span>
          </h1>
          
          <p className="text-xl text-gray-700 mb-4 max-w-3xl mx-auto leading-relaxed font-medium">
            Transform your flexible work scheduling with our intelligent, fair, and transparent lottery system
          </p>
          
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Employees enter with secure PINs, winners are randomly selected, and everyone stays informed with real-time updates
          </p>

          {/* Trust indicators */}
          <div className="flex justify-center items-center space-x-8 mb-16 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">100% Fair & Random</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Real-time Updates</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-20">
          {/* Manager Card */}
          <div className="group">
            <div className="card bg-white/80 backdrop-blur-sm p-8 border-2 border-transparent hover:border-blue-200 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  For Managers
                </h2>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Create polls, manage employees, and conduct fair lottery drawings with our comprehensive management dashboard
                </p>
              </div>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Create unlimited polls with custom schedules</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Bulk employee management with CSV import</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Real-time participation tracking</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Automated lottery drawing system</span>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  href="/manager/login"
                  className="btn btn-primary w-full text-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Manager Login
                </Link>
                <Link
                  href="/manager/register"
                  className="btn btn-secondary w-full text-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Account
                </Link>
              </div>
            </div>
          </div>

          {/* Employee Card */}
          <div className="group">
            <div className="card bg-white/80 backdrop-blur-sm p-8 border-2 border-transparent hover:border-green-200 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  For Employees
                </h2>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Join polls using your secure PIN and select your preferred flexible schedule spots with ease
                </p>
              </div>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure PIN-based authentication</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Simple one-click poll participation</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Live countdown and participation stats</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Instant lottery results notification</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-900 mb-1">Need a poll link?</p>
                    <p className="text-green-800 text-sm leading-relaxed">
                      Your manager will provide you with a unique poll link to participate. 
                      Check your email or company communication channels.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6 text-gray-900">
              How It Works
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our streamlined process ensures fairness and transparency in every lottery drawing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Manager Creates Poll</h4>
              <p className="text-gray-600 leading-relaxed">
                Set available spots for AM, PM, and All-day shifts with custom durations and descriptions
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Employees Participate</h4>
              <p className="text-gray-600 leading-relaxed">
                Use secure PIN authentication to verify identity and select preferred flexible schedule spots
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Automated Drawing</h4>
              <p className="text-gray-600 leading-relaxed">
                Fair lottery algorithm randomly selects winners with instant notifications and transparent results
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto">
          <div className="card bg-gradient-to-r from-blue-600 to-purple-700 p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-6">
              Why Choose FlexSpot?
            </h3>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">100% Fair & Transparent</h4>
                    <p className="text-blue-100 text-sm">Cryptographically secure random selection ensures every employee has an equal chance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Easy to Use</h4>
                    <p className="text-blue-100 text-sm">Intuitive interface designed for both managers and employees with minimal training required</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Real-time Updates</h4>
                    <p className="text-blue-100 text-sm">Live participation tracking and instant result notifications keep everyone informed</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Secure & Private</h4>
                    <p className="text-blue-100 text-sm">Enterprise-grade security with PIN-based authentication and encrypted data storage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}