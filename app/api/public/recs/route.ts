import { NextRequest, NextResponse } from 'next/server';
import { getRecsPaginated } from '@/lib/queries';

// GET /api/public/recs?page=1&limit=50&search=&roomId=
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') || '1');
    const limit = Number.parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const roomId = url.searchParams.get('roomId') || undefined;

    console.log(`[API] /api/public/recs - página ${page}, limite ${limit}, busca: "${search}"`);
    
    const { data, total } = await getRecsPaginated(page, limit, search, roomId);
    
    console.log(`[API] /api/public/recs - retornando ${data.length} de ${total} registros`);
    
    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API] /api/public/recs - erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar recs', details: String(error) }, { status: 500 });
  }
}
