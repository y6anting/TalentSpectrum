"use client"

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/card';
import { Button } from '@/app/components/button';
import { Badge } from '@/app/components/badge';
import { EmployerJobCoach } from '@/app/components/job-coach/employer/EmployerJobCoach';
import { CandidateJobCoach } from '@/app/components/job-coach/candidate/CandidateJobCoach';
import { AIJobCoachChat } from '@/app/components/job-coach/AIJobCoach';
import { SessionBooking } from '@/app/components/job-coach/SessionBooking';
import { AccessibilityControls } from '@/app/accessibility-control/page';
import { Heart, Brain, Users, BookOpen, MessageCircle, Calendar, Star, CheckCircle, Volume2, Shield } from 'lucide-react';

interface JobCoachProps {
  setCurrentPage: (page: string) => void;
}

export default function JobCoach({ setCurrentPage }: JobCoachProps) {
  const searchParams = useSearchParams();
  const coachMode = searchParams?.get('role') === 'employer' ? 'employer' : 'candidate';
  const coachHeadline = useMemo(() => coachMode === 'employer' ? 'Employer Job Coach' : 'Your Personal Job Coach', [coachMode]);
  const [showBooking, setShowBooking] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Personalized Career Guidance",
      description: "Discover your strengths and find career paths that align with your unique neurotype"
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Resume & Cover Letter Support",
      description: "AI-powered suggestions and templates designed for neurodivergent professionals"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Interview Preparation",
      description: "Practice in a safe, supportive environment with personalized feedback"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Workplace Accommodation",
      description: "Learn strategies for sensory management, communication, and time organization"
    }
  ];

  const testimonials = [
    {
      name: "Alex M.",
      role: "Software Developer",
      content: "The Job Coach helped me understand my ADHD strengths and find a role where I thrive. The interview practice was invaluable!",
      rating: 5
    },
    {
      name: "Sam R.",
      role: "Graphic Designer",
      content: "Finally, career guidance that understands autism. The sensory workplace tips have made all the difference.",
      rating: 5
    },
    {
      name: "Jordan K.",
      role: "Data Analyst",
      content: "The AI coach is available 24/7 and really gets it. When I needed more help, booking a real session was seamless.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      {/* Accessibility Controls */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#e8e6f0]">
        <div className="max-w-[1400px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-[#e8e6f0] text-[#6f7a80] hover:bg-[#635bff]/10"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Text-to-Speech
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-[#e8e6f0] text-[#6f7a80] hover:bg-[#635bff]/10"
              >
                <Shield className="w-4 h-4 mr-2" />
                Dark Mode
              </Button>
            </div>
            <div className="text-xs text-[#6f7a80]">
              Neurodivergent-friendly design
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-[1400px] mx-auto text-center">
          {/* <div className="inline-flex items-center gap-2 bg-[#635bff]/10 text-[#635bff] px-4 py-2 rounded-full mb-6 border border-[#e8e6f0]">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Neurodivergent-Friendly Career Support</span>
          </div> */}
          
          <h1 className="text-4xl font-bold mb-4 text-[#3a4043]">
            {coachHeadline}
          </h1>
          
          <p className="text-lg text-[#6f7a80] mb-8 max-w-4xl mx-auto leading-relaxed">
            Get career guidance, interview practice and workplace tips. 
            <p>
            AI-powered, human-supported.
            </p>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2">
            <Button 
              size="lg" 
              onClick={() => setShowAIChat(true)}
              className="bg-[#635bff] hover:bg-[#524aff] text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {coachMode === 'employer' ? 'Start Employer Coach Chat' : 'Start AI Coaching Chat'}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10"
              onClick={() => setShowBooking(true)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {coachMode === 'employer' ? 'Book Employer Session' : 'Book Human Coach Session'}
            </Button>
          </div>

          {/* Features Grid */}
          {/* <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white rounded-2xl border border-[#e8e6f0] shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-[#635bff]/10 rounded-lg text-[#635bff]">
                      {feature.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold mb-2 text-[#3a4043]">{feature.title}</h3>
                      <p className="text-sm leading-relaxed text-[#6f7a80]">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div> */}
        </div>
      </section>

      {/* Main Coaching Sections */}
      <section className="py-2 px-4">
        <div className="max-w-[1400px] mx-auto">
          {coachMode === 'employer' ? (
            <EmployerJobCoach />
          ) : (
            <CandidateJobCoach />
          )}
        </div>
      </section>

      {/* AI Chat Modal */}
      {showAIChat && (
        <AIJobCoachChat 
          onClose={() => setShowAIChat(false)}
          onScheduleSession={() => {
            setShowAIChat(false);
            setShowBooking(true);
          }}
        />
      )}

      {/* Session Booking Modal */}
      {showBooking && (
        <SessionBooking onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
}