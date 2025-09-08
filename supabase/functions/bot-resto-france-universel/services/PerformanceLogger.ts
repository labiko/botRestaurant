// 🚀 SERVICE DE LOGGING DES PERFORMANCES
// Traçage complet des latences : Supabase, Green API, et traitement

export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  type: 'supabase' | 'green_api' | 'processing' | 'total';
  details?: any;
  error?: string;
}

export class PerformanceLogger {
  private static instance: PerformanceLogger;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private sessionMetrics: PerformanceMetric[] = [];

  static getInstance(): PerformanceLogger {
    if (!PerformanceLogger.instance) {
      PerformanceLogger.instance = new PerformanceLogger();
    }
    return PerformanceLogger.instance;
  }

  /**
   * Démarrer le suivi d'une opération
   */
  startOperation(operationId: string, operation: string, type: PerformanceMetric['type'], details?: any): void {
    const metric: PerformanceMetric = {
      operation,
      startTime: Date.now(),
      type,
      details
    };
    
    this.metrics.set(operationId, metric);
    console.log(`⏱️ [PERF-START] ${type.toUpperCase()} | ${operation} | ID: ${operationId}`, details ? `| ${JSON.stringify(details)}` : '');
  }

  /**
   * Terminer le suivi d'une opération
   */
  endOperation(operationId: string, error?: string): number {
    const metric = this.metrics.get(operationId);
    if (!metric) {
      console.warn(`⚠️ [PERF] Opération non trouvée: ${operationId}`);
      return 0;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;
    metric.error = error;

    // Log avec code couleur selon la durée
    const colorCode = this.getColorCode(duration, metric.type);
    console.log(`⏱️ [PERF-END] ${colorCode} ${metric.type.toUpperCase()} | ${metric.operation} | ${duration}ms | ID: ${operationId}${error ? ` | ERROR: ${error}` : ''}`);

    // Ajouter aux métriques de session
    this.sessionMetrics.push({ ...metric });

    // Alerte si trop lent
    if (duration > this.getThreshold(metric.type)) {
      console.warn(`🐌 [PERF-SLOW] ${metric.type.toUpperCase()} LENT | ${metric.operation} | ${duration}ms (seuil: ${this.getThreshold(metric.type)}ms)`);
    }

    this.metrics.delete(operationId);
    return duration;
  }

  /**
   * Logger une opération complète (start + end)
   */
  async measureAsync<T>(
    operationId: string,
    operation: string,
    type: PerformanceMetric['type'],
    asyncFn: () => Promise<T>,
    details?: any
  ): Promise<T> {
    this.startOperation(operationId, operation, type, details);
    
    try {
      const result = await asyncFn();
      this.endOperation(operationId);
      return result;
    } catch (error) {
      this.endOperation(operationId, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Obtenir un résumé des performances de la session
   */
  getSessionSummary(): {
    total: number;
    supabase: { count: number; totalTime: number; avgTime: number };
    greenApi: { count: number; totalTime: number; avgTime: number };
    processing: { count: number; totalTime: number; avgTime: number };
    slowOperations: PerformanceMetric[];
  } {
    const supabaseOps = this.sessionMetrics.filter(m => m.type === 'supabase');
    const greenApiOps = this.sessionMetrics.filter(m => m.type === 'green_api');
    const processingOps = this.sessionMetrics.filter(m => m.type === 'processing');
    const slowOps = this.sessionMetrics.filter(m => m.duration && m.duration > this.getThreshold(m.type));

    return {
      total: this.sessionMetrics.length,
      supabase: {
        count: supabaseOps.length,
        totalTime: supabaseOps.reduce((sum, op) => sum + (op.duration || 0), 0),
        avgTime: supabaseOps.length ? Math.round(supabaseOps.reduce((sum, op) => sum + (op.duration || 0), 0) / supabaseOps.length) : 0
      },
      greenApi: {
        count: greenApiOps.length,
        totalTime: greenApiOps.reduce((sum, op) => sum + (op.duration || 0), 0),
        avgTime: greenApiOps.length ? Math.round(greenApiOps.reduce((sum, op) => sum + (op.duration || 0), 0) / greenApiOps.length) : 0
      },
      processing: {
        count: processingOps.length,
        totalTime: processingOps.reduce((sum, op) => sum + (op.duration || 0), 0),
        avgTime: processingOps.length ? Math.round(processingOps.reduce((sum, op) => sum + (op.duration || 0), 0) / processingOps.length) : 0
      },
      slowOperations: slowOps
    };
  }

  /**
   * Logger le résumé des performances
   */
  logSessionSummary(context: string): void {
    const summary = this.getSessionSummary();
    
    console.log(`\n📊 [PERF-SUMMARY] ${context}`);
    console.log(`📈 Total opérations: ${summary.total}`);
    console.log(`🗄️  Supabase: ${summary.supabase.count} ops | ${summary.supabase.totalTime}ms total | ${summary.supabase.avgTime}ms moyenne`);
    console.log(`📱 Green API: ${summary.greenApi.count} ops | ${summary.greenApi.totalTime}ms total | ${summary.greenApi.avgTime}ms moyenne`);
    console.log(`⚙️  Processing: ${summary.processing.count} ops | ${summary.processing.totalTime}ms total | ${summary.processing.avgTime}ms moyenne`);
    
    if (summary.slowOperations.length > 0) {
      console.log(`🐌 Opérations lentes (${summary.slowOperations.length}):`);
      summary.slowOperations.forEach(op => {
        console.log(`   - ${op.type}: ${op.operation} (${op.duration}ms)`);
      });
    }
    
    console.log(`\n`);
  }

  /**
   * Réinitialiser les métriques de session
   */
  clearSession(): void {
    this.sessionMetrics = [];
    this.metrics.clear();
    console.log(`🔄 [PERF] Session métriques réinitialisées`);
  }

  /**
   * Obtenir le code couleur selon la durée
   */
  private getColorCode(duration: number, type: PerformanceMetric['type']): string {
    const threshold = this.getThreshold(type);
    if (duration > threshold * 2) return '🔴'; // Très lent
    if (duration > threshold) return '🟡';     // Lent
    return '🟢';                               // Rapide
  }

  /**
   * Obtenir le seuil d'alerte selon le type
   */
  private getThreshold(type: PerformanceMetric['type']): number {
    switch (type) {
      case 'supabase': return 500;  // 500ms pour les requêtes DB
      case 'green_api': return 1000; // 1s pour les appels API externes
      case 'processing': return 100; // 100ms pour le traitement
      case 'total': return 2000;     // 2s pour le traitement total
      default: return 500;
    }
  }

  /**
   * Générer un ID unique pour les opérations
   */
  static generateOperationId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}