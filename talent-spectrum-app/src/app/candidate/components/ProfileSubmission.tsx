
import { Button } from "@/app/components/button";

interface ProfileSubmissionProps {
  candidateProfile: any;
}

export function ProfileSubmission({ candidateProfile }: ProfileSubmissionProps) {
  const handleSubmitProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/profiles/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: candidateProfile.personalIdentifiers.fullName,
          email: candidateProfile.personalIdentifiers.emailAddress,
          location: candidateProfile.personalIdentifiers.residentialAddress,
          profile_completion: 0,
          accommodations: [],
          preferences: {
            workType: "",
            communication: "",
            schedule: ""
          },
          personal_identifiers: candidateProfile.personalIdentifiers,
          job_preferences: {
            preferredIndustries: [],
            preferredRoles: [],
            locationPreference: "",
            availability: ""
          },
          education: {
            level: "",
            fieldOfStudy: "",
            institution: "",
            graduationYear: 0,
            cgpa: 0,
            grade: "",
            award: ""
          },
          exp_skill: {
            employer: "",
            industry: "",
            start: "",
            end: "",
            RoleTitle: "",
            YearsInRole: "",
            SeniorityLevel: "",
            SkillsToolsUsed: "",
            ProjectHighlights: "",
            HardSkills: "",
            SoftSkills: "",
            LanguageProficiency: "",
            TechnicalKeywords: "",
            Achievements: ""
          },
          environment: {
            patternRecognition: "",
            attention: "",
            systematicThinking: "",
            bigVsDetail: "",
            taskSwitching: "",
            hyperfocus: "",
            communicationMedium: "",
            clarity: "",
            teamStyle: "",
            presentationComfort: "",
            checkIns: "",
            jobCoach: "",
            auditory: "",
            visual: "",
            workspace: "",
            workdayStructure: ""
          }
        }),
      });
      
      if (response.ok) {
        alert('Profile saved successfully!');
      } else {
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An error occurred while saving your profile.');
    }
  };

  return (
    <Button 
      className="bg-[#635bff] hover:bg-[#827CFF] text-white"
      onClick={handleSubmitProfile}
    >
      Save Changes
    </Button>
  );
}