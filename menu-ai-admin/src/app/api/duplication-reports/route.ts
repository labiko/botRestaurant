// 📋 API RAPPORTS DE DUPLICATION
// ================================

import { NextRequest, NextResponse } from 'next/server';
import { DuplicationLogger } from '@/lib/duplication-logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('📋 Récupération historique duplications...');

    const history = await DuplicationLogger.getHistory(limit);

    console.log(`✅ ${history.length} duplications récupérées`);

    return NextResponse.json({
      success: true,
      duplications: history
    });

  } catch (error) {
    console.error('❌ Erreur récupération historique:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement de l\'historique',
      duplications: []
    }, { status: 500 });
  }
}

// API pour récupérer un rapport spécifique
export async function POST(request: NextRequest) {
  try {
    const { logId } = await request.json();

    if (!logId) {
      return NextResponse.json({
        success: false,
        error: 'ID de log requis'
      }, { status: 400 });
    }

    console.log(`📋 Récupération rapport duplication ${logId}...`);

    // Créer une instance temporaire pour récupérer le rapport
    const logger = new DuplicationLogger();
    // Hack pour récupérer un rapport existant
    (logger as any).logId = logId;

    const report = await logger.generateReport();

    if (!report) {
      return NextResponse.json({
        success: false,
        error: 'Rapport non trouvé'
      }, { status: 404 });
    }

    console.log(`✅ Rapport récupéré pour ${report.targetRestaurant}`);

    return NextResponse.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('❌ Erreur récupération rapport:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du chargement du rapport'
    }, { status: 500 });
  }
}