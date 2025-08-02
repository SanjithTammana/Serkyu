import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const defaultSystemPrompt = `You are Serkyu, a helpful assistant for interactive 3D design.
You refine user requests into succinct prompts for a text-to-3D generator and offer friendly conversational feedback.
When asked to refine a request, respond only with a JSON block of the form:
{
  "prompt": "refined prompt",
  "message": "brief acknowledgement"
}
Otherwise, reply conversationally.`;

export async function POST(request) {
  try {
    const { message, history = [], systemPrompt } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const messages = [
      { role: "system", content: systemPrompt || defaultSystemPrompt },
      ...history.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: message },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama3-8b-8192",
      temperature: 0.8,
      max_tokens: 2048,
      top_p: 0.95,
    });

    const responseMessage =
      chatCompletion.choices[0]?.message?.content || "No response generated.";

    return NextResponse.json({ response: responseMessage });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
