'use client';
import { useState } from 'react';
import { Button } from "@/app/components/button";
import { useSession } from "next-auth/react";
import { useToastHelpers } from "@/components/ui/toast";

interface EnvironmentSubmissionProps {
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
  onSave?: () => void;
}

export function EnvironmentSubmission({ environment, onSave }: EnvironmentSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const { success, error: showError } = useToastHelpers();

  const handleSubmitEnvironment = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error('No user email found in session');
      }

      const encodedEmail = encodeURIComponent(userEmail);

      const requestData = { environment };
      console.log('Saving environment:', requestData);

      const response = await fetch(`/api/profiles?email=${encodedEmail}&type=environment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        success('Environment Saved', 'Environment preferences saved successfully!');
        if (onSave) onSave();
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error('Failed to save environment.');
      }
    } catch (error: any) {
      console.error('Error saving environment:', error);
      const errorMessage = error.message || 'An error occurred while saving your environment.';
      setError(errorMessage);
      showError('Save Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <Button
        className="bg-[#635bff] hover:bg-[#827CFF] text-white justify-end hover:cursor-pointer"
        onClick={handleSubmitEnvironment}
        disabled={isSubmitting || !session}
      >
        {isSubmitting ? 'Saving...' : 'Save Environment'}
      </Button>
      {!session && (
        <p className="text-gray-500 text-sm mt-2">
          Please log in to save your environment details.
        </p>
      )}
    </div>
  );
}
