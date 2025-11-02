import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentRequest {
  provider: string;
  amount: number;
  phone: string;
  reference: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const paymentRequest: PaymentRequest = await req.json();
    const { provider, amount, phone, reference, description, customerName } = paymentRequest;

    let result;

    switch (provider) {
      case "orange_money":
        result = await processOrangeMoney(amount, phone, reference, description);
        break;
      case "moov_money":
        result = await processMoovMoney(amount, phone, reference, description);
        break;
      case "wave":
        result = await processWave(amount, phone, reference, description);
        break;
      case "telecel_money":
        result = await processTelecelMoney(amount, phone, reference, description);
        break;
      default:
        throw new Error("Fournisseur non supporté");
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function processOrangeMoney(
  amount: number,
  phone: string,
  reference: string,
  description?: string
) {
  const apiUrl = "https://api.orange.com/orange-money-webpay/bf/v1/webpayment";
  const apiKey = Deno.env.get("ORANGE_MONEY_API_KEY");
  const merchantKey = Deno.env.get("ORANGE_MONEY_MERCHANT_KEY");

  if (!apiKey || !merchantKey) {
    return {
      success: false,
      error: "Configuration Orange Money manquante",
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant_key: merchantKey,
        currency: "XOF",
        order_id: reference,
        amount: amount,
        return_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
        cancel_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
        notif_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
        lang: "fr",
        reference: description || reference,
      }),
    });

    const data = await response.json();

    if (response.ok && data.payment_url) {
      return {
        success: true,
        transactionId: data.notif_token || reference,
        providerReference: data.pay_token,
        checkoutUrl: data.payment_url,
        message: "Paiement Orange Money initié avec succès",
      };
    }

    return {
      success: false,
      error: data.message || "Erreur Orange Money",
    };
  } catch (error) {
    console.error("Orange Money error:", error);
    return {
      success: false,
      error: "Erreur de connexion Orange Money",
    };
  }
}

async function processMoovMoney(
  amount: number,
  phone: string,
  reference: string,
  description?: string
) {
  const apiUrl = "https://api.moov-africa.bf/v1/transactions/merchant-payment";
  const apiKey = Deno.env.get("MOOV_MONEY_API_KEY");

  if (!apiKey) {
    return {
      success: false,
      error: "Configuration Moov Money manquante",
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        currency: "XOF",
        customer_phone: phone,
        reference: reference,
        description: description || reference,
        callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === "pending") {
      return {
        success: true,
        transactionId: data.transaction_id,
        providerReference: data.reference,
        message: "Veuillez confirmer le paiement sur votre téléphone",
      };
    }

    return {
      success: false,
      error: data.message || "Erreur Moov Money",
    };
  } catch (error) {
    console.error("Moov Money error:", error);
    return {
      success: false,
      error: "Erreur de connexion Moov Money",
    };
  }
}

async function processWave(
  amount: number,
  phone: string,
  reference: string,
  description?: string
) {
  const apiUrl = "https://api.wave.com/v1/checkout/sessions";
  const apiKey = Deno.env.get("WAVE_API_KEY");

  if (!apiKey) {
    return {
      success: false,
      error: "Configuration Wave manquante",
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        currency: "XOF",
        client_reference: reference,
        success_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook?status=success`,
        error_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook?status=error`,
        webhook_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
      }),
    });

    const data = await response.json();

    if (response.ok && data.wave_launch_url) {
      return {
        success: true,
        transactionId: data.id,
        providerReference: data.business_name,
        checkoutUrl: data.wave_launch_url,
        message: "Redirection vers Wave...",
      };
    }

    return {
      success: false,
      error: data.message || "Erreur Wave",
    };
  } catch (error) {
    console.error("Wave error:", error);
    return {
      success: false,
      error: "Erreur de connexion Wave",
    };
  }
}

async function processTelecelMoney(
  amount: number,
  phone: string,
  reference: string,
  description?: string
) {
  const apiUrl = "https://api.telecel.bf/v1/payment/mobile-money";
  const apiKey = Deno.env.get("TELECEL_MONEY_API_KEY");
  const merchantId = Deno.env.get("TELECEL_MONEY_MERCHANT_ID");

  if (!apiKey || !merchantId) {
    return {
      success: false,
      error: "Configuration Telecel Money manquante",
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: amount,
        currency: "XOF",
        phone_number: phone,
        transaction_reference: reference,
        description: description || reference,
        callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === "initiated") {
      return {
        success: true,
        transactionId: data.transaction_id,
        providerReference: data.reference_number,
        message: "Composez *123# pour valider le paiement",
      };
    }

    return {
      success: false,
      error: data.message || "Erreur Telecel Money",
    };
  } catch (error) {
    console.error("Telecel Money error:", error);
    return {
      success: false,
      error: "Erreur de connexion Telecel Money",
    };
  }
}
