import { Shield, Users, Ban, VolumeX, Server } from "lucide-react";
import Link from "next/link";

interface ModuleCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}

function ModuleCard({ href, icon, title, description, disabled }: ModuleCardProps) {
  return (
    <Link href={disabled ? "#" : href} aria-disabled={disabled} tabIndex={disabled ? -1 : 0}>
      <div className={`bg-card rounded-xl border border-border shadow p-4 flex flex-col gap-1 min-w-[220px] max-w-xs h-44 transition hover:shadow-lg ${disabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}>
        <div className="w-9 h-9 flex items-center justify-center rounded-lg mb-2" style={{ background: "#111" }}>
          {icon}
        </div>
        <div className="font-bold text-base text-foreground">{title}</div>
        <div className="text-muted-foreground text-sm flex-1">{description}</div>
        <div className="flex justify-end mt-2">
          <span className="text-primary text-xl">&rarr;</span>
        </div>
      </div>
    </Link>
  );
}

export default ModuleCard;
