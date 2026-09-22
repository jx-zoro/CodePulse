import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { OpenAICompatibleProvider } from "@/server/services/ai/OpenAIProvider";
import { AIRedactionService } from "@/server/services/ai/AIRedactionService";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt, context } = await req.json();

    const provider = new OpenAICompatibleProvider();
    if (!provider.isConfigured()) {
      return NextResponse.json({ message: "AI Provider is not configured." }, { status: 503 });
    }

    const redactedContext = AIRedactionService.redactJson(context);
    
    const systemPrompt = `You are the CodePulse AI Copilot, an expert API developer assistant.
You help developers debug APIs, write tests, explain failures, and improve API security.
Always base your advice strictly on the provided context. Do NOT invent or hallucinate API structures that are not in the context.
If you are guessing, state clearly that it is a suggestion or a guess.
Use Markdown formatting for your responses.`;

    const fullPrompt = `${prompt}

Context:
${JSON.stringify(redactedContext, null, 2)}`;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await provider.stream(fullPrompt, systemPrompt, (chunk) => {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          });
          controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err: any) {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Copilot Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}



