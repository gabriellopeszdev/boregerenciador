import LogPanel from "@/components/admin-endpoint-log";
import { Shield, Radio } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-7 h-7 text-purple-500" />
          <h1 className="text-2xl font-extrabold text-foreground">Admin Endpoints</h1>
        </div>
        <p className="text-sm text-muted-foreground text-center max-w-2xl">Monitore os endpoints públicos da API em tempo real.</p>
      </div>

      <div className="w-full max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LogPanel endpoint="/api/public/recs" title="Replays" icon="replay" />
        <LogPanel endpoint="/api/public/stats" title="Stats dos Players" icon="stats" />
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground text-xs">
        <Radio className="w-3 h-3 animate-pulse text-green-500" />
        Atualização automática a cada 30s
      </div>
    </div>
  );
}
