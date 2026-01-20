import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

// GET /api/public/stats
export async function GET() {
  try {
    console.log('[API] /api/public/stats - requisitado');
    const stats = await executeQuery(`
      SELECT s.*, p.name as playerName, r.name as roomName
      FROM stats s
      JOIN players p ON s.player_id = p.id
      JOIN rooms r ON s.room_id = r.id
      ORDER BY s.points DESC, s.elo DESC
      LIMIT 100
    `);
    console.log(`[API] /api/public/stats - retornou ${stats.length} registros`);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API] /api/public/stats - erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar stats', details: String(error) }, { status: 500 });
  }
}
