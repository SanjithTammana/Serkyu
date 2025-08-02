import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Accept a refined prompt from the chat endpoint
    const { prompt: rawPrompt } = await request.json();
    const prompt = rawPrompt?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const token = process.env.HF_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "HF_API_TOKEN is not configured" },
        { status: 500 }
      );
    }

    // Step 1: generate an image from the prompt using a text-to-image model
    const textToImage = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!textToImage.ok) {
      const errorText = await textToImage.text();
      return NextResponse.json(
        { error: "Failed to generate image", details: errorText },
        { status: 500 }
      );
    }

    const imageBuffer = Buffer.from(await textToImage.arrayBuffer());

    // Step 2: send the image to an image-to-3D model
    const imageTo3D = await fetch(
      "https://api-inference.huggingface.co/models/ashawkey/zero123-xl",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
        },
        body: imageBuffer,
      }
    );

    if (!imageTo3D.ok) {
      const errorText = await imageTo3D.text();
      return NextResponse.json(
        { error: "Failed to generate 3D model", details: errorText },
        { status: 500 }
      );
    }

    const modelBuffer = Buffer.from(await imageTo3D.arrayBuffer());
    const contentType = imageTo3D.headers.get("content-type") ||
      "application/octet-stream";

    return new NextResponse(modelBuffer, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    console.error("Error in generate3d API:", err);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
