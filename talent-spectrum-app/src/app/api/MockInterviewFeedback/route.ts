import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface JobPosition {
  title: string;
  description: string;
  requirements: string[];
  level: 'entry' | 'mid' | 'senior';
  industry: string;
}

export async function POST(req: Request) {
  let requestData: any;
  
  try {
    requestData = await req.json();
    const { jobPosition, interviewType, answers } = requestData;
    
    console.log('Server: Generating comprehensive AI feedback...');
    console.log('Answers to analyze:', answers.length);
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const feedbackPrompt = createFeedbackPrompt(jobPosition, interviewType, answers);
    console.log('Server: Feedback prompt created:', feedbackPrompt);
    
    const result = await model.generateContent(feedbackPrompt);
    const feedback = result.response.text();
    
    console.log('Server: AI feedback generated successfully');
    
    return NextResponse.json({ 
      feedback,
      success: true,
      source: 'gemini'
    });
    
  } catch (error) {
    console.error('Server: Feedback generation error:', error);
    
    const fallbackFeedback = getFallbackFeedback(
      requestData?.interviewType || 'general',
      requestData?.answers?.length || 0
    );
    
    return NextResponse.json({ 
      feedback: fallbackFeedback,
      success: false,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function createFeedbackPrompt(
  jobPosition: JobPosition,
  interviewType: 'general' | 'technical' | 'behavioral',
  answers: Array<{
    question: string;
    answer: string;
    timestamp: Date;
  }>
): string {
  const contextInfo = `
Position: ${jobPosition.title}
Industry: ${jobPosition.industry}
Experience Level: ${jobPosition.level}
Interview Type: ${interviewType}
Key Requirements: ${jobPosition.requirements.join(', ')}
`;

  const qaSection = answers.map((qa, index) => `
Question ${index + 1}: ${qa.question}
Answer: ${qa.answer || '[No answer provided]'}
`).join('\n');

  return `
You are an expert interview coach and hiring manager. Please provide detailed, constructive feedback for this ${interviewType} interview.

${contextInfo}

Interview Q&A:
${qaSection}

Please provide feedback covering:

1. **Overall Performance** (2-3 sentences)
   - General impression and interview readiness
   - Communication clarity and confidence level

2. **Strengths** (3-4 bullet points)
   - What the candidate did well
   - Strong answers or examples provided
   - Positive qualities demonstrated

3. **Areas for Improvement** (3-4 bullet points)
   - Specific areas to focus on
   - Missing elements in answers
   - Skills or knowledge gaps to address

4. **Specific Recommendations** (3-4 actionable items)
   - How to improve weak areas
   - Resources or practice suggestions
   - Interview strategy tips

5. **Position-Specific Feedback**
   - How well answers align with ${jobPosition.title} requirements
   - Industry-specific insights
   - Level-appropriate expectations

Keep feedback:
- Constructive and encouraging
- Specific with examples from their answers
- Actionable with clear next steps
- Professional but supportive in tone
- Tailored to ${jobPosition.level} level expectations

Format as clear sections with headers and bullet points for easy reading. Keep the answer short and concise.
`;
}

function getFallbackFeedback(
  interviewType: 'general' | 'technical' | 'behavioral',
  answersCount: number
): string {
  return `
## Overall Performance

Great job completing your ${interviewType} interview! You answered ${answersCount} questions and showed engagement throughout the process.

## Strengths
• **Participation**: You actively engaged with all questions presented
• **Completion**: You followed through with the entire interview process
• **Practice Mindset**: You're taking initiative to improve your interview skills
• **Technology Comfort**: You successfully used the AI interview platform

## Areas for Improvement
• **Answer Depth**: Consider providing more detailed examples in your responses
• **Structure**: Use frameworks like STAR (Situation, Task, Action, Result) for behavioral questions
• **Preparation**: Research common ${interviewType} questions for more practice
• **Confidence**: Continue practicing to build confidence in your delivery

## Specific Recommendations
• **Practice More**: Use this platform regularly to build confidence
• **Record Yourself**: Practice answering questions while recording to review your performance
• **Research**: Study the specific requirements for your target positions
• **Mock Interviews**: Consider practicing with friends or career counselors

## Next Steps
Keep practicing with different types of questions and positions. Each interview session will help you improve your communication skills and confidence level.

Remember: Every interview is a learning opportunity. You're on the right track by practicing regularly!
`;
}
