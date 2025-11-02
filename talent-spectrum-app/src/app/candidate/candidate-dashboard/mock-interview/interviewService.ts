export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'general' | 'technical' | 'behavioral';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedDuration: number;
}

export interface JobPosition {
  title: string;
  description: string;
  requirements: string[];
  level: 'entry' | 'mid' | 'senior';
  industry: string;
}

export async function generateInterviewQuestions(
  jobPosition: JobPosition,
  interviewType: 'general' | 'technical' | 'behavioral',
  numberOfQuestions: number = 5
): Promise<InterviewQuestion[]> {
  try {
    
    const response = await fetch('/api/generate-interview-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobPosition,
        interviewType,
        numberOfQuestions
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('Questions received:', data.questions.length);
    console.log('Source:', data.source);
    
    return data.questions || [];
    
  } catch (error) {
    console.error('API Error:', error);
    console.log('Check server logs for details');
    return [];
  }
}
// Text-to-Speech service
export async function generateSpeechFromText(text: string): Promise<string> {
  try {
    // For now, we'll use browser's built-in speech synthesis
    // In production, you'd integrate with a more advanced TTS service
    if ('speechSynthesis' in window) {
      return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Find a suitable voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.includes('Female')
        ) || voices.find(voice => voice.lang.startsWith('en'));
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.onend = () => resolve('speech-completed');
        utterance.onerror = (error) => reject(error);
        
        speechSynthesis.speak(utterance);
      });
    }
    
    throw new Error('Speech synthesis not supported');
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

// Voice-to-Text Transcription using OpenAI Whisper
export async function transcribeVoiceToText(audioBlob: Blob): Promise<string> {
  try {
    console.log('🎤 Client: Starting OpenAI Whisper transcription...');
    console.log('📊 Client: Audio blob size:', audioBlob.size, 'bytes');
    console.log('📊 Client: Audio blob type:', audioBlob.type);
    
    if (audioBlob.size === 0) {
      throw new Error('Audio blob is empty');
    }

    if (audioBlob.size > 25 * 1024 * 1024) { // 25MB limit
      throw new Error('Audio file too large (max 25MB)');
    }
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    
    console.log('🔗 Client: Calling transcription API...');
    const response = await fetch('/api/MockInterviewTranscription', {
      method: 'POST',
      body: formData
    });
    
    console.log('📨 Client: API response status:', response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Client: API error:', data.error);
      throw new Error(data.error || `API error: ${response.status}`);
    }
    
    if (data.success && data.text) {
      console.log('✅ Client: Transcription successful');
      console.log('📝 Client: Transcribed text:', data.text.substring(0, 100) + (data.text.length > 100 ? '...' : ''));
      return data.text.trim();
    } else {
      console.warn('⚠️ Client: No text returned from transcription');
      return '';
    }
    
  } catch (error) {
    console.error('❌ Client: Whisper transcription error:', error);
    throw error; // Let the caller handle the error
  }
}

// AI Feedback Generation - calls server API
export async function generateAIFeedback(
  jobPosition: JobPosition,
  interviewType: 'general' | 'technical' | 'behavioral',
  answers: Array<{
    question: string;
    answer: string;
    timestamp: Date;
    audioBlob?: Blob;
  }>
): Promise<string> {
  try {
    console.log('🤖 Client: Requesting AI feedback...');
    console.log('📝 Analyzing', answers.length, 'answers for', jobPosition.title);
    
    const response = await fetch('/api/MockInterviewFeedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobPosition,
        interviewType,
        answers: answers.map(a => ({
          question: a.question,
          answer: a.answer,
          timestamp: a.timestamp
        })) // Remove audioBlob for API call
      })
    });
    
    if (!response.ok) {
      throw new Error(`Feedback API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Client: AI feedback received');
    console.log('📋 Source:', data.source);
    
    return data.feedback || 'Thank you for completing the interview!';
    
  } catch (error) {
    console.error('❌ Client: Error requesting feedback:', error);
    console.log('🔄 Check server logs for details');
    return 'Thank you for completing the interview! Keep practicing to improve your skills.';
  }
}


// Real Wav2Lips integration via backend API
export async function generateLipSyncVideo(
  text: string,
  imageUrl: string
): Promise<string> {
  try {
    console.log('🎬 Generating lip-sync video with Wav2Lips backend...');
    console.log('Text length:', text.length, 'characters');
    console.log('Avatar image:', imageUrl);
    
    // Make full URL for avatar image
    const fullAvatarUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${window.location.origin}${imageUrl}`;
    
    const response = await fetch('/api/wav2lip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        avatarUrl: fullAvatarUrl,
        language: 'en'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate lip-sync video');
    }

    const result = await response.json();
    
    if (!result.video_url) {
      throw new Error('No video URL returned from lip-sync service');
    }

    console.log('✅ Lip-sync video generated successfully');
    return result.video_url;
    
  } catch (error) {
    console.error('❌ Error generating lip-sync video:', error);
    throw error;
  }
}

// Text-to-Speech with audio blob generation
export async function generateSpeechAudio(text: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Find the best available voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Female') || voice.name.includes('Neural'))
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Note: Browser speech synthesis doesn't provide audio blobs directly
    // In a real implementation, you'd use a TTS service that returns audio files
    utterance.onend = () => {
      // Create a placeholder blob
      const audioBlob = new Blob([''], { type: 'audio/wav' });
      resolve(audioBlob);
    };

    utterance.onerror = (error) => reject(error);
    
    speechSynthesis.speak(utterance);
  });
}

export const jobPositions = [
  {
    title: "Frontend Developer",
    description: "Develop user-facing web applications using modern JavaScript frameworks",
    requirements: ["React", "TypeScript", "CSS", "HTML", "Git"],
    level: "mid" as const,
    industry: "Technology"
  },
  {
    title: "Full Stack Developer", 
    description: "Build end-to-end web applications with both frontend and backend components",
    requirements: ["React", "Node.js", "MongoDB", "Express", "REST APIs"],
    level: "mid" as const,
    industry: "Technology"
  },
  {
    title: "Data Scientist",
    description: "Analyze large datasets to extract insights and build predictive models",
    requirements: ["Python", "Machine Learning", "SQL", "Statistics", "Data Visualization"],
    level: "senior" as const,
    industry: "Technology"
  },
  {
    title: "UX Designer",
    description: "Design user experiences for digital products and services",
    requirements: ["Figma", "User Research", "Prototyping", "Design Systems", "Usability Testing"],
    level: "mid" as const,
    industry: "Design"
  },
  {
    title: "Product Manager",
    description: "Lead product development from conception to launch",
    requirements: ["Product Strategy", "Agile", "Analytics", "Stakeholder Management", "Market Research"],
    level: "senior" as const,
    industry: "Technology"
  },
  {
    title: "Software Engineer",
    description: "Design and develop scalable software solutions",
    requirements: ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes"],
    level: "mid" as const,
    industry: "Technology"
  }
];

