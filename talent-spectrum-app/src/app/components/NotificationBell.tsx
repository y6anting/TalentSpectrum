"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Calendar, FileText, Briefcase, ChevronDown, ChevronUp, MessageCircleMore } from "lucide-react";
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
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const [hoveredNotification, setHoveredNotification] = useState<string | null>(null);
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
          // Only show notifications to the OTHER party (not the one who booked it)
          // - If current user is candidate: show notifications for appointments booked FOR them (job coach booked it)
          // - If current user is job coach: show notifications for appointments booked WITH them (candidate booked it)
          const recentBookings = appointments
            .filter((apt: any) => {
              if (!apt.dateTime || !apt.candidate) return false; // Only show booked appointments
              const aptDate = new Date(apt.dateTime);
              const now = new Date();
              const minutesAgo = (now.getTime() - aptDate.getTime()) / (1000 * 60);
              
              // Show notifications for appointments booked/rescheduled in the last hour
              // Candidates see notifications when job coach books for them
              // Job coaches see notifications when candidate books with them
              const isCandidateView = apt.candidate === userEmail;
              const isJobCoachView = apt.jobCoach === userEmail && apt.candidate !== null;
              
              return (
                (isCandidateView || isJobCoachView) &&
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
              return {
                id: `appointment-booking-${apt.id}`,
                type: "appointment" as const,
                title: "Appointment Booked",
                message: `Your appointment has been booked for ${new Date(apt.dateTime).toLocaleDateString()} at ${new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
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
      // Use Next.js API route which properly calls the backend profiles endpoint
      try {
        const applicationsRes = await fetch(`/api/applications?candidateEmail=${encodeURIComponent(userEmail)}`);
        if (applicationsRes.ok) {
          const applications = await applicationsRes.json();
          console.log('[NotificationBell] Fetched applications:', applications.length);
          
          // Helper function to get status-specific message
          const getStatusMessage = (status: string, jobTitle: string, company: string) => {
            const jobName = jobTitle || "a job";
            const companyName = company || "a company";
            
            switch (status?.toLowerCase()) {
              case "shortlisted":
                return `Great news! Your application for ${jobName} at ${companyName} has been shortlisted!`;
              case "rejected":
                return `Your application for ${jobName} at ${companyName} has been reviewed. Unfortunately, you were not selected for this position.`;
              case "under_review":
                return `Your application for ${jobName} at ${companyName} is under review.`;
              case "interview_scheduled":
                return `Interview scheduled! Your application for ${jobName} at ${companyName} has progressed to the interview stage.`;
              case "accepted":
                return `Congratulations! Your application for ${jobName} at ${companyName} has been accepted!`;
              default:
                return `Your application for ${jobName} at ${companyName} has been updated.`;
            }
          };
          
          // Helper function to get status-specific title
          const getStatusTitle = (status: string) => {
            switch (status?.toLowerCase()) {
              case "shortlisted":
                return "Application Shortlisted";
              case "rejected":
                return "Application Update";
              case "under_review":
                return "Application Under Review";
              case "interview_scheduled":
                return "Interview Scheduled";
              case "accepted":
                return "Application Accepted";
              default:
                return "Application Status Updated";
            }
          };
          
          const recentUpdates = applications
            .filter((app: any) => {
              console.log('[NotificationBell] Checking application:', {
                id: app.id,
                status: app.status,
                updated_at: app.updated_at,
                applied_date: app.applied_date,
                interview_date: app.interview_date || app.interviewDate
              });
              
              // Always show interview_scheduled status (even if updated_at is missing)
              if (app.status === "interview_scheduled") {
                console.log('[NotificationBell] Including interview_scheduled application:', app.id);
                return true;
              }
              
              // Only show notifications for applications that have been updated (not just created)
              // Check if updated_at exists and is different from applied_date
              if (!app.updated_at) {
                console.log('[NotificationBell] Skipping application (no updated_at):', app.id);
                return false;
              }
              
              const updatedDate = new Date(app.updated_at);
              const appliedDate = app.applied_date ? new Date(app.applied_date) : null;
              
              // Show if updated within last 30 days (increased from 7 days)
              const daysSinceUpdate = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
              if (daysSinceUpdate > 30) {
                console.log('[NotificationBell] Skipping application (too old):', app.id);
                return false;
              }
              
              // Only show if status was actually changed (updated_at is after applied_date)
              if (appliedDate && updatedDate <= appliedDate) {
                console.log('[NotificationBell] Skipping application (not updated):', app.id);
                return false;
              }
              
              // Don't show "under_review" status if it's the initial status (same as applied_date)
              if (app.status === "under_review" && appliedDate && 
                  Math.abs(updatedDate.getTime() - appliedDate.getTime()) < 60000) {
                console.log('[NotificationBell] Skipping application (initial under_review):', app.id);
                return false;
              }
              
              console.log('[NotificationBell] Including application:', app.id, app.status);
              return true;
            })
            .map((app: any) => {
              const jobTitle = app.jobTitle || app.job_title || "a job";
              const company = app.company || app.employer || "a company";
              
              // Get custom message with interview date if available
              let message = getStatusMessage(app.status, jobTitle, company);
              if (app.status === "interview_scheduled" && (app.interview_date || app.interviewDate)) {
                try {
                  const interviewDate = app.interview_date || app.interviewDate;
                  // Normalize date string to ensure proper timezone handling
                  const normalizedStr = interviewDate.endsWith('Z') || interviewDate.includes('+') || interviewDate.includes('-', 10)
                    ? interviewDate
                    : interviewDate + 'Z';
                  const interviewDateTime = new Date(normalizedStr);
                  const dateStr = interviewDateTime.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                  });
                  const timeStr = interviewDateTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                  });
                  message = `Interview scheduled! Your interview for ${jobTitle} at ${company} is scheduled for ${dateStr} at ${timeStr}.`;
                } catch (e) {
                  console.warn('Failed to parse interview date for notification:', e);
                  // Use default message if date parsing fails
                }
              }
              
              // Timestamp should always be when the update happened, not the interview date
              // Use updated_at if available, otherwise use current time (notification just created)
              let timestamp: Date;
              if (app.updated_at) {
                // Normalize updated_at to ensure proper timezone handling
                const updatedAtStr = app.updated_at;
                const normalizedStr = updatedAtStr.endsWith('Z') || updatedAtStr.includes('+') || updatedAtStr.includes('-', 10)
                  ? updatedAtStr
                  : updatedAtStr + 'Z';
                timestamp = new Date(normalizedStr);
                
                // Debug logging for timestamp issues
                console.log('[NotificationBell] Timestamp for notification:', {
                  appId: app.id,
                  status: app.status,
                  updated_at_raw: app.updated_at,
                  normalized: normalizedStr,
                  parsed: timestamp.toISOString(),
                  now: new Date().toISOString(),
                  diffHours: (new Date().getTime() - timestamp.getTime()) / (1000 * 60 * 60)
                });
              } else {
                // If no updated_at, use current time (notification just created)
                timestamp = new Date();
                console.log('[NotificationBell] No updated_at, using current time for notification:', {
                  appId: app.id,
                  status: app.status,
                  timestamp: timestamp.toISOString()
                });
              }
              
              // Create unique ID - use interview_date if updated_at is missing
              const uniqueId = app.status === "interview_scheduled" && !app.updated_at && (app.interview_date || app.interviewDate)
                ? `application-${app.id}-${app.interview_date || app.interviewDate}`
                : `application-${app.id}-${app.updated_at || Date.now()}`;
              
              return {
                id: uniqueId,
              type: "application" as const,
                title: getStatusTitle(app.status),
                message: message,
                timestamp: timestamp,
              read: false,
              link: "/candidate/candidate-dashboard?tab=applications",
              };
            });
          
          // Sort by timestamp (newest first) and limit to 10 most recent
          recentUpdates.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());
          allNotifications.push(...recentUpdates.slice(0, 10));
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
      // Refresh notifications every 30 seconds (more frequent for better real-time updates)
      const interval = setInterval(fetchNotifications, 30 * 1000);
      
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
        console.log('[NotificationBell] Application status updated event received');
        setTimeout(() => fetchNotifications(), 1000);
      };
      
      const handleInterviewScheduled = () => {
        // Refresh notifications when interview is scheduled
        console.log('[NotificationBell] Interview scheduled event received');
        setTimeout(() => fetchNotifications(), 1000);
      };
      
      // Refresh when page becomes visible
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          console.log('[NotificationBell] Page became visible, refreshing notifications...');
          fetchNotifications();
        }
      };
      
      window.addEventListener('appointmentBooked', handleAppointmentBooked);
      window.addEventListener('appointmentRescheduled', handleAppointmentRescheduled);
      window.addEventListener('applicationStatusUpdated', handleApplicationStatusUpdated);
      window.addEventListener('interviewScheduled', handleInterviewScheduled);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('appointmentBooked', handleAppointmentBooked);
        window.removeEventListener('appointmentRescheduled', handleAppointmentRescheduled);
        window.removeEventListener('applicationStatusUpdated', handleApplicationStatusUpdated);
        window.removeEventListener('interviewScheduled', handleInterviewScheduled);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking expand button
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isMessageLong = (message: string) => {
    // Consider message long if it's more than ~100 characters or would wrap beyond 2 lines
    return message.length > 100;
  };

  const getNotificationIcon = (type: string) => {
    const iconColor = { color: 'var(--theme-color, #635bff)' };
    switch (type) {
      case "appointment":
        return <Calendar className="w-5 h-5" style={iconColor} />;
      case "application":
        return <MessageCircleMore className="w-5 h-5" style={iconColor} />;
      case "job":
        return <Briefcase className="w-5 h-5" style={iconColor} />;
      default:
        return <Bell className="w-5 h-5" style={iconColor} />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Handle edge case: if date is in the future (shouldn't happen, but handle gracefully)
    if (diffMs < 0) {
      console.warn('[NotificationBell] Future timestamp detected:', {
        date: date.toISOString(),
        now: now.toISOString(),
        diffMs
      });
      return "Just now";
    }
    
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
        className="relative p-2 text-gray-700 transition-colors cursor-pointer"
        style={{ 
          '--hover-color': 'var(--theme-color, #635bff)'
        } as React.CSSProperties & { '--hover-color': string }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--theme-color, #635bff)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '';
        }}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" style={{ color: 'var(--theme-color, #635bff)' }} />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden z-50 shadow-lg">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-[#3a4043]">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm cursor-pointer transition-colors"
                  style={{ 
                    color: 'var(--theme-color, #635bff)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--theme-color-hover, #524aff)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--theme-color, #635bff)';
                  }}
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
                  {notifications.map((notification) => {
                    const isExpanded = expandedNotifications.has(notification.id);
                    const isLong = isMessageLong(notification.message);
                    const showExpandButton = isLong;
                    
                    return (
                    <div
                      key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? "bg-blue-50/50" : ""
                      }`}
                        onMouseEnter={() => setHoveredNotification(notification.id)}
                        onMouseLeave={() => setHoveredNotification(null)}
                      onClick={() => {
                          if (!notification.read) {
                        markAsRead(notification.id);
                          }
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
                            
                            {/* Message with expand/collapse */}
                            <div className="mt-1">
                              <p 
                                className={`text-sm text-gray-600 ${
                                  isExpanded ? '' : 'line-clamp-2'
                                }`}
                                title={hoveredNotification === notification.id && !isExpanded ? notification.message : undefined}
                              >
                            {notification.message}
                          </p>
                              
                              {/* Expand/Collapse button for long messages */}
                              {showExpandButton && (
                                <button
                                  onClick={(e) => toggleExpand(notification.id, e)}
                                  className="text-xs mt-1 flex items-center gap-1 cursor-pointer transition-colors"
                                  style={{ color: 'var(--theme-color, #635bff)' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = 'var(--theme-color-hover, #524aff)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'var(--theme-color, #635bff)';
                                  }}
                                  aria-label={isExpanded ? "Show less" : "Show more"}
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-3 h-3" />
                                      Show less
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3" />
                                      Show more
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-400">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

