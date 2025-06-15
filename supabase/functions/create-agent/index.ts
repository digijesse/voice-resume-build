
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, firstName, bio } = await req.json();

    if (!apiKey || !firstName || !bio) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: apiKey, firstName, bio' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Creating ElevenLabs agent for:', firstName);

    // Create the agent using ElevenLabs API
    const agentResponse = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'Xi-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_config: {
          agent: {
            first_message: `Hi, I'm ${firstName}, ask me about my professional or educational history.`,
            prompt: {
              prompt: bio
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
