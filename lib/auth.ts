import { cookies } from "next/headers";
import prisma from "./prisma";
import bcrypt from "bcrypt";

export class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
  }
}

export class InvalidPasswordError extends Error {
  constructor() {
    super("Invalid password");
  }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
    select: {
      hashedPassword: true,
      id: true,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  const match = await bcrypt.compare(password, user.hashedPassword);

  if (!match) {
    throw new InvalidPasswordError();
  }

  return saveSessionCookie(user.id);
}

export async function register(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: email,
      hashedPassword: hashedPassword,
    },
  });

  saveSessionCookie(user.id);
  return user.id;
}

export async function saveSessionCookie(userId: string) {
  const session = await prisma.session.create({
    data: {
      userId: userId,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  cookies().set("session", session.id, {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  console.log("session", session.id);
}

async function removeSessionCookie() {
  cookies().delete("session");
}

export async function logout() {
  const sessionId = cookies().get("session");

  if (!sessionId) {
    return;
  }

  await prisma.session.delete({
    where: {
      id: sessionId.value,
    },
  });

  removeSessionCookie();
}

export async function validateSessionCookie() {
  const sessionId = cookies().get("session");

  if (!sessionId) {
    throw new Error("No session cookie");
  }

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId.value,
      expires: {
        gt: new Date(),
      },
    },
    select: {
      userId: true,
    },
  });

  if (!session) {
    throw new Error("Invalid session");
  }

  return session.userId;
}
