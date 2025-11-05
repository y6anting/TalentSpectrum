"use client";
import { useState } from "react";
import RealisticAvatar from "./RealisticAvatar";
import VoiceRecorder from "./VoiceRecorder";
import Loader from "./Loader";

export default function InterviewUI() {
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUserAnswer = async (answer: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();
      setAiResponse(data.feedback);
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <RealisticAvatar currentQuestion={aiResponse} />
      <VoiceRecorder onTranscribed={handleUserAnswer} />
      {loading && <Loader />}
      {aiResponse && (
        <div className="p-4 bg-gray-100 rounded-lg w-full max-w-lg text-gray-800">
          <strong>AI Feedback:</strong> {aiResponse}
        </div>
      )}
    </div>
  );
}
