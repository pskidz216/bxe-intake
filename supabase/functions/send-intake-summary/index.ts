// BXE Intake Portal — Email Summary Edge Function
// Sends application summary emails to the applicant and admin team
// Uses Resend API for email delivery

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Admin emails to receive notification on every submission
const ADMIN_EMAILS = [
  "paul@boldxenterprises.com",
  "paul@thearcstudio.com",
];

// Sending domain — must be verified in Resend
const FROM_EMAIL = "BXE Intake <noreply@boldxenterprises.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Helper: format currency ──
function fmtCurrency(val: string | number | null | undefined): string {
  if (!val) return "N/A";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
}

// ── Helper: format transaction path ──
function fmtPath(path: string | null | undefined): string {
  if (!path) return "Not specified";
  const map: Record<string, string> = {
    equity_investment: "Equity Investment",
    ma: "Merger & Acquisition",
    both: "Both / Open to Either",
  };
  return map[path] || path;
}

// ── Helper: format date ──
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Build the summary data from DB records ──
interface SummaryData {
  companyName: string;
  industry: string;
  stage: string;
  businessModel: string;
  founderName: string;
  founderEmail: string;
  transactionPath: string;
  investmentAmount: string;
  securityType: string;
  preMoneyValuation: string;
  founderIntent: string;
  documentCount: number;
  sectionsWithData: number;
  submittedAt: string;
  applicationId: string;
}

function buildSummaryHtml(d: SummaryData): string {
  return `
    <table style="width:100%;border-collapse:collapse;font-family:'Helvetica Neue',Arial,sans-serif;">
      <tr>
        <td colspan="2" style="padding:20px 0 12px;border-bottom:2px solid #E8871E;">
          <h2 style="margin:0;color:#1A1A2E;font-size:20px;">Application Summary</h2>
          <p style="margin:4px 0 0;color:#6B7280;font-size:13px;">Submitted ${d.submittedAt}</p>
        </td>
      </tr>

      <tr><td colspan="2" style="padding:16px 0 6px;"><strong style="color:#E8871E;font-size:14px;">Company Information</strong></td></tr>
      <tr>
        <td style="padding:4px 0;color:#6B7280;font-size:13px;width:40%;">Company Name</td>
        <td style="padding:4px 0;color:#1A1A2E;font-size:13px;font-weight:600;">${d.companyName || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6B7280;font-size:13px;">Industry</td>
        <td style="padding:4px 0;color:#1A1A2E;font-size:13px;">${d.industry || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6B7280;font-size:13px;">Stage</td>
        <td style="padding:4px 0;color:#1A1A2E;font-size:13px;">${d.stage || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6B7280;font-size:13px;">Business Model</td>
        <td style="padding:4px 0;color:#1A1A2E;font-size:13px;">${d.businessModel || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6B7280;font-size:13px;">Founder / CEO</td>
        <td style="padding:4px 0;color:#1A1A2E;font-size:13px;">${d.founderName || "N/A"} (${d.founderEmail || "N/A"})</td>
      </tr>

      <tr><td colspan="2" style="padding:16px 0 6px;border-top:1px solid #E5E7EB;"><strong style="color:#E8871E;font-size:14px;">Transaction Details</strong></td></tr>
      <tr>
        <td style="padding:4px 0;color:#6B7280;font-size:13px;">Transaction Path</td>
        <td style="padding:4px 0;color:#1A1A2E;font-size:13px;">${d.transactionPath}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6B7280;font-size:13px;">Investment Amount</td>
        <td style="padding:4px 0;color:#1A1A2E;font-size:13px;font-weight:600;">${d.investmentAmount}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6B7280;font-size:13px;">Security Type</td>
        <td style="padding:4px 0;color:#1A1A2E;font-size:13px;">${d.securityType || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6B7280;font-size:13px;">Pre-Money Valuation</td>
        <td style="padding:4px 0;color:#1A1A2E;font-size:13px;">${d.preMoneyValuation}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6B7280;font-size:13px;">Founder Intent</td>
        <td style="padding:4px 0;color:#1A1A2E;font-size:13px;">${d.founderIntent || "N/A"}</td>
      </tr>

      <tr><td colspan="2" style="padding:16px 0 6px;border-top:1px solid #E5E7EB;"><strong style="color:#E8871E;font-size:14px;">Submission Stats</strong></td></tr>
      <tr>
        <td style="padding:4px 0;color:#6B7280;font-size:13px;">Sections Completed</td>
        <td style="padding:4px 0;color:#1A1A2E;font-size:13px;">${d.sectionsWithData} of 10</td>
      </tr>
      <tr>
        <td style="padding:4px 0;color:#6B7280;font-size:13px;">Documents Uploaded</td>
        <td style="padding:4px 0;color:#1A1A2E;font-size:13px;">${d.documentCount} file${d.documentCount !== 1 ? "s" : ""}</td>
      </tr>
    </table>
  `;
}

function buildApplicantEmail(summaryHtml: string, applicantName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#F9FAFB;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="margin:0;color:#E8871E;font-size:24px;font-weight:800;">BXE</h1>
          <p style="margin:2px 0 0;color:#6B7280;font-size:11px;letter-spacing:2px;">INTAKE PORTAL</p>
        </div>

        <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <h2 style="margin:0 0 8px;color:#1A1A2E;font-size:18px;">Thank you, ${applicantName || "Applicant"}!</h2>
          <p style="margin:0 0 20px;color:#6B7280;font-size:14px;line-height:1.6;">
            Your application to the BXE ecosystem has been successfully submitted.
            Our team will review your submission and you will be notified of any updates or requests via email.
          </p>

          <div style="background:#FFF7ED;border-left:3px solid #E8871E;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <p style="margin:0;color:#92400E;font-size:13px;font-weight:500;">
              Typical review time: 5-7 business days
            </p>
          </div>

          ${summaryHtml}

          <div style="text-align:center;margin-top:28px;">
            <p style="margin:0 0 8px;color:#6B7280;font-size:12px;">
              You can track your application status from your dashboard.
            </p>
          </div>
        </div>

        <div style="text-align:center;margin-top:24px;">
          <p style="color:#9CA3AF;font-size:11px;">
            BoldX Enterprises &bull; BXE Ecosystem
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function buildAdminEmail(summaryHtml: string, applicationId: string, applicantEmail: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#F9FAFB;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="margin:0;color:#E8871E;font-size:24px;font-weight:800;">BXE</h1>
          <p style="margin:2px 0 0;color:#6B7280;font-size:11px;letter-spacing:2px;">ADMIN NOTIFICATION</p>
        </div>

        <div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <div style="background:#DBEAFE;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
            <h3 style="margin:0;color:#1E40AF;font-size:14px;">New Application Submitted</h3>
            <p style="margin:4px 0 0;color:#3B82F6;font-size:12px;">Applicant: ${applicantEmail}</p>
          </div>

          ${summaryHtml}

          <div style="text-align:center;margin-top:28px;">
            <p style="margin:0;color:#6B7280;font-size:12px;">
              Application ID: <code style="background:#F3F4F6;padding:2px 6px;border-radius:4px;font-size:11px;">${applicationId}</code>
            </p>
            <p style="margin:8px 0 0;color:#6B7280;font-size:12px;">
              Log in to the Admin Dashboard to review this application.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ── Send email via Resend API ──
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured — skipping email to", to);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Resend API error for ${to}:`, err);
      return false;
    }

    console.log(`Email sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`Failed to send email to ${to}:`, err);
    return false;
  }
}

// ── Main handler ──
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { applicationId, applicantEmail, applicantName, companyName } = await req.json();

    if (!applicationId) {
      return new Response(
        JSON.stringify({ error: "applicationId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service-role client to bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch application
    const { data: app } = await supabase
      .from("intake_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    // Fetch all sections
    const { data: sections } = await supabase
      .from("intake_sections")
      .select("*")
      .eq("application_id", applicationId)
      .order("section_number");

    // Count documents
    const { count: docCount } = await supabase
      .from("intake_documents")
      .select("*", { count: "exact", head: true })
      .eq("application_id", applicationId);

    // Extract section data
    const companyData = sections?.find((s: any) => s.section_key === "company")?.data || {};
    const transactionData = sections?.find((s: any) => s.section_key === "transaction")?.data || {};
    const capTableData = sections?.find((s: any) => s.section_key === "cap_table")?.data || {};

    // Count sections with actual data
    const sectionsWithData = sections?.filter(
      (s: any) => s.data && Object.keys(s.data).length > 0
    ).length || 0;

    // Build summary
    const summary: SummaryData = {
      companyName: companyData.legal_name || companyName || "N/A",
      industry: companyData.industry || "N/A",
      stage: companyData.stage || "N/A",
      businessModel: companyData.business_model || "N/A",
      founderName: companyData.founder_name || applicantName || "N/A",
      founderEmail: companyData.founder_email || applicantEmail || "N/A",
      transactionPath: fmtPath(transactionData.path),
      investmentAmount: fmtCurrency(transactionData.investment_amount),
      securityType: transactionData.security_type || "N/A",
      preMoneyValuation: fmtCurrency(
        capTableData.pre_money_valuation || transactionData.pre_money_valuation
      ),
      founderIntent: transactionData.founder_intent || "N/A",
      documentCount: docCount || 0,
      sectionsWithData,
      submittedAt: fmtDate(app?.submitted_at),
      applicationId,
    };

    const summaryHtml = buildSummaryHtml(summary);

    // Send emails
    const results = {
      applicant: false,
      admins: [] as boolean[],
    };

    // 1. Send to applicant
    if (applicantEmail) {
      results.applicant = await sendEmail(
        applicantEmail,
        `BXE Intake Application Received - ${summary.companyName}`,
        buildApplicantEmail(summaryHtml, applicantName || summary.founderName)
      );
    }

    // 2. Send to all admins
    for (const adminEmail of ADMIN_EMAILS) {
      const sent = await sendEmail(
        adminEmail,
        `New BXE Application: ${summary.companyName}`,
        buildAdminEmail(summaryHtml, applicationId, applicantEmail || "unknown")
      );
      results.admins.push(sent);
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Edge Function error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
