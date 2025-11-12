"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import {
  Briefcase, MapPin, DollarSign, ChevronDown, ChevronUp, Eye, X,
  Calendar, Building2, Target, Shield, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Application } from "../types";

interface ApplicationsTabProps {
  applications: Application[];
  expandedApplicationId: string | null;
  onToggleExpand: (id: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  applications,
  expandedApplicationId,
  onToggleExpand,
  getStatusIcon,
  getStatusBadge,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Applications</CardTitle>
            <Badge variant="secondary" className="bg-[#635bff] text-white">
              {applications.length} {applications.length === 1 ? "Application" : "Applications"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start applying to jobs that match your skills and preferences
              </p>
              <Button className="bg-[#635bff] hover:bg-[#4f46e5] text-white">
                Browse Jobs
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg overflow-hidden"
                >
                  <Card>
                    <CardContent className="p-6">
                      {/* Always Visible Summary */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(app.status)}
                              <h3 className="font-semibold text-lg text-[#3a4043]">
                                {app.jobTitle}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                <span>{app.company}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{app.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(app.status)}
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                              <Target className="h-4 w-4" />
                              <span>Match: {app.score}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Applied: {app.appliedDate}</span>
                          </div>
                          {app.accommodationsRequested && (
                            <Badge
                              variant="secondary"
                              className="bg-purple-100 text-purple-800 flex items-center gap-1"
                            >
                              <Shield className="h-3 w-3" />
                              Accommodations Requested
                            </Badge>
                          )}
                        </div>

                        {/* Expandable Details Section */}
                        <AnimatePresence>
                          {expandedApplicationId === String(app.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 border-t space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-[#3a4043] mb-2">
                                      Job Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-gray-600" />
                                        <span>Salary: {app.salary}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-gray-600" />
                                        <span>Status: {app.status}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-[#3a4043] mb-2">
                                      Application Info
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-600" />
                                        <span>Submitted: {app.appliedDate}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-gray-600" />
                                        <span>Match Score: {app.score}%</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {app.accommodationsRequested && (
                                  <div>
                                    <h4 className="font-medium text-[#3a4043] mb-2 flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-purple-600" />
                                      Requested Accommodations
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      You've requested workplace accommodations for this position.
                                      The employer will review your requirements during the hiring process.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Toggle Button */}
                        <Button
                          variant="outline"
                          onClick={() => onToggleExpand(String(app.id))}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          {expandedApplicationId === String(app.id) ? (
                            <>
                              <X className="h-4 w-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              View Details
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
