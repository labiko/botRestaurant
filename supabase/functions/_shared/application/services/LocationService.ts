/**
 * Service de Géolocalisation
 * Principe SOLID: Single Responsibility
 */

export interface ICoordinates {
  latitude: number;
  longitude: number;
}

export class LocationService {
  /**
   * Calcule la distance entre deux points en utilisant la formule Haversine
   * @returns Distance en kilomètres
   */
  static calculateDistance(point1: ICoordinates, point2: ICoordinates): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.latitude)) * Math.cos(this.toRad(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
  }

  /**
   * Arrondit la distance au kilomètre supérieur pour le calcul des frais
   */
  static roundUpDistance(distance: number): number {
    return Math.ceil(distance);
  }

  /**
   * Convertit les degrés en radians
   */
  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Trie une liste de lieux par distance croissante
   */
  static sortByDistance<T extends { latitude: number; longitude: number }>(
    userLocation: ICoordinates,
    places: T[]
  ): Array<T & { distance: number }> {
    return places
      .map(place => ({
        ...place,
        distance: this.calculateDistance(userLocation, place)
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Filtre les lieux dans un rayon donné
   */
  static filterByRadius<T extends { latitude: number; longitude: number }>(
    center: ICoordinates,
    places: T[],
    radiusKm: number
  ): Array<T & { distance: number }> {
    return places
      .map(place => ({
        ...place,
        distance: this.calculateDistance(center, place)
      }))
      .filter(place => place.distance <= radiusKm);
  }

  /**
   * Formate une adresse à partir de coordonnées (simulation)
   * Dans un cas réel, utiliserait un service de géocodage inverse
   */
  static formatAddress(coordinates: ICoordinates): string {
    // Simulation basique pour Conakry
    const zones = [
      { name: 'Kipé', lat: 9.554, lng: -13.661 },
      { name: 'Cosa', lat: 9.563, lng: -13.646 },
      { name: 'Taouyah', lat: 9.536, lng: -13.677 },
      { name: 'Minière', lat: 9.541, lng: -13.654 },
      { name: 'Ratoma Centre', lat: 9.570, lng: -13.640 }
    ];

    // Trouve la zone la plus proche
    const nearestZone = zones
      .map(zone => ({
        ...zone,
        distance: this.calculateDistance(coordinates, { latitude: zone.lat, longitude: zone.lng })
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    return `${nearestZone.name}, Ratoma, Conakry`;
  }

  /**
   * Valide des coordonnées
   */
  static isValidCoordinates(coordinates: ICoordinates): boolean {
    return (
      typeof coordinates.latitude === 'number' &&
      typeof coordinates.longitude === 'number' &&
      Math.abs(coordinates.latitude) <= 90 &&
      Math.abs(coordinates.longitude) <= 180
    );
  }

  /**
   * Vérifie si les coordonnées sont dans la zone de Conakry
   */
  static isInConakry(coordinates: ICoordinates): boolean {
    // Limites approximatives de Conakry
    const bounds = {
      north: 9.650,
      south: 9.450,
      east: -13.550,
      west: -13.750
    };

    return (
      coordinates.latitude >= bounds.south &&
      coordinates.latitude <= bounds.north &&
      coordinates.longitude >= bounds.west &&
      coordinates.longitude <= bounds.east
    );
  }
}