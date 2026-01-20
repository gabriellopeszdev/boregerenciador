import LogPanel from "@/components/admin-endpoint-log";

export default function AdminPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-primary">Logs Detalhados dos Endpoints Públicos</h2>
      <LogPanel endpoint="/api/public/recs" title="/api/public/recs (Replays)" />
      <LogPanel endpoint="/api/public/stats" title="/api/public/stats (Stats dos Players)" />
      <div className="mt-8 text-muted-foreground text-xs opacity-70">
        Os dados são atualizados automaticamente a cada 30 segundos.<br />Clique em "Atualizar" para forçar uma nova consulta.
      </div>
    </div>
  );
}
