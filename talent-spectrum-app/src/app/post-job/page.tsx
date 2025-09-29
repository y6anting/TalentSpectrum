"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/card';
import { Button } from '@/app/components/button';
import { Input } from '@/app/components/input';
import { Textarea } from '@/app/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/select';
import { Checkbox } from '@/app/components/checkbox';
import { Badge } from '@/app/components/badge';
import { Separator } from '@/app/components/separator';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Shield,
  Heart,
  Plus,
  X
} from 'lucide-react';

export default function PostJob() {
  const router = useRouter();
  const [jobType, setJobType] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [accommodations, setAccommodations] = useState<string[]>([]);

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];
  const locations = ['Remote', 'On-site', 'Hybrid'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];
  const availableAccommodations = [
    'Flexible work hours',
    'Remote work options',
    'Quiet workspace',
    'Noise-cancelling headphones',
    'Written instructions',
    'Extended deadlines',
    'Regular check-ins',
    'Sensory-friendly environment',
    'Break schedule flexibility',
    'Communication preferences support'
  ];

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const toggleAccommodation = (accommodation: string) => {
    accommodations.includes(accommodation)
      ? setAccommodations(accommodations.filter(acc => acc !== accommodation))
      : setAccommodations([...accommodations, accommodation]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Job posted successfully');
    router.push('/employer-dashboard');
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/employer-dashboard')}
            className="mb-4 text-[#3a4043] hover:text-[#6b8a7a]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-[#3a4043] mb-2">Post a New Job</h1>
          <p className="text-gray-600">Create an inclusive job posting that attracts neurodivergent talent</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Job Information */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                <Building2 className="h-5 w-5 text-[#6b8a7a]" /> Job Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#3a4043] mb-2">Job Title *</label>
                  <Input 
                    placeholder="e.g. Senior Software Engineer"
                    required
                    className="bg-[#faf9f7] border border-gray-300 text-[#3a4043]"
                  />
                </div>
                <div>
                  <label className="block text-[#3a4043] mb-2">Department</label>
                  <Input 
                    placeholder="e.g. Engineering"
                    className="bg-[#faf9f7] border border-gray-300 text-[#3a4043]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[#3a4043] mb-2">Job Type *</label>
                  <Select value={jobType} onValueChange={setJobType} required>
                    <SelectTrigger className="bg-[#faf9f7] border border-gray-300 text-[#3a4043]">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map(type => <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-[#3a4043] mb-2">Work Location *</label>
                  <Select value={workLocation} onValueChange={setWorkLocation} required>
                    <SelectTrigger className="bg-[#faf9f7] border border-gray-300 text-[#3a4043]">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => <SelectItem key={loc} value={loc.toLowerCase()}>{loc}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-[#3a4043] mb-2">Experience Level</label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="bg-[#faf9f7] border border-gray-300 text-[#3a4043]">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map(level => <SelectItem key={level} value={level.toLowerCase()}>{level}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#3a4043] mb-2">Location</label>
                  <Input placeholder="e.g. San Francisco, CA or Remote" className="bg-[#faf9f7] border border-gray-300 text-[#3a4043]" />
                </div>
                <div>
                  <label className="block text-[#3a4043] mb-2">Salary Range</label>
                  <Input placeholder="e.g. $80,000 - $120,000" className="bg-[#faf9f7] border border-gray-300 text-[#3a4043]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-[#3a4043]">Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-[#3a4043] mb-2">Job Summary *</label>
                <Textarea placeholder="Provide a brief overview..." rows={4} required className="bg-[#faf9f7] border border-gray-300 text-[#3a4043]" />
              </div>
              <div>
                <label className="block text-[#3a4043] mb-2">Key Responsibilities</label>
                <Textarea placeholder="• Responsibilities..." rows={6} className="bg-[#faf9f7] border border-gray-300 text-[#3a4043]" />
              </div>
              <div>
                <label className="block text-[#3a4043] mb-2">Requirements</label>
                <Textarea placeholder="• Requirements..." rows={6} className="bg-[#faf9f7] border border-gray-300 text-[#3a4043]" />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-[#3a4043]">Required Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="bg-[#faf9f7] border border-gray-300 text-[#3a4043]"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-[#6b8a7a]/10 text-[#6b8a7a]">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Neurodivergent-Friendly Features */}
          <Card className="border border-[#6b8a7a]/30 bg-[#f0f4f3]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#3a4043]">
                <Heart className="h-5 w-5 text-[#6b8a7a]" /> Neurodivergent-Friendly Features
              </CardTitle>
              <p className="text-gray-600 mt-1">Highlight your commitment to inclusive hiring</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-[#3a4043] mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#6b8a7a]" /> Available Accommodations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableAccommodations.map(acc => (
                    <div key={acc} className="flex items-center space-x-2">
                      <Checkbox id={acc} checked={accommodations.includes(acc)} onCheckedChange={() => toggleAccommodation(acc)} />
                      <label htmlFor={acc} className="text-[#3a4043] cursor-pointer">{acc}</label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex justify-end gap-4 pb-8">
            <Button type="button" variant="outline" onClick={() => router.push('/employer-dashboard')}>Cancel</Button>
            <Button type="button" variant="outline">Save as Draft</Button>
            <Button type="submit" className="bg-[#6b8a7a] hover:bg-[#5d7c6b] text-white">Post Job</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
