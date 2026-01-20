
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/public/recs
export async function GET() {
  try {
    console.log('[API] /api/public/recs - requisitado');
    const recs = await executeQuery(`SELECT id, roomId, fileName, matchInfo, createdAt, updatedAt FROM recs ORDER BY createdAt DESC LIMIT 100`);
    console.log(`[API] /api/public/recs - retornou ${recs.length} registros`);
    return NextResponse.json(recs);
  } catch (error) {
    console.error('[API] /api/public/recs - erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar recs', details: String(error) }, { status: 500 });
  }
}
