"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  setCurrentPage?: (page: string) => void; 
}

export default function Header({ setCurrentPage }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/about", label: "About" },
    { href: "/jobListing", label: "Jobs" },
    // { href: "/JobCoach", label: "Job Coach" },
    { href: "/candidate-dashboard", label: "Job Seeker" },
    // { href: "/contact", label: "Contact" },
    {href: "/employer-dashboard", label: "Employer"}
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="w-full sticky top-0 z-50 bg-[#e8e7ff]/80 backdrop-blur-lg border-b border-gray-200 shadow-[0_4px_12px_rgba(99,91,255,0.15)]">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setCurrentPage?.("home")}
            className="flex items-center gap-2"
          >
            <Image
              src="/TalentSpectrumLogo.png"
              alt="Talent Spectrum Logo"
              width={100}
              height={100}
              className="rounded-md"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-2 rounded-full font-semibold tracking-wide transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-[#635bff] text-white shadow hover:bg-[#524aff]"
                    : "hover:text-[#635bff] text-gray-700  hover:bg-violet-100/70"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              onClick={() => setCurrentPage?.("login")}
              className="text-[#635bff] hover:text-[#524aff] font-semibold transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/role-selection"
              onClick={() => setCurrentPage?.("role-selection")}
              className="bg-[#635bff] hover:bg-[#524aff] text-white px-4 py-2 rounded-full font-medium shadow-sm transition-all duration-200"
            >
              Get Started
            </Link>
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
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}