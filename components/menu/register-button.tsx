import Link from "next/link";
import { Button } from "../ui/button";

export default function RegisterButton() {
  return (
    <Button>
      <Link href="/register">Register</Link>
    </Button>
  );
}
