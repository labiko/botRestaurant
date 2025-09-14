/**
 * 📊 UTILITAIRE DE MONITORING SQL NON-INTRUSIF
 * Mesure les temps d'exécution des requêtes sans toucher à la logique métier
 */

export class QueryPerformanceMonitor {
  /**
   * Mesurer le temps d'exécution d'une requête
   * @param keyword - Mot-clé identifiant la requête
   * @param queryPromise - Promise de la requête à mesurer
   * @returns Le résultat de la requête inchangé
   */
  static async measureQuery<T>(
    keyword: string,
    queryPromise: Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await queryPromise;
      const duration = performance.now() - startTime;
      
      console.log(`🕐 [QUERY-PERF] ${keyword}: ${duration.toFixed(2)}ms ✅`);
      
      // Alerte si > 500ms
      if (duration > 500) {
        console.warn(`🐌 [SLOW-QUERY] ${keyword}: ${duration.toFixed(2)}ms - LENT!`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ [QUERY-ERROR] ${keyword}: ${duration.toFixed(2)}ms - ERROR: ${error}`);
      throw error;
    }
  }
}