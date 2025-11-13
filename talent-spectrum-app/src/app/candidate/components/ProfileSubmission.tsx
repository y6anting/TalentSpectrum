"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/app/components/button";
import { useToastHelpers } from "@/components/ui/toast";

interface ProfileSubmissionProps {
  candidateProfile: {
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
      preferred_role: string;
      preferred_industry: string;
      preferred_location: string;
    };
    name: string;
    email: string;
    location: string;
  };
  onSave?: () => void;
}

export function ProfileSubmission({ candidateProfile, onSave }: ProfileSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToastHelpers();

  // ✅ Get user session
  const { data: session } = useSession();

  const handleSubmitProfile = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // ✅ Extract user email from session
      const userEmail = session?.user?.email;

      if (!userEmail) {
        throw new Error("User not logged in or session not found.");
      }

      const requestData = {
        personal_identifiers: candidateProfile.personalIdentifiers,
        name: candidateProfile.name,
        email: candidateProfile.email,
        location: candidateProfile.location,
      };

      console.log("Saving personal information:", requestData);

      const response = await fetch(
        `/api/profiles?email=${encodeURIComponent(userEmail)}&type=personal_identifiers`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (response.ok) {
        success('Profile Saved', 'Personal information saved successfully!');
        if (onSave) onSave();
      } else {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        showError('Save Failed', 'Failed to save personal information.');
      }
    } catch (error: any) {
      console.error("Error saving personal information:", error);
      showError('Error', error.message || 'An error occurred while saving your personal information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <Button
        className="bg-[#635bff] hover:bg-[#827CFF] text-white"
        onClick={handleSubmitProfile}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}



// import { Button } from "@/app/components/button";

// interface ProfileSubmissionProps {
//   candidateProfile: any;
// }

// export function ProfileSubmission({ candidateProfile }: ProfileSubmissionProps) {
//   const handleSubmitProfile = async () => {
//     try {
//       const response = await fetch('http://localhost:8000/profiles/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           name: candidateProfile.personalIdentifiers.fullName,
//           email: candidateProfile.personalIdentifiers.emailAddress,
//           location: candidateProfile.personalIdentifiers.residentialAddress,
//           profile_completion: 0,
//           accommodations: [],
//           preferences: {
//             workType: "",
//             communication: "",
//             schedule: ""
//           },
//           personal_identifiers: candidateProfile.personalIdentifiers,
//           job_preferences: {
//             preferredIndustries: [],
//             preferredRoles: [],
//             locationPreference: "",
//             availability: ""
//           },
//           education: {
//             level: "",
//             fieldOfStudy: "",
//             institution: "",
//             graduationYear: 0,
//             cgpa: 0,
//             grade: "",
//             award: ""
//           },
//           exp_skill: {
//             employer: "",
//             industry: "",
//             start: "",
//             end: "",
//             RoleTitle: "",
//             YearsInRole: "",
//             SeniorityLevel: "",
//             SkillsToolsUsed: "",
//             ProjectHighlights: "",
//             HardSkills: "",
//             SoftSkills: "",
//             LanguageProficiency: "",
//             TechnicalKeywords: "",
//             Achievements: ""
//           },
//           environment: {
//             patternRecognition: "",
//             attention: "",
//             systematicThinking: "",
//             bigVsDetail: "",
//             taskSwitching: "",
//             hyperfocus: "",
//             communicationMedium: "",
//             clarity: "",
//             teamStyle: "",
//             presentationComfort: "",
//             checkIns: "",
//             jobCoach: "",
//             auditory: "",
//             visual: "",
//             workspace: "",
//             workdayStructure: ""
//           }
//         }),
//       });
      
//       if (response.ok) {
//         alert('Profile saved successfully!');
//       } else {
//         alert('Failed to save profile. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error saving profile:', error);
//       alert('An error occurred while saving your profile.');
//     }
//   };

//   return (
//     <Button 
//       className="bg-[#635bff] hover:bg-[#827CFF] text-white"
//       onClick={handleSubmitProfile}
//     >
//       Save Changes
//     </Button>
//   );
// }