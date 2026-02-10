import { NextRequest, NextResponse } from 'next/server';
import { getRecById } from '@/lib/queries';

// GET /api/public/recs/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    console.log(`[API] /api/public/recs/${id} - requisitado`);
    
    const rec = await getRecById(id);
    
    if (!rec) {
      return NextResponse.json({ error: 'Replay não encontrado' }, { status: 404 });
    }
    
    const { fileName, recData } = rec;
    
    if (!recData) {
      return NextResponse.json({ error: 'Dados do replay não disponíveis' }, { status: 404 });
    }
    
    return new Response(Buffer.from(recData), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error(`[API] /api/public/recs/${id} - erro:`, error);
    return NextResponse.json({ error: 'Erro ao buscar replay', details: String(error) }, { status: 500 });
  }
}
