import { useState } from 'react';
import { Button } from "@/app/components/button";

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

  const handleSubmitEnvironment = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('No userEmail found in localStorage');
      }

      const requestData = { environment };
      console.log('Saving environment:', requestData);

      const response = await fetch(`http://127.0.0.1:8000/profiles/${userEmail}/environment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        alert('Environment saved successfully!');
        if (onSave) onSave();
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error('Failed to save environment.');
      }
    } catch (error: any) {
      console.error('Error saving environment:', error);
      setError(error.message || 'An error occurred while saving your environment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <Button
        className="bg-[#635bff] hover:bg-[#827CFF] text-white"
        onClick={handleSubmitEnvironment}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save Environment'}
      </Button>
    </div>
  );
}