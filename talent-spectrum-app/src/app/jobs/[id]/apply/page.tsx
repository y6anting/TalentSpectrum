"use client"

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components//button";
import { Card, CardContent, CardHeader } from "@/app/components/card";
import { Input } from "@/app/components/input";
import { Label } from "@/app/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";
import { Textarea } from "@/app/components/textarea";
import { Checkbox } from "@/app/components/checkbox";
import { RadioGroup, RadioGroupItem } from "@/app/components/radio-group";
import { Separator } from "@/app/components//separator";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  FileText,
  User,
} from "lucide-react";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface JobApplicationFormProps {
  jobId: string;
  setCurrentPage: (page: string) => void;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

interface Skill {
  id: string;
  name: string;
}

export default function JobApplicationForm({
  jobId,
  setCurrentPage,
}: JobApplicationFormProps) {
  const [fillMethod, setFillMethod] = useState<
    "resume" | "manual" | null
  >(null);
  
  // Animation refs
  const backButtonRef = useRef<HTMLDivElement>(null);
  const selectionHeaderRef = useRef<HTMLDivElement>(null);
  const selectionCardsRef = useRef<HTMLDivElement>(null);
  const formHeaderRef = useRef<HTMLDivElement>(null);
  const formSectionsRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    citizenship: "",
    gender: "",
    race: "",

    // Contact & Address
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postcode: "",

    // Medical & Neurodivergent Information
    isNeurodivergent: "",
    neurodivergentConditions: [] as string[],
    hasOkuCard: "",
    okuNumber: "",
    
    // Neurodivergent Strengths (multiple choice)
    neurodivergentStrengths: [] as string[],
    
    // Preferred Communication Style
    communicationMedium: "",
    teamCollaborationStyle: "",
    checkInFrequency: "",
    presentationComfort: "",
    needsJobCoach: "",
    
    // Environmental & Sensory Needs
    auditoryPreference: "",
    workspaceType: "",
    workdayStructure: "",

    // Job Preferences
    preferredJobTitle: "",
    workType: "",
    workMode: "",

    // Additional Info
    coverLetter: "",
  });

  const [experiences, setExperiences] = useState<Experience[]>(
    [],
  );
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(
    null,
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNeurodivergentConditionChange = (
    condition: string,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      neurodivergentConditions: checked
        ? [...prev.neurodivergentConditions, condition]
        : prev.neurodivergentConditions.filter(
            (c) => c !== condition,
          ),
    }));
  };

  const handleNeurodivergentStrengthChange = (
    strength: string,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      neurodivergentStrengths: checked
        ? [...prev.neurodivergentStrengths, strength]
        : prev.neurodivergentStrengths.filter(
            (s) => s !== strength,
          ),
    }));
  };

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      title: "",
      company: "",
      duration: "",
      description: "",
    };
    setExperiences((prev) => [...prev, newExperience]);
  };

  const updateExperience = (
    id: string,
    field: string,
    value: string,
  ) => {
    setExperiences((prev) =>
      prev.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
    );
  };

  const removeExperience = (id: string) => {
    setExperiences((prev) =>
      prev.filter((exp) => exp.id !== id),
    );
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      year: "",
    };
    setEducation((prev) => [...prev, newEducation]);
  };

  const updateEducation = (
    id: string,
    field: string,
    value: string,
  ) => {
    setEducation((prev) =>
      prev.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu,
      ),
    );
  };

  const removeEducation = (id: string) => {
    setEducation((prev) => prev.filter((edu) => edu.id !== id));
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "",
    };
    setSkills((prev) => [...prev, newSkill]);
  };

  const updateSkill = (id: string, value: string) => {
    setSkills((prev) =>
      prev.map((skill) =>
        skill.id === id ? { ...skill, name: value } : skill,
      ),
    );
  };

  const removeSkill = (id: string) => {
    setSkills((prev) =>
      prev.filter((skill) => skill.id !== id),
    );
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
      // Simulate auto-filling from resume
      setFormData((prev) => ({
        ...prev,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phone: "+60123456789",
        preferredJobTitle: "Software Developer",
      }));
      setExperiences([
        {
          id: "1",
          title: "Software Developer",
          company: "TechCorp Malaysia",
          duration: "2020 - Present",
          description:
            "Developed web applications using React and Node.js",
        },
      ]);
      setEducation([
        {
          id: "1",
          institution: "University of Malaya",
          degree: "Bachelor of Computer Science",
          year: "2019",
        },
      ]);
      setSkills([
        { id: "1", name: "JavaScript" },
        { id: "2", name: "React" },
        { id: "3", name: "Node.js" },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Application submitted:", {
      formData,
      experiences,
      education,
      skills,
      resumeFile,
    });
    // Show success message and redirect
    alert("Application submitted successfully!");
    setCurrentPage("job-details");
  };

  // Mock job data for header
  const job = {
    title: "Senior Software Developer",
    company: "TechCorp",
    location: "Remote / Kuala Lumpur, Malaysia",
  };

  // Animation for method selection screen
  useEffect(() => {
    if (fillMethod !== null) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Back button animation
      if (backButtonRef.current) {
        gsap.from(backButtonRef.current, {
          opacity: 0,
          x: -20,
          duration: 0.5,
          ease: 'power2.out'
        });
      }

      // Header animation
      if (selectionHeaderRef.current) {
        gsap.from(selectionHeaderRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          delay: 0.2,
          ease: 'power2.out'
        });
      }

      // Cards animation
      if (selectionCardsRef.current) {
        gsap.from(selectionCardsRef.current.children, {
          opacity: 0,
          y: 30,
          duration: 0.5,
          stagger: 0.15,
          delay: 0.4,
          ease: 'power2.out'
        });
      }
    });

    return () => ctx.revert();
  }, [fillMethod]);

  // Animation for form screen
  useEffect(() => {
    if (fillMethod === null) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Back button animation
      if (backButtonRef.current) {
        gsap.from(backButtonRef.current, {
          opacity: 0,
          x: -20,
          duration: 0.5,
          ease: 'power2.out'
        });
      }

      // Form header animation
      if (formHeaderRef.current) {
        gsap.from(formHeaderRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          delay: 0.2,
          ease: 'power2.out'
        });
      }

      // Form sections scroll-triggered animation
      if (formSectionsRef.current) {
        const sections = formSectionsRef.current.querySelectorAll('.form-section');
        
        sections.forEach((section) => {
          gsap.from(section, {
            opacity: 0,
            y: 40,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          });
        });
      }
    });

    return () => ctx.revert();
  }, [fillMethod]);

  // Animate newly added items (experiences, education, skills)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || experiences.length === 0) return;

    const lastExperience = document.querySelector(`[data-experience-id="${experiences[experiences.length - 1].id}"]`);
    if (lastExperience) {
      gsap.from(lastExperience, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.4,
        ease: 'back.out(1.2)'
      });
    }
  }, [experiences]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || education.length === 0) return;

    const lastEducation = document.querySelector(`[data-education-id="${education[education.length - 1].id}"]`);
    if (lastEducation) {
      gsap.from(lastEducation, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.4,
        ease: 'back.out(1.2)'
      });
    }
  }, [education]);

  if (fillMethod === null) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <div ref={backButtonRef}>
            <Button
              variant="ghost"
              onClick={() => setCurrentPage("job-details")}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Job Details
            </Button>
          </div>

          {/* Application Method Selection */}
          <Card className="border-2 border-border bg-card">
            <CardHeader ref={selectionHeaderRef} className="text-center pb-8">
              <h1 className="mb-4">Apply for {job.title}</h1>
              <div className="space-y-2 text-muted-foreground mb-6">
                <p className="text-lg">{job.company}</p>
                <p>{job.location}</p>
              </div>
              <p className="text-muted-foreground">
                Choose how you'd like to fill out your
                application
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div ref={selectionCardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                  className="cursor-pointer border-2 border-border hover:border-primary transition-colors bg-card"
                  onClick={() => setFillMethod("resume")}
                >
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="mb-2">Upload Resume</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload your resume and we'll automatically
                      fill in your details
                    </p>
                    <Button className="w-full">
                      Upload & Auto-fill
                    </Button>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer border-2 border-border hover:border-primary transition-colors bg-card"
                  onClick={() => setFillMethod("manual")}
                >
                  <CardContent className="p-6 text-center">
                    <User className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="mb-2">Fill Manually</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter your information manually step by
                      step
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      Fill Manually
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <div ref={backButtonRef}>
          <Button
            variant="ghost"
            onClick={() => setCurrentPage("job-details")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Details
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header */}
          <Card ref={formHeaderRef} className="border-2 border-border bg-card">
            <CardHeader className="pb-6">
              <div className="space-y-4">
                <h1>Job Application</h1>
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <h2 className="text-lg mb-2 text-foreground">{job.title}</h2>
                  <div className="text-muted-foreground space-y-1">
                    <p>{job.company}</p>
                    <p>{job.location}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Please fill out this form completely. All
                  fields marked with * are required.
                </p>
              </div>
            </CardHeader>
          </Card>

          <div ref={formSectionsRef} className="space-y-8">
          {/* Resume Upload */}
          {fillMethod === "resume" && (
            <Card className="form-section border-2 border-border bg-card">
              <CardHeader>
                <h2>Resume Upload *</h2>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border bg-muted/30 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <p>Upload your resume</p>
                    <p className="text-sm text-muted-foreground">
                      Supported formats: PDF, DOC, DOCX (Max
                      5MB)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document
                          .getElementById("resume-upload")
                          ?.click()
                      }
                    >
                      Choose File
                    </Button>
                    {resumeFile && (
                      <div className="text-sm text-green-700 mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="mb-2">
                          ✓ {resumeFile.name} uploaded
                          successfully
                        </p>
                        <p className="text-xs text-green-600">
                          Your information has been
                          automatically filled in the form
                          below. Please review and update as
                          needed.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Information */}
          <Card className="form-section border-2 border-border bg-card">
            <CardHeader>
              <h2>Personal Information</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange(
                        "firstName",
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange(
                        "lastName",
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dateOfBirth">
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange(
                      "dateOfBirth",
                      e.target.value,
                    )
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="citizenship">
                  Citizenship Status *
                </Label>
                <Select
                  value={formData.citizenship}
                  onValueChange={(value) =>
                    handleInputChange("citizenship", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select citizenship status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">
                      Malaysian Citizen
                    </SelectItem>
                    <SelectItem value="permanent-resident">
                      Permanent Resident
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    handleInputChange("gender", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">
                      Female
                    </SelectItem>
                    <SelectItem value="prefer-not-to-say-gender">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="race">Race</Label>
                <Select
                  value={formData.race}
                  onValueChange={(value) =>
                    handleInputChange("race", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select race" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="malay">Malay</SelectItem>
                    <SelectItem value="chinese">
                      Chinese
                    </SelectItem>
                    <SelectItem value="indian">
                      Indian
                    </SelectItem>
                    <SelectItem value="prefer-not-to-say-race">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Address */}
          <Card className="form-section border-2 border-border bg-card">
            <CardHeader>
              <h2>Contact & Address (Malaysia)</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      handleInputChange("email", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      handleInputChange("phone", e.target.value)
                    }
                    placeholder="+60"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">
                  Street Address *
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    handleInputChange("address", e.target.value)
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      handleInputChange("city", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) =>
                      handleInputChange("state", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="johor">
                        Johor
                      </SelectItem>
                      <SelectItem value="kedah">
                        Kedah
                      </SelectItem>
                      <SelectItem value="kelantan">
                        Kelantan
                      </SelectItem>
                      <SelectItem value="melaka">
                        Melaka
                      </SelectItem>
                      <SelectItem value="negeri-sembilan">
                        Negeri Sembilan
                      </SelectItem>
                      <SelectItem value="pahang">
                        Pahang
                      </SelectItem>
                      <SelectItem value="perak">
                        Perak
                      </SelectItem>
                      <SelectItem value="perlis">
                        Perlis
                      </SelectItem>
                      <SelectItem value="pulau-pinang">
                        Pulau Pinang
                      </SelectItem>
                      <SelectItem value="sabah">
                        Sabah
                      </SelectItem>
                      <SelectItem value="sarawak">
                        Sarawak
                      </SelectItem>
                      <SelectItem value="selangor">
                        Selangor
                      </SelectItem>
                      <SelectItem value="terengganu">
                        Terengganu
                      </SelectItem>
                      <SelectItem value="kuala-lumpur">
                        Kuala Lumpur
                      </SelectItem>
                      <SelectItem value="labuan">
                        Labuan
                      </SelectItem>
                      <SelectItem value="putrajaya">
                        Putrajaya
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) =>
                      handleInputChange(
                        "postcode",
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical & Neurodivergent Information */}
          <Card className="form-section border-2 border-primary/20 bg-accent">
            <CardHeader>
              <h2>Neurodivergent Information</h2>
              <p className="text-sm text-muted-foreground">
                This information helps us provide appropriate
                workplace accommodations.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="isNeurodivergent">
                  Are you a neurodivergent?
                </Label>
                <Select
                  value={formData.isNeurodivergent}
                  onValueChange={(value) =>
                    handleInputChange("isNeurodivergent", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.isNeurodivergent === "yes" && (
                <div>
                  <Label>
                    What is your neurodivergent condition?
                    (Select all that apply)
                  </Label>
                  <div className="space-y-2 mt-2">
                    {[
                      "Autism",
                      "ADHD",
                      "Dyslexia",
                      "Others",
                    ].map((condition) => (
                      <div
                        key={condition}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={condition.toLowerCase()}
                          checked={formData.neurodivergentConditions.includes(
                            condition,
                          )}
                          onCheckedChange={(checked) =>
                            handleNeurodivergentConditionChange(
                              condition,
                              checked as boolean,
                            )
                          }
                        />
                        <Label
                          htmlFor={condition.toLowerCase()}
                        >
                          {condition}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="hasOkuCard">
                  Do you have an OKU card?
                </Label>
                <Select
                  value={formData.hasOkuCard}
                  onValueChange={(value) =>
                    handleInputChange("hasOkuCard", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.hasOkuCard === "yes" && (
                <div>
                  <Label htmlFor="okuNumber">
                    OKU Number *
                  </Label>
                  <Input
                    id="okuNumber"
                    value={formData.okuNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "okuNumber",
                        e.target.value,
                      )
                    }
                    placeholder="Enter your OKU number"
                    required={formData.hasOkuCard === "yes"}
                  />
                </div>
              )}
              
              {formData.isNeurodivergent === "yes" && (
                <>
                  <Separator className="my-6" />
                  
                  <div>
                    <Label>
                      What are your neurodivergent strengths?
                      (Select all that apply)
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Help us understand your unique abilities and talents.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {[
                        "Pattern Recognition",
                        "Attention to Detail", 
                        "Systematic Thinking",
                        "Big Picture Thinking",
                        "Task Switching",
                        "Creative/Innovative Thinking",
                        "Hyperfocus"
                      ].map((strength) => (
                        <div
                          key={strength}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={strength.toLowerCase().replace(/[\/\s]/g, '-')}
                            checked={formData.neurodivergentStrengths.includes(
                              strength,
                            )}
                            onCheckedChange={(checked) =>
                              handleNeurodivergentStrengthChange(
                                strength,
                                checked as boolean,
                              )
                            }
                          />
                          <Label
                            htmlFor={strength.toLowerCase().replace(/[\/\s]/g, '-')}
                            className="text-sm"
                          >
                            {strength}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="font-medium mb-4">Communication Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="communicationMedium">
                          Preferred Communication Medium
                        </Label>
                        <Select
                          value={formData.communicationMedium}
                          onValueChange={(value) =>
                            handleInputChange("communicationMedium", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text/Written</SelectItem>
                            <SelectItem value="verbal">Verbal/Spoken</SelectItem>
                            <SelectItem value="mixed">Mix of Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="teamCollaborationStyle">
                          Team Collaboration Style
                        </Label>
                        <Select
                          value={formData.teamCollaborationStyle}
                          onValueChange={(value) =>
                            handleInputChange("teamCollaborationStyle", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="independent">Work Independently</SelectItem>
                            <SelectItem value="small-group">Small Group (2-4 people)</SelectItem>
                            <SelectItem value="large-team">Large Team (5+ people)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="checkInFrequency">
                          Check-in Frequency
                        </Label>
                        <Select
                          value={formData.checkInFrequency}
                          onValueChange={(value) =>
                            handleInputChange("checkInFrequency", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="frequent">Frequent Check-ins</SelectItem>
                            <SelectItem value="scheduled">Scheduled Check-ins</SelectItem>
                            <SelectItem value="autonomous">Given Task & Left to Complete</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="presentationComfort">
                          Presentation Comfort Level
                        </Label>
                        <Select
                          value={formData.presentationComfort}
                          onValueChange={(value) =>
                            handleInputChange("presentationComfort", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select comfort level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="comfortable">Comfortable</SelectItem>
                            <SelectItem value="not-comfortable">Not Comfortable</SelectItem>
                            <SelectItem value="willing-to-try">Willing to Try</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="needsJobCoach">
                          Job Coach Support
                        </Label>
                        <Select
                          value={formData.needsJobCoach}
                          onValueChange={(value) =>
                            handleInputChange("needsJobCoach", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select need" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="need">Need Job Coach</SelectItem>
                            <SelectItem value="no-need">No Need for Job Coach</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="font-medium mb-4">Environmental & Sensory Needs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="auditoryPreference">
                          Auditory Environment Preference
                        </Label>
                        <Select
                          value={formData.auditoryPreference}
                          onValueChange={(value) =>
                            handleInputChange("auditoryPreference", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quiet">Quiet Environment</SelectItem>
                            <SelectItem value="background-noise">Background Noise Okay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="workspaceType">
                          Workspace Type Preference
                        </Label>
                        <Select
                          value={formData.workspaceType}
                          onValueChange={(value) =>
                            handleInputChange("workspaceType", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed-desk">Fixed Desk/Table</SelectItem>
                            <SelectItem value="hot-desk">Hot Desk (Flexible Seating)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="workdayStructure">
                          Workday Structure Preference
                        </Label>
                        <Select
                          value={formData.workdayStructure}
                          onValueChange={(value) =>
                            handleInputChange("workdayStructure", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed-hours">Fixed Work Hours</SelectItem>
                            <SelectItem value="flexible-hours">Flexible Work Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Job Preferences */}
          <Card className="form-section border-2 border-border bg-card">
            <CardHeader>
              <h2>Job Preferences</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="preferredJobTitle">
                  Preferred Job Title
                </Label>
                <Input
                  id="preferredJobTitle"
                  value={formData.preferredJobTitle}
                  onChange={(e) =>
                    handleInputChange(
                      "preferredJobTitle",
                      e.target.value,
                    )
                  }
                  placeholder="e.g., Software Developer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workType">Work Type</Label>
                  <Select
                    value={formData.workType}
                    onValueChange={(value) =>
                      handleInputChange("workType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">
                        Full-time
                      </SelectItem>
                      <SelectItem value="part-time">
                        Part-time
                      </SelectItem>
                      <SelectItem value="freelance">
                        Freelance
                      </SelectItem>
                      <SelectItem value="contract">
                        Contract
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="workMode">Work Mode</Label>
                  <Select
                    value={formData.workMode}
                    onValueChange={(value) =>
                      handleInputChange("workMode", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select work mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-person">
                        In-person
                      </SelectItem>
                      <SelectItem value="hybrid">
                        Hybrid
                      </SelectItem>
                      <SelectItem value="remote">
                        Remote
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="form-section border-2 border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2>Work Experience</h2>
                <Button
                  type="button"
                  onClick={addExperience}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {experiences.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No work experience added yet. Click "Add
                  Experience" to get started.
                </p>
              ) : (
                experiences.map((experience) => (
                  <div
                    key={experience.id}
                    data-experience-id={experience.id}
                    className="border-2 border-border bg-accent rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <h4>Experience Entry</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeExperience(experience.id)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Job Title</Label>
                        <Input
                          value={experience.title}
                          onChange={(e) =>
                            updateExperience(
                              experience.id,
                              "title",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., Software Developer"
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={experience.company}
                          onChange={(e) =>
                            updateExperience(
                              experience.id,
                              "company",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., TechCorp"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={experience.duration}
                        onChange={(e) =>
                          updateExperience(
                            experience.id,
                            "duration",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., Jan 2020 - Dec 2022"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={experience.description}
                        onChange={(e) =>
                          updateExperience(
                            experience.id,
                            "description",
                            e.target.value,
                          )
                        }
                        placeholder="Describe your responsibilities and achievements..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="form-section border-2 border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2>Education</h2>
                <Button
                  type="button"
                  onClick={addEducation}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No education added yet. Click "Add Education"
                  to get started.
                </p>
              ) : (
                education.map((edu) => (
                  <div
                    key={edu.id}
                    data-education-id={edu.id}
                    className="border-2 border-border bg-accent rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <h4>Education Entry</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(edu.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) =>
                            updateEducation(
                              edu.id,
                              "institution",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., University of Malaya"
                        />
                      </div>
                      <div>
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) =>
                            updateEducation(
                              edu.id,
                              "degree",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., Bachelor of Computer Science"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Year</Label>
                      <Input
                        value={edu.year}
                        onChange={(e) =>
                          updateEducation(
                            edu.id,
                            "year",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., 2020"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="form-section border-2 border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2>Skills</h2>
                <Button
                  type="button"
                  onClick={addSkill}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No skills added yet. Click "Add Skill" to get
                  started.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex gap-2">
                      <Input
                        value={skill.name}
                        onChange={(e) =>
                          updateSkill(skill.id, e.target.value)
                        }
                        placeholder="e.g., JavaScript, React, etc."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(skill.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card className="form-section border-2 border-border bg-card">
            <CardHeader>
              <h2>Cover Letter (Optional)</h2>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.coverLetter}
                onChange={(e) =>
                  handleInputChange(
                    "coverLetter",
                    e.target.value,
                  )
                }
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Submit Section */}
          <Card className="form-section border-2 border-border bg-card">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentPage("job-details")}
                >
                  Save as Draft
                </Button>
                <Button type="submit" size="lg">
                  Submit Application
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                By submitting this application, you acknowledge
                that the information provided is accurate and
                complete.
              </p>
            </CardContent>
          </Card>
          </div>
        </form>
      </div>
    </div>
  );
}