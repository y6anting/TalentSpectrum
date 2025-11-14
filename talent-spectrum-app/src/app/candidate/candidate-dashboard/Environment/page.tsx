"use client";

import React from "react";
import { EnvironmentSubmission } from "../../components/EnvironmentSubmission";

interface EnvironmentPageProps {
  environment: {
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
  refreshProfileData: () => void;
}

export default function EnvironmentPage({
  environment,
  refreshProfileData,
}: EnvironmentPageProps) {
  return (
    <div className="space-y-6">
      <EnvironmentSubmission
        environment={environment}
        onSave={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('profileUpdated'));
          }
        }}
      />
    </div>
  );
}
