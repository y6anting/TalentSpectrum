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
  numberOfQuestions: number = 2
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
// Text-to-Speech service using Edge TTS with browser fallback
export async function generateSpeechFromText(
  text: string,
  voice: string = "en-SG-LunaNeural", // Singapore female voice
  rate: number = 0,
  volume: number = 1.0,
  pitch?: string,
  style?: string,
  useSsml: boolean = false
): Promise<string> {
  try {
    console.log('🔊 Attempting Edge TTS...');
    
    const response = await fetch('/api/edge-tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
        rate,
        volume,
        pitch,
        style,
        use_ssml: useSsml
      })
    });

    if (!response.ok) {
      throw new Error(`Edge TTS API error: ${response.status}`);
    }

    // Check if response is audio blob
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.startsWith('audio/')) {
      // Play the audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve('speech-completed');
        };
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          // If playback fails, don't reject - just resolve (audio was generated successfully)
          console.warn('⚠️ Audio playback failed, but Edge TTS succeeded');
          resolve('speech-completed');
        };
        
        // Play audio and handle autoplay restrictions
        audio.play().catch((playError) => {
          // Autoplay policy or other playback restrictions
          // Don't trigger fallback since Edge TTS succeeded
          console.warn('⚠️ Audio play() failed (may be autoplay restriction), but Edge TTS succeeded:', playError);
          URL.revokeObjectURL(audioUrl);
          resolve('speech-completed');
        });
      });
    } else {
      // JSON response with filename
      const data = await response.json();
      return data.audio_filename || 'speech-completed';
    }
  } catch (error) {
    // Only fallback if Edge TTS API call itself failed (network error, server error, etc.)
    console.warn('⚠️ Edge TTS API failed, falling back to browser TTS:', error);
    return fallbackToBrowserTTS(text);
  }
}

// Helper function for browser TTS fallback
function fallbackToBrowserTTS(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
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

// Text-to-Speech with audio blob generation using Edge TTS with browser fallback
export async function generateSpeechAudio(
  text: string,
  voice: string = "en-SG-LunaNeural", // Singapore female voice
  rate: number = 0,
  volume: number = 1.0,
  pitch?: string,
  style?: string,
  useSsml: boolean = false
): Promise<Blob> {
  try {
    console.log('🔊 Attempting Edge TTS audio generation...');
    
    const response = await fetch('/api/edge-tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
        rate,
        volume,
        pitch,
        style,
        use_ssml: useSsml
      })
    });

    if (!response.ok) {
      throw new Error(`Edge TTS API error: ${response.status}`);
    }

    // Return the audio blob directly
    const audioBlob = await response.blob();
    
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Failed to generate audio file');
    }

    console.log('✅ Edge TTS audio generated successfully');
    return audioBlob;
  } catch (error) {
    console.warn('⚠️ Edge TTS failed, falling back to browser TTS:', error);
    // Fallback to browser TTS (returns empty blob as placeholder since browser TTS can't generate blobs)
    return fallbackToBrowserTTSAudio(text);
  }
}

// Helper function for browser TTS fallback (returns placeholder blob)
function fallbackToBrowserTTSAudio(text: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Female') || voice.name.includes('Neural'))
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      // Browser TTS doesn't provide audio blobs, so return placeholder
      // The caller can use this to know speech completed via browser TTS
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

