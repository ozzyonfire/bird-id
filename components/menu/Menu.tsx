import { ModeToggle } from "./mode-toggle";

export default async function Menu(props: { children?: React.ReactNode }) {
  const { children } = props;
  return (
    <div className="fixed flex items-center p-2 w-screen z-10 gap-2">
      {children}
      <div className="flex-grow" />
      <div className="flex gap-2 items-center">
        <ModeToggle />
      </div>
    </div>
  );
}
