// Type definitions for candidate dashboard

export type Environment = {
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

export type Education = {
  id: number;
  level: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: number | null;
  cgpa_grade: string;
  award: string;
};

export type Experience = {
  id: number;
  employer: string;
  title: string;
  industry: string;
  start: string;
  end: string;
  isCurrent: boolean;
  seniorityLevel: string;
  skillsToolsUsed: string;
  projectHighlights: string;
  achievements: string;
};

export type LanguageProficiency = {
  id: number;
  language: string;
  reading: string;
  writing: string;
  listening: string;
  speaking: string;
};

export type CandidateProfile = {
  name: string;
  email: string;
  location: string;
  profileCompletion: number;
  accommodations: string[];
  preferences: {
    workType: string;
    communication: string;
    schedule: string;
  };
  personalIdentifiers: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    emailAddress: string;
    phoneNumber: string;
    residentialAddress: string;
    nric: string;
    oku_card: string;
    linkedin: string;
    preferred_role: string;
    preferred_industry: string;
    preferred_location: string;
  };
  education: {
    level: string;
    fieldOfStudy: string;
    institution: string | null;
    graduationYear: number | null;
    cgpa: number | null;
    grade: string | null;
    award: string | null;
  };
  exp_skill: {
    employer: string;
    industry: string;
    start: string;
    end: string;
    RoleTitle: string;
    YearsInRole: string;
    SeniorityLevel: string;
    SkillsToolsUsed: string;
    ProjectHighlights: string;
    HardSkills: string;
    SoftSkills: string;
    LanguageProficiency: string;
    TechnicalKeywords: string;
    Achievements: string;
  };
  environment: Environment;
};

export type Application = {
  id: number;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: string;
  accommodationsRequested: boolean;
  score: number;
  location: string;
  salary: string;
  interviewDate: string | null;
};

export type SavedJob = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  isInclusive: boolean;
  hasAccommodations: boolean;
  createdAt: string;
};
