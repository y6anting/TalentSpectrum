"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/app/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import {
  User,
  Briefcase,
  Heart,
  Settings,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
  Bell,
  Shield,
  Eye,
  Star,
  Camera,
  Book,
  House,
  Percent, // New icon for match percentage
  Search, // New icon for search/filter
  ArrowUpNarrowWide, // New icon for sorting
  ChevronDown, // For dropdowns
  ChevronUp, // For dropdowns
  Info, // For AI comments
  MessageSquare, // For communication
  Calendar, // For scheduling
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"; // Assuming ui/select is the correct path

// --- Mock Data Structures (Simplified from CandidateDashboard for display) ---
type EnvironmentPreference = {
  patternRecognition: string;
  attention: string;
  systematicThinking: string;
  bigVsDetail: string;
  taskSwitching: string;
  hyperfocus: string;
  communicationMedium: string;
  clarity: string;
  teamStyle: string;
  presentationComfort: string;
  checkIns: string;
  jobCoach: string;
  auditory: string;
  visual: string;
  workspace: string;
  workdayStructure: string;
};

type CandidateProfileSummary = {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
  accommodations: string[];
  preferences: {
    workType: string;
    communication: string;
    schedule: string;
  };
  experienceSummary: string;
  educationSummary: string;
  environment: EnvironmentPreference;
};

interface MatchBreakdown {
  percentage: number;
  comments: string;
  matchedPoints: string[]; // Specific points that matched
  mismatchedPoints?: string[]; // Specific points that mismatched (optional)
  aiRecommendation?: string; // AI's specific recommendation for this metric
}

interface MatchedCandidate {
  id: string;
  candidateId: string; // Unique ID for the candidate's full profile
  jobTitle: string; // The job posting this candidate matched for
  overallMatchPercentage: number;
  candidateSummary: CandidateProfileSummary; // Simplified candidate data for display
  primaryMatch: MatchBreakdown; // Hard Requirements
  secondaryMatch: MatchBreakdown; // Environmental Fit
  tertiaryMatch: MatchBreakdown; // Soft Factors
}

// --- Mock Data for Matched Candidates ---
const mockMatchedCandidates: MatchedCandidate[] = [
  {
    id: "match-1",
    candidateId: "siti-aminah-1",
    jobTitle: "Data Scientist",
    overallMatchPercentage: 92,
    candidateSummary: {
      id: "siti-aminah-1",
      name: "Siti Aminah",
      email: "siti.aminah@example.com",
      location: "Kuala Lumpur, Malaysia",
      skills: ["Python", "Data Analysis", "Machine Learning", "NLP"],
      accommodations: ["Flexible Hours", "Quiet Workspace"],
      preferences: {
        workType: "Remote",
        communication: "Written preferred",
        schedule: "Flexible hours",
      },
      experienceSummary: "2+ years as Data Scientist, 1.5 years as Data Analyst.",
      educationSummary: "MSc in Data Science, BSc in Computer Science.",
      environment: {
        patternRecognition: "Good",
        attention: "Hyperfocus",
        systematicThinking: "Good",
        bigVsDetail: "Detail-Oriented",
        taskSwitching: "One task at a time",
        hyperfocus: "Good",
        communicationMedium: "Written",
        clarity: "Prefers clear, literal instructions",
        teamStyle: "Work independently",
        presentationComfort: "Not comfortable, but willing to try",
        checkIns: "Scheduled check-ins",
        jobCoach: "No Need",
        auditory: "Quiet environment",
        visual: "Natural lighting",
        workspace: "Work from home",
        workdayStructure: "Flexible work hour",
      },
    },
    primaryMatch: {
      percentage: 95,
      comments: "Strong alignment with required technical skills (Python, ML, NLP).",
      matchedPoints: ["Python", "Machine Learning", "NLP", "Data Analysis"],
      mismatchedPoints: ["Cloud Computing (minor gap)"],
      aiRecommendation: "Candidate possesses core technical competencies. Consider a short technical assessment for cloud skills."
    },
    secondaryMatch: {
      percentage: 90,
      comments: "Excellent fit for remote work and preference for written communication.",
      matchedPoints: ["Remote work preference", "Written communication", "Quiet environment", "Flexible hours"],
      mismatchedPoints: ["Prefers independent work, team style might need slight adjustment"],
      aiRecommendation: "The candidate's environmental preferences align well with the remote-first culture. Ensure clear, written instructions are standard."
    },
    tertiaryMatch: {
      percentage: 88,
      comments: "Good alignment with company's focus on detail-oriented problem solving.",
      matchedPoints: ["Detail-Oriented", "Systematic Thinking"],
      mismatchedPoints: ["Presentation comfort is lower, may need support for client-facing roles."],
      aiRecommendation: "Candidate's preference for detail and systematic thinking is a strong asset. Provide coaching or alternative presentation methods if role requires public speaking."
    },
  },
  {
    id: "match-2",
    candidateId: "alex-johnson-2",
    jobTitle: "UX Designer",
    overallMatchPercentage: 85,
    candidateSummary: {
      id: "alex-johnson-2",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      location: "Remote, USA",
      skills: ["Figma", "User Research", "Prototyping", "Accessibility"],
      accommodations: ["Extended breaks", "Visual aids"],
      preferences: {
        workType: "Hybrid",
        communication: "Verbal with summaries",
        schedule: "Fixed hours with flexibility",
      },
      experienceSummary: "3 years as UX Designer, specializing in accessible design.",
      educationSummary: "B.A. in Graphic Design.",
      environment: {
        patternRecognition: "Good",
        attention: "Moderate",
        systematicThinking: "Good",
        bigVsDetail: "Big Picture",
        taskSwitching: "Moderate",
        hyperfocus: "Moderate",
        communicationMedium: "Verbal",
        clarity: "Open-ended or indirect language",
        teamStyle: "Small, close-knit team",
        presentationComfort: "Comfortable",
        checkIns: "Prefers frequent check-ins",
        jobCoach: "Need",
        auditory: "Can have background noise",
        visual: "Bright lighting",
        workspace: "Fixed table",
        workdayStructure: "Fixed work hour",
      },
    },
    primaryMatch: {
      percentage: 88,
      comments: "Solid UX skills, particularly in accessibility which is a plus.",
      matchedPoints: ["Figma", "User Research", "Prototyping", "Accessibility"],
      mismatchedPoints: ["Less experience with specific design systems used by company (minor)"],
      aiRecommendation: "Candidate's accessibility focus is valuable. Assess adaptability to company's existing design system during interview."
    },
    secondaryMatch: {
      percentage: 80,
      comments: "Good fit for hybrid model, but communication preference needs attention.",
      matchedPoints: ["Hybrid work preference", "Visual aids"],
      mismatchedPoints: ["Prefers verbal communication, company leans written. Needs frequent check-ins."],
      aiRecommendation: "Ensure team is aware of candidate's preference for verbal communication and frequent check-ins. A job coach could be beneficial."
    },
    tertiaryMatch: {
      percentage: 87,
      comments: "Comfortable with presentations and team collaboration.",
      matchedPoints: ["Comfortable with presentations", "Small team collaboration"],
      mismatchedPoints: [],
      aiRecommendation: "Candidate's social preferences are a good fit for collaborative design sprints."
    },
  },
  {
    id: "match-3",
    candidateId: "mei-ling-3",
    jobTitle: "Frontend Developer",
    overallMatchPercentage: 78,
    candidateSummary: {
      id: "mei-ling-3",
      name: "Mei Ling",
      email: "mei.ling@example.com",
      location: "Singapore",
      skills: ["React", "JavaScript", "HTML/CSS", "Responsive Design"],
      accommodations: ["Quiet workspace", "Written instructions"],
      preferences: {
        workType: "Remote",
        communication: "Written preferred",
        schedule: "Fixed hours",
      },
      experienceSummary: "1.5 years as Junior Frontend Developer.",
      educationSummary: "Diploma in Web Development.",
      environment: {
        patternRecognition: "Good",
        attention: "Good",
        systematicThinking: "Good",
        bigVsDetail: "Detail-Oriented",
        taskSwitching: "One task at a time",
        hyperfocus: "Good",
        communicationMedium: "Written",
        clarity: "Prefers clear, literal instructions",
        teamStyle: "Work independently",
        presentationComfort: "Not comfortable",
        checkIns: "Scheduled check-ins",
        jobCoach: "Need",
        auditory: "Quiet environment",
        visual: "Dim lighting",
        workspace: "Fixed table",
        workdayStructure: "Fixed work hour",
      },
    },
    primaryMatch: {
      percentage: 80,
      comments: "Good foundational frontend skills, particularly React.",
      matchedPoints: ["React", "JavaScript", "HTML/CSS"],
      mismatchedPoints: ["Limited experience with advanced state management (e.g., Redux)"],
      aiRecommendation: "Candidate has strong basics. Potential for growth with mentorship in advanced frontend concepts."
    },
    secondaryMatch: {
      percentage: 85,
      comments: "Strong preference for quiet, remote work with written instructions.",
      matchedPoints: ["Remote work preference", "Quiet environment", "Written instructions", "Fixed hours"],
      mismatchedPoints: ["Prefers independent work, may need structured team integration."],
      aiRecommendation: "Ideal for roles with clear, well-documented tasks. Consider pairing with a mentor for team-based projects."
    },
    tertiaryMatch: {
      percentage: 70,
      comments: "Less comfortable with presentations and prefers independent work.",
      matchedPoints: ["Detail-Oriented"],
      mismatchedPoints: ["Not comfortable with presentations", "Prefers independent work"],
      aiRecommendation: "Candidate may thrive in roles focused on coding and implementation rather than client-facing or highly collaborative design roles."
    },
  },
];

export default function EmployerMatchlistDashboard() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<"overallMatchPercentage" | "jobTitle">(
    "overallMatchPercentage"
  );
  const [selectedCandidate, setSelectedCandidate] =
    useState<MatchedCandidate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const sortedCandidates = useMemo(() => {
    let sorted = [...mockMatchedCandidates];
    if (sortBy === "overallMatchPercentage") {
      sorted.sort((a, b) => b.overallMatchPercentage - a.overallMatchPercentage);
    } else if (sortBy === "jobTitle") {
      sorted.sort((a, b) => a.jobTitle.localeCompare(b.jobTitle));
    }
    return sorted;
  }, [mockMatchedCandidates, sortBy]);

  const handleViewDetails = (candidate: MatchedCandidate) => {
    setSelectedCandidate(candidate);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailModalOpen(false);
    setSelectedCandidate(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3a4043] mb-1">
            Neurodivergent Candidate Matchlist
          </h1>
          <p className="text-gray-600">
            Discover potential candidates matched to your job postings based on
            our AI algorithm.
          </p>
        </div>

        {/* Filter and Sort Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Search className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search candidates or job titles..."
              className="w-full sm:w-64 px-3 py-2 border border-[#e8e6f0] rounded-lg outline-none focus-visible:border-gray-400 focus-visible:ring-gray-400/50 focus-visible:ring-[1px]"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowUpNarrowWide className="h-5 w-5 text-gray-500" />
            <Select
              value={sortBy}
              onValueChange={(value: "overallMatchPercentage" | "jobTitle") =>
                setSortBy(value)
              }
            >
              <SelectTrigger className="w-full sm:w-[200px] border-[#d9d6f3] rounded-lg focus:ring-[#635bff]/40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-lg shadow-lg border border-[#e8e6f0] bg-white">
                <SelectItem value="overallMatchPercentage">
                  Match Percentage (High to Low)
                </SelectItem>
                <SelectItem value="jobTitle">Job Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Candidate List */}
        <div className="grid gap-6">
          {sortedCandidates.length > 0 ? (
            sortedCandidates.map((match) => (
              <motion.div
                key={match.id}
                whileHover={{
                  boxShadow: "0 4px 12px rgba(99,91,255,0.1)",
                  y: -2,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-xl overflow-hidden"
              >
                <Card>
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-[#3a4043] mb-1">
                        {match.candidateSummary.name}
                      </h3>
                      <p className="text-[#635bff] font-medium mb-2">
                        Matched for: {match.jobTitle}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {match.candidateSummary.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {match.candidateSummary.experienceSummary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Book className="h-4 w-4" />
                          {match.candidateSummary.educationSummary}
                        </span>
                      </div>
                      {match.candidateSummary.accommodations.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-800 flex items-center gap-1"
                          >
                            <Shield className="h-3 w-3" />
                            Accommodations:{" "}
                            {match.candidateSummary.accommodations.join(", ")}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-4xl font-bold text-[#635bff]">
                        {match.overallMatchPercentage}%
                      </div>
                      <p className="text-sm text-gray-600">Overall Match</p>
                      <Button
                        onClick={() => handleViewDetails(match)}
                        className="bg-[#635bff] hover:bg-[#5748e5] text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all duration-200"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-600">
                No candidates matched your criteria yet.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Candidate Detail Modal */}
        {isDetailModalOpen && selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <CardHeader className="flex flex-row justify-between items-center p-6 border-b border-gray-200">
                  <CardTitle className="text-2xl font-bold text-[#3a4043]">
                    {selectedCandidate.candidateSummary.name} - Match Details
                  </CardTitle>
                  <Button
                    variant="ghost"
                    onClick={handleCloseDetails}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    <XCircle className="h-6 w-6" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Overall Match */}
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-600">Overall Match for</p>
                    <h2 className="text-4xl font-extrabold text-[#635bff] mt-1">
                      {selectedCandidate.jobTitle}
                    </h2>
                    <p className="text-6xl font-extrabold text-[#635bff] mt-4">
                      {selectedCandidate.overallMatchPercentage}%
                    </p>
                  </div>

                  {/* Candidate Summary */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-[#635bff]" /> Candidate
                        Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <p>
                          <strong>Email:</strong>{" "}
                          {selectedCandidate.candidateSummary.email}
                        </p>
                        <p>
                          <strong>Location:</strong>{" "}
                          {selectedCandidate.candidateSummary.location}
                        </p>
                        <p>
                          <strong>Work Type Pref:</strong>{" "}
                          {selectedCandidate.candidateSummary.preferences.workType}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Skills:</strong>{" "}
                          {selectedCandidate.candidateSummary.skills.join(", ")}
                        </p>
                        <p>
                          <strong>Accommodations:</strong>{" "}
                          {selectedCandidate.candidateSummary.accommodations.join(
                            ", "
                          )}
                        </p>
                        <p>
                          <strong>Communication Pref:</strong>{" "}
                          {selectedCandidate.candidateSummary.preferences.communication}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Match Breakdown */}
                  <h3 className="text-xl font-bold text-[#3a4043] mt-8 mb-4">
                    Detailed Match Analysis
                  </h3>
                  {[
                    {
                      title: "Primary Match: Hard Requirements",
                      match: selectedCandidate.primaryMatch,
                      icon: Briefcase,
                      color: "text-green-600",
                    },
                    {
                      title: "Secondary Match: Environmental Fit",
                      match: selectedCandidate.secondaryMatch,
                      icon: House,
                      color: "text-blue-600",
                    },
                    {
                      title: "Tertiary Match: Soft Factors",
                      match: selectedCandidate.tertiaryMatch,
                      icon: Heart,
                      color: "text-purple-600",
                    },
                  ].map((section, index) => (
                    <Card key={index} className="border-l-4 border-[#635bff]">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <section.icon className={`h-5 w-5 ${section.color}`} />{" "}
                          {section.title}
                          <Badge
                            variant="secondary"
                            className={`ml-auto bg-opacity-20 ${
                              section.match.percentage >= 80
                                ? "bg-green-100 text-green-800"
                                : section.match.percentage >= 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {section.match.percentage}%
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-gray-700">
                        <p className="font-medium">{section.match.comments}</p>
                        {section.match.matchedPoints.length > 0 && (
                          <p>
                            <strong>Matched:</strong>{" "}
                            {section.match.matchedPoints.join(", ")}
                          </p>
                        )}
                        {section.match.mismatchedPoints &&
                          section.match.mismatchedPoints.length > 0 && (
                            <p className="text-red-600">
                              <strong>Consider:</strong>{" "}
                              {section.match.mismatchedPoints.join(", ")}
                            </p>
                          )}
                        {section.match.aiRecommendation && (
                          <p className="flex items-start gap-2 text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span>
                              <strong>AI Recommendation:</strong>{" "}
                              {section.match.aiRecommendation}
                            </span>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {/* Actions */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
                    <Button
                      variant="outline"
                      onClick={handleCloseDetails}
                      className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10"
                    >
                      Close
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() =>
                        alert(
                          `Scheduling interview for ${selectedCandidate.candidateSummary.name}`
                        )
                      }
                    >
                      <Calendar className="h-4 w-4 mr-2" /> Schedule Interview
                    </Button>
                    <Button
                      className="bg-[#635bff] hover:bg-[#5748e5] text-white"
                      onClick={() =>
                        alert(
                          `Shortlisting ${selectedCandidate.candidateSummary.name}`
                            )
                      }
                    >
                      <Star className="h-4 w-4 mr-2" /> Shortlist Candidate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}