import LoginForm from "@/components/login";
import { getUser, validate } from "./actions";

export default async function Home() {
  const { loggedIn, userId } = await validate();
  if (!loggedIn) {
    return (
      <main className="pt-16 h-screen flex flex-col items-center">
        <LoginForm />
      </main>
    );
  }

  if (!userId) {
    throw new Error("No user ID");
  }

  const user = await getUser(userId);

  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Starter App Template</h1>
      <p>Welcome, {user?.email}</p>
    </main>
  );
}
