import React from 'react';
import { Separator } from '@/app/components/separator';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "For Job Seekers",
      links: [
        { label: "Browse Jobs", page: "jobs" },
        { label: "Candidate Dashboard", page: "dashboard" },
        { label: "Accessibility Features", page: "accessibility" }
      ]
    },
    {
      title: "For Employers", 
      links: [
        { label: "Post a Job", page: "post-job" },
        { label: "Employer Dashboard", page: "employer-dashboard" },
        { label: "Inclusive Hiring", page: "employers" }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "About Talent Spectrum", page: "about" },
        { label: "Neurodiversity Guide", page: "guide" },
        { label: "Success Stories", page: "stories" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", page: "help" },
        { label: "Contact Us", page: "contact" },
        { label: "Accessibility Statement", page: "accessibility-statement" }
      ]
    }
  ];

  return (
    <footer className="bg-card border-t-1 border-violet-400 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => setCurrentPage(link.page)}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          {/* Brand and Mission */}
          <div className="max-w-md">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs">TS</span>
              </div>
              <span className="text-foreground">Talent Spectrum</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connecting neurodivergent talent with inclusive employers. 
              Building a more accessible and understanding workplace for everyone.
            </p>
          </div>

          {/* Legal and Compliance */}
          <div className="flex flex-col lg:items-end space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <button
                onClick={() => setCurrentPage('privacy')}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setCurrentPage('terms')}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setCurrentPage('accessibility-statement')}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                Accessibility
              </button>
            </div>
            <p className="text-muted-foreground text-sm">
              © {currentYear} Talent Spectrum. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}