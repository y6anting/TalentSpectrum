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
import {
  Users,
  Eye,
  Star,
  MapPin,
  Shield,
  Briefcase,
  Heart,
  Info,
  XCircle,
  User,
  Loader2, // Added for loading indicator
} from "lucide-react";
import { motion } from "framer-motion"; // Changed from "motion/react" to "framer-motion" for common usage

// ============= TYPES (Existing) =============
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
  matchedPoints: string[];
  mismatchedPoints?: string[];
  aiRecommendation?: string;
}

export interface MatchedCandidate {
  id: string; // This will be the match ID from the API or mock
  candidateId: string; // A unique ID for the candidate (derived)
  jobTitle: string;
  overallMatchPercentage: number;
  candidateSummary: CandidateProfileSummary;
  primaryMatch: MatchBreakdown;
  secondaryMatch: MatchBreakdown;
  tertiaryMatch: MatchBreakdown;
}

// ============= NEW TYPE FOR API RESPONSE =============
interface ApiMatchResult {
  id: number; // Match ID
  candidate_name: string;
  candidate_email: string;
  location: string;
  work_type_preference: string;
  skills: string; // Comma-separated string
  accommodations: string; // Comma-separated string
  communication_preference: string;
  job_id: number;
  job_title: string;
  company_name: string;
  company_email: string;
  company_id: number;
  primary_score: number;
  secondary_score: number;
  tertiary_score: number;
  total_score: number;
  primary_matched: string;
  primary_consider: string;
  primary_ai_recommendation: string;
  secondary_matched: string;
  secondary_consider: string;
  secondary_ai_recommendation: string;
  tertiary_matched: string;
  tertiary_consider: string;
  tertiary_ai_recommendation: string;
}

// ============= MOCK DATA (Kept for fallback) =============
const mockMatchedCandidates: MatchedCandidate[] = [
  {
    id: "match-1",
    candidateId: "siti-aminah-1",
    jobTitle: "Frontend Developer",
    overallMatchPercentage: 92,
    candidateSummary: {
      id: "siti-aminah-1",
      name: "Siti Aminah",
      email: "siti.aminah@example.com",
      location: "Kuala Lumpur, Malaysia",
      skills: ["React", "JavaScript", "TypeScript", "CSS"],
      accommodations: ["Flexible Hours", "Quiet Workspace"],
      preferences: {
        workType: "Remote",
        communication: "Written preferred",
        schedule: "Flexible hours",
      },
      experienceSummary: "3 years as Frontend Developer",
      educationSummary: "BSc in Computer Science",
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
      comments: "Strong alignment with required technical skills.",
      matchedPoints: ["React", "JavaScript", "TypeScript", "CSS"],
      mismatchedPoints: [],
      aiRecommendation: "Candidate possesses core technical competencies.",
    },
    secondaryMatch: {
      percentage: 90,
      comments: "Excellent fit for remote work.",
      matchedPoints: [
        "Remote work preference",
        "Written communication",
        "Quiet environment",
        "Flexible hours",
      ],
      mismatchedPoints: [],
      aiRecommendation:
        "The candidate's environmental preferences align well with remote-first culture.",
    },
    tertiaryMatch: {
      percentage: 88,
      comments: "Good alignment with company culture.",
      matchedPoints: ["Detail-Oriented", "Systematic Thinking"],
      mismatchedPoints: [],
      aiRecommendation: "Candidate's preference for detail is a strong asset.",
    },
  },
  {
    id: "match-2",
    candidateId: "alex-johnson-2",
    jobTitle: "Frontend Developer",
    overallMatchPercentage: 85,
    candidateSummary: {
      id: "alex-johnson-2",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      location: "Remote, USA",
      skills: ["React", "Vue.js", "HTML/CSS", "Accessibility"],
      accommodations: ["Extended breaks", "Visual aids"],
      preferences: {
        workType: "Hybrid",
        communication: "Verbal with summaries",
        schedule: "Fixed hours with flexibility",
      },
      experienceSummary: "2 years as Frontend Developer",
      educationSummary: "B.A. in Web Design",
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
      comments: "Solid frontend skills with accessibility focus.",
      matchedPoints: ["React", "HTML/CSS", "Accessibility"],
      mismatchedPoints: ["Less experience with TypeScript"],
      aiRecommendation: "Candidate's accessibility focus is valuable.",
    },
    secondaryMatch: {
      percentage: 80,
      comments: "Good fit for hybrid model.",
      matchedPoints: ["Hybrid work preference", "Visual aids"],
      mismatchedPoints: ["Prefers verbal communication"],
      aiRecommendation:
        "Ensure team is aware of candidate's communication preferences.",
    },
    tertiaryMatch: {
      percentage: 87,
      comments: "Comfortable with team collaboration.",
      matchedPoints: [
        "Comfortable with presentations",
        "Small team collaboration",
      ],
      mismatchedPoints: [],
      aiRecommendation:
        "Candidate's social preferences fit collaborative environment.",
    },
  },
  {
    id: "match-3",
    candidateId: "mei-ling-3",
    jobTitle: "Finance Analyst",
    overallMatchPercentage: 78,
    candidateSummary: {
      id: "mei-ling-3",
      name: "Mei Ling",
      email: "mei.ling@example.com",
      location: "Singapore",
      skills: ["Python", "Data Analysis", "SQL", "Tableau"],
      accommodations: ["Quiet workspace", "Written instructions"],
      preferences: {
        workType: "Remote",
        communication: "Written preferred",
        schedule: "Fixed hours",
      },
      experienceSummary: "1.5 years as Data Analyst",
      educationSummary: "MSc in Data Science",
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
      comments: "Good foundational data skills.",
      matchedPoints: ["Python", "Data Analysis", "SQL"],
      mismatchedPoints: ["Limited experience with Machine Learning"],
      aiRecommendation: "Candidate has strong basics with growth potential.",
    },
    secondaryMatch: {
      percentage: 85,
      comments: "Strong preference for quiet, remote work.",
      matchedPoints: [
        "Remote work preference",
        "Quiet environment",
        "Written instructions",
      ],
      mismatchedPoints: [],
      aiRecommendation: "Ideal for roles with clear, well-documented tasks.",
    },
    tertiaryMatch: {
      percentage: 70,
      comments: "Less comfortable with presentations.",
      matchedPoints: ["Detail-Oriented"],
      mismatchedPoints: ["Not comfortable with presentations"],
      aiRecommendation:
        "Candidate may thrive in analytical roles rather than client-facing.",
    },
  },
];

// ============= MAPPING FUNCTION =============
const mapApiDataToMatchedCandidate = (
  apiData: ApiMatchResult[]
): MatchedCandidate[] => {
  return apiData.map((item) => {
    // Helper to split comma-separated strings, handling "N/A"
    const splitAndClean = (str: string) =>
      str && str !== "N/A"
        ? str.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    // Helper to combine matched and consider points into a single comment
    const combineComments = (matched: string, consider: string) => {
      let comment = "";
      if (matched && matched !== "None") {
        comment += matched;
      }
      if (consider && consider !== "None") {
        comment += (comment ? " " : "") + `(Consider: ${consider})`;
      }
      return comment || "No specific comments provided.";
    };

    // Generate a somewhat unique candidate ID
    const candidateUniqueId = `${item.candidate_name.toLowerCase().replace(/\s/g, '-')}-${item.candidate_email.split('@')[0]}`;

    return {
      id: `match-${item.id}`, // Unique ID for this match record from API
      candidateId: candidateUniqueId, // Unique ID for the candidate
      jobTitle: item.job_title,
      overallMatchPercentage: Math.round(item.total_score), // Round to nearest integer
      candidateSummary: {
        id: candidateUniqueId, // Candidate ID
        name: item.candidate_name,
        email: item.candidate_email,
        location: item.location && item.location !== "N/A" ? item.location : "Not specified",
        skills: splitAndClean(item.skills),
        accommodations: splitAndClean(item.accommodations),
        preferences: {
          workType: item.work_type_preference && item.work_type_preference !== "N/A" ? item.work_type_preference : "Not specified",
          communication: item.communication_preference && item.communication_preference !== "N/A" ? item.communication_preference : "Not specified",
          schedule: "Not specified", // Not available in API data
        },
        experienceSummary: "Not provided", // Not available in API data
        educationSummary: "Not provided", // Not available in API data
        environment: {
          // Populate with default/placeholder values as detailed environment preferences are not in API
          patternRecognition: "N/A",
          attention: "N/A",
          systematicThinking: "N/A",
          bigVsDetail: "N/A",
          taskSwitching: "N/A",
          hyperfocus: "N/A",
          communicationMedium: item.communication_preference && item.communication_preference !== "N/A" ? item.communication_preference : "N/A",
          clarity: "N/A",
          teamStyle: "N/A",
          presentationComfort: "N/A",
          checkIns: "N/A",
          jobCoach: "N/A",
          // Example derivations for auditory/visual based on accommodations string
          auditory: splitAndClean(item.accommodations).some(acc => acc.includes("Auditory")) ? splitAndClean(item.accommodations).find(acc => acc.includes("Auditory"))?.replace("Auditory: ", "") || "N/A" : "N/A",
          visual: splitAndClean(item.accommodations).some(acc => acc.includes("Visual")) ? splitAndClean(item.accommodations).find(acc => acc.includes("Visual"))?.replace("Visual: ", "") || "N/A" : "N/A",
          workspace: "N/A",
          workdayStructure: item.work_type_preference === "Flexible work hour" ? "Flexible work hour" : "N/A", // Example derivation
        },
      },
      primaryMatch: {
        percentage: item.primary_score,
        comments: combineComments(item.primary_matched, item.primary_consider),
        matchedPoints: splitAndClean(item.primary_matched),
        mismatchedPoints: splitAndClean(item.primary_consider),
        aiRecommendation: item.primary_ai_recommendation,
      },
      secondaryMatch: {
        percentage: item.secondary_score,
        comments: combineComments(item.secondary_matched, item.secondary_consider),
        matchedPoints: splitAndClean(item.secondary_matched),
        mismatchedPoints: splitAndClean(item.secondary_consider),
        aiRecommendation: item.secondary_ai_recommendation,
      },
      tertiaryMatch: {
        percentage: item.tertiary_score,
        comments: combineComments(item.tertiary_matched, item.tertiary_consider),
        matchedPoints: splitAndClean(item.tertiary_matched),
        mismatchedPoints: splitAndClean(item.tertiary_consider),
        aiRecommendation: item.tertiary_ai_recommendation,
      },
    };
  });
};

// ============= COMPONENT =============
interface MatchedCandidatesProps {
  jobTitle: string;
  onShortlist: (candidate: MatchedCandidate) => void;
}

export default function MatchedCandidates({
  jobTitle,
  onShortlist,
}: MatchedCandidatesProps) {
  // Initialize with mock data as a fallback
  const [allMatchedCandidates, setAllMatchedCandidates] = useState<
    MatchedCandidate[]
  >(mockMatchedCandidates);
  const [loading, setLoading] = useState(true); // Set to true initially to show loading while fetching
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<MatchedCandidate | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchMatchResults = async () => {
      setLoading(true); // Start loading indicator
      setError(null); // Clear any previous errors

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/match_results/all_results"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData: ApiMatchResult[] = await response.json();

        if (rawData && rawData.length > 0) {
          const mappedData = mapApiDataToMatchedCandidate(rawData);
          setAllMatchedCandidates(mappedData); // Replace mock data with fetched data
          console.log("Successfully loaded data from API.");
        } else {
          console.log("API returned no data, displaying mock data as fallback.");
          // If API returns no data, `allMatchedCandidates` remains `mockMatchedCandidates`
        }
      } catch (err) {
        console.error("Failed to fetch match results:", err);
        setError(
          "Failed to load candidates from API. Displaying mock data as fallback."
        );
        // If fetch fails, `allMatchedCandidates` remains `mockMatchedCandidates`
      } finally {
        setLoading(false); // End loading indicator
      }
    };

    fetchMatchResults();
  }, []); // Empty dependency array means this runs once on mount

  // Filter candidates by job title from the currently available data (fetched or mock)
  const candidates = allMatchedCandidates.filter(
    (candidate) => candidate.jobTitle === jobTitle
  );

  const handleViewCandidateDetails = (candidate: MatchedCandidate) => {
    setSelectedCandidate(candidate);
    setIsDetailModalOpen(true);
  };

  const handleShortlist = (candidate: MatchedCandidate) => {
    onShortlist(candidate);
    setIsDetailModalOpen(false);
    setSelectedCandidate(null);
  };

  // Show a full-screen loading spinner only while the initial fetch is in progress
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Matched Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin text-[#635bff] mb-3" />
            <p>Loading matched candidates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Display error message if fetch failed, but still render content with fallback data */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          {/* Optional: Add a close button for the alert */}
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
            onClick={() => setError(null)}
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>AI Matched Candidates</CardTitle>
            <Badge variant="secondary" className="bg-[#635bff] text-white">
              {candidates.length} Matches
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
            {candidates.length > 0 ? (
              candidates.map((match) => (
                <motion.div
                  key={match.id}
                  whileHover={{
                    boxShadow: "0 4px 12px rgba(99,91,255,0.2)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="p-4 border border-gray-200 rounded-lg bg-white hover:border-[#635bff]/50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-[#635bff] rounded-full flex items-center justify-center text-white font-semibold">
                        {match.candidateSummary.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#3a4043]">
                          {match.candidateSummary.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {match.candidateSummary.experienceSummary}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3" />
                          {match.candidateSummary.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-[#635bff]">
                        {match.overallMatchPercentage}
                        <span className="text-xl">%</span>
                      </div>
                      <p className="text-xs text-gray-600">Match</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {match.candidateSummary.skills
                        .slice(0, 4)
                        .map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      {match.candidateSummary.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{match.candidateSummary.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Accommodations */}
                  {match.candidateSummary.accommodations.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-purple-800">
                            Accommodations Requested
                          </p>
                          <p className="text-sm text-purple-700">
                            {match.candidateSummary.accommodations.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Match Breakdown Preview */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-semibold text-green-700">
                        {match.primaryMatch.percentage}%
                      </div>
                      <div className="text-green-600">Skills</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-semibold text-blue-700">
                        {match.secondaryMatch.percentage}%
                      </div>
                      <div className="text-blue-600">Environment</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-semibold text-purple-700">
                        {match.tertiaryMatch.percentage}%
                      </div>
                      <div className="text-purple-600">Culture</div>
                    </div>
                  </div>
```
<div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <=
                              Math.floor(match.overallMatchPercentage / 20)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCandidateDetails(match)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#635bff] hover:bg-[#5346e6] text-white"
                        onClick={() => handleShortlist(match)}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Shortlist
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No matched candidates for this position yet</p>
                <p className="text-sm mt-2">
                  Our AI will find suitable candidates soon!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                  onClick={() => setIsDetailModalOpen(false)}
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
                    {selectedCandidate.overallMatchPercentage}
                    <span className="text-5xl">%</span>
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
                        {
                          selectedCandidate.candidateSummary.preferences
                            .workType
                        }
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
                        {
                          selectedCandidate.candidateSummary.preferences
                            .communication
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Match Analysis */}
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
                    icon: Shield,
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
                      {section.match.matchedPoints && section.match.matchedPoints.length > 0 && (
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
                    onClick={() => setIsDetailModalOpen(false)}
                    className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10"
                  >
                    Close
                  </Button>
                  <Button
                    className="bg-[#635bff] hover:bg-[#5748e5] text-white"
                    onClick={() => handleShortlist(selectedCandidate)}
                  >
                    <Star className="h-4 w-4 mr-2" /> Shortlist Candidate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </>
  );
}

                  
