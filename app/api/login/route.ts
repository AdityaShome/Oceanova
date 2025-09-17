import { NextRequest, NextResponse } from "next/server"
import { getUserCollection } from "@/dbCollections"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Missing email or password" }, { status: 400 })
    }

    // Normalize email to avoid case/whitespace mismatches
    const normalizedEmail = String(email).trim().toLowerCase()

    const users = await getUserCollection()
    const user = await users.findOne({ email: normalizedEmail })

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // If the account was created via Google Sign-In, there may be no password
    if (!user.password) {
      return NextResponse.json({ message: "This account uses Google Sign-In. Please sign in with Google or reset your password." }, { status: 400 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Create token with consistent field name
    const token = jwt.sign(
      { 
        id: user._id.toString(), // Changed from "userId" to "id"
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    )

    // Create response and set cookie
    const response = NextResponse.json({ 
      message: "Login successful",
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName || user.username, // Handle both old and new schema
        lastName: user.lastName || "",
        dob: user.dob,
        avatar: user.avatar
      }
    }, { status: 200 })

    // Set the token as an HTTP-only cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour in seconds
      path: "/"
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}