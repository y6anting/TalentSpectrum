"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

// ============================================================================
// CONFIGURATION - User Type Settings
// ============================================================================
// Customize labels, titles, descriptions, and dashboard routes for each user type
const USER_TYPE_CONFIG = {
  candidate: {
    label: "Job Seeker",
    title: "Find Your Perfect Role",
    description:
      "Join our platform designed for neurodivergent professionals to thrive in inclusive workplaces.",
    dashboard: "candidate/candidate-dashboard",
  },
  employer: {
    label: "Employer",
    title: "Discover Top Talent",
    description:
      "Build diverse teams with our neurodivergent-friendly hiring platform.",
    dashboard: "employer/employer-dashboard",
  },
  "job-coach": {
    label: "Job Coach",
    title: "Guide & Support Talent",
    description:
      "Help neurodivergent professionals succeed and support inclusive employers.",
    dashboard: "job-coach/dashboard",
  },
} as const;

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================
// Input Field Component - Reusable text/email/password input
const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = true,
}: {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}) => (
  <div className="mb-4 ">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    {/* INPUT FIELD STYLING - Minimal and clean design */}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-[#635bff] outline-none transition-all text-gray-900 bg-transparent placeholder:text-gray-400"
      placeholder={placeholder}
    />
  </div>
);

// Divider Component - "or" separator line
const Divider = () => (
  <div className="my-6 flex items-center">
    <div className="flex-grow border-t border-[#e8e6f0]" />
    <span className="mx-2 text-sm text-[#3a4043]">or</span>
    <div className="flex-grow border-t border-[#e8e6f0]" />
  </div>
);

// Google Sign In Button Component
const GoogleButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 bg-white border border-[#e8e6f0] hover:bg-[#faf9f7] text-[#3a4043] font-medium py-2.5 rounded-lg transition-colors"
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
    Continue with Google
  </button>
);

// ============================================================================
// MAIN LOGIN PAGE COMPONENT
// ============================================================================
const LoginPage = () => {
  const router = useRouter();

  // ----------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<TabType>("login");
  const [userType, setUserType] = useState<UserType>("candidate");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  // ----------------------------------------------------------------------------
  // EFFECTS - Header Management & Authentication Check
  // ----------------------------------------------------------------------------
  // Hide navigation header on login page and restore it when leaving
  useEffect(() => {
    const header = document.querySelector("header") as HTMLElement;

    if (header) {
      document.body.classList.add("hide-header");
      header.style.display = "none";
    }

    // // Redirect authenticated users to dashboard
    // getSession().then((session) => {
    //   if (session) router.push("/dashboard/candidate-dashboard");
    // });

    // Cleanup: restore header when component unmounts
    return () => {
      if (header) {
        document.body.classList.remove("hide-header");
        header.style.display = "";
      }
    };
  }, [router]);

  // ----------------------------------------------------------------------------
  // FORM INPUT HANDLERS
  // ----------------------------------------------------------------------------
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
  };

  // ----------------------------------------------------------------------------
  // NAVIGATION HELPER
  // ----------------------------------------------------------------------------
  const redirectToDashboard = () => {
    router.push(`/${USER_TYPE_CONFIG[userType].dashboard}`);
  };

  // ----------------------------------------------------------------------------
  // FORM SUBMISSION HANDLERS
  // ----------------------------------------------------------------------------
  // Handle Login Form Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        userType: userType,
        redirect: false, // we handle redirect manually
      });
  
      if (result?.ok) {
        // get updated session
        const session = await getSession();
  
        if (!session?.user?.role) {
          setError("User role not found.");
          return;
        }
  
        // Redirect based on role using USER_TYPE_CONFIG
        if (session.user.role === "EMPLOYER") {
          router.push(`/${USER_TYPE_CONFIG.employer.dashboard}`);
        } else if (session.user.role === "CANDIDATE") {
          router.push(`/${USER_TYPE_CONFIG.candidate.dashboard}`);
        } else if (session.user.role === "JOB_COACH") {
          router.push(`/${USER_TYPE_CONFIG["job-coach"].dashboard}`);
        } else {
          router.push("/"); // fallback
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

  // Handle Sign Up Form Submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password match
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Register new user
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
        // Auto-login after successful registration
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

  // Handle Google Sign In
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: `/${USER_TYPE_CONFIG[userType].dashboard}` });
  };

  // ----------------------------------------------------------------------------
  // USER TYPE TOGGLE
  // ----------------------------------------------------------------------------
  const toggleUserType = (newType?: "candidate" | "employer" | "job-coach") => {
    setUserType((prev) => {
      if (newType && newType !== prev) return newType;
  
      // Define all roles for easier management
      const roles: ("candidate" | "employer" | "job-coach")[] = [
        "candidate",
        "employer",
        "job-coach",
      ];
  
      // Cycle to the next role in order
      const currentIndex = roles.indexOf(prev);
      const nextIndex = (currentIndex + 1) % roles.length;
      return roles[nextIndex];
    });
  };

  // ----------------------------------------------------------------------------
  // PROGRESSIVE SIGNUP HANDLERS
  // ----------------------------------------------------------------------------
  const handleNextStep = () => {
    const { currentStep, completedSteps } = signupProgress;

    // Validate current step before proceeding
    if (currentStep === "name" && signupData.name.trim()) {
      setSignupProgress({
        currentStep: "email",
        completedSteps: [...completedSteps, "name"],
      });
    } else if (currentStep === "email" && signupData.email.trim()) {
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
  };

  // Get current user type configuration
  const currentConfig = USER_TYPE_CONFIG[userType];

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <>
      {/* CSS to hide navigation header on login page and add animations */}
      <style
        dangerouslySetInnerHTML={{
          //to ensure the nav bar doesnt show on login page and add fade animation
          __html: `
          body.hide-header header,
          body header {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
        `,
        }}
      />

      <div className="min-h-screen h-screen overflow-hidden bg-white flex">
        {/* ====================================================================
            LEFT SIDE - ILLUSTRATION PANEL
            To change gradient colors, modify: from-[#color] to-[#color]
            ==================================================================== */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#3a075a] to-[#635bff] p-12 flex-col justify-between">
          {/* Brand Header */}
          <div>
            <Image
              src="/TalentSpectrumLogoDark.png"
              alt="TalentSpectrum"
              width={300}
              height={100}
              className="mb-4"
              priority
            />
            <p className="text-white/90 text-lg">
              Connecting diverse talent with inclusive opportunities
            </p>
          </div>

          {/* Center Content - Dynamic based on signup progress or user type */}
          <div className="flex-1 flex items-center justify-center ">
            {activeTab === "signup" ? (
              // Progressive Signup Steps Display
              <div className="text-center w-full max-w-md">
                {/* Progress Indicator */}
                <div className="mb-8">
                  <div className="flex justify-center items-center gap-3 mb-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        signupProgress.completedSteps.includes("name")
                          ? "bg-white"
                          : signupProgress.currentStep === "name"
                          ? "bg-white/70 ring-2 ring-white/30"
                          : "bg-white/30"
                      }`}
                    />
                    <div
                      className={`w-3 h-3 rounded-full ${
                        signupProgress.completedSteps.includes("email")
                          ? "bg-white"
                          : signupProgress.currentStep === "email"
                          ? "bg-white/70 ring-2 ring-white/30"
                          : "bg-white/30"
                      }`}
                    />
                    <div
                      className={`w-3 h-3 rounded-full ${
                        signupProgress.completedSteps.includes("password")
                          ? "bg-white"
                          : signupProgress.currentStep === "password"
                          ? "bg-white/70 ring-2 ring-white/30"
                          : "bg-white/30"
                      }`}
                    />
                  </div>
                </div>

                {/* Step-specific content */}
                {signupProgress.currentStep === "name" && (
                  <div className="animate-fadeIn">
                    {/* <div className="text-7xl mb-6">🌋</div> */}
                    <h2 className="text-white text-4xl font-bold mb-4">
                      Your Journey Starts Here!
                    </h2>
                    <p className="text-white/90 text-lg">
                      Join thousands finding their perfect match
                    </p>
                  </div>
                )}

                {signupProgress.currentStep === "email" && (
                  <div className="animate-fadeIn">
                    {/* <div className="text-7xl mb-6">💫</div> */}
                    <h2 className="text-white text-4xl font-bold mb-4">
                      Great to meet you, {signupData.name}!
                    </h2>
                    <p className="text-white/90 text-lg">
                      You're one step closer to amazing opportunities
                    </p>
                  </div>
                )}

                {signupProgress.currentStep === "password" && (
                  <div className="animate-fadeIn">
                    {/* <div className="text-7xl mb-6">🎉</div> */}
                    <h2 className="text-white text-4xl font-bold mb-4">
                      Almost Ready to Shine!
                    </h2>
                    <p className="text-white/90 text-lg">
                      Your dream job is just moments away
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Login View - Simple Welcome Back message
              // <div className="text-center">
              //   {/* <div className="text-9xl mb-6">🌻</div> */}
              //   <h2 className="text-white text-7xl font-bold">Welcome Back</h2>
              // </div>
            <div className="relative w-full flex flex-col items-center justify-center text-center px-4 pt-20">
                {/* Text Content */}
                <h2 className="text-white text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold drop-shadow-lg mb-6">
                  Welcome Back
                </h2>

                {/* <img
                  src="/zzz.gif"
                  alt="Cute cat"
                  className="w-60 sm:w-72 md:w-96 lg:w-[500px] h-auto rounded-2xl object-contain"
                /> */}
              </div>
                )}
              </div>
            </div>

            

        {/* ====================================================================
            RIGHT SIDE - FORM CONTAINER
            Change background color with: bg-[#color]
            ==================================================================== */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-b from-violet-50 to-background">
          <div className="max-w-md w-full">
            {/* User Type Badge - Shows current user type (Job Seeker/Employer) */}
            <div className="text-center mb-8 text-4xl font-semibold text-gray-600">
              Hello, <span className="inline-block rounded-xl text-4xl font-semibold text-[#635bff] mb-7">
                {currentConfig.label}.
              </span>
              <div className="flex justify-center gap-3">
                {[
                  { type: "candidate", label: "Job Seeker" },
                  { type: "employer", label: "Employer" },
                  { type: "job-coach", label: "Job Coach" },
                ].map(({ type, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      toggleUserType(type as "candidate" | "employer" | "job-coach")
                    }
                    className={`px-5 py-2 text-sm font-medium rounded-full border transition-all duration-200 hover:cursor-pointer ${
                      userType === type
                        ? "bg-[#635bff] text-white border-[#635bff] shadow-md"
                        : "text-[#635bff] border-[#635bff] hover:bg-[#635bff]/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
              

            {/* ================================================================
                TAB SWITCHER - Login / Sign up tabs
                Change active tab colors: text-[#color] border-[#color]
                ================================================================ */}
            <div className="flex mb-8 border-b border-[#e8e6f0]">
              {(["login", "signup"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === "signup") {
                      resetSignupProgress();
                    }
                    setError("");
                  }}
                  className={`flex-1 pb-3 text-center font-semibold transition-all ${
                    activeTab === tab
                      ? "text-[#635bff] border-b-2 border-[#635bff]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* ================================================================
                LOGIN FORM
                ================================================================ */}
            {activeTab === "login" && (
              <>
                {/* Login Heading - Change color: text-[#color]
                <h2 className="text-3xl font-bold text-[#0d0d0e] mb-6 text-center">
                   Welcome Back
                </h2> */}

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <InputField
                    label="Email"
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginInputChange}
                    placeholder="your@email.com"
                  />

                  <InputField
                    label="Password"
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    placeholder="••••••••"
                  />

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      {/* Checkbox - Change color: text-[#color] focus:ring-[#color] */}
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={loginData.rememberMe}
                        onChange={handleLoginInputChange}
                        className="rounded border-[#e8e6f0] text-[#635bff] focus:ring-[#635bff]"
                      />
                      <span className="ml-2 text-sm text-[#3a4043]">
                        Remember me
                      </span>
                    </label>
                    {/* Forgot Password Link - Change color: text-[#color] */}
                    <a
                      href="#"
                      className="text-sm text-[#0d0d0e] hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Login Button - Change colors: bg-[#color] hover:bg-[#color] */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#635bff] hover:bg-[#4f46e5] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 mt-8"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <Divider />
                <GoogleButton onClick={handleGoogleSignIn} />
              </>
            )}

            {/* ================================================================
                PROGRESSIVE SIGN UP FORM - Shows one step at a time
                ================================================================ */}
            {activeTab === "signup" && (
              <>
                {/* Step 1: Name */}
                {signupProgress.currentStep === "name" && (
                  <div className="space-y-6">
                    <InputField
                      label="Full Name"
                      name="name"
                      value={signupData.name}
                      onChange={handleSignupInputChange}
                      placeholder="John Doe"
                    />

                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!signupData.name.trim()}
                      className="w-full bg-[#635bff] hover:bg-[#4f46e5] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                    >
                      Continue
                    </button>

                    <Divider />
                    <GoogleButton onClick={handleGoogleSignIn} />
                  </div>
                )}

                {/* Step 2: Email */}
                {signupProgress.currentStep === "email" && (
                  <div className="space-y-6">
                    {/* Back button */}
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      ← Back
                    </button>

                    <InputField
                      label="Email"
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupInputChange}
                      placeholder="your@email.com"
                    />

                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!signupData.email.trim()}
                      className="w-full bg-[#635bff] hover:bg-[#4f46e5] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                    >
                      Continue
                    </button>
                  </div>
                )}

                {/* Step 3: Password */}
                {signupProgress.currentStep === "password" && (
                  <form onSubmit={handleSignupSubmit} className="space-y-6">
                    {/* Back button */}
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      ← Back
                    </button>

                    <InputField
                      label="Password"
                      type="password"
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupInputChange}
                      placeholder="••••••••"
                    />

                    <InputField
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      value={signupData.confirmPassword}
                      onChange={handleSignupInputChange}
                      placeholder="••••••••"
                    />

                    {/* Sign Up Button - Change colors: bg-[#color] hover:bg-[#color] */}
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        !signupData.password.trim() ||
                        !signupData.confirmPassword.trim()
                      }
                      className="w-full bg-[#635bff] hover:bg-[#4f46e5] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* ================================================================
                USER TYPE TOGGLE - Switch between Job Seeker/Employer/Job Coach
                Change text/button colors: text-[#color] hover:text-[#color]
                ================================================================ */}
            {/* <div className="mt-6 pt-6 border-t border-[#e8e6f0]"> */}
              {/* <p className="text-center text-md text-gray-600 mb-3">
                {userType === "candidate"
                  ? "Are you an employer or job coach?"
                  : userType === "employer"
                  ? "Are you a job seeker or job coach?"
                  : "Are you a job seeker or employer?"}
              </p> */}
              

            {/* </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
