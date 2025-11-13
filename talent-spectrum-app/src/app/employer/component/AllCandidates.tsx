"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Input } from "@/app/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";
import {
  Users,
  Search,
  MapPin,
  Briefcase,
  Star,
  Eye,
  Download,
  Shield,
  Filter,
} from "lucide-react";
import { motion } from "motion/react";

export default function AllCandidates() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExperience, setFilterExperience] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  useEffect(() => {
    fetchAllCandidates();
  }, []);

  const fetchAllCandidates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/profiles/`);
      if (!res.ok) throw new Error(`Failed to fetch profiles: ${res.status}`);
      const data = await res.json();
      
      const mapped = (Array.isArray(data) ? data : []).map((p: any) => {
        const hardSkills = (p.exp_skill?.HardSkills || "").split(",").map((s: string) => s.trim()).filter(Boolean);
        const softSkills = (p.exp_skill?.SoftSkills || "").split(",").map((s: string) => s.trim()).filter(Boolean);
        const skills = [...new Set([...hardSkills, ...softSkills])];
        
        const strengths = Object.entries(p.environment || {})
          .filter(([_, v]) => {
            if (typeof v === "string") return v.trim().length > 0;
            if (v === null || v === undefined) return false;
            return Boolean(v);
          })
          .map(([k]) => k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim());
        
        const accommodationsRequested = Array.isArray(p.accommodations) && p.accommodations.length > 0;
        
        return {
          id: String(p.id ?? p.email ?? Math.random().toString(36).slice(2)),
          email: p.email ?? "",
          name: p.name ?? "Unnamed",
          title: p.exp_skill?.RoleTitle ?? "Candidate",
          location: p.location ?? "",
          experience: p.exp_skill?.YearsInRole ? `${p.exp_skill.YearsInRole} years` : "N/A",
          yearsInRole: p.exp_skill?.YearsInRole ?? 0,
          skills,
          status: "available",
          accommodationsRequested,
          accommodationDetails: accommodationsRequested ? (Array.isArray(p.accommodations) ? p.accommodations.join(", ") : String(p.accommodations)) : "",
          portfolio: p.personal_identifiers?.linkedin ?? "",
          availability: p.job_preferences?.availability ?? "",
          workType: p.preferences?.workType ?? "",
          neurodivergentStrengths: strengths,
          rawProfile: p,
        };
      });
      
      setCandidates(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to load candidates");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = !searchTerm || 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesExperience = filterExperience === "all" || 
      (filterExperience === "0-2" && candidate.yearsInRole <= 2) ||
      (filterExperience === "3-5" && candidate.yearsInRole >= 3 && candidate.yearsInRole <= 5) ||
      (filterExperience === "5+" && candidate.yearsInRole > 5);
    
    const matchesLocation = filterLocation === "all" || 
      candidate.location.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesExperience && matchesLocation;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bff] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={fetchAllCandidates}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[#3a4043] mb-4">Candidate Pool</h2>
      </div>

      {/* Filters */}
      <Card className="mb-3">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6f7a80] w-4 h-4" />
                <Input
                  placeholder="Search candidates by name, role, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Select value={filterExperience} onValueChange={setFilterExperience}>
                <SelectTrigger className="w-fit">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience</SelectItem>
                  <SelectItem value="0-2">0-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5+">5+ years</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger className="w-fit">
                  <MapPin className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="kuala lumpur">Kuala Lumpur</SelectItem>
                  <SelectItem value="selangor">Selangor</SelectItem>
                  <SelectItem value="penang">Penang</SelectItem>
                  <SelectItem value="johor">Johor</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-6 ml-2">
        <p className="text-[#6f7a80] text-sm">
          Showing {filteredCandidates.length} of {candidates.length} candidates
        </p>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidates.map((candidate, index) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{candidate.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{candidate.title}</p>
                  </div>
                  {candidate.accommodationsRequested && (
                    <div title="Accommodations Requested">
                      <Shield className="h-5 w-5 text-[#635bff]" />
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{candidate.location || "Location not specified"}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  <span>{candidate.experience}</span>
                </div>

                {/* Skills */}
                {candidate.skills.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs bg-[#635bff]/10 text-[#635bff]">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{candidate.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Neurodivergent Strengths */}
                {candidate.neurodivergentStrengths.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Strengths
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.neurodivergentStrengths.slice(0, 2).map((strength: string) => (
                        <Badge key={strength} variant="outline" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                      {candidate.neurodivergentStrengths.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.neurodivergentStrengths.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  {candidate.portfolio && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(candidate.portfolio, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No candidates found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{selectedCandidate.name}</CardTitle>
                  <p className="text-gray-600 mt-1">{selectedCandidate.title}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedCandidate(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{selectedCandidate.location || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{selectedCandidate.experience}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Work Type</p>
                  <p className="font-medium">{selectedCandidate.workType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Availability</p>
                  <p className="font-medium">{selectedCandidate.availability || "N/A"}</p>
                </div>
              </div>

              {selectedCandidate.skills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="bg-[#635bff]/10 text-[#635bff]">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedCandidate.neurodivergentStrengths.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Neurodivergent Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.neurodivergentStrengths.map((strength: string) => (
                      <Badge key={strength} variant="outline">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedCandidate.accommodationsRequested && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Accommodation Needs
                  </p>
                  <p className="text-sm">{selectedCandidate.accommodationDetails || "Details not provided"}</p>
                </div>
              )}

              {selectedCandidate.portfolio && (
                <div className="pt-4">
                  <Button
                    className="w-full bg-[#635bff] hover:bg-[#524aff] text-white"
                    onClick={() => window.open(selectedCandidate.portfolio, "_blank")}
                  >
                    View Portfolio/LinkedIn
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
