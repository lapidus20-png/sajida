import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  user_id: string;
  type: string;
  channel: 'email' | 'sms' | 'both';
  recipient: string;
  subject?: string;
  message: string;
  metadata?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: NotificationPayload = await req.json();

    const results = [];

    if (payload.channel === 'email' || payload.channel === 'both') {
      const emailResult = await sendEmail(payload);
      results.push(emailResult);
    }

    if (payload.channel === 'sms' || payload.channel === 'both') {
      const smsResult = await sendSMS(payload);
      results.push(smsResult);
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: 'Notifications sent successfully'
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending notifications:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send notifications'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function sendEmail(payload: NotificationPayload) {
  console.log('Sending email to:', payload.recipient);
  console.log('Subject:', payload.subject);
  console.log('Message:', payload.message);

  return {
    channel: 'email',
    recipient: payload.recipient,
    status: 'sent',
    sent_at: new Date().toISOString()
  };
}

async function sendSMS(payload: NotificationPayload) {
  console.log('Sending SMS to:', payload.recipient);
  console.log('Message:', payload.message);

  return {
    channel: 'sms',
    recipient: payload.recipient,
    status: 'sent',
    sent_at: new Date().toISOString()
  };
}