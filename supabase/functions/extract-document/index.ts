
import { GoogleGenAI, GenerateContentResponse, Part } from "npm:@google/genai@^0.12.0";
import { corsHeaders } from "../_shared/cors.ts";

const PROMPT_FOR_FILE_EXTRACTION = `You are an expert document analysis AI. Your task is to extract all text content from the provided document.
Preserve the original formatting as much as possible, including:
- Paragraphs and line breaks
- Headings (if discernible, represent them clearly)
- Lists (bulleted or numbered, preserve markers)
- Tables (represent as formatted text)

Output only the extracted text. Do not add any commentary.
If the document appears to be empty or unreadable, respond with "[[EMPTY_OR_UNREADABLE_DOCUMENT]]".`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { base64Data, mimeType } = await req.json();

    if (!base64Data || !mimeType) {
      return new Response(JSON.stringify({ error: 'Missing base64Data or mimeType' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in Supabase secrets.');
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const filePart: Part = {
      inlineData: { data: base64Data, mimeType: mimeType },
    };
    const textInstructionPart: Part = { text: PROMPT_FOR_FILE_EXTRACTION };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: { parts: [filePart, textInstructionPart] },
    });

    const extractedText = response.text;

    if (!extractedText) {
      throw new Error('No text extracted from document');
    }

    if (extractedText.trim() === "[[EMPTY_OR_UNREADABLE_DOCUMENT]]") {
      return new Response(JSON.stringify({ text: "The document appears to be empty or could not be read by the AI." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ text: extractedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
