"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Calendar, FileText, Briefcase } from "lucide-react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/app/components/card";
import { Badge } from "@/app/components/badge";

interface Notification {
  id: string;
  type: "appointment" | "application" | "job";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user?.email) return;

    try {
      const userEmail = session.user.email;
      const allNotifications: Notification[] = [];

      // Fetch upcoming appointments (within 24 hours) and recent bookings/reschedules
      try {
        const appointmentsRes = await fetch(`${API_BASE}/appointment/all`);
        if (appointmentsRes.ok) {
          const appointments = await appointmentsRes.json();
          
          // Upcoming appointments (within 24 hours)
          const userAppointments = appointments
            .filter((apt: any) => {
              const aptDate = new Date(apt.dateTime);
              const now = new Date();
              const hoursUntil = (aptDate.getTime() - now.getTime()) / (1000 * 60 * 60);
              return (
                (apt.candidate === userEmail || apt.jobCoach === userEmail) &&
                aptDate > now &&
                hoursUntil <= 24 &&
                hoursUntil > 0
              );
            })
            .map((apt: any) => {
              const isCandidate = apt.candidate === userEmail;
              const link = isCandidate 
                ? "/candidate/candidate-dashboard?tab=Appointment"
                : "/job-coach?tab=appointment";
              return {
                id: `appointment-${apt.id}`,
                type: "appointment" as const,
                title: "Upcoming Appointment",
                message: `You have an appointment ${new Date(apt.dateTime).toLocaleDateString()} at ${new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                timestamp: new Date(apt.dateTime),
                read: false,
                link,
              };
            });
          allNotifications.push(...userAppointments);
          
          // Recent bookings/reschedules (within last hour)
          const recentBookings = appointments
            .filter((apt: any) => {
              if (!apt.dateTime) return false;
              const aptDate = new Date(apt.dateTime);
              const now = new Date();
              const minutesAgo = (now.getTime() - aptDate.getTime()) / (1000 * 60);
              // Show notifications for appointments booked/rescheduled in the last hour
              return (
                (apt.candidate === userEmail || apt.jobCoach === userEmail) &&
                aptDate > now &&
                minutesAgo > -60 && // Not more than 60 minutes in the future
                minutesAgo < 60 // Within last 60 minutes
              );
            })
            .map((apt: any) => {
              const isCandidate = apt.candidate === userEmail;
              const link = isCandidate 
                ? "/candidate/candidate-dashboard?tab=Appointment"
                : "/job-coach?tab=appointment";
              const isBooking = apt.candidate === userEmail || apt.jobCoach === userEmail;
              return {
                id: `appointment-booking-${apt.id}`,
                type: "appointment" as const,
                title: isBooking ? "Appointment Booked" : "Appointment Rescheduled",
                message: isBooking 
                  ? `Your appointment has been booked for ${new Date(apt.dateTime).toLocaleDateString()} at ${new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : `Your appointment has been rescheduled for ${new Date(apt.dateTime).toLocaleDateString()} at ${new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
                timestamp: new Date(),
                read: false,
                link,
              };
            });
          allNotifications.push(...recentBookings);
        }
      } catch (err) {
        console.warn("Failed to fetch appointments:", err);
      }

      // Fetch application status updates (recent changes)
      try {
        const applicationsRes = await fetch(`${API_BASE}/applications?candidateEmail=${encodeURIComponent(userEmail)}`);
        if (applicationsRes.ok) {
          const applications = await applicationsRes.json();
          const recentUpdates = applications
            .filter((app: any) => {
              // Check if status changed recently (within last 7 days)
              const updatedDate = app.updated_at ? new Date(app.updated_at) : null;
              if (!updatedDate) return false;
              const daysSinceUpdate = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
              return daysSinceUpdate <= 7;
            })
            .map((app: any) => ({
              id: `application-${app.id}`,
              type: "application" as const,
              title: `Application Status: ${app.status || "Under Review"}`,
              message: `Your application for ${app.jobTitle || app.job_title || "a job"} at ${app.company || app.employer || "a company"} has been updated.`,
              timestamp: app.updated_at ? new Date(app.updated_at) : new Date(),
              read: false,
              link: "/candidate/candidate-dashboard?tab=applications",
            }));
          allNotifications.push(...recentUpdates.slice(0, 5)); // Limit to 5 most recent
        }
      } catch (err) {
        console.warn("Failed to fetch applications:", err);
      }

      // For employers: Fetch new job applications
      if (session?.user?.role === "EMPLOYER") {
        try {
          const jobsRes = await fetch(`${API_BASE}/company/all/full_profile`);
          if (jobsRes.ok) {
            const jobs = await jobsRes.json();
            // This would need to be enhanced with actual application counts
            // For now, we'll skip this
          }
        } catch (err) {
          console.warn("Failed to fetch jobs:", err);
        }
      }

      // Sort by timestamp (newest first)
      allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchNotifications();
      // Refresh notifications every 5 minutes
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
      
      // Listen for appointment booking/reschedule events
      const handleAppointmentBooked = () => {
        // Refresh notifications when appointment is booked
        setTimeout(() => fetchNotifications(), 1000); // Small delay to ensure backend is updated
      };
      
      const handleAppointmentRescheduled = () => {
        // Refresh notifications when appointment is rescheduled
        setTimeout(() => fetchNotifications(), 1000);
      };
      
      const handleApplicationStatusUpdated = () => {
        // Refresh notifications when application status is updated
        setTimeout(() => fetchNotifications(), 1000);
      };
      
      window.addEventListener('appointmentBooked', handleAppointmentBooked);
      window.addEventListener('appointmentRescheduled', handleAppointmentRescheduled);
      window.addEventListener('applicationStatusUpdated', handleApplicationStatusUpdated);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('appointmentBooked', handleAppointmentBooked);
        window.removeEventListener('appointmentRescheduled', handleAppointmentRescheduled);
        window.removeEventListener('applicationStatusUpdated', handleApplicationStatusUpdated);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case "application":
        return <FileText className="w-5 h-5 text-green-600" />;
      case "job":
        return <Briefcase className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!session?.user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-[#635bff] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden z-50 shadow-lg">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-[#3a4043]">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-[#635bff] hover:text-[#524aff] cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.link) {
                          setIsOpen(false);
                          window.location.href = notification.link;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-sm text-[#3a4043]">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

