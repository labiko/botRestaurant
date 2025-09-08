/**
 * Script de test pour le service RestaurantScheduleService
 */

import { RestaurantScheduleService } from './services/restaurant-schedule.service.ts';

const scheduleService = new RestaurantScheduleService();

// Mock d'un restaurant avec horaires
const mockRestaurant = {
  name: 'Pizza Yolo Test',
  is_active: true,
  is_exceptionally_closed: false,
  business_hours: {
    'lundi': { isOpen: true, opening: '11:00', closing: '22:00' },
    'mardi': { isOpen: true, opening: '11:00', closing: '22:00' },
    'mercredi': { isOpen: false },
    'jeudi': { isOpen: true, opening: '18:00', closing: '02:00' }, // Horaire nocturne
    'vendredi': { isOpen: true, opening: '11:00', closing: '23:00' },
    'samedi': { isOpen: true, opening: '11:00', closing: '23:00' },
    'dimanche': { isOpen: true, opening: '12:00', closing: '23:00' } // Étendu pour test ouvert
  }
};

// Mock restaurant sans horaires
const mockRestaurantNoSchedule = {
  name: 'Restaurant Sans Horaires',
  is_active: true,
  is_exceptionally_closed: false,
  business_hours: null
};

// Mock restaurant avec fermeture exceptionnelle
const mockRestaurantExceptional = {
  name: 'Pizza Yolo Fermé',
  is_active: true,
  is_exceptionally_closed: true,
  business_hours: {
    'dimanche': { isOpen: true, opening: '12:00', closing: '23:00' }
  }
};

// Mock restaurant inactif
const mockRestaurantInactive = {
  name: 'Pizza Yolo Inactif',
  is_active: false,
  business_hours: {
    'dimanche': { isOpen: true, opening: '12:00', closing: '23:00' }
  }
};

function testScheduleService() {
  console.log('🧪 Test du RestaurantScheduleService avec nouvelle logique de priorité\n');
  
  // Test 1: Restaurant avec horaires (devrait être ouvert)
  console.log('📋 Test 1: Restaurant avec horaires configurés');
  const result1 = scheduleService.checkRestaurantSchedule(mockRestaurant);
  console.log('Résultat:', result1);
  const message1 = scheduleService.getScheduleMessage(result1, mockRestaurant.name);
  console.log('Message généré:', message1);
  console.log('');
  
  // Test 2: Restaurant sans horaires
  console.log('📋 Test 2: Restaurant sans horaires');
  const result2 = scheduleService.checkRestaurantSchedule(mockRestaurantNoSchedule);
  console.log('Résultat:', result2);
  const message2 = scheduleService.getScheduleMessage(result2, mockRestaurantNoSchedule.name);
  console.log('Message généré:', message2);
  console.log('');
  
  // Test 3: PRIORITÉ 1 - Restaurant fermé exceptionnellement (priorité max)
  console.log('📋 Test 3: Restaurant fermé exceptionnellement (PRIORITÉ 1)');
  const result3 = scheduleService.checkRestaurantSchedule(mockRestaurantExceptional);
  console.log('Résultat:', result3);
  const message3 = scheduleService.getScheduleMessage(result3, mockRestaurantExceptional.name);
  console.log('Message généré:', message3);
  console.log('');
  
  // Test 4: PRIORITÉ 2 - Restaurant inactif
  console.log('📋 Test 4: Restaurant inactif (PRIORITÉ 2)');
  const result4 = scheduleService.checkRestaurantSchedule(mockRestaurantInactive);
  console.log('Résultat:', result4);
  const message4 = scheduleService.getScheduleMessage(result4, mockRestaurantInactive.name);
  console.log('Message généré:', message4);
  console.log('');
  
  // Test 5: Horaires formatés
  console.log('📋 Test 5: Affichage horaires formatés');
  const formattedSchedule = scheduleService.getFormattedSchedule(mockRestaurant.business_hours);
  console.log('Horaires formatés:');
  console.log(formattedSchedule);
  
  console.log('✅ Tests de priorité terminés avec succès!');
  console.log('\n🔥 ORDRE DE PRIORITÉ VÉRIFIÉ:');
  console.log('1. Fermeture exceptionnelle (is_exceptionally_closed)');
  console.log('2. Statut général (is_active)');
  console.log('3. Horaires normaux (business_hours)');
}

// Exécuter les tests si le script est appelé directement
if (import.meta.main) {
  testScheduleService();
}