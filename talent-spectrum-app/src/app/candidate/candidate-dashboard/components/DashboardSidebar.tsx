"use client";

import React from "react";
import { Card, CardContent } from "@/app/components/card";
import {
  User, Briefcase, Heart, Settings, Book, House,
  BrainCircuit, HandFist, LetterTextIcon, UserStar,
  MessagesSquare, CalendarClock, FileText, LayoutDashboard,
  Search
} from "lucide-react";
import { CandidateProfile } from "../types";

interface DashboardSidebarProps {
  candidateProfile: CandidateProfile;
  activeTab: string;
  openDropdowns: Record<string, boolean>;
  onTabChange: (tabId: string) => void;
  onDropdownToggle: (itemId: string) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  candidateProfile,
  activeTab,
  openDropdowns,
  onTabChange,
  onDropdownToggle,
}) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "browse jobs", label: "Browse Jobs", icon: Search },
    { id: "applications", label: "My Applications", icon: LetterTextIcon },
    { id: "saved", label: "Saved Jobs", icon: Heart },
    {
      id: "profile",
      label: "Profile Settings",
      icon: Settings,
      children: [
        { id: "profile config", label: "Profile Data", icon: User },
        { id: "education", label: "Education", icon: Book },
        { id: "experience", label: "Experience", icon: Briefcase },
        { id: "skills", label: "Skills", icon: HandFist },
        { id: "neuro_strength", label: "Neurodivergent Strengths", icon: BrainCircuit },
        { id: "environment", label: "Preferred Environment", icon: House },
      ],
    },
    {
      id: "job coach",
      label: "Job Coach",
      icon: UserStar,
      children: [
        { id: "mock interview", label: "Mock Interview", icon: MessagesSquare },
        { id: "Appointment", label: "Appointment", icon: CalendarClock },
        { id: "Report", label: "Report", icon: FileText },
      ],
    },
  ];

  return (
    <div className="sticky top-[var(--app-header-height)] self-start">
      <div className="lg:sticky lg:top-[calc(var(--app-header-height)+16px)]">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold">
                {candidateProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-[#635bff]">{candidateProfile.name}</h3>
                <p className="text-sm text-gray-600">{candidateProfile.email}</p>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#635bff]">Profile Completion</span>
                <span className="text-sm font-medium text-[#635bff]">{candidateProfile.profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#635bff] h-2 rounded-full"
                  style={{ width: `${candidateProfile.profileCompletion}%` }}
                />
              </div>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = Boolean(item.children);
                const isOpen = !!openDropdowns[item.id];

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          onDropdownToggle(item.id);
                        } else {
                          onTabChange(item.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === item.id
                          ? "bg-[#635bff] text-white"
                          : "text-[#3a4043] hover:bg-gray-100"
                      } hover:cursor-pointer`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </div>

                      {hasChildren && (
                        <svg
                          className={`h-4 w-4 transform transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {hasChildren && isOpen && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <button
                              key={child.id}
                              onClick={() => onTabChange(child.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
                                activeTab === child.id
                                  ? "bg-[#635bff] text-white"
                                  : "text-[#3a4043] hover:bg-gray-100"
                              } hover:cursor-pointer`}
                            >
                              <ChildIcon className="h-4 w-4" />
                              {child.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
