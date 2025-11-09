import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const url = new URL(req.url);
    const provider = url.searchParams.get("provider") || "unknown";

    let webhookData;
    if (req.method === "POST") {
      webhookData = await req.json();
    } else {
      webhookData = Object.fromEntries(url.searchParams);
    }

    console.log("Webhook received:", { provider, data: webhookData });

    let transactionId: string | undefined;
    let status: string;
    let providerReference: string | undefined;

    switch (provider) {
      case "orange_money":
        ({ transactionId, status, providerReference } = handleOrangeMoneyWebhook(webhookData));
        break;
      case "moov_money":
        ({ transactionId, status, providerReference } = handleMoovMoneyWebhook(webhookData));
        break;
      case "wave":
        ({ transactionId, status, providerReference } = handleWaveWebhook(webhookData));
        break;
      case "telecel_money":
        ({ transactionId, status, providerReference } = handleTelecelMoneyWebhook(webhookData));
        break;
      default:
        console.error("Unknown provider:", provider);
        return new Response(
          JSON.stringify({ success: false, error: "Provider unknown" }),
          { status: 400, headers: corsHeaders }
        );
    }

    if (transactionId) {
      const { error: updateError } = await supabase
        .from("transactions")
        .update({
          status: status,
          provider_reference: providerReference,
          processed_at: status === "complete" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("provider_transaction_id", transactionId);

      if (updateError) {
        console.error("Error updating transaction:", updateError);
      } else {
        console.log("Transaction updated:", transactionId, status);
      }

      if (status === "complete") {
        const { data: transaction } = await supabase
          .from("transactions")
          .select("contract_id, amount, transaction_type")
          .eq("provider_transaction_id", transactionId)
          .single();

        if (transaction && transaction.transaction_type === "acompte") {
          await supabase
            .from("escrow_accounts")
            .update({
              amount_deposited: transaction.amount,
              status: "finance",
              updated_at: new Date().toISOString(),
            })
            .eq("contract_id", transaction.contract_id);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, status, transactionId }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function handleOrangeMoneyWebhook(data: any) {
  const transactionId = data.notif_token || data.order_id;
  const paymentStatus = data.status || data.payment_status;

  let status: string;
  if (paymentStatus === "SUCCESS" || paymentStatus === "SUCCESSFUL") {
    status = "complete";
  } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
    status = "echoue";
  } else if (paymentStatus === "PENDING") {
    status = "traitement";
  } else {
    status = "en_attente";
  }

  return {
    transactionId,
    status,
    providerReference: data.pay_token || data.txnid,
  };
}

function handleMoovMoneyWebhook(data: any) {
  const transactionId = data.transaction_id || data.reference;
  const paymentStatus = data.status;

  let status: string;
  if (paymentStatus === "success" || paymentStatus === "completed") {
    status = "complete";
  } else if (paymentStatus === "failed" || paymentStatus === "rejected") {
    status = "echoue";
  } else if (paymentStatus === "pending") {
    status = "traitement";
  } else {
    status = "en_attente";
  }

  return {
    transactionId,
    status,
    providerReference: data.moov_reference || data.transaction_ref,
  };
}

function handleWaveWebhook(data: any) {
  const transactionId = data.id || data.client_reference;
  const paymentStatus = data.status || data.wave_status;

  let status: string;
  if (paymentStatus === "complete" || paymentStatus === "succeeded") {
    status = "complete";
  } else if (paymentStatus === "failed" || paymentStatus === "cancelled") {
    status = "echoue";
  } else if (paymentStatus === "pending") {
    status = "traitement";
  } else {
    status = "en_attente";
  }

  return {
    transactionId,
    status,
    providerReference: data.wave_transaction_id,
  };
}

function handleTelecelMoneyWebhook(data: any) {
  const transactionId = data.transaction_id || data.transaction_reference;
  const paymentStatus = data.status || data.transaction_status;

  let status: string;
  if (paymentStatus === "success" || paymentStatus === "completed" || paymentStatus === "confirmed") {
    status = "complete";
  } else if (paymentStatus === "failed" || paymentStatus === "declined" || paymentStatus === "cancelled") {
    status = "echoue";
  } else if (paymentStatus === "pending" || paymentStatus === "initiated") {
    status = "traitement";
  } else {
    status = "en_attente";
  }

  return {
    transactionId,
    status,
    providerReference: data.reference_number || data.telecel_reference,
  };
}
