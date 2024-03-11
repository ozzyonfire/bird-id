import { ModeToggle } from "./mode-toggle";

export default async function Menu(props: { children?: React.ReactNode }) {
  return (
    <div className="fixed flex items-center p-2 z-10 top-0 right-0">
      <ModeToggle />
    </div>
  );
}
