import { CandidateProfile } from "../types";

export const calculateProfileCompletion = (profile: CandidateProfile): number => {
  let completed = 0;
  const total = 8;

  if (profile.name) completed++;
  if (profile.email) completed++;
  if (profile.education && profile.education.level) completed++;
  if (profile.exp_skill && profile.exp_skill.employer) completed++;
  if (profile.exp_skill && profile.exp_skill.HardSkills) completed++;
  if (profile.accommodations && profile.accommodations.length > 0) completed++;
  if (
    profile.environment &&
    (profile.environment.patternRecognition ||
      profile.environment.communicationMedium ||
      profile.environment.workspace)
  )
    completed++;
  if (profile.personalIdentifiers && profile.personalIdentifiers.fullName) completed++;

  return Math.round((completed / total) * 100);
};
