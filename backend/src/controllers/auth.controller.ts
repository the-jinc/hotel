import { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { users } from "../schema";
import * as bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { eq } from "drizzle-orm";

export const register = async (
  c: Context<{ Bindings: CloudflareBindings }>
) => {
  const db = drizzle(c.env.DB);
  const { name, email, password } = await c.req.json();

  if (!name || !email || !password) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // check existing user
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();
    if (existing) {
      return c.json({ error: "User already exists" }, 409);
    }

    const newUser = await db
      .insert(users)
      .values({ name, email, password: hashedPassword })
      .returning()
      .get();

    if (!newUser) {
      return c.json({ error: "Could not create user" }, 500);
    }

    const payload = {
      sub: (newUser as any).id,
      role: (newUser as any).role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    const safeUser = {
      id: (newUser as any).id,
      name: (newUser as any).name,
      email: (newUser as any).email,
      role: (newUser as any).role,
    };

    return c.json({ token, user: safeUser });
  } catch (err: any) {
    console.error("register error", err);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const login = async (c: Context<{ Bindings: CloudflareBindings }>) => {
  const db = drizzle(c.env.DB);
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      (user as any).password
    );

    if (!isPasswordValid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const payload = {
      sub: (user as any).id,
      role: (user as any).role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    };

    const token = await sign(payload, c.env.JWT_SECRET);

    const safeUser = {
      id: (user as any).id,
      name: (user as any).name,
      email: (user as any).email,
      role: (user as any).role,
    };

    return c.json({ token, user: safeUser });
  } catch (err: any) {
    console.error("login error", err);
    return c.json({ error: "Internal server error" }, 500);
  }
};
