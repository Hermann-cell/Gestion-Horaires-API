import jwt from "jsonwebtoken";

const ACTIVATION_SECRET = process.env.ACTIVATION_SECRET || "activation_secret";

export function generateActivationToken(userId: number) {
  return jwt.sign(
    { userId, type: "activation" },
    ACTIVATION_SECRET,
    { expiresIn: "24h" }
  );
}