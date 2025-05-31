interface ResumeData {
  rawText: string;
  skills: string[];
  experience: string[];
  education: string[];
  contact: {
    email?: string;
    phone?: string;
    location?: string;
  };
  summary?: string;
}

interface ParsedResume {
  success: boolean;
  data?: ResumeData;
  error?: string;
}

// Extract skills from resume text
function extractSkills(text: string): string[] {
  const skillKeywords = [
    // Programming languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    // Web technologies
    'react', 'angular', 'vue', 'nodejs', 'express', 'nextjs', 'html', 'css', 'sass', 'tailwind',
    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'sql', 'nosql',
    // Cloud/DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
    // Data/Analytics
    'excel', 'powerbi', 'tableau', 'pandas', 'numpy', 'tensorflow', 'pytorch',
    // Project Management
    'agile', 'scrum', 'jira', 'confluence', 'trello',
    // Marketing
    'seo', 'sem', 'google analytics', 'facebook ads', 'instagram', 'linkedin',
    // Design
    'figma', 'sketch', 'photoshop', 'illustrator', 'canva'
  ];

  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();

  skillKeywords.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  // Also look for skills sections
  const skillsSectionMatch = text.match(/(?:skills|technical skills|core competencies)[:\s]*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
  if (skillsSectionMatch) {
    const skillsText = skillsSectionMatch[1];
    const additionalSkills = skillsText.split(/[,•\n\-]/).map(s => s.trim()).filter(s => s.length > 2);
    foundSkills.push(...additionalSkills);
  }

  return [...new Set(foundSkills)]; // Remove duplicates
}

// Extract work experience from resume text
function extractExperience(text: string): string[] {
  const experiences: string[] = [];
  
  // Look for experience sections
  const experienceMatches = text.match(/(?:experience|work history|employment|professional experience)[:\s]*([\s\S]*?)(?:\n\n|education|skills|$)/i);
  if (experienceMatches) {
    const expText = experienceMatches[1];
    // Split by job entries (usually marked by company names or dates)
    const jobEntries = expText.split(/\n(?=[A-Z].*(?:20\d{2}|19\d{2}))/);
    experiences.push(...jobEntries.map(entry => entry.trim()).filter(entry => entry.length > 10));
  }

  return experiences;
}

// Extract education from resume text
function extractEducation(text: string): string[] {
  const education: string[] = [];
  
  const educationMatch = text.match(/(?:education|academic background|qualifications)[:\s]*([\s\S]*?)(?:\n\n|experience|skills|$)/i);
  if (educationMatch) {
    const eduText = educationMatch[1];
    const eduEntries = eduText.split(/\n(?=[A-Z].*(?:university|college|institute|school))/i);
    education.push(...eduEntries.map(entry => entry.trim()).filter(entry => entry.length > 5));
  }

  return education;
}

// Extract contact information
function extractContact(text: string) {
  const contact: ResumeData['contact'] = {};
  
  // Email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) contact.email = emailMatch[1];
  
  // Phone
  const phoneMatch = text.match(/(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
  if (phoneMatch) contact.phone = phoneMatch[1];
  
  // Location (basic extraction)
  const locationMatch = text.match(/(?:location|address)[:\s]*([^\n]+)/i) || 
                       text.match(/([A-Z][a-z]+,\s*[A-Z]{2}(?:\s+\d{5})?)/);
  if (locationMatch) contact.location = locationMatch[1];
  
  return contact;
}

// Extract professional summary
function extractSummary(text: string): string | undefined {
  const summaryMatch = text.match(/(?:summary|objective|profile|about)[:\s]*([\s\S]*?)(?:\n\n|experience|education|skills|$)/i);
  return summaryMatch ? summaryMatch[1].trim() : undefined;
}

// Parse PDF file (client-side)
async function parsePDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Since we're on the client-side, we'll need to send to an API endpoint
    fetch('/api/parse-resume', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        resolve(data.text);
      } else {
        reject(new Error(data.error || 'Failed to parse PDF'));
      }
    })
    .catch(reject);
  });
}

// Main resume parsing function
export async function parseResume(file: File): Promise<ParsedResume> {
  try {
    let text: string;
    
    if (file.type === 'application/pdf') {
      text = await parsePDF(file);
    } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      // For Word documents, we'll also need server-side parsing
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to parse document');
      }
      text = data.text;
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or Word document.');
    }

    // Extract structured data from text
    const resumeData: ResumeData = {
      rawText: text,
      skills: extractSkills(text),
      experience: extractExperience(text),
      education: extractEducation(text),
      contact: extractContact(text),
      summary: extractSummary(text)
    };

    return {
      success: true,
      data: resumeData
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse resume'
    };
  }
}

// Generate interview context from resume data
export function generateInterviewContext(resumeData: ResumeData, jobDetails: any): string {
  let context = '\n\nCANDIDATE RESUME ANALYSIS:';
  
  if (resumeData.summary) {
    context += `\nProfessional Summary: ${resumeData.summary}`;
  }
  
  if (resumeData.skills.length > 0) {
    context += `\nKey Skills: ${resumeData.skills.slice(0, 15).join(', ')}`;
  }
  
  if (resumeData.experience.length > 0) {
    context += `\nWork Experience: ${resumeData.experience.slice(0, 3).map(exp => exp.substring(0, 200)).join('; ')}`;
  }
  
  if (resumeData.education.length > 0) {
    context += `\nEducation: ${resumeData.education.slice(0, 2).join('; ')}`;
  }
  
  context += `\n\nINTERVIEW GUIDANCE:
- Ask specific questions about the skills and experience mentioned in their resume
- Probe deeper into their work experience and achievements
- Ask about projects or accomplishments that relate to the ${jobDetails.title} role
- Inquire about how their background prepares them for this specific position at ${jobDetails.company}
- Ask for specific examples and metrics where possible`;
  
  return context;
}

export type { ResumeData, ParsedResume }; 