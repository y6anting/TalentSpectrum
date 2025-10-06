"use client"

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/card';
import { Button } from '@/app/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/tabs';
import { Badge } from '@/app/components/badge';
import { CareerGuidance } from '@/app/components/job-coach/CareerGuidance';
import { ResumeHelper } from '@/app/components/job-coach/ResumeHelper';
import { InterviewCoach } from '@/app/components/job-coach/InterviewCoach';
import { WorkplaceSupport } from '@/app/components/job-coach/WorkplaceSupport';
import { LearningHub } from '@/app/components/job-coach/LearningHub';
import { AIJobCoachChat } from '@/app/components/job-coach/AIJobCoach';
import { SessionBooking } from '@/app/components/job-coach/SessionBooking';
import { AccessibilityControls } from '@/app/accessibility-control/page';
import { Heart, Brain, Users, BookOpen, MessageCircle, Calendar, Star, CheckCircle } from 'lucide-react';

interface JobCoachProps {
  setCurrentPage: (page: string) => void;
}

export default function JobCoach({ setCurrentPage }: JobCoachProps) {
  const searchParams = useSearchParams();
  const coachMode = searchParams?.get('role') === 'employer' ? 'employer' : 'candidate';
  const coachHeadline = useMemo(() => coachMode === 'employer' ? 'Employer Job Coach' : 'Your Personal Job Coach', [coachMode]);
  const [activeTab, setActiveTab] = useState('overview');
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
      {/* Accessibility Controls hidden for now */}
      {false && (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-[1400px] mx-auto px-4 py-2">
            <AccessibilityControls darkMode={false} setDarkMode={() => {}} distractionFree={false} setDistractionFree={() => {}} />
          </div>
        </div>
      )}

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
          
          <p className="text-lg text-[#6f7a80] mb-8 max-w-2xl mx-auto leading-relaxed">
            Get personalized career guidance, practice interviews, and learn workplace strategies designed specifically for neurodivergent professionals. Our AI coach is available 24/7, with human coaches ready when you need them.
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white rounded-xl border border-[#e8e6f0] p-1">
              <TabsTrigger value="overview" className="text-sm data-[state=active]:bg-[#635bff] data-[state=active]:text-white rounded-lg">Overview</TabsTrigger>
              <TabsTrigger value="career" className="text-sm data-[state=active]:bg-[#635bff] data-[state=active]:text-white rounded-lg">Career Guidance</TabsTrigger>
              <TabsTrigger value="resume" className="text-sm data-[state=active]:bg-[#635bff] data-[state=active]:text-white rounded-lg">Resume Help</TabsTrigger>
              <TabsTrigger value="interview" className="text-sm data-[state=active]:bg-[#635bff] data-[state=active]:text-white rounded-lg">Interview Prep</TabsTrigger>
              <TabsTrigger value="workplace" className="text-sm data-[state=active]:bg-[#635bff] data-[state=active]:text-white rounded-lg">Workplace Support</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <LearningHub />
              
              {/* Testimonials */}
              <Card className="bg-white rounded-2xl border border-[#e8e6f0] shadow-md mb-10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                    <Star className="w-5 h-5 text-[#635bff]" />
                    Success Stories
                  </CardTitle>
                  <CardDescription>
                    Hear from neurodivergent professionals who found success with our Job Coach
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="bg-white p-4 rounded-xl border border-[#e8e6f0] shadow-sm">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#635bff] text-[#635bff]" />
                          ))}
                        </div>
                        <p className="text-sm text-[#6f7a80] mb-3 italic">"{testimonial.content}"</p>
                        <div>
                          <p className="font-medium text-sm text-[#3a4043]">{testimonial.name}</p>
                          <p className="text-xs text-[#6f7a80]">{testimonial.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="career">
              <CareerGuidance />
            </TabsContent>

            <TabsContent value="resume">
              <ResumeHelper />
            </TabsContent>

            <TabsContent value="interview">
              <InterviewCoach setCurrentPage={setCurrentPage} />
            </TabsContent>

            <TabsContent value="workplace">
              <WorkplaceSupport />
            </TabsContent>
          </Tabs>
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