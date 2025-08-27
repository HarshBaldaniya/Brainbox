import { ArrowLeftCircle, Check, Sparkles, Users, Zap, Shield } from "lucide-react";
import NewDocumentButton from "@/components/NewDocumentButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex space-x-2 items-center justify-center mb-8 animate-pulse">
              <ArrowLeftCircle className="w-7 h-7" />
              <h1 className="font-bold text-xl">Get started with creating a new document.</h1>
            </div>
            
            <div className="flex justify-center mb-12">
              <NewDocumentButton isDisabled={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Collaborative Intelligence for Modern Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create, collaborate, and innovate with AI-powered document editing. 
              Real-time collaboration, smart suggestions, and seamless teamwork in one powerful platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Collaboration</h3>
              <p className="text-gray-600">
                Work together seamlessly with live cursors, instant updates, and real-time editing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Intelligence</h3>
              <p className="text-gray-600">
                Leverage advanced AI to enhance your writing, get smart suggestions, and automate tasks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Enterprise Security</h3>
              <p className="text-gray-600">
                Bank-level security with end-to-end encryption and role-based access control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that works best for your team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Current Plan
                </span>
              </div>
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
                  <p className="text-gray-600">Forever free</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Up to 5 documents</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Up to 5 users per document</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Basic AI features</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Real-time collaboration</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">5000 words per document</span>
                  </li>
                </ul>
                
                <button className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                  Get Started Free
                </button>
              </div>
            </div>

            {/* Monthly Plan */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 relative opacity-60">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gray-400 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Coming Soon
                </span>
              </div>
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$9</div>
                  <p className="text-gray-600">per month</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited documents</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Up to 20 users per document</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced AI features</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited words per document</span>
                  </li>
                </ul>
                
                <button className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed" disabled>
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Yearly Plan */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 relative opacity-60">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gray-400 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Coming Soon
                </span>
              </div>
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Yearly</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$89</div>
                  <p className="text-gray-600">per year</p>
                  <p className="text-sm text-green-600 font-medium">Save 17%</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Everything in Monthly</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited users per document</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Enterprise features</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">24/7 support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </li>
                </ul>
                
                <button className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">BrainBox</span>
          </div>
          <p className="text-gray-400 mb-4">
            The ultimate collaborative intelligence platform for modern teams.
          </p>
          <p className="text-gray-500 text-sm">&copy; 2024 BrainBox. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
