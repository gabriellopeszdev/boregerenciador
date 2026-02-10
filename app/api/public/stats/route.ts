import { NextRequest, NextResponse } from 'next/server';
import { getStatsPaginated } from '@/lib/queries';

// GET /api/public/stats?page=1&limit=50&search=&sortBy=points&sortOrder=desc
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') || '1');
    const limit = Number.parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'points';
    const sortOrder = (url.searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    console.log(`[API] /api/public/stats - página ${page}, limite ${limit}, busca: "${search}"`);
    
    const { data, total } = await getStatsPaginated(page, limit, search, sortBy, sortOrder);
    
    console.log(`[API] /api/public/stats - retornando ${data.length} de ${total} registros`);
    
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
    console.error('[API] /api/public/stats - erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar stats', details: String(error) }, { status: 500 });
  }
}
