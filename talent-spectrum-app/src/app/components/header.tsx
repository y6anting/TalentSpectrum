"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  setCurrentPage?: (page: string) => void;
}

export default function Header({ setCurrentPage }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: session, status } = useSession();
  // Normalize role to uppercase to avoid casing mismatches (e.g., "employer" vs "EMPLOYER")
  const role = session?.user?.role ? (String(session.user.role).toUpperCase() as "CANDIDATE" | "EMPLOYER") : undefined;

  // Wait until session is loaded
  if (status === "loading") return null;

  // Base nav items
  const base = [
    { href: "/about", label: "About" },
    { href: "/jobListing", label: "Jobs" },
    { href: "/job-coach", label: "Job Coach" },
  ];

  // Job coach link depends on role
  // const jobCoach = {
  //   href: role === "EMPLOYER" ? "/job-coach?role=employer" : "/job-coach?role=candidate",
  //   label: "Job Coach",
  // };

  const jobCoach =
    role === "EMPLOYER"
      ? [{ href: "/job-coach?role=employer", label: "Job Coach" }]
      : role === "CANDIDATE"
      ? [{ href: "/job-coach?role=candidate", label: "Job Coach" }]
      : [];
  
  const dashboards =
    role === "EMPLOYER"
      ? [{ href: "/employer-dashboard", label: "Employer Dashboard" }]
      : role === "CANDIDATE"
      ? [{ href: "/candidate-dashboard", label: "Candidate Dashboard" }]
      : [];

  // Combine all nav items
  const navItems = [...base, ...jobCoach, ...dashboards];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="w-full sticky top-0 z-50 bg-[#E9E8FF]/90 shadow-sm border-b border-indigo-100">
      <div className="w-full px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setCurrentPage?.("home")}
            className="flex items-center gap-3"
          >
            <Image
              src="/TalentSpectrumLogo.png"
              alt="Talent Spectrum Logo"
              width={110}
              height={110}
              className="rounded-md"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-xl font-semibold9 text-base tracking-wide transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-[#635bff] text-white hover:bg-[#524aff]"
                    : "hover:text-[#635bff] text-[#312d7f] hover:bg-violet-100/70 font-semibold"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Area */}
          <div className="hidden md:flex items-center space-x-4">
            {session?.user ? (
              <>
                <span className="text-[#3a4043]">
                  {/* Hi, <span className="font-semibold">{session.user.name ?? "User"}</span> */}
                  Hi, <span className="font-semibold">{role}</span>
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="bg-[#635bff] hover:bg-[#524aff] text-white px-4 py-2 rounded-full font-medium shadow-md transition-all duration-200"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setCurrentPage?.("login")}
                  className="text-[#635bff] hover:text-[#524aff] font-semibold transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  onClick={() => setCurrentPage?.("login")}
                  className="bg-[#635bff] hover:bg-[#524aff] text-white px-4 py-2 rounded-full font-medium shadow-md transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden text-gray-700 hover:text-[#635bff] p-2"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 border-t border-violet-100 bg-white/70 backdrop-blur-xl rounded-lg shadow-md">
            <nav className="flex flex-col space-y-2 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-[#635bff] text-white shadow-sm"
                      : "text-gray-700 hover:bg-violet-100/70 hover:text-[#635bff]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-4 border-t border-violet-100 flex flex-col gap-2">
                {session?.user ? (
                  <>
                    <span className="text-center text-[#3a4043] py-2">
                      Hi, <span className="font-semibold">{session.user.name ?? "User"}</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="text-center bg-[#635bff] hover:bg-[#524aff] text-white py-2 rounded-full font-medium shadow-md transition-all"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center text-[#635bff] hover:text-[#524aff] font-medium py-2 transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center bg-[#635bff] hover:bg-[#524aff] text-white py-2 rounded-full font-medium shadow-md transition-all"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
