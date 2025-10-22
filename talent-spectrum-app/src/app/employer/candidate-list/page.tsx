"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  Filter,
  Eye,
  MessageCircle,
  Star,
  MapPin,
  Clock,
  Shield,
  Heart,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { motion } from "motion/react";

export default function CandidateList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  // Mock candidate data
  const candidates = [
    {
      id: "1",
      name: "Alex Johnson",
      title: "Software Developer",
      location: "San Francisco, CA",
      experience: "3 years",
      skills: ["React", "Node.js", "TypeScript", "Python"],
      status: "available",
      matchScore: 92,
      lastActive: "2 days ago",
      accommodationsRequested: true,
      accommodationDetails: "Flexible hours, quiet workspace",
      portfolio: "https://alexjohnson.dev",
      resume: "Alex_Johnson_Resume.pdf",
      appliedJobs: ["Backend Developer", "Full Stack Developer"],
      availability: "Immediate",
      salaryExpectation: "$70k - $90k",
      workStyle: "Remote preferred",
      neurodivergentStrengths: ["Attention to detail", "Systematic thinking", "Deep focus"],
    },
    {
      id: "2",
      name: "Sam Chen",
      title: "UX Designer",
      location: "Seattle, WA",
      experience: "2 years",
      skills: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping"],
      status: "interviewing",
      matchScore: 88,
      lastActive: "1 day ago",
      accommodationsRequested: false,
      portfolio: "https://samchen.design",
      resume: "Sam_Chen_Resume.pdf",
      appliedJobs: ["UX Designer", "Product Designer"],
      availability: "2 weeks notice",
      salaryExpectation: "$65k - $85k",
      workStyle: "Hybrid preferred",
      neurodivergentStrengths: ["Visual thinking", "User empathy", "Creative problem-solving"],
    },
    {
      id: "3",
      name: "Jordan Smith",
      title: "Data Analyst",
      location: "Austin, TX",
      experience: "4 years",
      skills: ["Python", "SQL", "Tableau", "Machine Learning"],
      status: "available",
      matchScore: 95,
      lastActive: "3 hours ago",
      accommodationsRequested: true,
      accommodationDetails: "Extended time for complex analysis",
      portfolio: "https://jordansmith.analytics",
      resume: "Jordan_Smith_Resume.pdf",
      appliedJobs: ["Data Analyst", "Business Intelligence Analyst"],
      availability: "Immediate",
      salaryExpectation: "$80k - $110k",
      workStyle: "Remote or on-site",
      neurodivergentStrengths: ["Pattern recognition", "Analytical thinking", "Accuracy"],
    },
    {
      id: "4",
      name: "Taylor Williams",
      title: "Marketing Specialist",
      location: "New York, NY",
      experience: "2 years",
      skills: ["Digital Marketing", "Content Creation", "SEO", "Social Media"],
      status: "hired",
      matchScore: 85,
      lastActive: "1 week ago",
      accommodationsRequested: true,
      accommodationDetails: "Written instructions, structured feedback",
      portfolio: "https://taylorwilliams.marketing",
      resume: "Taylor_Williams_Resume.pdf",
      appliedJobs: ["Marketing Coordinator", "Content Manager"],
      availability: "Not available",
      salaryExpectation: "$55k - $75k",
      workStyle: "Hybrid",
      neurodivergentStrengths: ["Creative thinking", "Attention to detail", "Organization"],
    },
    {
      id: "5",
      name: "Casey Rodriguez",
      title: "Project Manager",
      location: "Chicago, IL",
      experience: "5 years",
      skills: ["Agile", "Scrum", "Jira", "Team Leadership"],
      status: "available",
      matchScore: 90,
      lastActive: "5 hours ago",
      accommodationsRequested: false,
      portfolio: "https://caseyrodriguez.pm",
      resume: "Casey_Rodriguez_Resume.pdf",
      appliedJobs: ["Project Manager", "Scrum Master"],
      availability: "1 month notice",
      salaryExpectation: "$75k - $95k",
      workStyle: "Remote or hybrid",
      neurodivergentStrengths: ["Systematic planning", "Process improvement", "Team coordination"],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Available
          </Badge>
        );
      case "interviewing":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Interviewing
          </Badge>
        );
      case "hired":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Hired
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === "all" || candidate.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3a4043] mb-2">Candidate Pool</h1>
          <p className="text-[#6f7a80]">
            Discover and connect with exceptional neurodivergent talent
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6f7a80] w-4 h-4" />
                  <Input
                    placeholder="Search candidates by name, skills, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="match">Best Match</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedCandidates.length > 0 && (
              <div className="mt-4 p-4 bg-[#635bff]/5 border border-[#635bff]/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#635bff] font-medium">
                    {selectedCandidates.length} candidate(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button size="sm" variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-[#6f7a80]">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </p>
        </div>

        {/* Candidate Cards */}
        <div className="space-y-6">
          {filteredCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Candidate Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.includes(candidate.id)}
                          onChange={() => handleSelectCandidate(candidate.id)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-[#3a4043]">{candidate.name}</h3>
                            {getStatusBadge(candidate.status)}
                            <div className={`text-sm font-medium ${getMatchScoreColor(candidate.matchScore)}`}>
                              {candidate.matchScore}% match
                            </div>
                          </div>
                          
                          <p className="text-[#635bff] font-medium mb-2">{candidate.title}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-[#6f7a80] mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {candidate.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {candidate.experience}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {candidate.availability}
                            </span>
                          </div>

                          {/* Skills */}
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                              {candidate.skills.map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Neurodivergent Strengths */}
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-[#3a4043]">Neurodivergent Strengths:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {candidate.neurodivergentStrengths.map((strength, strengthIndex) => (
                                <Badge key={strengthIndex} variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                                  {strength}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Accommodations */}
                          {candidate.accommodationsRequested && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                              <div className="flex items-start gap-2">
                                <Shield className="h-4 w-4 text-purple-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-purple-800">Accommodations Requested</p>
                                  <p className="text-sm text-purple-700">{candidate.accommodationDetails}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Additional Info */}
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-[#6f7a80]">
                            <div>
                              <span className="font-medium">Salary Expectation:</span> {candidate.salaryExpectation}
                            </div>
                            <div>
                              <span className="font-medium">Work Style:</span> {candidate.workStyle}
                            </div>
                            <div>
                              <span className="font-medium">Last Active:</span> {candidate.lastActive}
                            </div>
                            <div>
                              <span className="font-medium">Applied Jobs:</span> {candidate.appliedJobs.join(", ")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" className="bg-[#635bff] hover:bg-[#524aff] text-white">
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredCandidates.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-[#6f7a80] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#3a4043] mb-2">No candidates found</h3>
              <p className="text-[#6f7a80] mb-4">
                Try adjusting your search criteria or filters to find more candidates.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {filteredCandidates.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button size="sm" className="bg-[#635bff] text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
