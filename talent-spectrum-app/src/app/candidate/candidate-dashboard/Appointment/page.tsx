"use client";

import React, { useState } from "react";
import { Card } from "@/app/components/card";
import { Calendar, Video, User, Clock } from "lucide-react"

type BookingInfo = {
  coach?: string;
  date?: Date;
  time?: string;
  applierName?: string;
};

export default function AppointmentPage() {
  const [jobCoachSearch, setJobCoachSearch] = useState('');
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointmentMonth, setAppointmentMonth] = useState(new Date().getMonth());
  const [appointmentYear, setAppointmentYear] = useState(new Date().getFullYear());
  const [showPopup, setShowPopup] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [appointmentBookedSessions, setAppointmentBookedSessions] = useState<BookingInfo[]>([]);
  const jobCoachTemporary = [
    { name: "one", appointments: [{ time: 1762153200 }, { time: 1762185600 }, { time: 1762207200 }] },
    { name: "two", appointments: [{ time: 1765421400 }, { time: 1764421400 }, { time: 1763641400 }] },
    { name: "three", appointments: [{ time: 1762639400 }, { time: 1763639400 }, { time: 1764639400 }] },
    { name: "four", appointments: [{ time: 1762153200 }, { time: 1762185600 }, { time: 1762207200 }] },
    { name: "five", appointments: [{ time: 1765421400 }, { time: 1764421400 }, { time: 1763641400 }] },
    { name: "six", appointments: [{ time: 1562639400 }, { time: 1767676700 }, { time: 1762006700 }] },
    { name: "seven", appointments: [{ time: 1762153200 }, { time: 1762185600 }, { time: 1762207200 }] },
    { name: "eight", appointments: [{ time: 1765421400 }, { time: 1764421400 }, { time: 1763641400 }] },
    { name: "nine", appointments: [{ time: 1762639400 }, { time: 1763639400 }, { time: 1764639400 }] },
  ];
  const handleConfirmBooking = () => {
    if (!bookingInfo?.coach || !bookingInfo?.date || !bookingInfo?.time) {
      alert("Please select a coach, date, and time before confirming.");
      return;
    }

    // Add the booking to the list
    setAppointmentBookedSessions((prev) => [...prev, bookingInfo]);

    // Optionally clear the temp booking info
    setBookingInfo(null);

    // Close popup
    handleClosePopup();

    // Confirmation feedback
    // alert("Booking confirmed!"); Note: need to use standardized alert message of the site (see JobListing for example)
  };

  const handleRemove = (index: number) => {
    setAppointmentBookedSessions((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredJobCoachSearch = jobCoachTemporary.filter((c) =>
    c.name.toLowerCase().includes(jobCoachSearch.toLowerCase())
  );

  const handleSelect = (name: string) => {
    setSelectedCoach((prev) => (prev === name ? null : name));
    setSelectedDate(null);
  };

  const selectedCoachData = jobCoachTemporary.find((c) => c.name === selectedCoach);

  const availableDays = selectedCoachData
    ? selectedCoachData.appointments.map((a) => new Date(a.time * 1000))
    : [];

  const daysInMonth = new Date(appointmentYear, appointmentMonth + 1, 0).getDate();
  const firstDay = new Date(appointmentYear, appointmentMonth, 1).getDay();
  const daysArray = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const selectedDayAppointments =
    selectedCoachData && selectedDate
      ? selectedCoachData.appointments.filter(
        (a) => new Date(a.time * 1000).toDateString() === selectedDate.toDateString()
      )
      : [];

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

  const isDateAvailable = (d: Date) =>
    availableDays.some(
      (a) => a.getDate() === d.getDate() && a.getMonth() === d.getMonth() && a.getFullYear() === d.getFullYear()
    );

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

  const handleBookClick = (coachName: string, appointment: any) => {
    const date = new Date(appointment.time * 1000);
    const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setBookingInfo({ coach: coachName, date, time: formattedTime });
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setBookingInfo(null);
  };

  return (
    <>
      {/* <h1 className="text-2xl font-bold text-[#3a4043] pb-4 ">Book an Appointment</h1> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5">
        <Card>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 focus-within:border-[#635bff] transition-colors">
              <input
                className="flex-grow bg-transparent outline-none text-m text-gray-700 placeholder-gray-400"
                placeholder="Find and select a job coach:"
                onChange={(e) => setJobCoachSearch(e.target.value)}
              />
            </div>
            <div className="max-h-80 overflow-y-auto border rounded-lg p-3 space-y-3">
              {filteredJobCoachSearch.length > 0 ? (
                filteredJobCoachSearch.map((coach, index) => {
                  const isSelected = selectedCoach === coach.name;
                  return (
                    <li
                      key={index}
                      onClick={() => handleSelect(coach.name)}
                      className={` p-3 border rounded-lg cursor-pointer transition flex items-center gap-3 ${isSelected
                        ? "bg-[#635bff] text-white border-[#635bff]"
                        : "hover:bg-[#f5f3ff] text-gray-800"
                        }`}
                    >
                      {/* Profile picture placeholder */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isSelected ? "bg-white text-[#635bff]" : "bg-[#635bff] text-white"
                          }`}
                      >
                        {coach.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Coach name */}
                      <p className="font-semibold">{coach.name}</p>
                    </li>
                  );
                })
              ) : (
                <p className="text-gray-400 text-sm mt-2 text-center">
                  No matching coaches found.
                </p>
              )}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            {selectedCoach ? (
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
                        onClick={() => {
                          setSelectedDate(date);
                        }}
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

                {/* Appointments */}
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
                      <h3 className="font-semibold text-gray-800">Available Time Slots for {selectedCoach}:</h3>
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
                      {selectedDayAppointments.map((a, i) => (
                        <li
                          key={i}
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
                              {new Date(a.time * 1000).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <button onClick={() => handleBookClick(selectedCoach!, a)}
                            className="cursor-pointer bg-transparent hover:bg-[#635bff] text-[#635bff] hover:text-white text-sm px-4 py-1.5 rounded-md font-medium border border-[#635bff] transition"
                          >
                            Book
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : selectedDate ? (
                  <p className="mt-5 text-gray-400 text-center pt-5">
                    No available appointments on this day.
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-gray-400 text-center pt-[10%]">
                Select a coach to view their calendar.
              </p>
            )}
          </div>
        </Card>
        {showPopup && bookingInfo && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn"
            onClick={handleClosePopup}
          >
            <div
              className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center space-y-4 transform animate-scaleIn"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                Confirm Your Booking
              </h2>

              <div className="text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Coach:</span> {bookingInfo.coach}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {bookingInfo.date?.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-medium">Time:</span> {bookingInfo.time}
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={handleClosePopup}
                  className="cursor-pointer px-4 py-2 rounded-md border text-gray-700 hover:bg-[#c7d2fe] hover:text-[#635bff] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="cursor-pointer bg-transparent hover:bg-[#635bff] text-[#635bff] hover:text-white px-4 py-1.5 rounded-md font-medium border border-[#635bff] transition"
                >
                  Confirm
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
            {appointmentBookedSessions.map((b, i) => (
              <div
                key={i}
                className="relative flex flex-col gap-2 p-4 border rounded-xl shadow-sm bg-white w-64"
              >
                {/* Close button */}
                <button
                  onClick={() => handleRemove(i)}
                  className="cursor-pointer absolute top-3 right-3 text-red-500 hover:text-red-600 text-sm"
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
                    {b.date
                      ? b.date.toLocaleDateString("en-US", {
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
                  <span>{b.time || "No time"}</span>
                </div>

                {/* Coach */}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User size={16} className="text-gray-500" />
                  <span>{b.coach || "Unknown coach"}</span>
                </div>

                {/* Applier name */}
                {b.applierName && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User size={16} className="text-gray-500" />
                    <span className="italic">{b.applierName}</span>
                  </div>
                )}

                {/* Join meeting link */}
                <button
                  className="cursor-pointer inline-flex items-center justify-center gap-1 text-[#635bff] text-sm font-medium border border-[#635bff] rounded-md px-3 py-1 hover:bg-[#635bff] hover:text-white transition w-fit whitespace-nowrap"
                >
                  <Video size={14} />
                  Join Meeting
                </button>
              </div>
            ))}

            {/* Empty state */}
            {appointmentBookedSessions.length === 0 && (
              <p className="text-gray-500 text-sm mt-4">No booked sessions yet.</p>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}