import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Sidebar } from '/@app/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '/@app/components/card';
import { Button } from '/@app/components/button';
import { Textarea } from '/@app/components/textarea';
import { Badge } from '/@app/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '/@app/components/tabs';
import { MessageSquare, Heart, Share2, User } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  role: 'candidate' | 'coach' | 'employer';
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Alex Johnson',
    role: 'candidate',
    content: 'Just landed my first interview! Thank you to my coach Sarah for all the support. Feeling nervous but prepared!',
    timestamp: '2 hours ago',
    likes: 12,
    comments: 5,
  },
  {
    id: '2',
    author: 'Sarah Chen',
    role: 'coach',
    content: 'Reminder: Practice sessions are just as important as real interviews. Don\'t skip your mock interviews - they build confidence!',
    timestamp: '5 hours ago',
    likes: 24,
    comments: 3,
  },
  {
    id: '3',
    author: 'TechCorp HR',
    role: 'employer',
    content: 'We\'re excited to announce our new sensory-friendly interview rooms! Creating inclusive spaces is a priority for us.',
    timestamp: '1 day ago',
    likes: 35,
    comments: 8,
  },
  {
    id: '4',
    author: 'Jordan Lee',
    role: 'candidate',
    content: 'Does anyone have tips for disclosing accommodations during the interview process? I want to be open but professional.',
    timestamp: '1 day ago',
    likes: 18,
    comments: 12,
  },
];

export const CommunityPage: React.FC = () => {
  const { darkMode, user, setCurrentPage } = useApp();
  const [activePage, setActivePage] = useState('community');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'candidate' | 'coach' | 'employer'>('all');

  const handlePageChange = (page: string) => {
    if (page === 'community') {
      setActivePage('community');
    } else {
      // Navigate back to role-specific dashboard
      if (user?.role === 'candidate') {
        setCurrentPage('candidate-dashboard');
      } else if (user?.role === 'coach') {
        setCurrentPage('coach-dashboard');
      } else if (user?.role === 'employer') {
        setCurrentPage('employer-dashboard');
      }
    }
  };

  const filteredPosts = selectedFilter === 'all' 
    ? mockPosts 
    : mockPosts.filter(post => post.role === selectedFilter);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'candidate': return 'bg-blue-100 text-blue-800';
      case 'coach': return 'bg-green-100 text-green-800';
      case 'employer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex">
      <Sidebar activePage={activePage} onPageChange={handlePageChange} />
      
      <main className={`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen p-8 transition-colors`}>
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Community</h2>

          {/* Create Post */}
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-3xl`}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-3">
                  <Textarea 
                    placeholder="Share your thoughts, questions, or success stories..."
                    className="rounded-2xl min-h-24"
                  />
                  <div className="flex justify-between items-center">
                    <Badge className={`rounded-2xl ${user?.role === 'candidate' ? 'bg-blue-100 text-blue-800' : user?.role === 'coach' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                      Posting as {user?.role || 'candidate'}
                    </Badge>
                    <Button className="rounded-2xl">Share Post</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter Tabs */}
          <Tabs value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as any)}>
            <TabsList className="rounded-2xl">
              <TabsTrigger value="all" className="rounded-2xl">All Posts</TabsTrigger>
              <TabsTrigger value="candidate" className="rounded-2xl">Candidates</TabsTrigger>
              <TabsTrigger value="coach" className="rounded-2xl">Coaches</TabsTrigger>
              <TabsTrigger value="employer" className="rounded-2xl">Employers</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Posts Feed */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-3xl`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                      {post.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={darkMode ? 'text-white' : 'text-gray-900'}>{post.author}</span>
                        <Badge variant="secondary" className={`rounded-2xl text-xs ${getRoleBadgeColor(post.role)}`}>
                          {post.role}
                        </Badge>
                        <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>• {post.timestamp}</span>
                      </div>
                      
                      <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {post.content}
                      </p>

                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="rounded-2xl">
                          <Heart className="h-4 w-4 mr-2" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-2xl">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-2xl">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
