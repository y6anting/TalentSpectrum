"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select";
import { Card, CardContent } from "@/app/components/card";
import { 
  CheckCircle, 
  Clock, 
  Target, 
  Volume2, 
  Briefcase, 
  Star,
  Award,
  Search, 
  TrendingUp,
  Users,
  Brain,
  Code,
  MessageSquare,
  ArrowUpWideNarrow 
} from "lucide-react";
import { 
  generateInterviewQuestions, 
  jobPositions, 
  InterviewQuestion, 
  JobPosition 
} from "@/app/mock-interview/interviewService";

type InterviewType = "general" | "technical" | "behavioral";

interface InterviewSession {
  currentQuestion: number;
  totalQuestions: number;
  positionLevel: string;
  selectedPosition?: JobPosition;
  interviewType: InterviewType;
  questions: InterviewQuestion[];
}

type EmbeddedNavTarget = "setup" | "interview" | "feedback";
interface EmbeddedNavProps { onNavigate?: (target: EmbeddedNavTarget) => void }

const MockInterviewSetupPage: React.FC<EmbeddedNavProps> = ({ onNavigate }) => {
  const router = useRouter();
  
  const [session, setSession] = useState<InterviewSession>({
    currentQuestion: 0,
    totalQuestions: 2,
    interviewType: "general",
    questions: [],
    positionLevel: "junior"
  });

  const [loading, setLoading] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const filteredJobs = jobPositions.filter(position =>
    position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  const [customJobDescription, setCustomJobDescription] = useState("");

  // Generate questions and start interview
  const handleStartInterview = async () => {
    const selectedPosition = selectedPositionId 
      ? jobPositions.find(pos => pos.title === selectedPositionId)
      : null;

    if (!selectedPosition && !customJobDescription.trim()) {
      alert("Please select a position or enter a custom job description!");
      return;
    }

    setLoading(true);
    try {
      // Map position level to valid values
      const mapPositionLevel = (level: string): "entry" | "mid" | "senior" => {
        switch (level) {
          case "intern":
          case "entry level":
            return "entry";
          case "junior":
          case "mid":
            return "mid";
          case "senior":
          case "lead":
            return "senior";
          default:
            return "mid";
        }
      };

      const jobToUse = selectedPosition || {
        title: "Custom Position",
        description: customJobDescription,
        requirements: ["Communication", "Problem Solving", "Teamwork"],
        level: mapPositionLevel(session.positionLevel), // Use user-selected level
        industry: "General"
      };

      // Override the level with user selection even for predefined positions
      if (selectedPosition) {
        jobToUse.level = mapPositionLevel(session.positionLevel);
      }

      const generatedQuestions = await generateInterviewQuestions(
        jobToUse,
        session.interviewType,
        session.totalQuestions
      );

      // Store session data in sessionStorage for the next page
      const sessionData = {
        selectedPosition: jobToUse,
        questions: generatedQuestions,
        interviewType: session.interviewType,
        totalQuestions: session.totalQuestions,
        positionLevel: session.positionLevel,
        startTime: new Date().toISOString()
      };
      
      sessionStorage.setItem('mockInterviewSession', JSON.stringify(sessionData));
      
      // Navigate to interview process page or embedded subtab
      if (onNavigate) {
        onNavigate("interview");
      } else {
        router.push('/candidate/candidate-dashboard/mock-interview/interviewprocess');
      }
      
    } catch (error) {
      console.error("Failed to generate questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="w-full min-h-screen">

          {/* Main Setup Card */}
          <Card className="w-full border-0 bg-white/80 backdrop-blur-lg">
            <CardContent className="p-8">
              <div className="gap-8">
                
                {/* Interview Configuration */}
                <div className="space-y-6">
                  <div className="py-6" >
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <Target className="w-5 h-5 text-[#635BFF] mr-2" />
                      Interview Type
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
                      {[
                        { value: "general", label: "General Interview", icon: Users, color: "blue" },
                        { value: "technical", label: "Technical Interview", icon: Code, color: "purple", },
                        { value: "behavioral", label: "Behavioral Interview", icon: MessageSquare, color: "green",  }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setSession(prev => ({ ...prev, interviewType: type.value as InterviewType }))}
                          className={`
                            w-full p-1 rounded-xl border-2 lg:text-left transition-all duration-200 
                            ${session.interviewType === type.value
                              ? `border-${type.color}-200 bg-${type.color}-50 shadow-lg scale-100`
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }
                          `}
                        >
                          <div className="cursor-pointer flex flex-col gap-3 items-center lg:flex-row lg:items-center lg:justify-center lg:space-x-3 space-y-3 lg:space-y-0">
                            <div className={`p-1.5 rounded-lg bg-${type.color}-100`}>
                              <type.icon className={`w-5 h-5 text-${type.color}-500`} />
                            </div>
                              <div className="font-medium text-gray-900">{type.label}</div>
                              {/* <div className="text-[0.85rem] text-gray-600">{type.desc}</div> */}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 space-y-6 py-3">
                    {/* Number of Questions */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                        <Clock className="w-5 h-5 text-[#635BFF] mr-2" />
                        Number of Questions
                      </h3>

                      <Select
                        onValueChange={(value) =>
                          setSession((prev) => ({
                            ...prev,
                            totalQuestions: Number(value),
                          }))
                        }
                        value={String(session.totalQuestions)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select number of questions" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="2">2 Questions (4 min)</SelectItem>
                          <SelectItem value="4">4 Questions (8 min)</SelectItem>
                          <SelectItem value="6">6 Questions (12 min)</SelectItem>
                          <SelectItem value="8">8 Questions (16 min)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Position Level */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                        <ArrowUpWideNarrow className="w-5 h-5 text-[#635BFF] mr-2" />
                        Position Level
                      </h3>

                      <Select
                        onValueChange={(value) =>
                          setSession((prev) => ({
                            ...prev,
                            positionLevel: value,
                          }))
                        }
                        value={session.positionLevel}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select position level" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="intern">Intern</SelectItem>
                          <SelectItem value="entry level">Entry Level</SelectItem>
                          <SelectItem value="junior">Junior</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                  <div className="pb-6" >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 items-start justify-start">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-3 sm:mb-0">
                        <Briefcase className="w-5 h-5 text-[#635BFF] mr-2" /> Target Position
                      </h3>
                      <div className="relative w-full sm:w-70">
                        <input
                          type="text"
                          placeholder="Search job titles or descriptions..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#635BFF]/30 focus:outline-none transition-all"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                    </div>
                  </div> 

                    {/* Position Cards Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {currentJobs.map((position) => (
                        <button
                          key={position.title}
                          onClick={() => {
                            setSelectedPositionId(position.title);
                            setCustomJobDescription("");
                          }}
                          className={`
                            p-4 rounded-xl border-2 text-left transition-all duration-200
                            ${selectedPositionId === position.title
                              ? 'border-[#635BFF]/30 bg-[#635BFF]/5 shadow-sm scale-100'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">{position.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {position.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {position.requirements.slice(0, 3).map((req, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-50 text-gray-600 border border-[#635BFF]/50 text-[0.8rem] rounded-full"
                              >
                                {req}
                              </span>
                            ))}
                            {position.requirements.length > 3 && (
                              <span className="px-2 py-1 bg-gray-50 border border-[#635BFF]/50 text-gray-600 text-[0.8rem] rounded-full">
                                +{position.requirements.length - 3} more
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mb-6">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                          className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                        >
                          Previous
                        </button>

                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`px-3 py-2 border rounded-md transition-colors ${
                                currentPage === i + 1
                                  ? "bg-purple-500 text-white border-purple-500"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                          className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    )}

                    {/* Search Results Info */}
                    <div className="mb-4 text-sm text-gray-600 text-center">
                      {searchTerm ? (
                        <>
                          Found {filteredJobs.length} position{filteredJobs.length !== 1 ? 's' : ''} matching "{searchTerm}"
                          {filteredJobs.length === 0 && (
                            <div className="mt-2 text-gray-500">
                              Try searching for different keywords or browse all positions
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-500">
                          Showing {currentJobs.length} of {jobPositions.length} available positions
                        </div>
                      )}
                    </div>

                    <div className="relative py-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="p-4 bg-white text-gray-500 font-semibold">OR</span>
                      </div>
                    </div>

                    {/* Custom Job Description */}
                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-3 ml-1">
                        Custom Job Description
                      </label>
                      <textarea
                        value={customJobDescription}
                        onChange={(e) => {
                          setCustomJobDescription(e.target.value);
                          if (e.target.value.trim()) {
                            setSelectedPositionId("");
                          }
                        }}
                        placeholder="Paste a job description or describe the role you're preparing for..."
                        className={`w-full p-4 border rounded-xl h-28 resize-none transition-all ${
                          selectedPositionId 
                            ? 'border-gray-300 text-gray-500 ' 
                            : 'border-gray-300 bg-white'
                        }
                        focus:border-[#635BFF]/30 focus:ring-2 focus:ring-[#635BFF]/30 focus:bg-white focus:outline-none
                        
                        `}
                      />
                    </div>
                  </div>

                  {/* Selected Position Preview
                  {selectedPositionId && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <Star className="w-5 h-5 text-purple-500 mr-2" />
                        Selected Position Preview
                      </h3>
                      {(() => {
                        const position = jobPositions.find(pos => pos.title === selectedPositionId);
                        return position ? (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-800 mb-2">{position.title}</h4>
                              <p className="text-gray-600 text-sm mb-3">{position.description}</p>
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">Industry:</span> {position.industry} • 
                                <span className="font-medium"> Level:</span> {position.level}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-800 mb-2">Key Requirements:</h5>
                              <div className="flex flex-wrap gap-2">
                                {position.requirements.map((req, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-white text-purple-700 text-sm rounded-full border border-purple-200"
                                  >
                                    {req}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )} */}

                  {/* Start Button */}
                  <div className="mt-8 flex justify-end">
                    <Button
                      onClick={handleStartInterview}
                      disabled={loading || (!selectedPositionId && !customJobDescription.trim())}
                      className="bg-[#635BFF] hover:bg-[#5748e5] text-white py-4 text-lg font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-102"
                    >
                      {loading ? (
                        <>
                          <div className="hover:cursor-not-allowed animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Generating Questions...
                        </>
                      ) : (
                        <>
                        <div className="hover:cursor-pointer">Start Interview Practice</div>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewSetupPage;