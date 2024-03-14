import { Info } from "lucide-react";
import { Button } from "../ui/button";
import { GithubButton } from "./github-button";
import { ModeToggle } from "./mode-toggle";
import { InfoButton } from "./info-button";

export default async function Menu() {
  return (
    <div className="fixed flex items-center p-2 z-10 top-0 right-0 gap-2">
      <InfoButton />
      <GithubButton />
      <ModeToggle />
    </div>
  );
}
