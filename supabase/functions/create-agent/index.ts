
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resume_text, first_name, last_name, elevenlabs_api_key } = await req.json();

    if (!elevenlabs_api_key || !first_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: elevenlabs_api_key, first_name' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const fullName = `${first_name} ${last_name || ''}`.trim();
    console.log('Creating ElevenLabs agent for:', fullName);

    // Create the agent using ElevenLabs API
    const agentResponse = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'Xi-Api-Key': elevenlabs_api_key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_config: {
          agent: {
            first_message: `Hi, I'm ${first_name}, ask me about my professional or educational history.`,
            prompt: {
              prompt: resume_text || `I'm ${fullName}. Ask me about my background and experience.`
            }
          }
        }
      })
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${agentResponse.status} - ${errorText}`);
    }

    const agentData = await agentResponse.json();
    console.log('Agent created successfully:', agentData.agent_id);

    return new Response(
      JSON.stringify({ agent_id: agentData.agent_id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating agent:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
