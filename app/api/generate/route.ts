import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // Your site URL
        'X-Title': 'GeneralUX', // Your site name
      },
      body: JSON.stringify({
        model: 'x-ai/grok-4', // Using Grok-4
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for GeneralUX, a platform that helps businesses find prospects and LinkedIn profiles for their target markets. When given a target industry or market, provide detailed insights about potential companies and key personnel in that space.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate response from OpenRouter' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      response: data.choices[0]?.message?.content || 'No response generated'
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
