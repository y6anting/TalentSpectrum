"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Bell, Settings } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/discover", label: "Discover" },
    { href: "/jobListing", label: "Jobs" },
    { href: "/about", label: "About" },
    // { href: "/contact", label: "Contact" },
    {href: "dashboard", label: "Dashboard"}
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="w-full bg-[#f5faf7] backdrop-blur-md border-b border-[#e8e6f0] sticky top-0 z-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/TalentSpectrumLogo.png"
              alt="Talent Spectrum Logo"
              width={100}
              height={100}
              className="rounded-md"
            />
           
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  isActive(item.href)
                    ? "text-[#6b8a7a] font-medium"
                    : "text-[#3a4043] hover:text-[#6b8a7a]"
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
              className="text-[#6b8a7a] hover:text-[#5d7c6b] font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/role-selection"
              className="bg-[#3b6b3d] hover:bg-[#508D4E] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#3a4043] hover:text-[#6b8a7a] p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#e8e6f0] bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 transition-colors ${
                    isActive(item.href)
                      ? "text-[#6b8a7a] font-medium bg-[#6b8a7a]/10"
                      : "text-[#3a4043] hover:text-[#6b8a7a] hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-4 pt-3 border-t border-[#e8e6f0] space-y-2">
                <Link
                  href="/dashboard"
                  className="block w-full text-center text-[#6b8a7a] hover:text-[#5d7c6b] font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/login"
                  className="block w-full text-center text-[#6b8a7a] hover:text-[#5d7c6b] font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/role-selection"
                  className="block w-full text-center bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
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
