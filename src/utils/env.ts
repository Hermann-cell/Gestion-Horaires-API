import dotenv from "dotenv";

dotenv.config();

export const env = {
  mail: {
    host: process.env.MAIL_HOST as string,
    port: Number(process.env.MAIL_PORT),
    user: process.env.MAIL_USER as string,
    pass: process.env.MAIL_PASS as string,
    from: process.env.MAIL_FROM as string
  }
};