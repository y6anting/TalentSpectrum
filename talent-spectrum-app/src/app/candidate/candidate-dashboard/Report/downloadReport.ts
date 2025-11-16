// app/report/downloadReport.ts
// Using iframe print approach for better reliability

interface DownloadReportParams {
  reportData?: {
    resume_feedback?: {
      overall_resume_score?: number;
      summary?: string;
      strengths?: string[];
      areas_for_improvement?: string[];
      recommendations?: {
        what_to_add?: string[];
        what_to_remove?: string[];
        formatting_tips?: string[];
        tone_and_language?: string[];
      };
    };
    career_guidance?: {
      suitable_job_roles?: Array<{ role: string; reason: string }>;
      transferable_skills?: string[];
      next_steps?: string[];
    };
    resume_summary?: {
      experience?: string;
      education?: string;
      skills?: string[];
      key_achievements?: string[];
    };
  };
  mockInterviewFeedback?: {
    overall_score?: number;
    strengths?: string[];
    areas_for_improvement?: string[];
  };
  mockInterviewDetails?: {
    position?: string;
    interviewType?: string;
    positionLevel?: string;
    questionCount?: number;
    date?: string;
    duration?: number;
  };
  profileData?: any;
}

// Helper function to generate areas for improvement from profile (matches Report page logic)
const generateAreasForImprovementFromProfile = (profile: any): string[] => {
  const areas: string[] = [];
  
  if (!profile) return areas;
  
  const experiences = Array.isArray(profile.experience) ? profile.experience : 
                     (profile.experiences && Array.isArray(profile.experiences) ? profile.experiences : []);
  if (experiences.length === 0) {
    areas.push("Add work experience to showcase your professional background and skills");
  } else {
    const incompleteExp = experiences.find((exp: any) => 
      exp && (!exp.achievements || !exp.achievements.toString().trim() || 
      !exp.skillsToolsUsed || !exp.skillsToolsUsed.toString().trim())
    );
    if (incompleteExp) {
      areas.push("Enhance experience entries with specific achievements and skills used in each role");
    }
  }
  
  const educations = Array.isArray(profile.education) ? profile.education : 
                    (profile.educations && Array.isArray(profile.educations) ? profile.educations : []);
  if (educations.length === 0) {
    areas.push("Add your educational background including degree, institution, and graduation year");
  } else {
    const incompleteEdu = educations.find((edu: any) => 
      edu && (!edu.fieldOfStudy || !edu.field_of_study || !edu.institution)
    );
    if (incompleteEdu) {
      areas.push("Complete education details including field of study and institution name");
    }
  }
  
  const hasHardSkills = profile.skills?.hardSkills && Array.isArray(profile.skills.hardSkills) && profile.skills.hardSkills.length > 0;
  const hasSoftSkills = profile.skills?.softSkills && Array.isArray(profile.skills.softSkills) && profile.skills.softSkills.length > 0;
  if (!hasHardSkills && !hasSoftSkills) {
    areas.push("Add technical and soft skills to highlight your capabilities");
  } else if (!hasHardSkills) {
    areas.push("Include technical/hard skills relevant to your target roles");
  } else if (!hasSoftSkills) {
    areas.push("Add soft skills such as communication, teamwork, and problem-solving");
  }
  
  if (!profile.personal_identifiers?.phoneNumber || !profile.personal_identifiers?.residentialAddress) {
    areas.push("Complete your contact information for better profile visibility");
  }
  
  if (profile.profile_completion && profile.profile_completion < 70) {
    areas.push("Complete more sections of your profile to increase your profile completion score");
  }
  
  return areas;
};

export const handleDownloadReport = async (params?: DownloadReportParams): Promise<void> => {
  try {
    const reportData = params?.reportData;
    const mockInterviewFeedback = params?.mockInterviewFeedback;
    const mockInterviewDetails = params?.mockInterviewDetails;
    const profileData = params?.profileData;

    // Get strengths - matches Report page logic exactly
    let strengths: string[] = [];
    if (profileData?.neurodivergent_strengths && Array.isArray(profileData.neurodivergent_strengths) && profileData.neurodivergent_strengths.length > 0) {
      strengths = profileData.neurodivergent_strengths;
    } else if (reportData?.resume_feedback?.strengths && Array.isArray(reportData.resume_feedback.strengths) && reportData.resume_feedback.strengths.length > 0) {
      strengths = reportData.resume_feedback.strengths;
    }

    // Get needs - matches Report page logic exactly
    let needs: string[] = [];
    if (profileData?.environment) {
      const env = profileData.environment;
      if (Array.isArray(env)) {
        needs = env;
      } else if (env.preferred_environment && Array.isArray(env.preferred_environment)) {
        needs = env.preferred_environment;
      } else if (env.workplace_needs && Array.isArray(env.workplace_needs)) {
        needs = env.workplace_needs;
      } else if (typeof env === 'object' && env !== null) {
        const envNeeds: string[] = [];
        const preferenceFields: Record<string, string> = {
          communicationMedium: 'Communication: ',
          clarity: 'Clarity preference: ',
          teamStyle: 'Team style: ',
          presentationComfort: 'Presentation comfort: ',
          checkIns: 'Check-ins: ',
          jobCoach: 'Job coach: ',
          auditory: 'Auditory preference: ',
          visual: 'Visual preference: ',
          workspace: 'Workspace: ',
          workdayStructure: 'Workday structure: '
        };
        Object.entries(env).forEach(([key, value]) => {
          if (value && typeof value === 'string' && value.trim()) {
            const prefix = preferenceFields[key] || '';
            envNeeds.push(`${prefix}${value}`);
          }
        });
        if (envNeeds.length > 0) {
          needs = envNeeds;
        }
      }
    }
    if (needs.length === 0) {
      needs = reportData?.resume_feedback?.areas_for_improvement || [];
    }

    // Get areas for improvement - matches Report page logic exactly
    let areasForImprovement: string[] = [];
    if (reportData?.resume_feedback?.areas_for_improvement && Array.isArray(reportData.resume_feedback.areas_for_improvement) && reportData.resume_feedback.areas_for_improvement.length > 0) {
      areasForImprovement = reportData.resume_feedback.areas_for_improvement;
    } else {
      areasForImprovement = generateAreasForImprovementFromProfile(profileData);
    }

    // Get suitable jobs
    const suitableJobs = reportData?.career_guidance?.suitable_job_roles || [];

    // Get resume score
    const resumeScore = reportData?.resume_feedback?.overall_resume_score || profileData?.profile_completion || 0;
    const resumeSummary = reportData?.resume_feedback?.summary || 
      (profileData?.profile_completion ? 
        `Based on your profile completeness (${profileData.profile_completion}%)` : 
        'Based on your profile completeness and experience');

    // Build Resume Summary HTML - matches Report page structure
    const hasExperience = Array.isArray(profileData?.experience) && profileData.experience.length > 0;
    const hasEducation = Array.isArray(profileData?.education) && profileData.education.length > 0;
    const hasSkills = (() => {
      if (!profileData?.skills) return false;
      if (Array.isArray(profileData.skills)) return profileData.skills.length > 0;
      if (profileData.skills.hardSkills && Array.isArray(profileData.skills.hardSkills) && profileData.skills.hardSkills.length > 0) return true;
      if (profileData.skills.softSkills && Array.isArray(profileData.skills.softSkills) && profileData.skills.softSkills.length > 0) return true;
      return false;
    })();

    let experienceHTML = "";
    if (hasExperience) {
      experienceHTML = profileData.experience.slice(0, 3).map((exp: any) => {
        const title = exp.RoleTitle || exp.roleTitle || exp.title || 'Position';
        const employer = exp.employer || exp.company || '';
        const duration = exp.YearsInRole || exp.yearsInRole || exp.duration || '';
        return `<div style="margin-bottom:0.5rem;">
          <p style="margin:0; font-weight:600; color:#1f2937;">${title}</p>
          <p style="margin:0; color:#4b5563; font-size:0.9em;">${employer}${duration ? ` • ${duration}` : ''}</p>
        </div>`;
      }).join("");
    } else {
      experienceHTML = "<p style='color:#6b7280; font-style:italic;'>No experience data available</p>";
    }

    let educationHTML = "";
    if (hasEducation) {
      educationHTML = profileData.education.slice(0, 2).map((edu: any) => {
        const level = edu.level || edu.degree || '';
        const field = edu.fieldOfStudy || edu.field || '';
        const institution = edu.institution || '';
        const year = edu.graduationYear ? ` • ${edu.graduationYear}` : '';
        return `<div style="margin-bottom:0.5rem;">
          <p style="margin:0; font-weight:600; color:#1f2937;">${level}${field ? ` in ${field}` : ''}</p>
          <p style="margin:0; color:#4b5563; font-size:0.9em;">${institution}${year}</p>
        </div>`;
      }).join("");
    } else {
      educationHTML = "<p style='color:#6b7280; font-style:italic;'>No education data available</p>";
    }

    let skillsHTML = "";
    if (hasSkills) {
      let skillsList: string[] = [];
      if (profileData.skills?.hardSkills && Array.isArray(profileData.skills.hardSkills)) {
        skillsList = [...skillsList, ...profileData.skills.hardSkills];
      }
      if (profileData.skills?.softSkills && Array.isArray(profileData.skills.softSkills)) {
        skillsList = [...skillsList, ...profileData.skills.softSkills];
      }
      if (skillsList.length > 0) {
        skillsHTML = skillsList.slice(0, 10).map(skill => 
          `<span style="display:inline-block; padding:0.25rem 0.75rem; margin:0.25rem; background-color:rgba(99, 91, 255, 0.1); color:rgb(99, 91, 255); border-radius:9999px; font-size:0.75rem; font-weight:500;">${skill}</span>`
        ).join("");
      } else {
        skillsHTML = "<p style='color:#6b7280; font-style:italic;'>No skills data available</p>";
      }
    } else {
      skillsHTML = "<p style='color:#6b7280; font-style:italic;'>No skills data available</p>";
    }

    // Build HTML content for print - matches Report page structure exactly
    // Using exact font sizes: text-xl (1.25rem) for h3, text-sm (0.875rem) for content, font-medium for titles
    const strengthsHTML = strengths.length > 0
      ? strengths.map(s => `<div style="display:flex; gap:0.5rem; align-items:flex-start; margin-bottom:0.25rem;">
        <span style="color:rgb(99, 91, 255); margin-top:0.25rem; font-size:1rem;">•</span>
        <p style="margin:0; color:#374151; font-size:0.875rem;">${s}</p>
      </div>`).join("")
      : "<p style='color:#6b7280; font-style:italic; font-size:0.875rem;'>No strengths data available</p>";

    const needsHTML = needs.length > 0
      ? needs.slice(0, 3).map(n => `<div style="display:flex; gap:0.5rem; align-items:flex-start; margin-bottom:0.25rem;">
        <span style="color:rgb(99, 91, 255); margin-top:0.25rem; font-size:1rem;">•</span>
        <p style="margin:0; color:#374151; font-size:0.875rem;">${n}</p>
      </div>`).join("")
      : "<p style='color:#6b7280; font-style:italic; font-size:0.875rem;'>No needs data available</p>";

    const areasHTML = areasForImprovement.length > 0
      ? areasForImprovement.map((a, index) => {
          const priority = index === 0 ? "High" : index === 1 ? "Medium" : "Low";
          const priorityColors = {
            High: { bg: "rgb(254, 226, 226)", text: "rgb(153, 27, 27)", border: "rgb(252, 165, 165)" },
            Medium: { bg: "rgb(254, 240, 138)", text: "rgb(133, 77, 14)", border: "rgb(253, 224, 71)" },
            Low: { bg: "rgb(219, 234, 254)", text: "rgb(30, 64, 175)", border: "rgb(147, 197, 253)" }
          };
          const colors = priorityColors[priority];
          return `<div style="padding:0.75rem; border-left:4px solid rgb(220, 38, 38); background:linear-gradient(to right, rgb(254, 242, 242), white); border-radius:0.5rem; margin-bottom:0.75rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <p style="margin:0; color:#374151; font-size:0.875rem; flex:1; padding-right:0.5rem;">${a}</p>
              <span style="padding:0.25rem 0.5rem; border-radius:9999px; font-size:0.75rem; font-weight:500; border:1px solid ${colors.border}; background-color:${colors.bg}; color:${colors.text};">${priority}</span>
            </div>
          </div>`;
        }).join("")
      : "<p style='color:#6b7280; font-style:italic; text-align:center; padding:1.5rem;'>No improvement areas identified. Your profile looks complete!</p>";

    const jobsHTML = suitableJobs.length > 0
      ? suitableJobs.map(job => `<div style="padding:1rem; border:1px solid rgba(99, 91, 255, 0.2); background-color:rgba(99, 91, 255, 0.05); border-radius:0.5rem; margin-bottom:1rem;">
        <h4 style="margin:0 0 0.5rem 0; font-weight:600; color:rgb(99, 91, 255);">${job.role}</h4>
        <p style="margin:0; color:#4b5563; font-size:0.875rem;">${job.reason}</p>
      </div>`).join("")
      : "<p style='color:#6b7280; font-style:italic;'>No suitable job roles suggested.</p>";

    // Resume Summary HTML - matches Report page structure exactly
    // Using w-4 h-4 icons (1rem = 16px) and font-semibold (font-weight:600) for h4
    // Using exact SVG icons from lucide-react to match Report page
    const resumeSummaryHTML = `
      <div style="margin-bottom:1.5rem;">
        <h4 style="margin:0 0 0.75rem 0; font-weight:600; color:#1f2937; font-size:1rem; display:flex; align-items:center; gap:0.5rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(99, 91, 255)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          Experience
        </h4>
        ${experienceHTML}
      </div>
      <div style="margin-bottom:1.5rem;">
        <h4 style="margin:0 0 0.75rem 0; font-weight:600; color:#1f2937; font-size:1rem; display:flex; align-items:center; gap:0.5rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(99, 91, 255)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
          Education
        </h4>
        ${educationHTML}
      </div>
      <div style="margin-bottom:1rem;">
        <h4 style="margin:0 0 0.75rem 0; font-weight:600; color:#1f2937; font-size:1rem; display:flex; align-items:center; gap:0.5rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(99, 91, 255)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          Skills
        </h4>
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
          ${skillsHTML}
        </div>
      </div>
    `;

    // Score circle HTML (simplified for print)
    const scoreCircleHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:1rem; background-color:#f8f5ff; border-radius:0.5rem; margin-bottom:1.5rem;">
        <div style="flex:1; padding-right:1.5rem;">
          <h4 style="margin:0 0 0.25rem 0; font-size:1.125rem; font-weight:600; color:#1f2937;">Overall Resume Score</h4>
          <p style="margin:0; color:#4b5563; font-size:0.875rem;">${resumeSummary}</p>
        </div>
        <div style="position:relative; width:112px; height:112px; flex-shrink:0;">
          <div style="position:absolute; inset:0; border-radius:50%; border:10px solid #e5e7eb;"></div>
          <div style="position:absolute; inset:0; border-radius:50%; border:10px solid rgb(99, 91, 255); border-top-color:transparent; border-right-color:transparent; transform:rotate(${(resumeScore / 100) * 360 - 90}deg);"></div>
          <div style="position:absolute; inset:4px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center;">
            <span style="font-size:1.5rem; font-weight:bold; color:rgb(99, 91, 255);">${resumeScore}</span>
          </div>
        </div>
      </div>
    `;

    // Mock Interview HTML - matches Report page structure exactly
    let mockInterviewHTML = "";
    if (mockInterviewFeedback) {
      const score = mockInterviewFeedback.overall_score || 0;
      
      const strengthsHTML_mock = mockInterviewFeedback.strengths?.length > 0
        ? mockInterviewFeedback.strengths.map((s: string) => {
            const cleaned = s.replace(/^[-*•\s]+/, '').replace(/[\s*•-]+$/,'');
            return `<div style="padding:1rem; background-color:rgba(99, 91, 255, 0.05); border:1px solid rgba(99, 91, 255, 0.2); border-radius:0.75rem; margin-bottom:0.75rem;">
              <div style="display:flex; align-items:flex-start;">
                <span style="color:rgb(99, 91, 255); margin-right:0.5rem; margin-top:0.125rem;">✓</span>
                <span style="color:#1f2937;">${cleaned}</span>
              </div>
            </div>`;
          }).join("")
        : "<p style='color:#6b7280; font-style:italic;'>No strengths data available</p>";

      const areasHTML_mock = mockInterviewFeedback.areas_for_improvement?.length > 0
        ? mockInterviewFeedback.areas_for_improvement.map((a: string, index: number) => {
            const cleaned = a.replace(/^\s*([0-9]+\.|[-*•])\s*/, '').replace(/[\s*•-]+$/,'');
            return `<div style="padding:1rem; background-color:rgb(254, 242, 242); border:1px solid rgb(254, 226, 226); border-radius:0.75rem; margin-bottom:0.75rem;">
              <div style="display:flex; align-items:flex-start;">
                <div style="width:20px; height:20px; background-color:rgb(239, 68, 68); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-right:0.75rem; margin-top:0.125rem; flex-shrink:0;">
                  <span style="color:white; font-size:0.75rem; font-weight:600;">${index + 1}</span>
                </div>
                <p style="margin:0; color:#1f2937; line-height:1.5;">${cleaned}</p>
              </div>
            </div>`;
          }).join("")
        : "<p style='color:#6b7280; font-style:italic;'>No improvement areas identified</p>";

      const detailsHTML = mockInterviewDetails
        ? `
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; padding:1rem; background:linear-gradient(to right, rgb(239, 246, 255), rgb(250, 245, 255)); border-radius:0.5rem; margin-bottom:1.5rem;">
            <div>
              <div style="font-size:0.75rem; color:#4b5563; margin-bottom:0.25rem;">Position</div>
              <div style="font-weight:600; color:#1f2937;">${mockInterviewDetails.position || 'N/A'}</div>
            </div>
            <div>
              <div style="font-size:0.75rem; color:#4b5563; margin-bottom:0.25rem;">Interview Type</div>
              <div style="font-weight:600; color:#1f2937; text-transform:capitalize;">${mockInterviewDetails.interviewType || 'N/A'}</div>
            </div>
            <div>
              <div style="font-size:0.75rem; color:#4b5563; margin-bottom:0.25rem;">Position Level</div>
              <div style="font-weight:600; color:#1f2937; text-transform:capitalize;">${mockInterviewDetails.positionLevel || 'N/A'}</div>
            </div>
            <div>
              <div style="font-size:0.75rem; color:#4b5563; margin-bottom:0.25rem;">Questions Answered</div>
              <div style="font-weight:600; color:#1f2937;">${mockInterviewDetails.questionCount || 0}</div>
            </div>
            ${mockInterviewDetails.date ? `
            <div>
              <div style="font-size:0.75rem; color:#4b5563; margin-bottom:0.25rem;">Completed On</div>
              <div style="font-weight:600; color:#1f2937;">${mockInterviewDetails.date}</div>
              ${mockInterviewDetails.duration ? `<div style="font-size:0.75rem; color:#6b7280; margin-top:0.125rem;">${mockInterviewDetails.duration} min</div>` : ''}
            </div>
            ` : ''}
          </div>
        `
        : "";

      mockInterviewHTML = `
        <div class="section card">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(99, 91, 255)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <h3 style="margin:0; color:#1f2937; font-size:1.25rem; font-weight:bold;">Mock Interview Performance</h3>
            </div>
            ${score > 0 ? `
            <div style="text-align:center;">
              <div style="font-size:1.875rem; font-weight:bold; color:rgb(99, 91, 255);">${score}/100</div>
              <div style="font-size:0.75rem; color:#4b5563;">Interview Score</div>
            </div>
            ` : ''}
          </div>
          ${detailsHTML}
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-top:1.5rem;">
            <div>
              <h4 style="margin:0 0 1rem 0; font-weight:600; color:#1f2937; font-size:1rem; display:flex; align-items:center; gap:0.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(99, 91, 255)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Key Strengths
              </h4>
              ${strengthsHTML_mock}
            </div>
            <div>
              <h4 style="margin:0 0 1rem 0; font-weight:600; color:#1f2937; font-size:1rem; display:flex; align-items:center; gap:0.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(239, 68, 68)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M3 8h4"></path><path d="M7 8v8"></path><path d="M14 8h4"></path><path d="M10 12h4"></path><path d="M21 12h-4"></path><path d="M21 16H3"></path><path d="M21 4H3"></path></svg>
                Areas to Improve
              </h4>
              ${areasHTML_mock}
            </div>
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Feedback Report</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .section { page-break-inside: avoid; }
            }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              background: white; 
              color: #1f2937;
            }
            h1 { 
              color:#1f2937; 
              font-size: 1.875rem;
              font-weight: bold;
              margin-bottom: 0.5rem;
            }
            h2 { 
              color:#1f2937; 
              margin-bottom:0.5rem; 
              font-size: 1.25rem;
              font-weight: bold;
            }
            h3 {
              color:#1f2937;
              font-size: 1rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            .section { margin-bottom: 1.5rem; }
            .card { 
              border:1px solid #e5e7eb; 
              padding:1.5rem; 
              border-radius:0.5rem; 
              background:white; 
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          <h1>Feedback Report</h1>
          <p style="color:#4b5563; margin-bottom:1.5rem;">Comprehensive analysis of your profile and interview performance</p>

          <!-- Strengths & Needs Section -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
            <div class="card">
              <h3 style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem; font-size:1.25rem; font-weight:bold; color:#1f2937;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(99, 91, 255)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Strength
              </h3>
              ${strengthsHTML}
            </div>

            <div class="card">
              <h3 style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem; font-size:1.25rem; font-weight:bold; color:#1f2937;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(99, 91, 255)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                Needs
              </h3>
              ${needsHTML}
            </div>
          </div>

          <!-- Resume Summary & Areas for Improvement Section -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
            <div class="card">
              <h3 style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1.5rem; font-size:1.25rem; font-weight:bold; color:#1f2937;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(99, 91, 255)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Resume Summary
              </h3>
              ${resumeSummaryHTML}
            </div>

            <div class="card">
              <h3 style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1.5rem; font-size:1.25rem; font-weight:bold; color:#1f2937;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                Resume Areas for Improvement
              </h3>
              ${scoreCircleHTML}
              ${areasHTML}
            </div>
          </div>

          <!-- Suitable Job Roles Section -->
          ${suitableJobs.length > 0 ? `
          <div class="card section">
            <h3 style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1.5rem; font-size:1.25rem; font-weight:bold; color:#1f2937;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(99, 91, 255)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              You Are Suitable to Work As
            </h3>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem;">
              ${jobsHTML}
            </div>
          </div>
          ` : ''}

          <!-- Mock Interview Performance Section -->
          ${mockInterviewHTML}
        </body>
      </html>
    `;

    // Create iframe and print
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Wait for content to load, then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 500);
    };

    // Fallback if onload doesn't fire
    setTimeout(() => {
      if (iframe.parentElement) {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (iframe.parentElement) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    }, 1000);

  } catch (error) {
    console.error("Failed to generate report:", error);
    alert("Failed to generate report. Please try again.");
  }
};