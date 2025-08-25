import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ScheduleService, RestaurantSchedule, RestaurantStatus } from '../../../core/services/schedule.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit, OnDestroy {
  restaurantStatus: RestaurantStatus | null = null;
  schedule: RestaurantSchedule[] = [];
  weekDays = this.scheduleService.getWeekDays();
  currentStatus: string = 'ouvert';
  tempCloseReason: string = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private scheduleService: ScheduleService,
    private modalController: ModalController
  ) { }

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user || user.type !== 'restaurant') {
      this.router.navigate(['/auth/login'], { queryParams: { userType: 'restaurant' } });
      return;
    }

    await this.loadRestaurantData(user.restaurantId || 'default-id');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async loadRestaurantData(restaurantId: string) {
    try {
      this.restaurantStatus = await this.scheduleService.getRestaurantStatus(restaurantId);
      this.schedule = await this.scheduleService.getRestaurantSchedule(restaurantId);
      
      if (this.restaurantStatus) {
        this.currentStatus = this.restaurantStatus.status;
        this.tempCloseReason = '';
      }

      this.ensureCompleteSchedule();
    } catch (error) {
      console.error('Error loading restaurant data:', error);
    }
  }

  private ensureCompleteSchedule() {
    this.weekDays.forEach(day => {
      const existingDay = this.schedule.find(s => s.day_of_week === day.value);
      if (!existingDay) {
        this.schedule.push({
          restaurant_id: this.restaurantStatus?.id || 'default-id',
          day_of_week: day.value,
          open_time: '09:00',
          close_time: '22:00',
          is_closed: false
        });
      }
    });

    this.schedule.sort((a, b) => a.day_of_week - b.day_of_week);
  }

  async updateStatus() {
    if (!this.restaurantStatus) return;

    try {
      await this.scheduleService.updateRestaurantStatus(
        this.restaurantStatus.id,
        this.currentStatus,
        this.currentStatus === 'temporairement_ferme' ? this.tempCloseReason : undefined
      );

      this.restaurantStatus.status = this.currentStatus as any;
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  async saveSchedule() {
    if (!this.restaurantStatus) return;

    try {
      await this.scheduleService.updateSchedule(this.restaurantStatus.id, this.schedule);
      // Optionally show success message
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  }

  toggleDayClosed(dayIndex: number) {
    this.schedule[dayIndex].is_closed = !this.schedule[dayIndex].is_closed;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ouvert': return 'success';
      case 'ferme': return 'danger';
      case 'temporairement_ferme': return 'warning';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ouvert': return 'Ouvert';
      case 'ferme': return 'Fermé';
      case 'temporairement_ferme': return 'Temporairement fermé';
      default: return status;
    }
  }

  getDayName(dayOfWeek: number): string {
    return this.weekDays.find(d => d.value === dayOfWeek)?.name || '';
  }

  goBack() {
    this.router.navigate(['/restaurant/dashboard']);
  }

  // Nouvelles méthodes pour l'interface moderne

  // Vérifier si c'est aujourd'hui
  isToday(dayOfWeek: number): boolean {
    const today = new Date().getDay();
    // Convertir dimanche (0) vers 7 pour correspondre à notre système
    const adjustedToday = today === 0 ? 7 : today;
    return adjustedToday === dayOfWeek;
  }

  // Formatage des heures pour l'affichage
  formatTimeDisplay(time: string | undefined): string {
    if (!time) return '--:--';
    return time.substring(0, 5); // Format HH:mm
  }

  // Calculer la durée d'ouverture
  calculateDuration(openTime: string | undefined, closeTime: string | undefined): string {
    if (!openTime || !closeTime) return '--';
    
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    
    let duration = (closeHour * 60 + closeMin) - (openHour * 60 + openMin);
    
    // Gérer le cas où la fermeture est le lendemain (ex: 23h → 2h)
    if (duration < 0) {
      duration += 24 * 60;
    }
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h${minutes < 10 ? '0' : ''}${minutes}`;
    }
  }


  // Templates rapides
  applyTemplate(template: string) {
    let templateTimes: {open: string, close: string};
    
    switch (template) {
      case 'classic':
        templateTimes = {open: '11:00', close: '22:00'};
        break;
      case 'fastfood':
        templateTimes = {open: '10:00', close: '23:00'};
        break;
      case 'evening':
        templateTimes = {open: '18:00', close: '02:00'};
        break;
      default:
        return;
    }

    // Appliquer à tous les jours ouverts
    this.schedule.forEach(day => {
      if (!day.is_closed) {
        day.open_time = templateTimes.open;
        day.close_time = templateTimes.close;
      }
    });

    console.log(`Applied ${template} template`, templateTimes);
  }
}
