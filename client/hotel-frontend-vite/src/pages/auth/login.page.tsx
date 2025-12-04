import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Hotel } from "lucide-react";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted:", { email, password });
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 backdrop-blur-lg bg-white/30 rounded-2xl shadow-2xl border border-white/20">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <Hotel className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Welcome Back
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Sign in to access your hotel dashboard
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5 sm:space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base bg-white/50 backdrop-blur-sm border border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Remember me</span>
          </label>
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Sign In
        </button>
      </div>

      {/* Footer */}
      <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
        Don't have an account?{" "}
        <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
          Sign up
        </a>
      </div>
    </div>
  );
}
export default LoginPage;
