import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (token) {
    const passwordlessToken = await prisma.token.findFirst({
      where: {
        token: token,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (passwordlessToken) {
      const user = await prisma.user.findFirst({
        where: {
          email: passwordlessToken.email,
        },
      });

      if (!user) {
        return NextResponse.redirect("/register");
      }

      cookies().set("user", user.id.toString(), {
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  }

  return NextResponse.redirect("/");
}
