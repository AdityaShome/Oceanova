import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payment-service";
import { TokenService } from "@/lib/token-service";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getUserCollection } from "@/dbCollections";

export async function POST(req: NextRequest) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planId 
    } = await req.json();

    // Verify payment signature
    const verification = PaymentService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!verification.success) {
      return NextResponse.json({ 
        success: false, 
        error: verification.error || "Payment verification failed" 
      }, { status: 400 });
    }

    // Get user from token
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication required" 
      }, { status: 401 });
    }

    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const token = cookies['auth_token'];
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication token not found" 
      }, { status: 401 });
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || "supersecret";
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtError) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid or expired token" 
      }, { status: 401 });
    }

    // Get user from database
    const users = await getUserCollection();
    const user = await users.findOne({ _id: new ObjectId(decoded.id) });
    
    if (!user) {
      return NextResponse.json({
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }

    // Upgrade user subscription
    const upgradeSuccess = await TokenService.upgradeSubscription(
      decoded.id,
      planId,
      verification.paymentId
    );

    if (!upgradeSuccess) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to upgrade subscription" 
      }, { status: 500 });
    }

    // Add payment to history
    await users.updateOne(
      { _id: new ObjectId(decoded.id) },
      {
        $push: {
          paymentHistory: {
            id: verification.paymentId!,
            amount: 399, // Pro plan price
            currency: 'INR',
            status: 'completed',
            date: new Date(),
            plan: planId
          }
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Payment verified and subscription upgraded successfully",
      paymentId: verification.paymentId,
      orderId: verification.orderId
    });

  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
