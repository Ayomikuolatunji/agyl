import bcrypt from "bcrypt";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { InternalServerError } from "errors/InternalServerError";
import { BadRequestError } from "errors";
import { NextFunction, Request, Response } from "express";

export class UtilityFunctions {
  public hashPassword = async (password: string) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    if (!hashedPassword) {
      throw new InternalServerError("Error creating password");
    }
    return hashedPassword;
  };
  public async validatePassword(password: string, comparePassword: string): Promise<boolean> {
    const isPasswordValid = await bcrypt.compare(password, comparePassword);
    if (!isPasswordValid) {
      throw new BadRequestError("Invalid password");
    }
    return isPasswordValid;
  }
  public createToken(userId: string, secretKey: string): string {
    const token = jwt.sign({ userId }, secretKey, { expiresIn: "30d" });
    return token;
  }
  public diff_minutes(dt2: Date, dt1: Date) {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
  }
  public generateToken = async (): Promise<string> => {
    const token = crypto.randomBytes(100).toString("hex");
    return token;
  };
  public enableRateLimit = (max: number, windowMs: number = 60 * 60 * 1000, message: string) => {
    const apiLimiter = rateLimit({
      windowMs: windowMs,
      max: max,
      standardHeaders: true,
      legacyHeaders: false,
      message: message,
    });
    return apiLimiter;
  };
  public generateRandomPassword(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const passwordArray = [];
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      passwordArray.push(characters.charAt(randomIndex));
    }
    return passwordArray.join("");
  }
}
