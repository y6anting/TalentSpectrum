"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import {
  FileText,
  Users,
  Eye,
  Clock,
  Calculator,
  BotMessageSquare,
  Briefcase,
} from "lucide-react";
import { motion } from "motion/react";

interface RecentApplicant {
  id: number | string;
  candidateName: string;
  jobTitle: string;
  appliedDate: string;
  status: string;
  score?: number;
  accommodationsRequested?: boolean;
}

interface EmployerOverviewProps {
  activeJobs: number;
  totalApplicants: number;
  totalViews: number;
  recentApplicants: RecentApplicant[];
  handleTabChange: (tab: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

export default function EmployerOverview({
  activeJobs,
  totalApplicants,
  totalViews,
  recentApplicants,
  handleTabChange,
  getStatusIcon,
  getStatusBadge,
}: EmployerOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: FileText,
            iconColor: "text-[#635bff]",
            title: "Active Jobs",
            value: activeJobs,
            onClick: () => handleTabChange("jobs"),
          },
          {
            icon: Users,
            iconColor: "text-blue-600",
            title: "Total Applicants",
            value: totalApplicants,
            onClick: () => handleTabChange("search-candidates"),
          },
          {
            icon: Eye,
            iconColor: "text-green-600",
            title: "Total Views",
            value: totalViews,
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{
                boxShadow: "2px 2px 2px rgba(99,91,255,0.3)",
              }}
              className="rounded-xl overflow-hidden hover:cursor-pointer"
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={card.onClick}
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${card.iconColor}`} />
                  <h3 className="font-semibold text-[#3a4043] mb-1">{card.value}</h3>
                  <p className="text-sm text-gray-600">{card.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Applications</CardTitle>
            <div
              className="text-sm text-[#635bff] font-medium hover:underline hover:cursor-pointer"
              onClick={() => handleTabChange("applications")}
            >
              View More
            </div>
          </div>
          {recentApplicants.length === 0 && (
            <CardContent className="p-2 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-gray-600 mb-2">
                No applications yet
              </h3>
              <p className="text-sm text-gray-500">
                Start posting jobs to receive applications!
              </p>
            </CardContent>
          )}
        </CardHeader>
        {recentApplicants.length > 0 && (
          <CardContent>
            <div className="divide-y divide-gray-200">
              {recentApplicants.slice(0, 3).map((app, index) => (
                <motion.div
                  key={app.id}
                  whileHover={{
                    backgroundColor: "rgba(99,91,255,0.04)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`flex items-center justify-between py-3 hover:cursor-pointer`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(app.status)}
                    <div>
                      <h4 className="font-medium text-[#3a4043]">{app.candidateName}</h4>
                      <p className="text-sm text-gray-600">
                        {app.jobTitle} • {app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(app.status)}
                    {app.score && (
                      <p className="text-xs text-gray-500 mt-1">
                        Score: {app.score}%
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Access Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {[
          {
            title: "Calculator",
            subtitle: "Calculate employer costs",
            icon: Calculator,
            tab: "tax-calculator",
          },
          {
            title: "Shortlisted Applicants",
            subtitle: "View all shortlisted candidates",
            icon: Briefcase,
            tab: "applications",
          },
          {
            title: "Consult AI",
            subtitle: "Get AI assistance",
            icon: BotMessageSquare,
            tab: "consult-ai",
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{
                boxShadow: "2px 2px 2px rgba(99,91,255,0.3)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-xl overflow-hidden hover:cursor-pointer"
              onClick={() => handleTabChange(card.tab)}
            >
              <Card className="bg-white/60 border border-gray-200 transition-all duration-300">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <div className="p-4 bg-[#635bff]/10 rounded-full mb-3">
                    <Icon className="h-8 w-8 text-[#635bff]" />
                  </div>
                  <h3 className="font-semibold text-[#3a4043] text-lg mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600">{card.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

