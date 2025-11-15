"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/app/components/card";
import { Calendar, Video, User, Clock, Search, Building, Briefcase, MessageSquare, CalendarClock, MapPin } from "lucide-react"
import { useSession } from "next-auth/react";
import { useToastHelpers } from "@/components/ui/toast";

type Appointment = {
  id: number;
  jobCoach: string;
  candidate: string | null;
  dateTime: Date;
};

type Candidate = {
  email: string;
  name: string;
  title?: string;
  location?: string;
  profile_picture_url?: string;
  available_appointments?: Array<{
    id: number;
    dateTime: string;
    candidate: string | null;
  }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const APPOINTMENT_BASE_URL = `${BASE_URL}/appointment`;

export default function JobCoachAppointmentPage() {
  const { data: session } = useSession();
  const { success, error: showError } = useToastHelpers();
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointmentMonth, setAppointmentMonth] = useState(new Date().getMonth());
  const [appointmentYear, setAppointmentYear] = useState(new Date().getFullYear());
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const coachEmail = session?.user?.email || "";
  const meetUrl = "https://meet.google.com/"; // change this url to google meet. make sure it has https
  
  // Fetch all candidates
  const fetchCandidates = async () => {
    try {
      setLoadingCandidates(true);
      const res = await fetch(`${BASE_URL}/profiles/`);
      if (!res.ok) {
        throw new Error("Failed to fetch candidates");
      }
      const data: any[] = await res.json();
      
      // Transform candidate profiles to Candidate type
      const transformedCandidates: Candidate[] = data.map((profile: any) => ({
        email: profile.candidate_email || profile.email || "",
        name: profile.name || profile.personal_identifiers?.fullName || profile.candidate_email || profile.email || "Unknown",
        title: profile.title || profile.personal_identifiers?.jobTitle || "",
        location: profile.location || profile.personal_identifiers?.location || "",
        profile_picture_url: profile.profile_picture_url || profile.personal_identifiers?.profile_picture_url,
        available_appointments: [] // Will be populated from appointments
      }));
      
      setCandidates(transformedCandidates);
      
      // Fetch ALL appointments to include booked ones
      const allAppointmentsRes = await fetch(`${APPOINTMENT_BASE_URL}/all`);
      if (allAppointmentsRes.ok) {
        const allAppointmentsData: Appointment[] = await allAppointmentsRes.json();
        const converted = allAppointmentsData.map(a => ({ ...a, dateTime: new Date(a.dateTime) }));
        setAppointments(converted);
        
        // Populate available_appointments for each candidate
        const candidatesWithAppointments = transformedCandidates.map(candidate => {
          const candidateAppointments = converted
            .filter(apt => apt.jobCoach === coachEmail && apt.candidate === candidate.email)
            .map(apt => ({
              id: apt.id,
              dateTime: apt.dateTime.toISOString(),
              candidate: apt.candidate,
            }));
          
          return {
            ...candidate,
            available_appointments: candidateAppointments,
          };
        });
        
        setCandidates(candidatesWithAppointments);
      }
    } catch (err) {
      console.error("Error fetching candidates:", err);
      showError("Error", "Failed to fetch candidates. Please try again.");
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Fetch appointments separately
  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${APPOINTMENT_BASE_URL}/all`)
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data: Appointment[] = await res.json();
      const converted = data.map(a => ({ ...a, dateTime: new Date(a.dateTime) }));
      setAppointments(converted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachEmail]);

  const selectedAppointment = appointments.find(
    (a) => a.id === selectedAppointmentId && typeof selectedAppointmentId === 'number'
  );

  // Use candidates from API
  const availableCandidates = candidates.length > 0 
    ? candidates.map(candidate => ({ 
        name: candidate.name, 
        email: candidate.email,
        title: candidate.title,
        location: candidate.location,
        profile_picture_url: candidate.profile_picture_url,
        available_appointments: candidate.available_appointments || []
      }))
    : [];

  const formatDate = (d: Date) => d.toISOString().slice(0, 10)

  const handleConfirmBooking = async () => {
    if (selectedAppointmentId === null || !selectedCandidate) {
      showError("No Selection", "Please select a candidate and appointment time slot.");
      return;
    }

    setIsBooking(true);
    try {
      // Find the selected appointment
      const selectedAppointment = selectedDayAppointments.find(apt => apt.id === selectedAppointmentId);
      
      if (!selectedAppointment) {
        showError("Slot Not Found", "The selected appointment slot could not be found.");
        setIsBooking(false);
        return;
      }
      
      // Find the selected candidate
      const candidate = availableCandidates.find(c => c.email === selectedCandidate);
      if (!candidate) {
        showError("Candidate Not Found", "The selected candidate could not be found.");
        setIsBooking(false);
        return;
      }
      
      // Book the appointment
      const res = await fetch(
        `${APPOINTMENT_BASE_URL}/book?id=${selectedAppointmentId}&candidate=${encodeURIComponent(candidate.email)}`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) {
        let errorMessage = "Failed to book appointment";
        try {
          const errorData = await res.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          const errorText = await res.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Refresh appointments and candidate data
      await fetchAppointments();
      await fetchCandidates();
      
      // Dispatch notification event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('appointmentBooked', {
          detail: {
            appointmentId: selectedAppointmentId,
            dateTime: selectedAppointment.dateTime,
            coachEmail: coachEmail,
            candidateEmail: candidate.email,
          }
        }));
      }
      
      success("Appointment Booked", `Successfully booked appointment with ${candidate.name} on ${selectedDate?.toLocaleDateString()} at ${selectedAppointment.dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);

      setSelectedAppointmentId(null);
      setSelectedDate(null);
      setSelectedCandidate(null);
      setShowPopup(false);
    } catch (err: any) {
      console.error("Booking error:", err);
      showError("Booking Failed", err.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      const res = await fetch(`${APPOINTMENT_BASE_URL}/unbook?id=${id}`, {
        method: "PUT",
      });

      if (!res.ok) {
        throw new Error("Failed to unbook appointment");
      }

      // Refresh appointments and candidate data
      await fetchAppointments();
      await fetchCandidates();
      
      success("Appointment Cancelled", "Your appointment has been cancelled successfully.");

    } catch (err) {
      console.error(err);
      showError("Cancellation Failed", "Failed to cancel appointment. Please try again.");
    }
  };

  const handleReschedule = async (id: number) => {
    try {
      // First unbook the current appointment
      const unbookRes = await fetch(`${APPOINTMENT_BASE_URL}/unbook?id=${id}`, {
        method: "PUT",
      });

      if (!unbookRes.ok) {
        throw new Error("Failed to unbook appointment");
      }

      // Refresh appointments and candidate data
      await fetchAppointments();
      await fetchCandidates();
      
      // Dispatch notification event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('appointmentRescheduled', {
          detail: {
            appointmentId: id,
          }
        }));
      }
      
      success("Appointment Cancelled", "Your appointment has been cancelled. Please select a new time slot below.");

    } catch (err) {
      console.error(err);
      showError("Reschedule Failed", "Failed to reschedule appointment. Please try again.");
    }
  };

  const filteredCandidateSearch = availableCandidates.filter((c) => {
    if (!candidateSearch.trim()) return true; // Show all if search is empty
    const searchLower = candidateSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      (c.title && c.title.toLowerCase().includes(searchLower)) ||
      (c.location && c.location.toLowerCase().includes(searchLower))
    );
  });

  const handleSelect = (email: string) => {
    // If clicking the same candidate, deselect; otherwise select the new candidate
    setSelectedCandidate((prev) => (prev === email ? null : email));
    setSelectedDate(null);
    // Reset to current month when selecting a new candidate
    const now = new Date();
    setAppointmentMonth(now.getMonth());
    setAppointmentYear(now.getFullYear());
  };

  const availableDays = React.useMemo(() => {
    if (!selectedCandidate) return [];
    // Find the selected candidate
    const candidate = availableCandidates.find(c => c.email === selectedCandidate);
    if (candidate && candidate.available_appointments && candidate.available_appointments.length > 0) {
      // Use appointments from candidate data
      return candidate.available_appointments
        .filter(apt => apt.candidate === null)
        .map(apt => {
          const date = new Date(apt.dateTime);
          // Only include Monday-Friday (weekday 1-5), exclude Saturday (6) and Sunday (0)
          const weekday = date.getDay();
          if (weekday >= 1 && weekday <= 5) { // Monday=1, Friday=5
            return date;
          }
          return null;
        })
        .filter((date): date is Date => date !== null);
    }
    // Fallback to appointments array
    return appointments
      .filter(a => {
        if (a.jobCoach !== coachEmail || a.candidate !== null) return false;
        const weekday = a.dateTime.getDay();
        return weekday >= 1 && weekday <= 5; // Only Mon-Fri
      })
      .map(a => a.dateTime);
  }, [availableCandidates, appointments, selectedCandidate, coachEmail]);

  const daysInMonth = new Date(appointmentYear, appointmentMonth + 1, 0).getDate();
  const firstDay = new Date(appointmentYear, appointmentMonth, 1).getDay();
  const daysArray = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const selectedDayAppointments = React.useMemo(() => {
    if (!selectedCandidate || !selectedDate) return [];
    
    // Find the selected candidate
    const candidate = availableCandidates.find(c => c.email === selectedCandidate);
    
    // Get available appointments for this coach (where candidate is null)
    const selectedDateStr = formatDate(selectedDate);
    return appointments
      .filter(a => {
        if (a.jobCoach !== coachEmail || a.candidate !== null) return false;
        const weekday = a.dateTime.getDay();
        // Only include Monday-Friday (weekday 1-5), exclude Saturday (6) and Sunday (0)
        if (weekday === 0 || weekday === 6) return false;
        return formatDate(a.dateTime) === selectedDateStr;
      })
      .map(apt => ({
        id: apt.id,
        jobCoach: apt.jobCoach,
        candidate: apt.candidate,
        dateTime: apt.dateTime,
      }));
  }, [availableCandidates, appointments, selectedCandidate, selectedDate, coachEmail]);

  const handlePrevMonth = () => {
    if (appointmentMonth === 0) {
      setAppointmentMonth(11);
      setAppointmentYear((y) => y - 1);
    } else {
      setAppointmentMonth((m) => m - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (appointmentMonth === 11) {
      setAppointmentMonth(0);
      setAppointmentYear((y) => y + 1);
    } else {
      setAppointmentMonth((m) => m + 1);
    }
    setSelectedDate(null);
  };

  const isDateAvailable = (d: Date) => {
    // Only show Monday-Friday as available
    const weekday = d.getDay();
    if (weekday === 0 || weekday === 6) return false; // Sunday=0, Saturday=6
    return availableDays.some((a) => formatDate(a) === formatDate(d));
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleBookClick = (appointment: any) => {
    setSelectedAppointmentId(appointment.id);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedAppointmentId(null);
  };

  // Get booked appointments for this coach
  const bookedAppointments = appointments
    .filter(a => a.jobCoach === coachEmail && a.candidate !== null && a.dateTime > new Date())
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  return (
    <>
      {/* <h1 className="text-2xl font-bold text-[#3a4043] pb-4 ">Book an Appointment</h1> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5">
        <Card>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 focus-within:border-[#635bff] transition-colors">
              <input
                type="text"
                className="flex-grow bg-transparent outline-none text-m text-gray-700 placeholder-gray-400"
                placeholder="Find and select a candidate..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
              />
              <Search className="text-gray-400 w-5 h-5" />
            </div>
            <div className="max-h-80 overflow-y-auto border rounded-lg p-3 space-y-3">
              {loadingCandidates ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#635bff] mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Loading candidates...</p>
                  </div>
                </div>
              ) : filteredCandidateSearch.length > 0 ? (
                <ul className="space-y-3">
                  {filteredCandidateSearch.map((candidate, index) => {
                    const isSelected = selectedCandidate === candidate.email;
                    return (
                      <li
                        key={candidate.email || index}
                        onClick={() => handleSelect(candidate.email)}
                        className={`p-3 border rounded-lg cursor-pointer transition flex items-center gap-3 ${isSelected
                          ? "bg-[#635bff] text-white border-[#635bff]"
                          : "hover:bg-[#f5f3ff] text-gray-800 border-gray-200"
                          }`}
                      >
                        {/* Profile picture */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden relative">
                          {candidate.profile_picture_url ? (
                            <img
                              src={
                                (() => {
                                  const picUrl = candidate.profile_picture_url;
                                  if (!picUrl) return '';
                                  if (picUrl.startsWith("http")) {
                                    return `${picUrl}?t=${Date.now()}`;
                                  }
                                  return `${BASE_URL}${picUrl.startsWith('/') ? '' : '/'}${picUrl}?t=${Date.now()}`;
                                })()
                              }
                              alt={candidate.name || candidate.email}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                                const parentDiv = e.currentTarget.parentElement;
                                if (parentDiv && !parentDiv.querySelector('.fallback-initials')) {
                                  const fallback = document.createElement("div");
                                  fallback.className = `fallback-initials w-full h-full flex items-center justify-center font-bold ${isSelected ? "bg-white text-[#635bff]" : "bg-[#635bff] text-white"}`;
                                  fallback.textContent = candidate.name ? candidate.name.charAt(0).toUpperCase() : (candidate.email ? candidate.email.charAt(0).toUpperCase() : '?');
                                  parentDiv.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center ${isSelected ? "bg-white text-[#635bff]" : "bg-[#635bff] text-white"}`}
                            >
                              {candidate.name ? candidate.name.charAt(0).toUpperCase() : (candidate.email ? candidate.email.charAt(0).toUpperCase() : '?')}
                            </div>
                          )}
                        </div>

                        {/* Candidate info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          {/* First row: Candidate name */}
                          <p className={`font-semibold truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                            {candidate.name || candidate.email}
                          </p>
                          
                          {/* Second row: Title, Location */}
                          <div className={`flex flex-wrap items-center gap-3 text-xs ${isSelected ? "text-white/80" : "text-gray-600"}`}>
                            {candidate.title && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3.5 w-3.5" />
                                {candidate.title}
                              </span>
                            )}
                            {candidate.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {candidate.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : availableCandidates.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    No candidates available.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    No matching candidates found for "{candidateSearch}".
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Try a different search term.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            {loadingCandidates ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bff] mx-auto mb-4"></div>
                  <p className="text-[#6f7a80]">Loading appointment calendar...</p>
                </div>
              </div>
            ) : !selectedCandidate ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#3a4043] mb-2">Select a Candidate</h3>
                <p className="text-[#6f7a80] text-sm">
                  Choose a candidate from the list to view available appointment slots.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={handlePrevMonth}
                    className="cursor-pointer text-[#635bff] font-bold hover:text-[#4b44e0]"
                  >
                    ← Prev
                  </button>
                  <h2 className="font-bold text-lg">
                    {monthNames[appointmentMonth]} {appointmentYear}
                  </h2>
                  <button
                    onClick={handleNextMonth}
                    className="cursor-pointer text-[#635bff] font-bold hover:text-[#4b44e0]"
                  >
                    Next →
                  </button>
                </div>

                {/* Days of week */}
                <div className="grid grid-cols-7 gap-2 text-center text-sm mb-3">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="font-semibold">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {daysArray.map((day, i) => {
                    if (!day) return <div key={i}></div>;
                    const date = new Date(appointmentYear, appointmentMonth, day);
                    const available = isDateAvailable(date);
                    const isSelected =
                      selectedDate?.toDateString() === date.toDateString();

                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`p-2 rounded-lg cursor-pointer transition ${isSelected
                          ? "bg-[#635bff] text-white font-bold"
                          : available
                            ? "bg-[#e0e7ff] hover:bg-[#c7d2fe] text-[#4338ca]"
                            : "text-gray-400 hover:bg-gray-100"
                          }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                {/* appointments */}
                {selectedDayAppointments.length > 0 ? (
                  <div className="mt-5">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z"
                        />
                      </svg>
                      <h3 className="font-semibold text-gray-800">
                        Available Time Slots for {(() => {
                          const candidate = availableCandidates.find(c => c.email === selectedCandidate);
                          return candidate?.name || selectedCandidate;
                        })()}:
                      </h3>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                      Slots for {selectedDate?.toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    <ul className="space-y-3">
                      {selectedDayAppointments.map((a, i) => {
                        return (
                          <li
                            key={a.id || i}
                            className="flex items-center justify-between border rounded-xl px-4 py-3 hover:shadow-sm transition bg-white"
                          >
                            <div className="flex items-center gap-2 text-gray-700">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="font-medium">
                                {a.dateTime.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <button onClick={() => handleBookClick(a)}
                              className="cursor-pointer bg-transparent hover:bg-[#635bff] text-[#635bff] hover:text-white text-sm px-4 py-1.5 rounded-md font-medium border border-[#635bff] transition"
                            >
                              Book
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : selectedDate ? (
                  <p className="mt-5 text-gray-400 text-center pt-5">
                    No available appointments on this day.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </Card>
        {showPopup && selectedAppointmentId && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn"
            onClick={handleClosePopup}
          >
            <div
              className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center space-y-4 transform animate-scaleIn"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              <h2 className="text-lg font-semibold text-gray-800">
                Confirm Your Booking
              </h2>

              {selectedAppointment && selectedCandidate && (
                <div className="text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Candidate:</span> {(() => {
                      const candidate = availableCandidates.find(c => c.email === selectedCandidate);
                      return candidate?.name || selectedCandidate;
                    })()}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {selectedAppointment.dateTime.toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{" "}
                    {selectedAppointment.dateTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={handleClosePopup}
                  className="cursor-pointer px-4 py-2 rounded-md border text-gray-700 hover:bg-[#c7d2fe] hover:text-[#635bff] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={isBooking}
                  className={`cursor-pointer bg-transparent hover:bg-[#635bff] text-[#635bff] hover:text-white px-4 py-1.5 rounded-md font-medium border border-[#635bff] transition ${isBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isBooking ? "Booking..." : "Confirm"}
                </button>
              </div>
            </div>

            <style>
              {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out forwards;
        }
      `}
            </style>
          </div>
        )}


      </div>
      <Card>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Video className="text-gray-700" size={20} />
            <h2 className="text-lg font-semibold">Upcoming Booked Sessions</h2>
          </div>

          {/* Session cards */}
          <div className="flex flex-wrap gap-4">
            {bookedAppointments.map((a) => {
              const candidate = availableCandidates.find(c => c.email === a.candidate);
              return (
                <div
                  key={a.id}
                  className="relative flex flex-col gap-2 p-4 border rounded-xl shadow-sm bg-white w-64"
                >
                  {/* Close button */}
                  <button
                    onClick={() => handleRemove(a.id)}
                    className="cursor-pointer absolute top-3 right-3 text-black-500 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>

                  {/* Status badge */}
                  <span className="bg-[#00ff00]/25 text-[#009900] text-xs font-medium px-3 py-1 rounded-md w-fit">
                    Booked
                  </span>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="truncate overflow-hidden text-ellipsis block max-w-[100%]">
                      {a.dateTime
                        ? a.dateTime.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })
                        : "No date"}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock size={16} className="text-gray-500" />
                    <span>
                      {a.dateTime
                        ? a.dateTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                        : "No time"}
                    </span>
                  </div>

                  {/* Candidate */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User size={16} className="text-gray-500" />
                    <span>{candidate?.name || a.candidate || "Unknown candidate"}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      onClick={() => {
                        const url = meetUrl || "https://example.com";
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      className="cursor-pointer inline-flex items-center justify-center gap-1 text-[#635bff] text-sm font-medium border border-[#635bff] rounded-md px-3 py-1 hover:bg-[#635bff] hover:text-white transition w-full whitespace-nowrap"
                    >
                      <Video size={14} />
                      Join Meeting
                    </button>
                    <button
                      onClick={() => handleReschedule(a.id)}
                      className="cursor-pointer inline-flex items-center justify-center gap-1 text-orange-600 text-sm font-medium border border-orange-600 rounded-md px-3 py-1 hover:bg-orange-600 hover:text-white transition w-full whitespace-nowrap"
                    >
                      <CalendarClock size={14} />
                      Reschedule
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {bookedAppointments.length === 0 && !loadingCandidates && (
              <p className="text-gray-500 text-sm mt-4">No booked sessions yet.</p>
            )}
          </div>
        </div>
      </Card>

    </>
  );
}
