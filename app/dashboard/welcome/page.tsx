import Image from "next/image";

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Image src="/logobore.png" alt="Logo Bore" width={220} height={220} className="mb-6 object-contain" unoptimized />
      <h1 className="text-4xl font-bold mb-2">Bem-vindo ao Bore Gerenciador</h1>
      <p className="text-lg text-muted-foreground mb-6">Gerencie sua sala, jogadores e estatísticas de forma simples e segura.</p>
    </div>
  );
}
