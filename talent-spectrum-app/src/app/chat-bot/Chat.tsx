"use client";

import { useEffect, useRef, useState } from "react";
import {
  AIMessage,
  UserMessage,
  MessageBar,
  ChatScroller,
  RefreshButton,
} from "@/app/chat-bot";
import { Card } from "../components/card";

interface ChatMessage {
  id: number;
  sender: "user" | "ai";
  text: string;
  source?: "pdf" | "gemini" | "web" | "none";
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll whenever messages change
  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();

    const newUserMessage: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat/rag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        console.error("RAG error:", res.status, msg);
        throw new Error("RAG backend error");
      }

      const data: { answer?: string; source?: string } = await res.json();

      const aiReply: ChatMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text:
          data.answer ?? "Sorry, I could not generate an answer at the moment.",
        source:
          data.source === "pdf" ||
          data.source === "gemini" ||
          data.source === "web" ||
          data.source === "none"
            ? (data.source as ChatMessage["source"])
            : "none",
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (error) {
      console.error(error);
      const aiReply: ChatMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: "Sorry, something went wrong accessing the knowledge base. Please try again later.",
        source: "none",
      };
      setMessages((prev) => [...prev, aiReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setMessages([]);
    setIsLoading(false);
  };

  return (
    <Card>
      <div className="relative">
        <div className="flex justify-end">
          <RefreshButton onClick={handleRefresh} />
        </div>

        <ChatScroller>
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-8 text-sm">
              Start chatting with our AI below 💬
            </div>
          )}

          {messages.map((msg) =>
            msg.sender === "user" ? (
              <UserMessage key={msg.id} text={msg.text} />
            ) : (
              <AIMessage key={msg.id} text={msg.text} source={msg.source} />
            )
          )}

          {/* anchor for auto-scroll */}
          <div ref={bottomRef} />
        </ChatScroller>

        <div className="p-3 border-t">
          <MessageBar
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSend={sendMessage}
          />
        </div>
      </div>
    </Card>
  );
}
