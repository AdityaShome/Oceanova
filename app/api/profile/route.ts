import { NextResponse } from "next/server";
import { getUserCollection } from "@/dbCollections";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    console.log("Profile API called");

    // Extract token from cookies
    const cookieHeader = req.headers.get("cookie");
    console.log("Cookie header:", cookieHeader);
    
    if (!cookieHeader) {
      return NextResponse.json({ 
        success: false, 
        error: "No authentication cookie found",
        debug: "No cookie header present"
      }, { status: 401 });
    }

    // Better cookie parsing
    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const token = cookies['auth_token'];
    console.log("Extracted token:", token ? "Present" : "Missing");
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: "Authentication token not found",
        debug: `Available cookies: ${Object.keys(cookies).join(', ')}`
      }, { status: 401 });
    }

    // Check if JWT_SECRET is available
    const jwtSecret = process.env.JWT_SECRET || "supersecret";
    
    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
      // console.log("JWT decoded successfully, user ID:", decoded.id);
    } catch (jwtError: any) {
      console.error("JWT verification failed:", jwtError.message);
      
      return NextResponse.json({ 
        success: false, 
        error: "Invalid or expired token",
        debug: `JWT Error: ${jwtError.message}`
      }, { status: 401 });
    }

    // Validate decoded token structure
    if (!decoded || !decoded.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid token structure",
        debug: "Token does not contain user ID"
      }, { status: 401 });
    }

    // Find user in database using the same method as login
    const users = await getUserCollection();
    const user = await users.findOne({ _id: new ObjectId(decoded.id) });
    
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      return NextResponse.json({
        success: false, 
        error: "User not found",
        debug: `User ID ${decoded.id} not found in database`
      }, { status: 404 });
    }

    console.log("Profile retrieved successfully for user:", user.email);
    return NextResponse.json({ 
      success: true, 
      user: {
        firstName: user.firstName || user.username || "", // Handle both schemas
        lastName: user.lastName || "",
        email: user.email,
        dob: user.dob,
        avatar: user.avatar,
        subscription: user.subscription || {
          plan: 'basic',
          status: 'active'
        },
        tokens: user.tokens || {
          dailyLimit: 10,
          usedToday: 0,
          lastResetDate: new Date(),
          totalUsed: 0
        }
      }
    });
    
  } catch (err: any) {
    console.error("Profile API Error:", err);
    console.error("Error stack:", err.stack);
    
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error",
      debug: err.message
    }, { status: 500 });
  }
}