'use client';
import { useState } from 'react';
import { Button } from "@/app/components/button";
import { useSession } from "next-auth/react";

interface NeuroStrengthSubmissionProps {
  selectedStrengths: string[];
  onSave?: () => void;
}

export function NeuroStrengthSubmission({ selectedStrengths, onSave }: NeuroStrengthSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleSubmitStrengths = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error('No user email found in session');
      }

      const encodedEmail = encodeURIComponent(userEmail);

      const strengthsData = {
        neurodivergent_strengths: selectedStrengths,
      };

      console.log('Saving neurodivergent strengths:', strengthsData);

      const response = await fetch(`/api/profiles?email=${encodedEmail}&type=neurodivergent_strengths`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(strengthsData),
      });

      if (response.ok) {
        alert('Neurodivergent strengths saved successfully!');
        if (onSave) onSave();
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error('Failed to save neurodivergent strengths.');
      }
    } catch (error: any) {
      console.error('Error saving neurodivergent strengths:', error);
      setError(error.message || 'An error occurred while saving your strengths.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <Button
        className="bg-[#635bff] hover:bg-[#827CFF] text-white"
        onClick={handleSubmitStrengths}
        disabled={isSubmitting || !session}
      >
        {isSubmitting ? 'Saving...' : 'Save Strengths'}
      </Button>
      {!session && (
        <p className="text-gray-500 text-sm mt-2">
          Please log in to save your neurodivergent strengths.
        </p>
      )}
    </div>
  );
}
