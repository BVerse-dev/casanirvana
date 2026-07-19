import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current date
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Mark payments as overdue
    const { data: overduePayments, error: overdueError } = await supabase
      .from("payments")
      .update({ status: "overdue" })
      .eq("status", "pending")
      .lt("due_date", today.toISOString())
      .select();

    if (overdueError) {
      return new Response(
        JSON.stringify({ error: overdueError.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Create notifications for overdue payments
    if (overduePayments && overduePayments.length > 0) {
      const notifications = [];
      
      for (const payment of overduePayments) {
        // Get unit owner
        const { data: unit } = await supabase
          .from("units")
          .select("owner_id")
          .eq("id", payment.unit_id)
          .single();

        if (unit && unit.owner_id) {
          notifications.push({
            user_id: unit.owner_id,
            title: "Payment Overdue",
            message: `Your payment of ${payment.amount} for ${payment.description} is now overdue.`,
            type: "payment_overdue",
            metadata: { payment_id: payment.id },
            is_read: false,
            created_at: new Date().toISOString(),
          });
        }
      }

      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: overduePayments?.length || 0
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
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