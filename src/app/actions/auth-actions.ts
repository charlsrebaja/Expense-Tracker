"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { loginSchema, registerSchema } from "@/lib/validations";
import { ActionState } from "@/types";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

// Create JWT token
async function createToken(userId: string): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string };
  } catch {
    return null;
  }
}

// Get current user from session
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true },
    });
    return user;
  } catch {
    return null;
  }
}

// LOGIN
export async function login(formData: FormData): Promise<ActionState> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validated = loginSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await db.user.findUnique({
      where: { email: validated.data.email },
    });

    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    const passwordMatch = await bcrypt.compare(
      validated.data.password,
      user.password,
    );

    if (!passwordMatch) {
      return { success: false, message: "Invalid email or password" };
    }

    // Create token and set cookie
    const token = await createToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (error) {
    console.error("Login failed:", error);
    return { success: false, message: "Failed to login" };
  }

  redirect("/");
}

// REGISTER
export async function register(formData: FormData): Promise<ActionState> {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = registerSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validated.data.email },
    });

    if (existingUser) {
      return { success: false, message: "Email already registered" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.data.password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        name: validated.data.name,
        email: validated.data.email,
        password: hashedPassword,
      },
    });

    // Create token and set cookie
    const token = await createToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return { success: false, message: "Failed to create account" };
  }

  redirect("/");
}

// LOGOUT
export async function logout(): Promise<ActionState> {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
  redirect("/login");
}
