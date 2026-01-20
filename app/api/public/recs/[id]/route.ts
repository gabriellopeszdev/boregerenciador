import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/public/recs/[id]
export async function GET(req, { params }) {
  const { id } = params;
  try {
    console.log(`[API] /api/public/recs/${id} - requisitado`);
    const recs = await executeQuery(`SELECT fileName, recData FROM recs WHERE id = ? LIMIT 1`, [id]);
    if (!recs.length) {
      return NextResponse.json({ error: 'Replay não encontrado' }, { status: 404 });
    }
    const { fileName, recData } = recs[0];
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
