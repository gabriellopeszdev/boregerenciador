export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-4 w-full">
      {children}
    </div>
  )
}
