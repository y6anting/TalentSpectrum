"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  GraduationCap,
  AlignCenter,
} from "lucide-react";

// Types
type UserType = "candidate" | "employer" | "job-coach";
type TabType = "login" | "signup";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type SignupStep = "name" | "email" | "password";

interface SignupProgress {
  currentStep: SignupStep;
  completedSteps: SignupStep[];
}

// User Type Configuration
const USER_TYPE_CONFIG = {
  candidate: {
    label: "Job Seeker",
    icon: User,
    title: "Find Your Perfect Role",
    description:
      "Access resources, showcase your strengths, and connect with coaches to help you thrive in your career, whether as a job seeker or entrepreneur.",
    dashboard: "candidate/candidate-dashboard",
    gradient: "from-purple-500 to-indigo-600",
    bgImage: "/About_Express.jpg",
  },
  employer: {
    label: "Employer",
    icon: Building2,
    title: "Discover Top Talent",
    description:
      "Position your brand as a leader in diversity and inclusion as you commit to ESG values and support CSR that enhance your corporate reputation through our platform.",
    dashboard: "employer/employer-dashboard",
    gradient: "from-indigo-600 to-purple-700",
    bgImage: "/About_Connect.jpg",
  },
  "job-coach": {
    label: "Job Coach",
    icon: GraduationCap,
    title: "Guide & Support Talent",
    description:
      "Partner with inclusive employers to create accommodating workplace and connect with a wider network of neurodivergent professionals.",
    dashboard: "job-coach",
    gradient: "from-purple-700 to-indigo-800",
    bgImage: "/About_Discover.jpg",
  },
} as const;

const LoginPage = () => {
  const router = useRouter();

  // State Management
  const [activeTab, setActiveTab] = useState<TabType>("login");
  const [userType, setUserType] = useState<UserType>("candidate");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [signupData, setSignupData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [signupProgress, setSignupProgress] = useState<SignupProgress>({
    currentStep: "name",
    completedSteps: [],
  });

  // Hide header on mount
  useEffect(() => {
    const header = document.querySelector("header") as HTMLElement;
    if (header) {
      document.body.classList.add("hide-header");
      header.style.display = "none";
    }
    return () => {
      if (header) {
        document.body.classList.remove("hide-header");
        header.style.display = "";
      }
    };
  }, [router]);

  // Form Input Handlers
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error && name === "email") {
      setError("");
    }
  };

  // Form Submission Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        userType: userType,
        redirect: false,
      });

      if (result?.ok) {
        const session = await getSession();
        if (!session?.user?.role) {
          setError("User role not found.");
          return;
        }

        // Save user email to localStorage based on role
        if (session.user.role === "EMPLOYER") {
          localStorage.setItem("employerEmail", loginData.email);
          router.push(`/${USER_TYPE_CONFIG.employer.dashboard}`);
        } else if (session.user.role === "CANDIDATE") {
          localStorage.setItem("userEmail", loginData.email);
          router.push(`/${USER_TYPE_CONFIG.candidate.dashboard}`);
        } else if (session.user.role === "JOB_COACH") {
          localStorage.setItem("jobCoachEmail", loginData.email);
          router.push(`/${USER_TYPE_CONFIG["job-coach"].dashboard}`);
        } else {
          router.push("/");
        }
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
        }),
      });

      if (response.ok) {
        localStorage.setItem("userEmail", signupData.email);

        const result = await signIn("credentials", {
          email: signupData.email,
          password: signupData.password,
          redirect: false,
        });

        if (result?.ok) {
          router.push("/candidate/candidate-info");
        }
      } else {
        const data = await response.json();
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", {
      callbackUrl: `/${USER_TYPE_CONFIG[userType].dashboard}`,
    });
  };

  // Progressive Signup Handlers
  const handleNextStep = () => {
    const { currentStep, completedSteps } = signupProgress;

    if (currentStep === "name" && signupData.name.trim()) {
      setSignupProgress({
        currentStep: "email",
        completedSteps: [...completedSteps, "name"],
      });
    } else if (currentStep === "email" && signupData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupData.email)) {
        setError("Please enter a valid email address");
        return;
      }
      setError("");
      setSignupProgress({
        currentStep: "password",
        completedSteps: [...completedSteps, "email"],
      });
    }
  };

  const handlePreviousStep = () => {
    const { currentStep, completedSteps } = signupProgress;

    if (currentStep === "email") {
      setSignupProgress({
        currentStep: "name",
        completedSteps: completedSteps.filter((s) => s !== "name"),
      });
      setError("");
    } else if (currentStep === "password") {
      setSignupProgress({
        currentStep: "email",
        completedSteps: completedSteps.filter((s) => s !== "email"),
      });
    }
  };

  const resetSignupProgress = () => {
    setSignupProgress({
      currentStep: "name",
      completedSteps: [],
    });
    setSignupData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setError("");
  };

  const currentConfig = USER_TYPE_CONFIG[userType];

  return (
    <>
      <style jsx global>{`
        body.hide-header header {
          display: none !important;
        }
      `}</style>

      <div
        className="h-screen bg-fixed bg-center bg-cover flex"
        style={{
          backgroundImage: "url('/TalentSpectrumBackground.png')",
        }}
      >
        {/* Left Panel - Dynamic Content (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Background with overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${currentConfig.bgImage}')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-12 flex flex-col justify-between w-full">
            {/* Logo (Desktop) */}
            <div className="flex justify-center">
              <Link href="/" className="cursor-pointer">
                <Image
                  src="/TalentSpectrumLogoDark.png"
                  alt="TalentSpectrum"
                  width={180} // Smaller width
                  height={60} // Smaller height
                  className="mb-4"
                  priority
                />
              </Link>
            </div>

            {/* Center Content */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                {activeTab === "signup" &&
                signupProgress.currentStep !== "name" ? (
                  // Progressive signup messages
                  <div className="space-y-6">
                    {/* Progress dots
                    <div className="flex justify-center gap-3">
                      {["name", "email", "password"].map((step) => (
                        <div
                          key={step}
                          className={`w-3 h-3 rounded-full transition-all ${
                            signupProgress.completedSteps.includes(step as SignupStep)
                              ? "bg-white"
                              : signupProgress.currentStep === step
                              ? "bg-white/70 ring-2 ring-white/30"
                              : "bg-white/30"
                          }`}
                        />
                      ))}
                    </div> */}

                    {signupProgress.currentStep === "email" && (
                      <div>
                        <h2 className="text-4xl font-bold text-white mb-4">
                          Great to meet you, {signupData.name}!
                        </h2>
                        <p className="text-white/80 text-lg">
                          You're one step closer to amazing opportunities
                        </p>
                      </div>
                    )}

                    {signupProgress.currentStep === "password" && (
                      <div>
                        <h2 className="text-4xl font-bold text-white mb-4">
                          Almost Ready to Shine!
                        </h2>
                        <p className="text-white/80 text-lg">
                          Your dream job is just moments away
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Default welcome message
                  <div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                      <i>
                        {activeTab === "login" ? "Welcome Back" : "Join Us Now"}
                      </i>
                    </h1>
                    <p className="text-xl text-white/80">
                      {currentConfig.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom stats or features */}
            <div className="grid grid-cols-3 gap-4 text-white/80">
              <div className="text-center">
                <div className="text-2xl font-bold">1000+</div>
                <div className="text-sm">Job Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm">Coaches</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 h-screen">
          {/* Logo (Mobile Only) */}
          <div className="lg:hidden w-full flex justify-center p-4 pb-0">
            <Link href="/" className="cursor-pointer">
              <Image
                src="/TalentSpectrumLogoDark.png"
                alt="TalentSpectrum"
                width={150} // Smaller for mobile
                height={50} // Smaller for mobile
                priority
              />
            </Link>
          </div>

          <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-h-full overflow-y-auto mx-auto">
            {/* User Type Selector */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                I am a
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(USER_TYPE_CONFIG) as UserType[]).map((type) => {
                  const config = USER_TYPE_CONFIG[type];
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setUserType(type);
                        resetSignupProgress();
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        userType === type
                          ? `border-purple-600 bg-gradient-to-r ${config.gradient} text-white`
                          : "border-gray-200 hover:border-purple-300 bg-white text-gray-700"
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setActiveTab("login");
                  resetSignupProgress();
                }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  activeTab === "login"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setActiveTab("signup");
                  resetSignupProgress();
                }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  activeTab === "signup"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                {message}
              </div>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginInputChange}
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-purple-600 outline-none transition-colors bg-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-purple-600 outline-none transition-colors bg-transparent"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={loginData.rememberMe}
                      onChange={handleLoginInputChange}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02]"
                  }`}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>

                <div className="relative">
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-gray-500">OR</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignupSubmit} className="space-y-6">
                {/* Progressive Signup Steps */}
                {signupProgress.currentStep === "name" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={signupData.name}
                      onChange={handleSignupInputChange}
                      className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-purple-600 outline-none transition-colors bg-transparent"
                      placeholder="Enter your full name"
                      autoFocus
                      required
                    />
                  </div>
                )}

                {signupProgress.currentStep === "email" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupInputChange}
                      className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-purple-600 outline-none transition-colors bg-transparent"
                      placeholder="Enter your email"
                      autoFocus
                      required
                    />
                  </div>
                )}

                {signupProgress.currentStep === "password" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={signupData.password}
                        onChange={handleSignupInputChange}
                        className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-purple-600 outline-none transition-colors bg-transparent"
                        placeholder="Create a password"
                        autoFocus
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={signupData.confirmPassword}
                        onChange={handleSignupInputChange}
                        className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-purple-600 outline-none transition-colors bg-transparent"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  {signupProgress.currentStep !== "name" && (
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}

                  {signupProgress.currentStep !== "password" ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={
                        (signupProgress.currentStep === "name" &&
                          !signupData.name.trim()) ||
                        (signupProgress.currentStep === "email" &&
                          !signupData.email.trim())
                      }
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                        (signupProgress.currentStep === "name" &&
                          !signupData.name.trim()) ||
                        (signupProgress.currentStep === "email" &&
                          !signupData.email.trim())
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02]"
                      }`}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        !signupData.password ||
                        !signupData.confirmPassword
                      }
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                        isLoading ||
                        !signupData.password ||
                        !signupData.confirmPassword
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02]"
                      }`}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </button>
                  )}
                </div>

                {signupProgress.currentStep === "name" && (
                  <>
                    <div className="relative">
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 text-gray-500">OR</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign up with Google
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
