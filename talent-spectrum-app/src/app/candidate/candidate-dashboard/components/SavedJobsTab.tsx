"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import {
  Briefcase, MapPin, DollarSign, Heart, Eye, X, Trash2,
  Building2, Clock, CheckCircle, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SavedJob } from "../types";

interface SavedJobsTabProps {
  savedJobs: SavedJob[];
  expandedSavedJobId: string | null;
  isApplyingFromSaved: string | null;
  onToggleExpand: (id: string) => void;
  onRemoveSavedJob: (jobId: string) => Promise<void>;
  onApplyToSavedJob: (job: SavedJob) => Promise<void>;
  onNavigateToBrowseJobs: () => void;
}

export const SavedJobsTab: React.FC<SavedJobsTabProps> = ({
  savedJobs,
  expandedSavedJobId,
  isApplyingFromSaved,
  onToggleExpand,
  onRemoveSavedJob,
  onApplyToSavedJob,
  onNavigateToBrowseJobs,
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Saved Jobs</CardTitle>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {savedJobs.length} {savedJobs.length === 1 ? "Job" : "Jobs"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {savedJobs.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No saved jobs yet
              </h3>
              <p className="text-gray-600 mb-4">
                Save jobs you're interested in to review and apply later
              </p>
              <Button
                className="bg-[#635bff] hover:bg-[#4f46e5] text-white"
                onClick={onNavigateToBrowseJobs}
              >
                Browse Jobs
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedJobs.map((job) => (
                <motion.div
                  key={job.id}
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
                              <Briefcase className="h-5 w-5 text-[#635bff]" />
                              <h3 className="font-semibold text-lg text-[#3a4043]">
                                {job.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                <span>{job.company}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveSavedJob(String(job.id))}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.type}</span>
                          </div>
                          {job.isInclusive && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Inclusive Employer
                            </Badge>
                          )}
                        </div>

                        {/* Expandable Details Section */}
                        <AnimatePresence>
                          {expandedSavedJobId === String(job.id) && (
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
                                        <span>Salary: {job.salary}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-600" />
                                        <span>Type: {job.type}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-600" />
                                        <span>Location: {job.location}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-[#3a4043] mb-2">
                                      Company Info
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-gray-600" />
                                        <span>{job.company}</span>
                                      </div>
                                      {job.isInclusive && (
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                          <span className="text-green-700">
                                            Certified Inclusive Employer
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Apply Now Button */}
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => onApplyToSavedJob(job)}
                                    disabled={isApplyingFromSaved === String(job.id)}
                                    className="bg-[#635bff] hover:bg-[#4f46e5] text-white flex-1"
                                  >
                                    {isApplyingFromSaved === String(job.id) ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Applying...
                                      </>
                                    ) : (
                                      "Apply Now"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Toggle Button */}
                        <Button
                          variant="outline"
                          onClick={() => onToggleExpand(String(job.id))}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          {expandedSavedJobId === String(job.id) ? (
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
