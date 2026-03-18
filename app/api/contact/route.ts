import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY || "fallback_key");

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Save message to database as a Log entry
    await prisma.log.create({
      data: {
        action: "CONTACT_MESSAGE",
        details: JSON.stringify({ name, email, subject, message }),
      }
    });

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Saved to database instead.");
      return NextResponse.json({ success: true, simulated: true });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "hr.totscollege@gmail.com";

    const { data, error } = await resend.emails.send({
      from: "HandAttend AI Contact <onboarding@resend.dev>", // Use a verified domain in production
      to: [adminEmail],
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Message from HandAttend AI Contact Form</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      // Even if email fails, we saved it to the database, so return success
      return NextResponse.json({ success: true, note: "Email failed but saved to database" });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
