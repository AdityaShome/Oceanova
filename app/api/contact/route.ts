import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, institution, message } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Send email
    const emailResult = await sendContactEmail({
      firstName,
      lastName,
      email,
      institution: institution || "Not specified",
      message,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon."
    });

  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
