import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    
    let extractedText = '';

    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // For PDF parsing, we'll use a simple text extraction
        // In a production environment, you'd want to use a library like pdf-parse
        extractedText = await extractTextFromPDF(buffer);
      } else if (
        file.type.includes('word') || 
        file.name.endsWith('.docx') || 
        file.name.endsWith('.doc')
      ) {
        // For Word documents, we'd use a library like mammoth
        extractedText = await extractTextFromWord(buffer);
      } else {
        return NextResponse.json(
          { success: false, error: 'Unsupported file type. Please upload a PDF or Word document.' },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error('Error parsing file:', parseError);
      return NextResponse.json(
        { success: false, error: 'Failed to extract text from file. Please ensure the file is not corrupted.' },
        { status: 500 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { success: false, error: 'No text content found in the file.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      filename: file.name,
      size: file.size
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing file.' },
      { status: 500 }
    );
  }
}

// Simple PDF text extraction (fallback)
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // For now, we'll use a basic approach
    // In production, install and use: npm install pdf-parse
    // const pdf = require('pdf-parse');
    // const data = await pdf(buffer);
    // return data.text;
    
    // Fallback: Convert buffer to string and try to extract readable text
    const text = buffer.toString('utf8');
    // Look for text patterns that might be readable
    const readableText = text.match(/[a-zA-Z\s]{10,}/g)?.join(' ') || '';
    
    if (readableText.length < 50) {
      throw new Error('Unable to extract readable text from PDF');
    }
    
    return readableText;
  } catch (error) {
    throw new Error('PDF parsing failed. Please try converting to a text-based PDF or use a Word document.');
  }
}

// Simple Word document text extraction (fallback)
async function extractTextFromWord(buffer: Buffer): Promise<string> {
  try {
    // For now, we'll use a basic approach
    // In production, install and use: npm install mammoth
    // const mammoth = require('mammoth');
    // const result = await mammoth.extractRawText({buffer});
    // return result.value;
    
    // Fallback: Try to extract text from Word document
    const text = buffer.toString('utf8');
    // Word documents have XML structure, try to extract text
    const textMatches = text.match(/>([^<]*)</g);
    const extractedText = textMatches
      ?.map(match => match.replace(/[><]/g, ''))
      .filter(text => text.trim().length > 2 && /[a-zA-Z]/.test(text))
      .join(' ') || '';
    
    if (extractedText.length < 50) {
      throw new Error('Unable to extract readable text from Word document');
    }
    
    return extractedText;
  } catch (error) {
    throw new Error('Word document parsing failed. Please try saving as a PDF or use a different format.');
  }
} 