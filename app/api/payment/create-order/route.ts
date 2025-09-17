import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payment-service";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getUserCollection } from "@/dbCollections";

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json();

    // Validate plan
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid subscription plan" 
      }, { status: 400 });
    }

    // Check if it's a paid plan
    if (plan.price === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "This plan is free and doesn't require payment" 
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

    // Create payment order
    const receipt = `sub_${user._id}_${Date.now()}`;
    const order = await PaymentService.createOrder(plan.price, plan.currency, receipt);

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to create payment order" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      order,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency
      }
    });

  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
