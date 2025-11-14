"use client";

import React from "react";
import { Button } from "@/app/components/button";
import { Plus, X } from "lucide-react";
import { NeuroStrengthSubmission } from "../../components/NeuroStrengthSubmission";

interface NeuroStrengthsPageProps {
  strengthOptions: string[];
  selectedStrengths: string[];
  toggleStrength: (strength: string) => void;
  refreshProfileData: () => void;
}

export default function NeuroStrengthsPage({
  strengthOptions,
  selectedStrengths,
  toggleStrength,
  refreshProfileData,
}: NeuroStrengthsPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-gray-600">Select Your Top 10 Strengths</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {strengthOptions
            .filter((strength) => !selectedStrengths.includes(strength))
            .map((strength) => (
              <Button
                key={strength}
                variant="outline"
                className="rounded-full border border-purple-400 text-purple-600 hover:bg-purple-50"
                onClick={() => toggleStrength(strength)}
              >
                {strength}
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            ))}
        </div>

        {selectedStrengths.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-[#3a4043] mb-2">Selected Strengths:</h3>
            <div className="flex flex-wrap gap-3">
              {selectedStrengths.map((strength) => (
                <Button
                  key={strength}
                  variant="outline"
                  className="rounded-full border border-purple-400 bg-purple-100 text-purple-600 hover:bg-purple-200"
                  onClick={() => toggleStrength(strength)}
                >
                  {strength}
                  <X className="ml-2 h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <NeuroStrengthSubmission
            selectedStrengths={selectedStrengths}
            onSave={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('profileUpdated'));
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
