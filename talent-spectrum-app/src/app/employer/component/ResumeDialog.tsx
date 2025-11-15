"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeUrl: string | null;
}

export default function ResumeDialog({
  open,
  onOpenChange,
  resumeUrl,
}: ResumeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resume</DialogTitle>
        </DialogHeader>
        {resumeUrl ? (
          <div className="w-full h-full">
            <iframe
              src={resumeUrl}
              className="w-full h-[80vh] border-0"
              title="Resume"
            />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-[#6f7a80]">Resume not available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

