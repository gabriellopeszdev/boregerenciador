export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Painel Administrativo</h1>
      {children}
    </div>
  )
}
