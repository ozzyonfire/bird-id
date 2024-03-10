"use client";
import { logout } from "@/app/actions";
import { Button } from "./ui/button";

export default function Logout() {
  return (
    <Button
      onClick={async () => {
        console.log("logging out");
        await logout();
        window.location.reload();
      }}
    >
      Logout
    </Button>
  );
}
