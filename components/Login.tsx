"use client";

import { emailPasswordLogin } from "@/app/actions";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function LoginForm() {
  const [message, setMessage] = useState<string>("");

  async function handleLogin(formData: FormData) {
    const errorMessage = await emailPasswordLogin(formData);
    console.log(errorMessage);
    if (!errorMessage) return;
    setMessage(errorMessage);
  }

  return (
    <Card className="max-w-[400px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email and password to login
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="login-form"
          className="flex flex-col gap-2"
          action={handleLogin}
        >
          <Input type="email" name="email" placeholder="Email" required />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
        </form>
        <p className="font-bold text-red-800 dark:text-red-300">{message}</p>
      </CardContent>
      <CardFooter>
        <Button form="login-form" type="submit">
          Login
        </Button>
      </CardFooter>
    </Card>
  );
}
