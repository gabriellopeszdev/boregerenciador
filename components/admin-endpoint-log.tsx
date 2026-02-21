"use client";
import { useEffect, useState } from "react";
import { RefreshCw, Database, BarChart3, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

function LogPanel({ endpoint, title, icon }: { endpoint: string; title: string; icon?: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(endpoint);
      const json = res.data;
      setData(json);
      setLastFetch(new Date());
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [endpoint]);

  const Icon = icon === "replay" ? Database : BarChart3;

  const itemCount = data?.data?.length ?? data?.pagination?.total ?? "—";

  return (
    <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden min-w-0 w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-2 text-xs border-b border-border/50">
        <div className="flex items-center gap-1.5">
          {error ? (
            <XCircle className="w-3 h-3 text-red-400" />
          ) : (
            <CheckCircle2 className="w-3 h-3 text-green-400" />
          )}
          <span className={error ? "text-red-400" : "text-green-400"}>
            {error ? "Erro" : "Online"}
          </span>
        </div>
        <div className="text-muted-foreground">
          Registros: <span className="font-medium text-foreground">{itemCount}</span>
        </div>
        <div className="text-muted-foreground ml-auto">
          {lastFetch ? lastFetch.toLocaleTimeString() : "—"}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0">
        {loading && !data ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="px-4 py-4 text-sm text-red-400">{error}</div>
        ) : (
          <pre className="overflow-auto max-h-80 px-4 py-3 text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default LogPanel;
