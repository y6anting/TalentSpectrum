"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import {
  Briefcase, Eye, Heart, Clock, CheckCircle, Shield,
  MapPin, DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { Application, CandidateProfile } from "../types";

interface OverviewTabProps {
  applications: Application[];
  savedJobsCount: number;
  candidateProfile: CandidateProfile;
  onTabChange: (tabId: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  applications,
  savedJobsCount,
  candidateProfile,
  onTabChange,
  getStatusIcon,
  getStatusBadge,
}) => {
  const stats = [
    {
      icon: Briefcase,
      iconColor: "text-[#635bff]",
      title: "Applications Submitted",
      value: applications.length,
      targetTab: "applications",
    },
    {
      icon: Eye,
      iconColor: "text-blue-600",
      title: "Profile Views",
      value: 12,
      targetTab: null,
    },
    {
      icon: Heart,
      iconColor: "text-red-500",
      title: "Saved Jobs",
      value: savedJobsCount,
      targetTab: "saved",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((card, idx) => {
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
                if (card.targetTab) {
                  onTabChange(card.targetTab);
                }
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

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Applications</CardTitle>
          </div>
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
                className={`flex items-center justify-between py-3 hover:cursor-pointer`}
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
                      className="bg-purple-100 text-purple-800 flex items-center gap-1"
                    >
                      <Shield className="h-3 w-3" />
                      Accommodations
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  {getStatusBadge(app.status)}
                  <p className="text-xs text-gray-500 mt-1">Score: {app.score}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Your Accommodations Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {candidateProfile.accommodations.map((accommodation, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-[#3a4043]">{accommodation}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4">
            Update Accommodations
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
