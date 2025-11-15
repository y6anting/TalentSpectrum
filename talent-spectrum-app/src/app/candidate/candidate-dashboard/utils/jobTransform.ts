// Shared job transformation utility
// This ensures consistent data formatting across Browse Jobs, My Applications, and Saved Jobs

const SALARY_RANGES = [
  "Below RM 3,000",
  "RM 3,000 - RM 5,000",
  "RM 5,001 - RM 8,000",
  "RM 8,001 - RM 12,000",
  "RM 12,001 - RM 18,000",
  "RM 18,001 - RM 25,000",
  "Above RM 25,000",
];

export interface Job {
  id: number;
  employer_email: string;
  job_title: string;
  job_type: string;
  work_mode: string;
  experience_level: string;
  location: string;
  salary_range: number;
  job_summary: string;
  job_requirements: string;
  soft_skills: string;
  flexible_work_hour: boolean;
  sensory_friendly_environment: boolean;
  peer_support_system: boolean;
  dedicated_workspace: boolean;
  neurodiversity_awareness_training: boolean;
  regular_supervisor_check_in: boolean;
  zero_tolerance_bullying_mobbing_policy: boolean;
  augmentative_alternative_communication: boolean;
  quiet_room: boolean;
  sensory_aids: boolean;
  provide_visual_guidance: boolean;
  uses_project_management_tools: boolean;
  optional_social_event: boolean;
  mental_health_support: boolean;
  near_public_transport: boolean;
  created_at?: string; // ISO date string
  application_deadline?: string; // ISO date string
  status?: string; // Job status (active, closed, expired)
}

export interface DisplayJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  salaryRange?: number;
  postedDate: string;
  matchScore: number;
  accommodationsFriendly: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  accommodations?: string[];
  companySize: string;
  industry: string;
  applicationDeadline: string;
  neurodivergentFriendly: boolean;
  primaryMatchScore?: number;
  secondaryMatchScore?: number;
  tertiaryMatchScore?: number;
  status?: string; // Job status (active, closed, expired)
}

export const transformJob = (job: Job): DisplayJob => {
  // Calculate accommodations friendly based on multiple factors
  const accommodationsFriendly = 
    job.flexible_work_hour ||
    job.sensory_friendly_environment ||
    job.peer_support_system ||
    job.dedicated_workspace ||
    job.neurodiversity_awareness_training ||
    job.regular_supervisor_check_in ||
    job.zero_tolerance_bullying_mobbing_policy ||
    job.augmentative_alternative_communication ||
    job.quiet_room ||
    job.sensory_aids ||
    job.provide_visual_guidance ||
    job.uses_project_management_tools ||
    job.mental_health_support ||
    job.near_public_transport;

  // Parse requirements and soft skills
  const requirements = job.job_requirements ? job.job_requirements.split(',').map(r => r.trim()) : [];
  const softSkills = job.soft_skills ? job.soft_skills.split(',').map(s => s.trim()) : [];
  
  // Create accommodations array based on job accommodations
  const accommodations = [];
  if (job.flexible_work_hour) accommodations.push("Flexible Work Hours");
  if (job.quiet_room) accommodations.push("Quiet Room/Space");
  if (job.sensory_friendly_environment) accommodations.push("Sensory-Friendly Environment");
  if (job.peer_support_system) accommodations.push("Peer Support System");
  if (job.dedicated_workspace) accommodations.push("Dedicated Workspace");
  if (job.sensory_aids) accommodations.push("Sensory Aids Allowed");
  if (job.neurodiversity_awareness_training) accommodations.push("Neurodiversity Awareness Training");
  if (job.provide_visual_guidance) accommodations.push("Visual Project-Tracking Tool");
  if (job.regular_supervisor_check_in) accommodations.push("Regular Check-in with Supervisor");
  if (job.optional_social_event) accommodations.push("No Forced Social Events");
  if (job.zero_tolerance_bullying_mobbing_policy) accommodations.push("Zero Tolerance Policy for Bullying & Mobbing");
  if (job.mental_health_support) accommodations.push("Mental Health Support");
  if (job.augmentative_alternative_communication) accommodations.push("Alternative Communication App Allowed");
  if (job.near_public_transport) accommodations.push("Near Public Transport");

  // Calculate match score (simplified - in real app this would be more sophisticated)
  let matchScore = 70; // Base score
  if (accommodationsFriendly) matchScore += 15;
  if (job.work_mode === "Remote") matchScore += 5;
  if (job.flexible_work_hour) matchScore += 5;
  if (job.neurodiversity_awareness_training) matchScore += 5;

  // Use actual dates from backend if available, otherwise use defaults
  const postedDate = job.created_at 
    ? new Date(job.created_at).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  
  const applicationDeadline = job.application_deadline
    ? new Date(job.application_deadline).toISOString().split('T')[0]
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now as fallback

  // Determine job status - check if expired based on deadline
  let jobStatus = job.status || 'active';
  if (job.application_deadline && new Date(job.application_deadline) < new Date()) {
    jobStatus = 'expired';
  }

  return {
    id: job.id.toString(),
    title: job.job_title,
    company: job.employer_email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    location: job.location,
    type: job.job_type,
    salary: SALARY_RANGES[job.salary_range] || `RM${job.salary_range}k - RM${job.salary_range + 20}k / month`,
    salaryRange: job.salary_range,
    postedDate,
    matchScore: Math.min(matchScore, 100),
    accommodationsFriendly,
    description: job.job_summary,
    requirements: [...requirements, ...softSkills],
    benefits: accommodations,
    accommodations: accommodations,
    companySize: "50-500 employees",
    industry: "Technology",
    applicationDeadline,
    neurodivergentFriendly: accommodationsFriendly,
    primaryMatchScore: Math.min(matchScore, 100),
    secondaryMatchScore: Math.min(matchScore - 5, 95),
    tertiaryMatchScore: Math.min(matchScore - 10, 90),
    status: jobStatus, // Include job status
  };
};

// Helper function to find matching job by title and company
export const findMatchingJob = (jobs: Job[], jobTitle: string, company: string): Job | null => {
  if (!jobTitle || !company || jobs.length === 0) {
    console.log('findMatchingJob: Missing data', { jobTitle, company, jobsCount: jobs.length });
    return null;
  }
  
  const normalizedCompany = company.toLowerCase().trim();
  const normalizedTitle = jobTitle.toLowerCase().trim();
  
  // Company name from application is stored in Title Case (e.g., "Tech Company")
  // We need to match it with the email-derived company name
  const companyTitleCase = company.trim(); // Keep original title case from application
  
  console.log('findMatchingJob: Searching for', { normalizedTitle, normalizedCompany, companyTitleCase });
  
  const match = jobs.find(job => {
    const jobTitleMatch = job.job_title?.toLowerCase().trim() === normalizedTitle;
    if (!jobTitleMatch) return false;
    
    // Extract company name from email (same way it's stored in application)
    const companyFromEmail = job.employer_email?.split('@')[0].replace(/[._]/g, ' ').trim() || '';
    const companyFromEmailLower = companyFromEmail.toLowerCase();
    const companyFromEmailTitleCase = companyFromEmail.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    // Try multiple matching strategies
    // 1. Exact match (case-insensitive)
    const exactMatch = companyFromEmailLower === normalizedCompany;
    
    // 2. Title case match (application stores in Title Case)
    const titleCaseMatch = companyFromEmailTitleCase === companyTitleCase;
    
    // 3. Partial match (case-insensitive)
    const partialMatch = companyFromEmailLower.includes(normalizedCompany) || 
                        normalizedCompany.includes(companyFromEmailLower);
    
    // 4. Title case partial match
    const titleCasePartialMatch = companyFromEmailTitleCase.toLowerCase().includes(normalizedCompany) ||
                                  normalizedCompany.includes(companyFromEmailTitleCase.toLowerCase());
    
    const companyMatch = exactMatch || titleCaseMatch || partialMatch || titleCasePartialMatch;
    
    if (companyMatch) {
      console.log('findMatchingJob: Found match!', {
        jobId: job.id,
        jobTitle: job.job_title,
        companyFromEmail,
        companyFromEmailTitleCase,
        applicationCompany: companyTitleCase,
        matchType: exactMatch ? 'exact' : titleCaseMatch ? 'titleCase' : partialMatch ? 'partial' : 'titleCasePartial',
      });
      return true;
    }
    
    return false;
  });
  
  if (!match) {
    console.log('findMatchingJob: No match found. Sample jobs:', jobs.slice(0, 3).map(j => ({
      id: j.id,
      title: j.job_title,
      companyFromEmail: j.employer_email?.split('@')[0],
      companyFromEmailFormatted: j.employer_email?.split('@')[0].replace(/[._]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    })));
  }
  
  return match || null;
};

export { SALARY_RANGES };

