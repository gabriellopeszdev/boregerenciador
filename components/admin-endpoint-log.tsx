"use client";
import { useEffect, useState } from "react";

function LogPanel({ endpoint, title }: { endpoint: string; title: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastFetch(new Date());
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Atualiza a cada 30s
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [endpoint]);

  return (
    <div className="mb-8 bg-card rounded-xl shadow p-6 border border-border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-primary flex-1">{title}</h3>
        <button onClick={fetchData} className="ml-4 px-3 py-1 rounded bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">Atualizar</button>
      </div>
      <div className="text-xs text-muted-foreground mb-2">
        Última atualização: {lastFetch ? lastFetch.toLocaleString() : "-"}
      </div>
      {loading && <div className="text-sm text-muted-foreground">Carregando...</div>}
      {error && <div className="text-sm text-red-500">Erro: {error}</div>}
      {!loading && !error && (
        <pre className="overflow-auto max-h-96 bg-muted rounded p-3 text-xs whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default LogPanel;
