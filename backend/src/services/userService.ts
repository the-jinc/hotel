import bcrypt from "bcryptjs";
import { sign, verify } from "hono/jwt";
import { db } from "../db/index.js";
import { users, type NewUser, type User } from "../db/schema.js";
import { eq } from "drizzle-orm";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: Omit<User, "password">;
  token: string;
}

export class UserService {
  private static SALT_ROUNDS = 12;
  private static JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
  private static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async generateToken(userId: string, role: string): Promise<string> {
    const payload = {
      userId,
      role,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days from now
    };
    return await sign(payload, this.JWT_SECRET);
  }

  static async verifyToken(
    token: string
  ): Promise<{ userId: string; role: string }> {
    try {
      const payload = await verify(token, this.JWT_SECRET);
      return {
        userId: payload.userId as string,
        role: payload.role as string,
      };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  static async createUser(userData: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, userData.email),
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password);

    // Create user
    const newUser: NewUser = {
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: "guest", // Default role
    };

    const [createdUser] = await db.insert(users).values(newUser).returning();

    // Generate token
    const token = await this.generateToken(createdUser.id, createdUser.role);

    // Return user without password
    const { password: _, ...userWithoutPassword } = createdUser;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, credentials.email),
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // Check password
    const isPasswordValid = await this.comparePassword(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generate token
    const token = await this.generateToken(user.id, user.role);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async getUserById(id: string): Promise<Omit<User, "password"> | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getAllUsers(): Promise<Omit<User, "password">[]> {
    const allUsers = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    return allUsers.map((user) => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  static async updateUser(
    id: string,
    updates: Partial<NewUser>
  ): Promise<Omit<User, "password"> | null> {
    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await this.hashPassword(updates.password);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  static async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.length > 0;
  }
}
