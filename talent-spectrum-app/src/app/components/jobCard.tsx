"use client";

import React from "react";
import { MapPin, Clock, DollarSign, Heart, Home, Shield } from "lucide-react";
import { Button } from "@/app/components/button";
import { Badge } from "@/app/components/badge";
import { Card, CardContent, CardHeader } from "@/app/components/card";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    isRemote: boolean;
    isFlexible: boolean;
    hasAccommodations: boolean;
    isInclusive: boolean;
    description: string;
    posted: string;
  };
  onJobClick?: (jobId: string) => void;
  viewMode?: "grid" | "list";
}

export default function JobCard({
  job,
  onJobClick,
  viewMode = "grid",
}: JobCardProps) {
  const handleClick = () => {
    if (onJobClick) onJobClick(job.id);
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-200 ${
        viewMode === "list" ? "mb-4" : ""
      }`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div
          className={`flex ${
            viewMode === "list"
              ? "items-center justify-between"
              : "flex-col gap-2"
          }`}
        >
          <div className={viewMode === "list" ? "flex-1" : ""}>
            <h3 className="mb-1 font-semibold">{job.title}</h3>
            <p className="text-muted-foreground">{job.company}</p>
          </div>

          {viewMode === "list" && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {job.salary}
              </div>
              <span>{job.posted}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {viewMode === "grid" && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {job.type}
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              {job.salary}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {job.description}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {job.isRemote && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Home className="h-3 w-3 mr-1" />
              Remote
            </Badge>
          )}
          {job.isFlexible && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Clock className="h-3 w-3 mr-1" />
              Flexible
            </Badge>
          )}
          {job.hasAccommodations && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Shield className="h-3 w-3 mr-1" />
              Accommodations
            </Badge>
          )}
          {job.isInclusive && (
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-800"
            >
              <Heart className="h-3 w-3 mr-1" />
              Inclusive
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Posted {job.posted}
          </span>
          <Button size="sm" onClick={handleClick}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
