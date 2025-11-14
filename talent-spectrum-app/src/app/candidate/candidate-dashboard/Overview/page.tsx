"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import {
  Briefcase, Heart, Eye, Shield, Search, Calendar, Video, FileText
} from "lucide-react";
import { motion } from "framer-motion";

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  location: string;
  status: string;
  accommodationsRequested?: boolean;
  primaryMatchScore?: number;
  secondaryMatchScore?: number;
  tertiaryMatchScore?: number;
}

interface SavedJob {
  id: number;
}

interface OverviewPageProps {
  applications: Application[];
  savedJobs: SavedJob[];
  handleTabChange: (tab: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

export default function OverviewPage({
  applications,
  savedJobs,
  handleTabChange,
  getStatusIcon,
  getStatusBadge,
}: OverviewPageProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: Briefcase,
            iconColor: "text-[#635bff]",
            title: "Applications Submitted",
            value: applications.length,
          },
          {
            icon: Eye,
            iconColor: "text-blue-600",
            title: "Profile Views",
            value: 12,
          },
          {
            icon: Heart,
            iconColor: "text-red-500",
            title: "Saved Jobs",
            value: savedJobs.length,
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
              onClick={() => {
                card.icon == Briefcase
                  ? handleTabChange("applications")
                  : card.icon == Heart
                    ? handleTabChange("saved")
                    : null;
              }}
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
          {applications.length === 0 && (
            <CardContent className="p-2 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-gray-600 mb-2">
                No applications yet
              </h3>
              <p className="text-sm text-gray-500">
                Apply for jobs in 'Browse Jobs' to see them here!
              </p>
            </CardContent>
          )}
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-200">
            {applications.slice(0, 3).map((app, index) => (
              <motion.div
                key={app.id}
                whileHover={{
                  backgroundColor: "rgba(99,91,255,0.04)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`flex items-center justify-between py-3 ${
                  index === 0 ? "" : ""
                } hover:cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(app.status)}
                  <div>
                    <h4 className="font-medium text-[#3a4043]">{app.jobTitle}</h4>
                    <p className="text-sm text-gray-600">
                      {app.company} • {app.location}
                    </p>
                  </div>
                  {app.accommodationsRequested && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-[#635BFF] flex items-center gap-1"
                    >
                      <Shield className="h-3 w-3" />
                      Accommodations
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  {getStatusBadge(app.status)}
                  <p className="text-xs text-gray-500 mt-1">
                    Score:{" "}
                    {Math.round(
                      ((app.primaryMatchScore || 96) +
                        (app.secondaryMatchScore || 90) +
                        (app.tertiaryMatchScore || 85)) /
                        3
                    )}
                    %
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
  {[
    {
      title: "Mock Interview",
      subtitle: "Practice your interview skills",
      icon: Video,
      tab: "mock interview",
    },
    {
      title: "Appointments",
      subtitle: "Book job coach session",
      icon: Calendar,
      tab: "Appointment",
    },
    {
      title: "Reports",
      subtitle: "View your performance",
      icon: FileText,
      tab: "Report",
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
        className="rounded-xl overflow-hidden hover:cursor-pointer "
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
