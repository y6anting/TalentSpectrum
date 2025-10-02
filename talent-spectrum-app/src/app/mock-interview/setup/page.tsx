"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/button";
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

const MockInterviewSetupPage = () => {
  const router = useRouter();
  
  const [session, setSession] = useState<InterviewSession>({
    currentQuestion: 0,
    totalQuestions: 5,
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
      
      // Navigate to introduction page
      router.push('/mock-interview/interviewprocess');
      
    } catch (error) {
      console.error("Failed to generate questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="w-full min-h-screen">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold font-momo text-gray-900 mb-4">
              AI Mock Interview
            </h1>
            <p className="text-l font-momo text-gray-600 max-w-6xl mx-auto">
              Practice with AI-generated questions and get personalized feedback to ace your next interview!
            </p>
          </div>

          {/* Main Setup Card */}
          <Card className="w-full shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
            <CardContent className="p-8">
              <div className="gap-8">
                
                {/* Interview Configuration */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <Target className="w-5 h-5 text-blue-500 mr-2" />
                      Interview Type
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {[
                        { value: "general", label: "General Interview", icon: Users, color: "blue", desc: "Interests, experiences and goals" },
                        { value: "technical", label: "Technical Interview", icon: Code, color: "purple", desc: "Problem-solving and task approach" },
                        { value: "behavioral", label: "Behavioral Interview", icon: MessageSquare, color: "green", desc: "Collaboration and communication style" }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setSession(prev => ({ ...prev, interviewType: type.value as InterviewType }))}
                          className={`
                            w-full p-4 rounded-xl border-2 lg:text-left transition-all duration-200
                            ${session.interviewType === type.value
                              ? `border-${type.color}-500 bg-${type.color}-50 shadow-lg scale-100`
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }
                          `}
                        >
                          <div className="cursor-pointer flex flex-col items-center lg:flex-row lg:items-start lg:space-x-3 space-y-3 lg:space-y-0">
                            <div className={`p-2 rounded-lg bg-${type.color}-100`}>
                              <type.icon className={`w-5 h-5 text-${type.color}-500`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{type.label}</div>
                              <div className="text-[0.85rem] text-gray-600">{type.desc}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <Clock className="w-5 h-5 text-red-500 mr-2" />
                      Number of Questions
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                      {[
                        { value: 2, label: "2 Questions", time: "4 min" },
                        { value: 4, label: "4 Questions", time: "8 min" },
                        { value: 6, label: "6 Questions", time: "12 min" },
                        { value: 8, label: "8 Questions", time: "16 min" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`
                            cursor-pointer border-2 rounded-xl p-4 flex sm:flex-col lg:flex-row justify-between items-center transition-all duration-200
                            ${session.totalQuestions === option.value
                              ? "border-purple-500 bg-purple-50 shadow-md"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}
                          `}
                        >
                          <input
                            type="radio"
                            name="totalQuestions"
                            value={option.value}
                            checked={session.totalQuestions === option.value}
                            onChange={() =>
                              setSession((prev) => ({ ...prev, totalQuestions: option.value }))
                            }
                            className="hidden"
                          />
                          <span className="text-gray-900 font-medium text-center">{option.label}</span>
                          <span className="text-base text-gray-600 text-center mt-1 mr-2">{option.time}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <ArrowUpWideNarrow className="w-5 h-5 text-teal-700 mr-2" />
                      Position Level
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                      {[
                        { value: "intern", label: "Intern" },
                        { value: "entry level", label: "Entry Level" },
                        { value: "junior", label: "Junior" },
                        { value: "mid", label: "Mid Level" },
                        { value: "senior", label: "Senior" },
                        { value: "lead", label: "Lead" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`
                            cursor-pointer border-2 rounded-xl p-4 flex sm:flex-col lg:flex-row justify-center items-center transition-all duration-200
                            ${session.positionLevel === option.value
                              ? "border-teal-500 bg-teal-50 shadow-md"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}
                          `}
                        >
                          <input
                            type="radio"
                            name="positionLevel"
                            value={option.value}
                            checked={session.positionLevel === option.value}
                            onChange={() =>
                              setSession((prev) => ({ ...prev, positionLevel: option.value }))
                            }
                            className="hidden"
                          />
                          <div className="text-center">
                            <span className="text-gray-900 font-medium">{option.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 text-purple-700 mr-2" />
                      Select Your Target Position
                    </h3>
                    
                    {/* Search Bar */}
                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="Search job titles or descriptions..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1); // reset to first page on search
                        }}
                        className="w-full p-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        {searchTerm && (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setCurrentPage(1);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Clear search"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        <Search className="w-4 h-4 text-gray-400" />
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
                              ? 'border-purple-700 bg-purple-50 shadow-sm scale-100'
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
                                className="px-2 py-1 bg-gray-100 text-gray-600 border border-gray-300 text-[0.8rem] rounded-full"
                              >
                                {req}
                              </span>
                            ))}
                            {position.requirements.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-gray-600 text-[0.8rem] rounded-full">
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

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="p-4 bg-white text-gray-500 font-semibold">OR</span>
                      </div>
                    </div>

                    {/* Custom Job Description */}
                    <div className="mt-6">
                      <label className="block text-base font-medium font-momo text-gray-700 mb-3 ml-1">
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
                        className={`w-full p-4 border rounded-xl h-32 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none ${
                          selectedPositionId 
                            ? 'border-gray-200 bg-gray-50 text-gray-500' 
                            : 'border-gray-300 bg-white'
                        }`}
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
                  <div className="mt-8">
                    <Button
                      onClick={handleStartInterview}
                      disabled={loading || (!selectedPositionId && !customJobDescription.trim())}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Generating Questions...
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 mr-3" />
                            Start Interview Practice
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