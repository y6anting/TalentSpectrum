"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/app/components/card";
import { Calendar, Video, User, Clock, Search, Building, Briefcase, MessageSquare, CalendarClock } from "lucide-react"
import { useSession } from "next-auth/react";
import { useToastHelpers } from "@/components/ui/toast";

type Appointment = {
  id: number;
  jobCoach: string;
  candidate: string | null;
  dateTime: Date;
};

type JobCoach = {
  email: string;
  name: string;
  organization?: string;
  specializations?: string[];
  bio?: string;
  experience_years?: number;
  profile_picture_url?: string;
  available_appointments?: Array<{
    id: number;
    dateTime: string;
    candidate: string | null;
  }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const APPOINTMENT_BASE_URL = `${BASE_URL}/appointment`;

export default function AppointmentPage() {
  const { data: session } = useSession();
  const { success, error: showError } = useToastHelpers();
  const [jobCoachSearch, setJobCoachSearch] = useState('');
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointmentMonth, setAppointmentMonth] = useState(new Date().getMonth());
  const [appointmentYear, setAppointmentYear] = useState(new Date().getFullYear());
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [jobCoaches, setJobCoaches] = useState<JobCoach[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const candidateNameTemp = session?.user?.email || "Proxy Candidate";
  const meetUrl = "https://meet.google.com/xxj-yzxu-dkz"
  
  // Fetch job coaches with their available appointments from API
  const fetchJobCoachesWithAppointments = async () => {
    try {
      setLoadingCoaches(true);
      const res = await fetch('/api/job-coach/all-with-appointments');
      if (!res.ok) {
        console.warn("Failed to fetch job coaches with appointments, falling back to separate endpoints");
        // Fallback to separate endpoints
        await Promise.all([fetchJobCoaches(), fetchAppointments()]);
        return;
      }
      const data: JobCoach[] = await res.json();
      setJobCoaches(data || []);
      
      // Also populate appointments for backward compatibility
      // First, fetch ALL appointments to include booked ones
      const allAppointmentsRes = await fetch(`${APPOINTMENT_BASE_URL}/all`);
      if (allAppointmentsRes.ok) {
        const allAppointmentsData: Appointment[] = await allAppointmentsRes.json();
        const converted = allAppointmentsData.map(a => ({ ...a, dateTime: new Date(a.dateTime) }));
        setAppointments(converted);
      } else {
        // Fallback: build from coach data (but this might miss booked appointments)
        const allAppointments: Appointment[] = [];
        data.forEach(coach => {
          if (coach.available_appointments) {
            coach.available_appointments.forEach(apt => {
              allAppointments.push({
                id: apt.id,
                jobCoach: coach.email,
                candidate: apt.candidate,
                dateTime: new Date(apt.dateTime),
              });
            });
          }
        });
        setAppointments(allAppointments);
      }
    } catch (err) {
      console.error("Error fetching job coaches with appointments:", err);
      // Fallback to separate endpoints
      await Promise.all([fetchJobCoaches(), fetchAppointments()]);
    } finally {
      setLoadingCoaches(false);
    }
  };

  // Fallback: Fetch job coaches from API (separate endpoint)
  const fetchJobCoaches = async () => {
    try {
      const res = await fetch('/api/job-coach/all');
      if (!res.ok) {
        console.warn("Failed to fetch job coaches");
        return;
      }
      const data: JobCoach[] = await res.json();
      setJobCoaches(data || []);
    } catch (err) {
      console.error("Error fetching job coaches:", err);
    }
  };

  // Fallback: Fetch appointments separately
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
    fetchJobCoachesWithAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAppointment = appointments.find(
    (a) => a.id === selectedAppointmentId && typeof selectedAppointmentId === 'number'
  );

  // Use job coaches from API with their available appointments
  const availableJobCoaches = jobCoaches.length > 0 
    ? jobCoaches.map(coach => ({ 
        name: coach.name, 
        email: coach.email,
        organization: coach.organization,
        specializations: coach.specializations,
        bio: coach.bio,
        experience_years: coach.experience_years,
        profile_picture_url: coach.profile_picture_url,
        available_appointments: coach.available_appointments || []
      }))
    : Array.from(
        new Set(
          appointments
            .filter(a => a.candidate === null)
            .map(a => a.jobCoach)
        )
      ).map(name => ({ 
        name, 
        email: name,
        organization: undefined,
        specializations: undefined,
        bio: undefined,
        experience_years: undefined,
        profile_picture_url: undefined,
        available_appointments: []
      }));

  console.log(availableJobCoaches);

  const formatDate = (d: Date) => d.toISOString().slice(0, 10)

  const handleConfirmBooking = async () => {
    if (selectedAppointmentId === null) {
      showError("No Selection", "Please select an appointment time slot.");
      return;
    }

    setIsBooking(true);
    try {
      // Check if it's a virtual slot (starts with "virtual-")
      const isVirtualSlot = typeof selectedAppointmentId === 'string' && selectedAppointmentId.startsWith('virtual-');
      
      // Find the selected appointment
      const selectedAppointment = isVirtualSlot
        ? selectedDayAppointments.find(apt => `virtual-${apt.dateTime.toISOString()}` === selectedAppointmentId)
        : selectedDayAppointments.find(apt => apt.id === selectedAppointmentId);
      
      if (!selectedAppointment) {
        showError("Slot Not Found", "The selected appointment slot could not be found.");
        setIsBooking(false);
        return;
      }
      
      // Find the selected coach
      const coach = availableJobCoaches.find(c => c.name === selectedCoach || c.email === selectedCoach);
      if (!coach) {
        showError("Coach Not Found", "The selected coach could not be found.");
        setIsBooking(false);
        return;
      }
      
      // Check if candidate already has an appointment with this coach
      const existingBookingWithCoach = appointments.find(apt => 
        apt.candidate === candidateNameTemp && 
        apt.jobCoach === coach.email &&
        apt.dateTime > new Date() // Only check future appointments
      );
      
      if (existingBookingWithCoach) {
        showError(
          "Already Booked", 
          `You already have a booked appointment with ${coach.name}. Please cancel your existing appointment first before booking a new one.`
        );
        setIsBooking(false);
        return;
      }
      
      // Check for time conflicts (overlapping appointments) - allow 1 hour buffer
      const selectedDateTime = selectedAppointment.dateTime;
      const selectedEndTime = new Date(selectedDateTime.getTime() + 60 * 60 * 1000); // Add 1 hour
      
      const conflictingAppointment = appointments.find(apt => {
        if (apt.candidate !== candidateNameTemp) return false;
        if (apt.id === selectedAppointment.id) return false; // Same appointment
        const aptDateTime = apt.dateTime;
        const aptEndTime = new Date(aptDateTime.getTime() + 60 * 60 * 1000); // Assume 1 hour duration
        
        // Check if appointments overlap
        return (selectedDateTime < aptEndTime && selectedEndTime > aptDateTime);
      });
      
      if (conflictingAppointment) {
        const conflictCoach = availableJobCoaches.find(c => c.email === conflictingAppointment.jobCoach);
        showError(
          "Time Conflict",
          `You have a conflicting appointment with ${conflictCoach?.name || conflictingAppointment.jobCoach} at ${conflictingAppointment.dateTime.toLocaleString()}. Please choose a different time.`
        );
        setIsBooking(false);
        return;
      }
      
      // Ensure selectedDate is available
      if (!selectedDate) {
        showError("Missing Information", "Please select a date for the appointment.");
        setIsBooking(false);
        return;
      }
      
      // If it's a virtual slot (id is null or undefined), create it first
      if (isVirtualSlot || selectedAppointment.id === null || selectedAppointment.id === undefined) {
        // Find the virtual slot from available appointments - match by exact dateTime
        const virtualSlot = coach.available_appointments?.find(apt => {
          if (apt.candidate !== null) return false;
          if (apt.id !== null && apt.id !== undefined) return false; // Must be virtual slot
          const aptDate = new Date(apt.dateTime);
          // Match by exact ISO string comparison
          return aptDate.toISOString() === selectedAppointment.dateTime.toISOString();
        });
        
        if (!virtualSlot) {
          showError("Slot Unavailable", "The selected slot is no longer available. Please select another time.");
          setIsBooking(false);
          return;
        }
        
        // Create the appointment first
        const createRes = await fetch(`${APPOINTMENT_BASE_URL}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobCoach: coach.email,
            dateTime: virtualSlot.dateTime,
          }),
        });
        
        if (!createRes.ok) {
          const errorText = await createRes.text();
          throw new Error(`Failed to create appointment: ${errorText}`);
        }
        
        const createData = await createRes.json();
        const newAppointmentId = createData.id;
        
        if (!newAppointmentId) {
          throw new Error("Failed to get appointment ID after creation");
        }
        
        // Now book it
        const bookRes = await fetch(
          `${APPOINTMENT_BASE_URL}/book?id=${newAppointmentId}&candidate=${encodeURIComponent(candidateNameTemp)}`,
          {
            method: "PUT",
          }
        );
        
        if (!bookRes.ok) {
          let errorMessage = "Failed to book appointment";
          try {
            const errorData = await bookRes.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch {
            const errorText = await bookRes.text();
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        
        // Refresh appointments and coach data to update the available slots list
        await fetchAppointments();
        await fetchJobCoachesWithAppointments();
        
        // Dispatch notification event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('appointmentBooked', {
            detail: {
              appointmentId: newAppointmentId,
              dateTime: selectedAppointment.dateTime,
              coachEmail: coach.email,
              candidateEmail: candidateNameTemp,
            }
          }));
        }
        
        success("Appointment Booked", `Successfully booked appointment with ${coach.name} on ${selectedDate.toLocaleDateString()} at ${selectedAppointment.dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
        
      } else {
        // Regular appointment booking
        const res = await fetch(
          `${APPOINTMENT_BASE_URL}/book?id=${selectedAppointmentId}&candidate=${encodeURIComponent(candidateNameTemp)}`,
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

        // Refresh appointments and coach data to update the available slots list
        await fetchAppointments();
        await fetchJobCoachesWithAppointments();
        
        // Dispatch notification event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('appointmentBooked', {
            detail: {
              appointmentId: selectedAppointmentId,
              dateTime: selectedAppointment.dateTime,
              coachEmail: selectedAppointment.jobCoach,
              candidateEmail: candidateNameTemp,
            }
          }));
        }
        
        const coach = availableJobCoaches.find(c => c.name === selectedCoach || c.email === selectedCoach);
        success("Appointment Booked", `Successfully booked appointment with ${coach?.name || selectedCoach} on ${selectedDate?.toLocaleDateString()} at ${selectedAppointment.dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
      }

      setSelectedAppointmentId(null);
      setSelectedDate(null);

      // Deselect coach if no remaining slots
      if (selectedCoach) {
        const coach = availableJobCoaches.find(c => c.name === selectedCoach || c.email === selectedCoach);
        const hasAvailable = coach?.available_appointments?.some(apt => apt.candidate === null) || false;
        if (!hasAvailable) setSelectedCoach(null);
      }

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

      // Update frontend state
      setAppointments(prev =>
        prev.map(a =>
          a.id === id ? { ...a, candidate: null } : a
        )
      );

      // Refresh appointments and coach data
      await fetchAppointments();
      await fetchJobCoachesWithAppointments();
      
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

      // Update frontend state
      setAppointments(prev =>
        prev.map(a =>
          a.id === id ? { ...a, candidate: null } : a
        )
      );

      // Refresh appointments and coach data
      await fetchAppointments();
      await fetchJobCoachesWithAppointments();
      
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

  const filteredJobCoachSearch = availableJobCoaches.filter((c) => {
    if (!jobCoachSearch.trim()) return true; // Show all if search is empty
    const searchLower = jobCoachSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      (c.organization && c.organization.toLowerCase().includes(searchLower)) ||
      (c.specializations && c.specializations.some((spec: string) => spec.toLowerCase().includes(searchLower)))
    );
  });

  const handleSelect = (name: string) => {
    // If clicking the same coach, deselect; otherwise select the new coach
    setSelectedCoach((prev) => (prev === name ? null : name));
    setSelectedDate(null);
    // Reset to current month when selecting a new coach
    const now = new Date();
    setAppointmentMonth(now.getMonth());
    setAppointmentYear(now.getFullYear());
  };

  const availableDays = React.useMemo(() => {
    if (!selectedCoach) return [];
    // Find the selected coach
    const coach = availableJobCoaches.find(c => c.name === selectedCoach || c.email === selectedCoach);
    if (coach && coach.available_appointments && coach.available_appointments.length > 0) {
      // Use appointments from coach data
      return coach.available_appointments
        .filter(apt => apt.candidate === null)
        .map(apt => {
          const date = new Date(apt.dateTime);
          // Only include Monday-Friday (weekday 0-4), exclude Saturday (5) and Sunday (6)
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
        if (a.jobCoach !== selectedCoach || a.candidate !== null) return false;
        const weekday = a.dateTime.getDay();
        return weekday >= 1 && weekday <= 5; // Only Mon-Fri
      })
      .map(a => a.dateTime);
  }, [availableJobCoaches, appointments, selectedCoach]);


  const daysInMonth = new Date(appointmentYear, appointmentMonth + 1, 0).getDate();
  const firstDay = new Date(appointmentYear, appointmentMonth, 1).getDay();
  const daysArray = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const selectedDayAppointments = React.useMemo(() => {
    if (!selectedCoach || !selectedDate) return [];
    
    // Find the selected coach
    const coach = availableJobCoaches.find(c => c.name === selectedCoach || c.email === selectedCoach);
    
    // Get all booked appointments for this candidate (from upcoming booked sessions)
    const bookedAppointmentIds = new Set(
      appointments
        .filter(apt => apt.candidate === candidateNameTemp && apt.dateTime > new Date())
        .map(apt => apt.id)
    );
    
    let existingAppointments: any[] = [];
    
    if (coach && coach.available_appointments && coach.available_appointments.length > 0) {
      // Use appointments from coach data
      const selectedDateStr = formatDate(selectedDate);
      existingAppointments = coach.available_appointments
        .filter(apt => {
          // Exclude ALL booked appointments (booked by anyone, not just this candidate)
          if (apt.candidate !== null) return false;
          // Also exclude appointments that are already booked by this candidate (double check)
          if (apt.id !== null && apt.id !== undefined && bookedAppointmentIds.has(apt.id)) return false;
          const aptDate = new Date(apt.dateTime);
          const weekday = aptDate.getDay();
          // Only include Monday-Friday (weekday 1-5), exclude Saturday (6) and Sunday (0)
          if (weekday === 0 || weekday === 6) return false;
          return formatDate(aptDate) === selectedDateStr;
        })
        .map(apt => ({
          id: apt.id,
          jobCoach: coach.email,
          candidate: apt.candidate,
          dateTime: new Date(apt.dateTime),
        }));
    } else {
    // Fallback to appointments array
      existingAppointments = appointments.filter(
      (a) => {
          // Exclude ALL booked appointments (booked by anyone, not just this candidate)
        if (a.candidate !== null) return false;
          // Also exclude appointments that are already booked by this candidate (double check)
        if (a.id !== null && a.id !== undefined && bookedAppointmentIds.has(a.id)) return false;
        const weekday = a.dateTime.getDay();
        // Only include Monday-Friday
        if (weekday === 0 || weekday === 6) return false;
        return (a.jobCoach === selectedCoach || a.jobCoach === coach?.email) &&
               formatDate(a.dateTime) === formatDate(selectedDate);
      }
    );
    }
    
    // If there are existing appointments, return them
    if (existingAppointments.length > 0) {
      return existingAppointments;
    }
    
    // Generate virtual slots for weekdays when no appointments exist
    // Match backend logic: 9 AM, 11 AM, 1 PM, 3 PM, 5 PM
    const weekday = selectedDate.getDay();
    if (weekday >= 1 && weekday <= 5) {
      const workingHours = [9, 11, 13, 15, 17];
      const now = new Date();
      const virtualSlots = workingHours
        .map(hour => {
          const slotDate = new Date(selectedDate);
          slotDate.setHours(hour, 0, 0, 0);
          // Only include future slots
          if (slotDate > now) {
            return {
              id: null,
              jobCoach: coach?.email || selectedCoach,
              candidate: null,
              dateTime: slotDate,
            };
          }
          return null;
        })
        .filter((slot): slot is { id: null; jobCoach: string; candidate: null; dateTime: Date } => slot !== null);
      
      return virtualSlots;
    }
    
    return [];
  }, [availableJobCoaches, appointments, selectedCoach, selectedDate, candidateNameTemp]);


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
    // Show all Monday-Friday dates as available (not just those with existing appointments)
    // The backend generates virtual slots, so all weekdays should be available
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(d);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate >= today; // Only future dates
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
    // For virtual slots (id === null), use a temporary identifier based on dateTime
    const appointmentId = appointment.id !== null && appointment.id !== undefined 
      ? appointment.id 
      : `virtual-${appointment.dateTime.toISOString()}`;
    setSelectedAppointmentId(appointmentId as any);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedAppointmentId(null);
  };

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
                placeholder="Find and select a job coach..."
                value={jobCoachSearch}
                onChange={(e) => setJobCoachSearch(e.target.value)}
              />
              <Search className="text-gray-400 w-5 h-5" />
            </div>
            <div className="max-h-80 overflow-y-auto border rounded-lg p-3 space-y-3">
              {loadingCoaches ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#635bff] mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Loading job coaches...</p>
                  </div>
                </div>
              ) : filteredJobCoachSearch.length > 0 ? (
                <ul className="space-y-3">
                  {filteredJobCoachSearch.map((coach, index) => {
                    const isSelected = selectedCoach === coach.name || selectedCoach === coach.email;
                    return (
                      <li
                        key={coach.email || index}
                        onClick={() => handleSelect(coach.name)}
                        className={`p-3 border rounded-lg cursor-pointer transition flex items-center gap-3 ${isSelected
                          ? "bg-[#635bff] text-white border-[#635bff]"
                          : "hover:bg-[#f5f3ff] text-gray-800 border-gray-200"
                          }`}
                      >
                        {/* Profile picture */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden relative">
                          {coach.profile_picture_url ? (
                            <img
                              src={
                                (() => {
                                  const picUrl = coach.profile_picture_url;
                                  if (!picUrl) return '';
                                  if (picUrl.startsWith("http")) {
                                    return `${picUrl}?t=${Date.now()}`;
                                  }
                                  return `${BASE_URL}${picUrl.startsWith('/') ? '' : '/'}${picUrl}?t=${Date.now()}`;
                                })()
                              }
                              alt={coach.name || coach.email}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                                const parentDiv = e.currentTarget.parentElement;
                                if (parentDiv && !parentDiv.querySelector('.fallback-initials')) {
                                  const fallback = document.createElement("div");
                                  fallback.className = `fallback-initials w-full h-full flex items-center justify-center font-bold ${isSelected ? "bg-white text-[#635bff]" : "bg-[#635bff] text-white"}`;
                                  fallback.textContent = coach.name ? coach.name.charAt(0).toUpperCase() : (coach.email ? coach.email.charAt(0).toUpperCase() : '?');
                                  parentDiv.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div
                              className={`w-full h-full flex items-center justify-center ${isSelected ? "bg-white text-[#635bff]" : "bg-[#635bff] text-white"}`}
                            >
                              {coach.name ? coach.name.charAt(0).toUpperCase() : (coach.email ? coach.email.charAt(0).toUpperCase() : '?')}
                            </div>
                          )}
                        </div>

                        {/* Coach info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          {/* First row: Coach name */}
                          <p className={`font-semibold truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                            {coach.name || coach.email}
                          </p>
                          
                          {/* Second row: Organization, Specializations, Experience years */}
                          <div className={`flex flex-wrap items-center gap-3 text-xs ${isSelected ? "text-white/80" : "text-gray-600"}`}>
                            {coach.organization && (
                              <span className="flex items-center gap-1">
                                <Building className="h-3.5 w-3.5" />
                                {coach.organization}
                              </span>
                            )}
                            {coach.specializations && coach.specializations.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3.5 w-3.5" />
                                {coach.specializations.join(", ")}
                              </span>
                            )}
                            {coach.experience_years !== null && coach.experience_years !== undefined && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {coach.experience_years} {coach.experience_years === 1 ? 'year' : 'years'} exp.
                              </span>
                            )}
                          </div>
                          
                          {/* Third row: Bio */}
                          {coach.bio && (
                            <p className={`text-xs line-clamp-2 ${isSelected ? "text-white/70" : "text-gray-500"} flex items-start gap-1`}>
                              <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                              <span>{coach.bio}</span>
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : availableJobCoaches.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    No job coaches available.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    No matching coaches found for "{jobCoachSearch}".
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
            {loadingCoaches ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#635bff] mx-auto mb-4"></div>
                  <p className="text-[#6f7a80]">Loading appointment calendar...</p>
                </div>
              </div>
            ) : !selectedCoach ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#3a4043] mb-2">Select a Job Coach</h3>
                <p className="text-[#6f7a80] text-sm">
                  Choose a job coach from the list to view their available appointment slots.
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
                          const coach = availableJobCoaches.find(c => c.name === selectedCoach || c.email === selectedCoach);
                          return coach?.name || selectedCoach;
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
                        // Create a unique key for virtual slots using dateTime string
                        const slotKey = a.id || `virtual-${a.dateTime.toISOString()}`;
                        return (
                          <li
                            key={slotKey}
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

              {selectedAppointment && (
                <div className="text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Coach:</span> {selectedAppointment.jobCoach}
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
            {appointments
              .filter(a => ((a.candidate != null) && (a.candidate === candidateNameTemp) && (a.dateTime > new Date())))
              .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()) // Sort by date, earliest first
              .map((a, i) => (
                <div
                  key={i}
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

                  {/* Coach */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User size={16} className="text-gray-500" />
                    <span>
                      {(() => {
                        const coach = availableJobCoaches.find(c => c.email === a.jobCoach);
                        return coach?.name || a.jobCoach || "Unknown coach";
                      })()}
                    </span>
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
              ))}

            {/* Empty state */}
            {appointments.filter(a => a.candidate === candidateNameTemp && a.dateTime > new Date()).length === 0 && (
              <p className="text-gray-500 text-sm mt-4">No booked sessions yet.</p>
            )}
          </div>
        </div>
      </Card>

    </>
  );
}