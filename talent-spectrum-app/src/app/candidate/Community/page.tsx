"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Rss,
  Search,
  User,
  Heart,
  MessageCircle,
  Plus,
  Settings,
  Hash,
  MapPin,
  Briefcase,
  Book,
  Star,
  Smile,
  Zap,
  Lightbulb,
  Sun,
  Moon,
  Coffee,
  Image as ImageIcon,
  Globe,
  Lock,
  Mail,
  Phone,
  Calendar,
  Tag,
  Info,
  UserCheck,
  XCircle,
} from "lucide-react";

// --- Replicating components based on your provided files ---
// These are simplified versions for demonstration. In a real app,
// they would likely be in separate files in '@/app/components'.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "default",
  children,
  className,
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variantStyles = {
    primary: "bg-[#635bff] text-white hover:bg-[#5748e5]",
    outline:
      "border border-[#e8e6f0] bg-white hover:bg-gray-100 hover:text-[#3a4043]",
    ghost: "hover:bg-gray-100 hover:text-[#3a4043]",
  };
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div
    className={`rounded-xl border border-[#e8e6f0] bg-white shadow-md ${className}`}
    {...props}
  >
    {children}
  </div>
);

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}
const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
  ...props
}) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-tight text-[#3a4043] ${className}`}
    {...props}
  >
    {children}
  </h3>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "purple"
    | "blue"
    | "green"
    | "yellow"
    | "red";
  children: React.ReactNode;
  className?: string;
}
const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className,
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variantStyles = {
    default: "border-transparent bg-gray-100 text-gray-800",
    success: "border-transparent bg-emerald-100 text-emerald-800",
    warning: "border-transparent bg-yellow-100 text-yellow-800",
    danger: "border-transparent bg-red-100 text-red-800",
    info: "border-transparent bg-blue-100 text-blue-800",
    purple: "border-transparent bg-purple-100 text-purple-800",
    blue: "border-transparent bg-blue-100 text-blue-800",
    green: "border-transparent bg-green-100 text-green-800",
    yellow: "border-transparent bg-yellow-100 text-yellow-800",
    red: "border-transparent bg-red-100 text-red-800",
  };
  return (
    <div
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const Input: React.FC<InputProps> = ({ className, ...props }) => (
  <input
    className={`flex h-10 w-full rounded-lg border border-[#e8e6f0] bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const Textarea: React.FC<TextareaProps> = ({ className, ...props }) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-lg border border-[#e8e6f0] bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Functional Select components
interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  onClick?: () => void;
}
const SelectItem: React.FC<SelectItemProps> = ({
  value,
  children,
  onClick,
  ...props
}) => (
  <div
    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
);

interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}
const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={`flex h-10 w-full items-center justify-between rounded-lg border border-[#e8e6f0] bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400/50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
    <svg
      className="h-4 w-4 opacity-50"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </button>
);

interface SelectValueProps {
  placeholder: string;
  children?: React.ReactNode;
}
const SelectValue: React.FC<SelectValueProps> = ({ placeholder, children }) => (
  <span>{children || placeholder}</span>
);

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
const SelectContent: React.FC<SelectContentProps> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={`absolute z-50 mt-1 w-full rounded-lg border border-[#e8e6f0] bg-white shadow-lg ${className}`}
    {...props}
  >
    {children}
  </div>
);

interface SelectProps {
  children: React.ReactNode;
  onValueChange: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  children,
  onValueChange,
  defaultValue,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(defaultValue || "");
  const selectRef = useRef<HTMLDivElement>(null);

  const handleSelect = (value: string) => {
    setCurrentValue(value);
    onValueChange(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <SelectTrigger onClick={() => setIsOpen(!isOpen)}>
        <SelectValue placeholder={placeholder || "Select an option"}>
          {currentValue}
        </SelectValue>
      </SelectTrigger>
      {isOpen && (
        <SelectContent>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === SelectItem) {
              const typedChild = child as React.ReactElement<SelectItemProps>;
              return React.cloneElement(typedChild, {
                onClick: () => handleSelect(typedChild.props.value),
              });
            }
            return child;
          })}
        </SelectContent>
      )}
    </div>
  );
};

// --- INTERFACES FOR DATA STRUCTURES ---
interface CommunityPost {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  isLiked: boolean;
  showCommentBox: boolean;
  newCommentText: string; // This is for the comment input state, not part of the post content itself
  imageUrl: string | null;
}

interface ChatMessage {
  type: "sent" | "received";
  text: string;
}

interface Conversation {
  id: string;
  sender: string;
  senderAvatar: string;
  lastMessage: string;
  time: string;
  chatHistory: ChatMessage[];
}

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  neurotype: string;
  interests: string[];
  mutual?: number; // Optional for suggested users
  lastActive?: string; // Optional for connections
}

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  imageUrl: string;
  isJoined: boolean;
}

// --- Main NeuroConnect Page Component ---

const NeuroConnectPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatPartner, setSelectedChatPartner] = useState<string | null>(
    null
  );

  // State for new post creation
  const [newPostText, setNewPostText] = useState("");
  const [newPostImageFile, setNewPostImageFile] = useState<File | null>(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Placeholder Data
  const [currentUser, setCurrentUser] = useState({
    name: "Alex Chen",
    avatar: "/community/alex_chen.png",
    neurotype: "Autistic",
    interests: ["Coding", "Gaming", "Art", "Nature"],
    location: "Kuala Lumpur",
    email: "alex.chen@example.com",
    dob: "1995-03-15",
    bio: "Passionate about coding and exploring the intersection of technology and creativity. Always looking for new perspectives and connections.",
    privacy: "Public",
  });

  const suggestedUsers: UserProfile[] = [
    {
      id: "u1",
      name: "Muhammad Aiman",
      avatar: "/community/muhammad_aiman.png",
      neurotype: "ADHD",
      interests: ["Writing", "Photography", "Travel"],
      mutual: 3,
    },
    {
      id: "u2",
      name: "Arjun Raj",
      avatar: "/community/arjun_raj.png",
      neurotype: "Autistic",
      interests: ["Coding", "Sci-Fi", "Chess"],
      mutual: 5,
    },
    {
      id: "u3",
      name: "Nur Aisyah",
      avatar: "/community/nur_aisyah.png",
      neurotype: "Dyslexic",
      interests: ["Reading", "History", "Cooking"],
      mutual: 1,
    },
    {
      id: "u4",
      name: "Lim Jun Hao",
      avatar: "/community/lim_jun_hao.png",
      neurotype: "Autistic",
      interests: ["Art", "Music", "Animals"],
      mutual: 2,
    },
    {
      id: "u5",
      name: "Siti Nurina",
      avatar: "/community/siti_nurina.png",
      neurotype: "Dyslexic",
      interests: ["Reading", "History", "Cooking"],
      mutual: 1,
    },
    {
      id: "u6",
      name: "Emma Webber",
      avatar: "/community/emma_webber.png",
      neurotype: "Autistic",
      interests: ["Art", "Music", "Animals"],
      mutual: 2,
    },
  ];

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: "p1",
      author: "Maya Singh",
      authorAvatar: "/community/maya_singh.png",
      content:
        "Just finished a new short story! It's about a neurodivergent protagonist discovering their unique strengths. Anyone else find writing helps process thoughts?",
      timestamp: "2 hours ago",
      likes: 15,
      comments: 3,
      tags: ["Writing", "Creativity", "Processing"],
      isLiked: false,
      showCommentBox: false,
      newCommentText: "",
      imageUrl: "/community/post/post1.png",
    },
    {
      id: "p2",
      author: "Ben Carter",
      authorAvatar: "/community/ben_carter.png",
      content:
        "Looking for recommendations for sensory-friendly headphones for work. Any suggestions that are comfortable for long periods?",
      timestamp: "5 hours ago",
      likes: 22,
      comments: 8,
      tags: ["Sensory", "Work", "Recommendations"],
      isLiked: false,
      showCommentBox: false,
      newCommentText: "",
      imageUrl: "/community/post/post3.png",
    },
    {
      id: "p3",
      author: "Chloe Lee",
      authorAvatar: "/community/chloe_lee.png",
      content:
        "Feeling a bit overwhelmed today. Just wanted to share that it's okay to take a break and recharge. Sending good vibes to everyone!",
      timestamp: "1 day ago",
      likes: 40,
      comments: 12,
      tags: ["Support", "SelfCare", "MentalHealth"],
      isLiked: false,
      showCommentBox: false,
      newCommentText: "",
      imageUrl: "/community/post/post2.png",
    },
  ]);

  const communityGroups: CommunityGroup[] = [
    {
      id: "g1",
      name: "Autism & Tech",
      description:
        "Discussing tech, coding, and innovation from an autistic perspective.",
      members: 120,
      imageUrl: "/community/group/autism_tech.png",
      isJoined: true,
    },
    {
      id: "g2",
      name: "ADHD Productivity Hacks",
      description:
        "Sharing strategies and tools for focus and organization with ADHD.",
      members: 85,
      imageUrl: "/community/group/adhd_pd.png",
      isJoined: false,
    },
    {
      id: "g3",
      name: "Neurodivergent Artists",
      description:
        "A space for neurodivergent creators to share art and inspiration.",
      members: 200,
      imageUrl: "/community/group/neurodivergence_artist.png",
      isJoined: true,
    },
    {
      id: "g4",
      name: "Sensory-Friendly Living",
      description:
        "Tips and tricks for creating a comfortable and sensory-aware environment.",
      members: 150,
      imageUrl: "/community/group/sensory_living.png",
      isJoined: false,
    },
  ];

  const messages: Conversation[] = [
    {
      id: "m1",
      sender: "Ben Carter",
      senderAvatar: "/community/ben_carter.png",
      lastMessage:
        "Hey Alex, saw your post about gaming. What are you playing lately?",
      time: "10:30 AM",
      chatHistory: [
        {
          type: "received",
          text: "Hey Alex, saw your post about gaming. What are you playing lately?",
        },
        {
          type: "sent",
          text: "Hey Ben! Mostly indie games and some strategy titles. Just finished Stardew Valley again!",
        },
        {
          type: "received",
          text: "Oh, Stardew is great! I've been looking for something new. Any other recommendations?",
        },
      ],
    },
    {
      id: "m2",
      sender: "Maya Singh",
      senderAvatar: "/community/maya_singh.png",
      lastMessage: "Thanks for the feedback on my story! Really appreciate it.",
      time: "Yesterday",
      chatHistory: [
        {
          type: "received",
          text: "Thanks for the feedback on my story! Really appreciate it.",
        },
        {
          type: "sent",
          text: "You're welcome! Your writing is truly inspiring.",
        },
      ],
    },
    {
      id: "m3",
      sender: "Chloe Lee",
      senderAvatar: "/community/chloe_lee.png",
      lastMessage:
        "Feeling a bit overwhelmed today. Just wanted to share that it's okay to take a break and recharge.",
      time: "2 days ago",
      chatHistory: [
        {
          type: "received",
          text: "Feeling a bit overwhelmed today. Just wanted to share that it's okay to take a break and recharge.",
        },
        {
          type: "sent",
          text: "Sending you strength, Chloe! Take care of yourself.",
        },
      ],
    },
  ];

  const myConnections: UserProfile[] = [
    {
      id: "c1",
      name: "Ben Carter",
      avatar: "/community/ben_carter.png",
      neurotype: "Autistic",
      interests: ["Coding", "Sci-Fi", "Chess"],
      lastActive: "Online",
    },
    {
      id: "c2",
      name: "Maya Singh",
      avatar: "/community/maya_singh.png",
      neurotype: "ADHD",
      interests: ["Writing", "Photography", "Travel"],
      lastActive: "Active 30m ago",
    },
    {
      id: "c3",
      name: "Chloe Lee",
      avatar: "/community/chloe_lee.png",
      neurotype: "Autistic",
      interests: ["Art", "Music", "Animals"],
      lastActive: "Active 1h ago",
    },
    {
      id: "c4",
      name: "Siti Sarah",
      avatar: "/community/siti_sarah.png",
      neurotype: "Dyspraxic",
      interests: ["Design", "Gardening", "Cooking"],
      lastActive: "Offline",
    },
    {
      id: "c5",
      name: "Ahmad Firdaus",
      avatar: "/community/ahmad_firdaus.png",
      neurotype: "Autistic",
      interests: ["Art", "Music", "Animals"],
      lastActive: "Active 5h ago",
    },
    {
      id: "c6",
      name: "Kavitha",
      avatar: "/community/kavitha.png",
      neurotype: "Dyspraxic",
      interests: ["Design", "Gardening", "Cooking"],
      lastActive: "Offline",
    },
  ];

  // --- Community Feed Interaction Handlers ---
  const handleLike = (postId: string) => {
    setCommunityPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleToggleCommentBox = (postId: string) => {
    setCommunityPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              showCommentBox: !post.showCommentBox,
              newCommentText: "",
            } // Clear text when toggling
          : post
      )
    );
  };

  const handleCommentChange = (postId: string, text: string) => {
    setCommunityPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, newCommentText: text } : post
      )
    );
  };

  const handleSubmitComment = (postId: string) => {
    setCommunityPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments + 1,
              newCommentText: "",
              showCommentBox: false,
            } // Simulate adding comment
          : post
      )
    );
  };

  // --- Image Post Handlers ---
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setNewPostImageFile(file);
      setNewPostImagePreview(URL.createObjectURL(file));
    } else {
      setNewPostImageFile(null);
      setNewPostImagePreview(null);
    }
  };

  const handleCreatePost = () => {
    if (!newPostText.trim() && !newPostImageFile) {
      alert("Please enter some text or select an image to post.");
      return;
    }

    const newPost: CommunityPost = {
      // Explicitly type newPost
      id: `p${communityPosts.length + 1}`,
      author: currentUser.name,
      authorAvatar: currentUser.avatar,
      content: newPostText,
      timestamp: "Just now",
      likes: 0,
      comments: 0,
      tags: [],
      isLiked: false,
      showCommentBox: false,
      newCommentText: "", // This is part of the post's state for its own comment box
      imageUrl: newPostImagePreview,
    };

    setCommunityPosts((prevPosts) => [newPost, ...prevPosts]);
    setNewPostText("");
    setNewPostImageFile(null);
    setNewPostImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --- Profile Settings Handlers ---
  const handleProfileChange = (field: string, value: string | string[]) => {
    setCurrentUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    alert("Profile saved!"); // Placeholder for actual save logic
  };

  const renderContent = () => {
    switch (activeTab) {
      case "feed":
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#3a4043]">
              Community Feed
            </h1>
            <Card className="p-4">
              <div className="flex items-start space-x-3 my-5">
                <img
                  src={currentUser.avatar || "/avatar-placeholder.jpg"}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <Textarea
                  placeholder="Share your thoughts, ask a question, or post an update..."
                  className="flex-grow"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                />
              </div>
              {newPostImagePreview && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden mx-auto mb-4">
                  <img
                    src={newPostImagePreview}
                    alt="Image preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 bg-white/70 hover:bg-white"
                    onClick={() => {
                      setNewPostImageFile(null);
                      setNewPostImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <XCircle className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              )}
              <div className="flex justify-between items-center mt-4">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="mr-2 h-4 w-4" /> Add Photo
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreatePost}
                  disabled={!newPostText.trim() && !newPostImageFile}
                >
                  Post
                </Button>
              </div>
            </Card>

            {communityPosts.map((post) => (
              <motion.div
                key={post.id}
                whileHover={{
                  scale: 1.01,
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
                transition={{ duration: 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={post.authorAvatar || "/avatar-placeholder.jpg"}
                      alt={post.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-[#3a4043]">
                        {post.author}
                      </p>
                      <p className="text-xs text-gray-500">{post.timestamp}</p>
                    </div>
                  </div>
                  {post.content && (
                    <p className="text-gray-700 mb-4">{post.content}</p>
                  )}
                  {post.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="w-full object-cover max-h-96"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, idx) => (
                      <Badge key={idx} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center space-x-4 text-gray-600 border-t border-[#e8e6f0] pt-4 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          post.isLiked ? "text-red-500 fill-red-500" : ""
                        }`}
                      />{" "}
                      <span className={post.isLiked ? "font-bold" : ""}>
                        {post.likes} Likes
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={() => handleToggleCommentBox(post.id)}
                    >
                      <MessageCircle className="h-4 w-4" />{" "}
                      <span>{post.comments} Comments</span>
                    </Button>
                  </div>
                  {post.showCommentBox && (
                    <div className="mt-4 pt-4 border-t border-[#e8e6f0] flex flex-col space-y-2">
                      <Textarea
                        placeholder="Write your comment..."
                        value={post.newCommentText}
                        onChange={(e) =>
                          handleCommentChange(post.id, e.target.value)
                        }
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleCommentBox(post.id)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSubmitComment(post.id)}
                          disabled={!post.newCommentText.trim()}
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        );

      case "discover":
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#3a4043]">
              Discover Friends
            </h1>
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search by name, interest, neurotype..."
                className="w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedUsers
                .filter(
                  (user) =>
                    user.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    user.neurotype
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    user.interests.some((interest) =>
                      interest.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                )
                .map((user) => (
                  <motion.div
                    key={user.id}
                    whileHover={{
                      scale: 1.03,
                      boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-6 text-center">
                      <img
                        src={user.avatar || "/avatar-placeholder.jpg"}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                      />
                      <h3 className="text-xl font-semibold text-[#3a4043]">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {user.neurotype}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {user.interests.map((interest, idx) => (
                          <Badge key={idx} variant="blue">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mb-4">
                        {user.mutual} mutual connections
                      </p>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" /> Connect
                      </Button>
                    </Card>
                  </motion.div>
                ))}
            </div>
            {suggestedUsers.filter(
              (user) =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.neurotype
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                user.interests.some((interest) =>
                  interest.toLowerCase().includes(searchQuery.toLowerCase())
                )
            ).length === 0 && (
              <p className="text-center text-gray-600 text-lg mt-8">
                No users found matching your search criteria.
              </p>
            )}
          </div>
        );

      case "connections":
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#3a4043]">
              My Connections
            </h1>

            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search connections by name or interest..."
                className="w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myConnections
                .filter(
                  (user) =>
                    user.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    user.neurotype
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    user.interests.some((interest) =>
                      interest.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                )
                .map((user) => (
                  <motion.div
                    key={user.id}
                    whileHover={{
                      scale: 1.03,
                      boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-6 text-center">
                      <img
                        src={user.avatar || "/avatar-placeholder.jpg"}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                      />
                      <h3 className="text-xl font-semibold text-[#3a4043]">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {user.neurotype}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {user.interests.map((interest, idx) => (
                          <Badge key={idx} variant="blue">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mb-4">
                        {user.lastActive}
                      </p>
                      <Button className="w-full" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" /> Message
                      </Button>
                    </Card>
                  </motion.div>
                ))}
            </div>
            {myConnections.filter(
              (user) =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.neurotype
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                user.interests.some((interest) =>
                  interest.toLowerCase().includes(searchQuery.toLowerCase())
                )
            ).length === 0 && (
              <p className="text-center text-gray-600 text-lg mt-8">
                No connections found matching your search criteria.
              </p>
            )}
          </div>
        );

      case "messages":
        // Find the currently selected conversation's data
        const currentConversation = messages.find(
          (msg) => msg.sender === selectedChatPartner
        );

        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#3a4043]">Messages</h1>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Conversation List */}
              <Card className="md:col-span-1 p-0">
                <CardHeader className="pb-3">
                  <CardTitle>Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-[#e8e6f0]">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        // Add onClick to select conversation and highlight it
                        onClick={() => setSelectedChatPartner(msg.sender)}
                        className={`flex items-center space-x-3 p-4 cursor-pointer ${
                          selectedChatPartner === msg.sender
                            ? "bg-violet-50"
                            : ""
                        }`}
                      >
                        <img
                          src={msg.senderAvatar || "/avatar-placeholder.jpg"}
                          alt={msg.sender}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-grow">
                          <p className="font-semibold text-[#3a4043]">
                            {msg.sender}
                          </p>
                          <p className="text-sm text-gray-600">
                            {msg.lastMessage}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">{msg.time}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Window */}
              <Card className="md:col-span-2 flex flex-col h-[500px]">
                <CardHeader className="pb-3 border-b border-[#e8e6f0]">
                  <CardTitle>
                    Chat with {selectedChatPartner || "..."}
                  </CardTitle>{" "}
                  {/* Dynamic title */}
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-4">
                  {selectedChatPartner ? (
                    <div className="space-y-4">
                      {currentConversation?.chatHistory.map(
                        (chatMsg, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              chatMsg.type === "sent"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`p-3 rounded-lg max-w-[70%] break-words ${
                                chatMsg.type === "sent"
                                  ? "bg-[#635bff] text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {chatMsg.text}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-lg">
                      Select a conversation to start chatting.
                    </div>
                  )}
                </CardContent>
                <div className="p-4 border-t border-[#e8e6f0] flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    className="flex-grow"
                    disabled={!selectedChatPartner}
                  />
                  <Button disabled={!selectedChatPartner}>Send</Button>
                </div>
              </Card>
            </div>
          </div>
        );

      case "groups":
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#3a4043]">
              My Groups & Forums
            </h1>
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-grow mr-4">
                <Input
                  type="text"
                  placeholder="Search groups..."
                  className="w-full pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Create Group
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityGroups
                .filter(
                  (group) =>
                    group.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    group.description
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .map((group) => (
                  <motion.div
                    key={group.id}
                    whileHover={{
                      scale: 1.03,
                      boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-6 text-center">
                      <img
                        src={group.imageUrl || "/group-placeholder.jpg"}
                        alt={group.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                      />
                      <h3 className="text-xl font-semibold text-[#3a4043]">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {group.description}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        {group.members} members
                      </p>
                      <Button
                        className="w-full"
                        variant={group.isJoined ? "outline" : "primary"}
                      >
                        {group.isJoined ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" /> Joined
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" /> Join Group
                          </>
                        )}
                      </Button>
                    </Card>
                  </motion.div>
                ))}
            </div>
            {communityGroups.filter(
              (group) =>
                group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                group.description
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <p className="text-center text-gray-600 text-lg mt-8">
                No groups found matching your search criteria.
              </p>
            )}
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#3a4043]">
              Profile Settings
            </h1>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <Input
                    id="name"
                    value={currentUser.name}
                    onChange={(e) =>
                      handleProfileChange("name", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={currentUser.email}
                    onChange={(e) =>
                      handleProfileChange("email", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth
                  </label>
                  <Input
                    id="dob"
                    type="date"
                    value={currentUser.dob}
                    onChange={(e) => handleProfileChange("dob", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Location
                  </label>
                  <Input
                    id="location"
                    value={currentUser.location}
                    onChange={(e) =>
                      handleProfileChange("location", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    value={currentUser.bio}
                    onChange={(e) => handleProfileChange("bio", e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="neurotype"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Neurotype
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleProfileChange("neurotype", value)
                    }
                    defaultValue={currentUser.neurotype}
                    placeholder="Select Neurotype"
                  >
                    <SelectItem value="Autistic">Autistic</SelectItem>
                    <SelectItem value="ADHD">ADHD</SelectItem>
                    <SelectItem value="Dyslexic">Dyslexic</SelectItem>
                    <SelectItem value="Dyspraxic">Dyspraxic</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="interests"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Interests (comma-separated)
                  </label>
                  <Input
                    id="interests"
                    value={
                      Array.isArray(currentUser.interests)
                        ? currentUser.interests.join(", ")
                        : currentUser.interests
                    } // Ensure value is string
                    onChange={(e) =>
                      handleProfileChange(
                        "interests",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="privacy"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Profile Privacy
                  </label>
                  <Select
                    onValueChange={(value) =>
                      handleProfileChange("privacy", value)
                    }
                    defaultValue={currentUser.privacy}
                    placeholder="Select Privacy"
                  >
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Connections Only">
                      Connections Only
                    </SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                  </Select>
                </div>
                <Button onClick={handleSaveProfile}>Update Preferences</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Current Password
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>
                <Button onClick={() => alert("Password updated!")}>
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-background py-8 px-4 font-['Plus_Jakarta_Sans',_sans-serif]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a4043]">
              NeuroConnect Community
            </h1>
            <p className="text-gray-600 mt-1">
              Connect, chat, and support each other in a safe space.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Post
          </Button>
        </div>

        <div className="flex items-start gap-8">
          {/* Sidebar */}
          <Card className="w-72 sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto shrink-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 my-6">
                <img
                  src={currentUser.avatar || "/avatar-placeholder.jpg"}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-[#3a4043]">
                    {currentUser.name}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <User className="h-3 w-3 mr-1" /> {currentUser.neurotype}
                  </p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { name: "Community Feed", icon: Rss, tab: "feed" },
                  { name: "Discover Friends", icon: Users, tab: "discover" },
                  { name: "My Connections", icon: Heart, tab: "connections" },
                  { name: "Messages", icon: MessageSquare, tab: "messages" },
                  { name: "My Groups", icon: Hash, tab: "groups" },
                  { name: "Profile Settings", icon: Settings, tab: "settings" },
                ].map((item) => (
                  <motion.div
                    key={item.tab}
                    whileHover={{ x: 5 }}
                    className="relative"
                  >
                    <button
                      onClick={() => setActiveTab(item.tab)}
                      className={`flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200
                        ${
                          activeTab === item.tab
                            ? "bg-[#635bff] text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </motion.div>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="flex-grow space-y-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default NeuroConnectPage;
