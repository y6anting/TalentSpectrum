"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { Input } from "@/app/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/select";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Building,
  Star,
  Heart,
  Filter,
  SortAsc,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  CheckCircle,
} from "lucide-react";
import { motion } from "motion/react";

export default function EmployerJobListing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Mock job data
  const jobs = [
    {
      id: "1",
      title: "Backend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$70k - $90k",
      postedDate: "2024-01-15",
      status: "active",
      applicants: 12,
      views: 234,
      accommodationsFriendly: true,
      description: "We're looking for a backend developer to join our inclusive team. We offer flexible work arrangements and neurodivergent-friendly accommodations.",
      requirements: ["Python", "Django", "PostgreSQL", "AWS"],
      benefits: ["Health Insurance", "Flexible Hours", "Remote Work", "Professional Development"],
      applicationDeadline: "2024-02-15",
      neurodivergentFriendly: true,
    },
    {
      id: "2",
      title: "UX Designer",
      department: "Design",
      location: "Seattle, WA",
      type: "Full-time",
      salary: "$65k - $85k",
      postedDate: "2024-01-20",
      status: "active",
      applicants: 8,
      views: 156,
      accommodationsFriendly: true,
      description: "Join our design team to create accessible and inclusive user experiences. We value diverse perspectives and neurodivergent thinking.",
      requirements: ["Figma", "User Research", "Prototyping", "Accessibility"],
      benefits: ["Health Insurance", "Flexible Hours", "Design Tools", "Team Collaboration"],
      applicationDeadline: "2024-02-20",
      neurodivergentFriendly: true,
    },
    {
      id: "3",
      title: "Data Analyst",
      department: "Analytics",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$80k - $110k",
      postedDate: "2024-01-18",
      status: "paused",
      applicants: 15,
      views: 289,
      accommodationsFriendly: false,
      description: "Analyze complex datasets to drive business decisions. We're looking for someone with strong analytical skills and attention to detail.",
      requirements: ["Python", "SQL", "Tableau", "Machine Learning"],
      benefits: ["Health Insurance", "401k", "Professional Development", "Gym Membership"],
      applicationDeadline: "2024-02-18",
      neurodivergentFriendly: false,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Paused
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Closed
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a4043] mb-2">Job Postings</h1>
            <p className="text-[#6f7a80]">
              Manage your job postings and track applications
            </p>
          </div>
          <Button className="bg-[#635bff] hover:bg-[#524aff] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6f7a80] w-4 h-4" />
                  <Input
                    placeholder="Search jobs by title, department, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SortAsc className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="applicants">Most Applicants</SelectItem>
                    <SelectItem value="views">Most Views</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-[#6f7a80]">
            Showing {filteredJobs.length} of {jobs.length} job postings
          </p>
        </div>

        {/* Job Cards */}
        <div className="space-y-6">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-[#3a4043]">{job.title}</h3>
                        {getStatusBadge(job.status)}
                        {/* {job.accommodationsFriendly && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Accommodation Friendly
                          </Badge>
                        )} */}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[#6f7a80] mb-3">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
                        </span>
                      </div>

                      <p className="text-[#6f7a80] mb-4 leading-relaxed">{job.description}</p>

                      {/* Requirements */}
                      <div className="mb-4">
                        <h4 className="font-medium text-[#3a4043] mb-2">Requirements:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req, reqIndex) => (
                            <Badge key={reqIndex} variant="secondary" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Benefits */}
                      <div className="mb-4">
                        <h4 className="font-medium text-[#3a4043] mb-2">Benefits:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.benefits.map((benefit, benefitIndex) => (
                            <Badge key={benefitIndex} variant="outline" className="text-xs border-[#635bff]/20 text-[#635bff]">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Job Stats */}
                      <div className="flex items-center gap-6 text-sm text-[#6f7a80] mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.applicants} applicants
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {job.views} views
                        </span>
                        <span>Posted: {job.postedDate}</span>
                        <span>Deadline: {job.applicationDeadline}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button className="bg-[#635bff] hover:bg-[#524aff] text-white">
                        <Eye className="w-4 h-4 mr-2" />
                        View Applications
                      </Button>
                      <Button variant="outline" className="border-[#635bff] text-[#635bff] hover:bg-[#635bff]/10">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 text-[#6f7a80] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#3a4043] mb-2">No job postings found</h3>
              <p className="text-[#6f7a80] mb-4">
                Try adjusting your search criteria or create a new job posting.
              </p>
              <Button 
                className="bg-[#635bff] hover:bg-[#524aff] text-white"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button size="sm" className="bg-[#635bff] text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
