import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

interface HeaderProps {
  label: string;
  className?: string;
}

export const Header = ({ label, className }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-y-4">
      <h1 className={cn("text-3xl font-semibold", poppins.className)}>Auth</h1>
      <p className={cn("text-muted-foreground text-sm", className)}>{label}</p>
    </div>
  );
};
