import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { userRepository, UserRepository } from "../repositories/user.repository";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { AppError } from "../errors/AppError";
import { config } from "../config";
import { AuthUser } from "../types/express";

export interface UserResponse {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface AuthResult {
  user: UserResponse;
  token: string;
}

export class AuthService {
  constructor(private userRepo: UserRepository = userRepository) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await this.userRepo.create({
      email: input.email,
      password: hashedPassword,
      role: input.role,
    });

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new AppError(401, "Invalid credentials");
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  private generateToken(payload: AuthUser): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }
}

export const authService = new AuthService();
