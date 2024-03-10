"use server";

import crypto from "crypto";
import prisma from "@/lib/prisma";
import sgMail from "@sendgrid/mail";
import {
  UserNotFoundError,
  login,
  register,
  logout as logoutUser,
  validateSessionCookie,
} from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function passwordlessLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const code = crypto.randomBytes(6).toString("hex");
  const newtoken = await prisma.token.create({
    data: {
      email: email,
      token: code,
      // 5 minutes
      expires: new Date(Date.now() + 5 * 60 * 1000),
    },
  });
  console.log(newtoken);
  sendEmail(email, newtoken.token);
}

export async function sendEmail(email: string, token: string) {
  // Send email
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
  const url = `http://localhost:3000/login?token=${token}`;
  const response = await sgMail.send({
    from: "mattoskamp@gmail.com",
    to: email,
    templateId: "d-7ffddd8b549044c2a7aae7411b853038",
    dynamicTemplateData: {
      loginUrl: url,
    },
  });
  console.log(response);
}

export async function emailPasswordLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  console.log("emailPasswordLogin", email, password);
  try {
    await login(email, password);
    revalidatePath("/");
  } catch (e) {
    console.log("error", e);
    if (e instanceof UserNotFoundError) {
      redirect("/register");
    }
    return "Invalid username or password";
  }
}

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirmation = formData.get("passwordConfirmation") as string;

  if (password !== passwordConfirmation) {
    return "Passwords do not match";
  }

  try {
    await register(email, password);
    revalidatePath("/");
    // redirect("/");
  } catch (e) {
    console.log("error", e);
    return "Error registering user";
  }
}

export async function logout() {
  logoutUser();
  revalidatePath("/");
  redirect("/");
}

export async function validate() {
  try {
    const userId = await validateSessionCookie();
    return {
      loggedIn: true,
      userId,
    };
  } catch {
    return {
      loggedIn: false,
    };
  }
}

export async function getUser(userId: string) {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
      id: true,
      name: true,
    },
  });
}
