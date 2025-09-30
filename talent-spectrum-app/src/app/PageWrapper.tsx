"use client";

import { useState } from "react";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState("home");

  // Pages where footer should appear
  const pagesWithFooter = ["home", "jobs", "about", "dashboard"];

  return (
    <div className="min-h-screen flex flex-col">
      <Header setCurrentPage={setCurrentPage} />
      <main className="flex-1">{children}</main>
      {pagesWithFooter.includes(currentPage) && (
        <Footer setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}
