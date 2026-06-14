import { NextRequest, NextResponse } from "next/server";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lyrics, trackName, artistName, albumName, messages, mode, targetLanguage } = body;

    // Retrieve API key from environment variables
    const apiKey = process.env.GROQ_API_KEY;

    // Check if key is available. If not, fallback to Simulation Mode.
    if (!apiKey) {
      return handleSimulationMode({ lyrics, trackName, artistName, albumName, messages, mode, targetLanguage });
    }

    let groqMessages: { role: string; content: string }[] = [];

    if (mode === "translate") {
      const systemInstruction = `You are Lyriqa, a premium AI lyrics translation expert. You specialize in preserving the cultural context, poetic metrics, and emotional resonance of song lyrics across multiple languages.`;
      const userPrompt = `Please translate the following song into ${targetLanguage || "Spanish"}.
Song Details:
- Title: "${trackName}"
- Artist/Author: "${artistName}"
- Album: "${albumName}"

Lyrics:
"""
${lyrics || "[No lyrics available. Please translate based on the title and artist.]"}
"""

Requirements:
1. Provide a high-quality translation that preserves the emotion, rhythm, and lyrical nuance as much as possible.
2. Include a short introductory note (1-2 sentences) about the song's meaning and language transition, then output the translated lyrics/translation clearly.`;

      groqMessages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ];
    } else {
      const systemPrompt = `You are Lyriqa, a premium AI song analyst and music expert.
You have access to the following song details:
- Song Title: "${trackName}"
- Artist/Author: "${artistName}"
- Album: "${albumName}"

Lyrics:
"""
${lyrics || "[No lyrics available. Please analyze the song based on its title and artist.]"}
"""

TASK: Answer the user's questions or queries regarding this song.
The user might ask about the song's meaning, metaphors, instrumentals, historical context, or details about the author/artist (${artistName}).
Use the lyrics and your extensive music database knowledge to answer. Be insightful, concise, and structure your responses with Markdown (bolding, bullet points, quotes) to match a premium UI look.`;

      groqMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((m: Message) => ({
          role: m.role,
          content: m.content,
        })),
      ];
    }

    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq API error response:", errorData);
      return NextResponse.json(
        { error: errorData?.error?.message || `Groq API responded with status ${response.status}` },
        { status: response.status }
      );
    }

    const groqData = await response.json();
    const aiResponse = groqData?.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("Invalid response format from Groq API");
    }

    return NextResponse.json({ content: aiResponse, simulated: false });
  } catch (error: any) {
    console.error("Error in AI route:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// High-quality simulated response generator for zero-setup demonstrations
function handleSimulationMode(data: any): Promise<NextResponse> {
  const { trackName, artistName, messages, mode, targetLanguage } = data;
  const lastUserMessage = messages[messages.length - 1]?.content || "";

  let simulationContent = "";

  const simulationHeader = `> **[Simulation Mode Active]** _Enter your Groq API Key in the settings panel (gear icon) to activate live Llama-3.1 AI analysis._\n\n`;

  if (mode === "translate") {
    simulationContent = `${simulationHeader}Here is a simulated translation of **"${trackName}"** by **${artistName}** into **${targetLanguage || "Spanish"}**:\n\n` +
      `### Lyrical Translation Excerpt (${targetLanguage})\n` +
      `*This is a preview of how Lyrind translates lyrics while preserving the artistic integrity of the original text.*\n\n` +
      `1. **[Verse 1]**\n` +
      `   * (Original) "I hear the wind call my name..." \n` +
      `   * (Translated) "Escucho al viento llamar mi nombre..."\n\n` +
      `2. **[Chorus]**\n` +
      `   * (Original) "Take me higher, let me fly..." \n` +
      `   * (Translated) "Llévame más alto, déjame volar..."\n\n` +
      `---\n` +
      `### Analysis & Meaning\n` +
      `This song captures themes of freedom and self-discovery. Translating it into **${targetLanguage}** emphasizes the universal yearning for release that **${artistName}** wove into the track.`;
  } else {
    // Basic heuristics to match query types
    const query = lastUserMessage.toLowerCase();
    
    if (query.includes("author") || query.includes("artist") || query.includes("who wrote") || query.includes("singer")) {
      simulationContent = `${simulationHeader}### About the Author / Artist: **${artistName}**\n\n` +
        `**${artistName}** is the primary creator of **"${trackName}"**. \n\n` +
        `Key background highlights for this artist include:\n` +
        `- **Musical Style:** Blending emotional songwriting with modern production nuances.\n` +
        `- **Lyrical Strengths:** Known for poetic metaphors, narrative storytelling, and exploring complex introspective topics.\n` +
        `- **Song Impact:** *"${trackName}"* stands as a core example of their ability to connect with listeners through raw vulnerability.`;
    } else if (query.includes("meaning") || query.includes("theme") || query.includes("metaphor") || query.includes("what is it about")) {
      simulationContent = `${simulationHeader}### Lyrical Analysis of **"${trackName}"** by **${artistName}**\n\n` +
        `Here is a thematic breakdown of the song:\n\n` +
        `1. **The Core Message:** The song details a transition from darkness or struggle toward hope and self-reliance.\n` +
        `2. **Key Metaphors:**\n` +
        `   - **"Storms" and "Shadows":** Often represent internal anxiety or structural societal pressures.\n` +
        `   - **"Flying" or "Light":** Represents reclamation of agency and personal breakthrough.\n` +
        `3. **Tone and Vibe:** Melancholic yet uplifting, building toward an emotional crescendo that echoes the lyrical transformation.`;
    } else {
      simulationContent = `${simulationHeader}### Lyriqa AI Companion response for **"${trackName}"**\n\n` +
        `You asked: *"${lastUserMessage}"*\n\n` +
        `Here is a simulated response concerning **"${trackName}"** by **${artistName}**:\n` +
        `- **Artist:** ${artistName}\n` +
        `- **Track:** ${trackName}\n\n` +
        `Lyriqa's AI model analyzes the lyrics to find poetic structures, rhyming patterns, and hidden context. \n\n` +
        `*To customize your questions and receive complete real-time answers, please insert a **Groq API key** via the Settings modal in the top-right corner.*`;
    }
  }

  // Add a small delay to simulate network latency
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(NextResponse.json({ content: simulationContent, simulated: true }));
    }, 800);
  });
}
