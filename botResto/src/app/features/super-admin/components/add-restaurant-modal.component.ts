import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { SuperAdminRestaurantService } from '../services/super-admin-restaurant.service';

@Component({
  selector: 'app-add-restaurant-modal',
  templateUrl: './add-restaurant-modal.component.html',
  styleUrls: ['./add-restaurant-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class AddRestaurantModalComponent implements OnInit {
  restaurantForm!: FormGroup;
  currentStep = 1;
  totalSteps = 4;
  locationAccuracy: number | null = null;
  Math = Math; // Pour utiliser Math.round dans le template
  
  // Horaires par défaut
  defaultSchedule = {
    lundi: { ouverture: '08:00', fermeture: '22:00', ferme: false },
    mardi: { ouverture: '08:00', fermeture: '22:00', ferme: false },
    mercredi: { ouverture: '08:00', fermeture: '22:00', ferme: false },
    jeudi: { ouverture: '08:00', fermeture: '22:00', ferme: false },
    vendredi: { ouverture: '08:00', fermeture: '23:00', ferme: false },
    samedi: { ouverture: '08:00', fermeture: '23:00', ferme: false },
    dimanche: { ouverture: '09:00', fermeture: '22:00', ferme: false }
  };
  
  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private restaurantService: SuperAdminRestaurantService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.restaurantForm = this.fb.group({
      // Étape 1: Informations de base
      nom: ['', [Validators.required, Validators.minLength(3)]],
      owner_name: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,12}$/)]],
      phone_whatsapp: ['', [Validators.pattern(/^[0-9]{9,12}$/)]],
      email: ['', [Validators.email]],
      description: ['', [Validators.maxLength(500)]],
      
      // Étape 2: Adresse et localisation
      adresse: ['', [Validators.required]],
      latitude: [8.9806, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [-13.6476, [Validators.required, Validators.min(-180), Validators.max(180)]],
      
      // Étape 3: Configuration de livraison
      allow_dine_in: [true],
      allow_takeaway: [true],
      allow_delivery: [true],
      tarif_km: [5000, [Validators.min(0)]],
      seuil_gratuite: [100000, [Validators.min(0)]],
      minimum_livraison: [50000, [Validators.min(0)]],
      rayon_livraison_km: [10, [Validators.min(1), Validators.max(50)]],
      delivery_fee: [0, [Validators.min(0)]],
      min_order_amount: [0, [Validators.min(0)]],
      max_delivery_distance: [10, [Validators.min(1)]],
      preparation_time: [30, [Validators.min(5), Validators.max(120)]],
      
      // Étape 4: Paiement et horaires
      allow_pay_now: [false], // Masqué dans l'interface, défaut à false
      allow_pay_later: [true],
      currency: ['GNF'],
      horaires: [this.defaultSchedule],
      
      // Statut initial
      status: ['pending'],
      is_featured: [false],
      rating: [4.0],
      total_orders: [0],
      first_login: [true],
      is_blocked: [false]
    });
  }

  // Navigation entre les étapes
  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  validateCurrentStep(): boolean {
    const fieldsToValidate = this.getFieldsForStep(this.currentStep);
    let isValid = true;

    fieldsToValidate.forEach(field => {
      const control = this.restaurantForm.get(field);
      if (control) {
        control.markAsTouched();
        if (control.invalid) {
          isValid = false;
        }
      }
    });

    if (!isValid) {
      this.showToast('Veuillez remplir tous les champs obligatoires', 'warning');
    }

    return isValid;
  }

  getFieldsForStep(step: number): string[] {
    switch (step) {
      case 1:
        return ['nom', 'owner_name', 'telephone'];
      case 2:
        return ['adresse', 'latitude', 'longitude'];
      case 3:
        return ['minimum_livraison', 'rayon_livraison_km'];
      case 4:
        return ['horaires'];
      default:
        return [];
    }
  }

  // Gestion des horaires
  toggleDay(day: string) {
    const horaires = this.restaurantForm.get('horaires')?.value;
    horaires[day].ferme = !horaires[day].ferme;
    this.restaurantForm.patchValue({ horaires });
  }

  updateSchedule(day: string, field: 'ouverture' | 'fermeture', value: string) {
    const horaires = this.restaurantForm.get('horaires')?.value;
    horaires[day][field] = value;
    this.restaurantForm.patchValue({ horaires });
  }

  applyToAllDays(day: string) {
    const horaires = this.restaurantForm.get('horaires')?.value;
    const templateDay = horaires[day];
    
    Object.keys(horaires).forEach(d => {
      if (d !== day) {
        horaires[d] = { ...templateDay };
      }
    });
    
    this.restaurantForm.patchValue({ horaires });
    this.showToast('Horaires appliqués à tous les jours', 'success');
  }

  // Obtenir la position actuelle
  async getCurrentPosition() {
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });
        
        // Stocker l'accuracy détectée
        this.locationAccuracy = position.coords.accuracy;
        
        this.restaurantForm.patchValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        
        this.showToast(`Position récupérée avec succès (précision: ${Math.round(this.locationAccuracy)}m)`, 'success');
      }
    } catch (error) {
      this.locationAccuracy = null;
      this.showToast('Impossible de récupérer la position', 'warning');
    }
  }

  // Ouvrir la preview de la carte
  openMapPreview() {
    const lat = this.restaurantForm.get('latitude')?.value;
    const lng = this.restaurantForm.get('longitude')?.value;
    
    if (lat && lng) {
      const url = `https://www.google.com/maps?q=${lat},${lng}&zoom=16&hl=fr`;
      window.open(url, '_blank');
    }
  }

  // Génération automatique du mot de passe
  generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Soumission du formulaire
  async onSubmit() {
    if (!this.restaurantForm.valid) {
      this.showToast('Veuillez corriger les erreurs dans le formulaire', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Création du restaurant...'
    });
    await loading.present();

    try {
      const formData = this.restaurantForm.value;
      
      // Générer un email unique si non fourni
      if (!formData.email) {
        const timestamp = Date.now();
        formData.email = `restaurant${timestamp}@botrestaurant.com`;
      }
      
      // Générer un mot de passe temporaire
      const tempPassword = this.generatePassword();
      formData.password = tempPassword;
      
      // Normaliser les numéros de téléphone
      formData.telephone = this.normalizePhoneNumber(formData.telephone);
      if (formData.phone_whatsapp) {
        formData.phone_whatsapp = this.normalizePhoneNumber(formData.phone_whatsapp);
      } else {
        formData.phone_whatsapp = formData.telephone;
      }
      
      // Créer le restaurant
      const result = await this.restaurantService.createRestaurant(formData);
      
      await loading.dismiss();
      
      // Fermer la modal avec succès - pas d'affichage des infos de connexion
      this.modalController.dismiss({
        success: true,
        restaurant: result,
        restaurantName: formData.nom
      });
      
    } catch (error: any) {
      await loading.dismiss();
      console.error('Erreur création restaurant:', error);
      
      // Gestion spécifique de l'erreur de téléphone déjà existant
      if (error.code === '23505' && error.details?.includes('phone_whatsapp')) {
        await this.showPhoneDuplicateAlert(this.restaurantForm.value.telephone);
      } else {
        this.showToast(error.message || 'Erreur lors de la création', 'danger');
      }
    }
  }

  normalizePhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques
    let cleaned = phone.replace(/\D/g, '');
    
    // Si le numéro commence par 224, le garder tel quel
    if (cleaned.startsWith('224')) {
      return cleaned;
    }
    
    // Si le numéro a 9 chiffres, ajouter le préfixe 224
    if (cleaned.length === 9) {
      return '224' + cleaned;
    }
    
    return cleaned;
  }

  async showSuccessAlert(name: string, phone: string, password: string) {
    const alert = await this.modalController.create({
      component: SuccessAlertComponent,
      componentProps: {
        restaurantName: name,
        phone: phone,
        password: password
      },
      cssClass: 'success-alert-modal'
    });
    
    await alert.present();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    // Durée plus longue pour les messages de succès
    const duration = color === 'success' ? 5000 : 3000;
    
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
      color
    });
    await toast.present();
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 1: return 'Informations de base';
      case 2: return 'Adresse et localisation';
      case 3: return 'Configuration de livraison';
      case 4: return 'Paiement et horaires';
      default: return '';
    }
  }

  getStepIcon(): string {
    switch (this.currentStep) {
      case 1: return 'information-circle';
      case 2: return 'location';
      case 3: return 'bicycle';
      case 4: return 'time';
      default: return 'information';
    }
  }

  isStepCompleted(step: number): boolean {
    const fields = this.getFieldsForStep(step);
    return fields.every(field => {
      const control = this.restaurantForm.get(field);
      return control ? control.valid : true;
    });
  }

  async showPhoneDuplicateAlert(phone: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Numéro déjà utilisé',
      subHeader: 'Ce numéro de téléphone est déjà enregistré',
      message: `Le numéro <strong>${phone}</strong> est déjà utilisé par un autre restaurant. Veuillez utiliser un numéro différent.`,
      cssClass: 'custom-alert warning-alert',
      buttons: [
        {
          text: 'Corriger le numéro',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: () => {
            // Focus sur le champ téléphone
            const phoneField = document.querySelector('ion-input[formControlName="telephone"] input') as HTMLInputElement;
            if (phoneField) {
              setTimeout(() => {
                phoneField.focus();
                phoneField.select();
              }, 300);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}

// Composant pour afficher le succès
@Component({
  selector: 'app-success-alert',
  template: `
    <ion-header>
      <ion-toolbar color="success">
        <ion-title>Restaurant créé avec succès!</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="success-content">
      <div class="success-icon">
        <ion-icon name="checkmark-circle" color="success"></ion-icon>
      </div>
      
      <h2>{{ restaurantName }}</h2>
      <p>Le restaurant a été créé avec succès. Voici les informations de connexion:</p>
      
      <div class="credentials-card">
        <div class="credential-item">
          <ion-icon name="call"></ion-icon>
          <div>
            <label>Téléphone:</label>
            <strong>{{ phone }}</strong>
          </div>
        </div>
        
        <div class="credential-item">
          <ion-icon name="key"></ion-icon>
          <div>
            <label>Mot de passe temporaire:</label>
            <strong>{{ password }}</strong>
            <ion-button fill="clear" size="small" (click)="copyPassword()">
              <ion-icon name="copy"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>
      
      <p class="info-text">
        <ion-icon name="information-circle"></ion-icon>
        Le restaurant devra changer ce mot de passe lors de sa première connexion.
      </p>
      
      <div class="actions">
        <ion-button expand="block" (click)="sendByWhatsApp()" color="success">
          <ion-icon name="logo-whatsapp" slot="start"></ion-icon>
          Envoyer par WhatsApp
        </ion-button>
        
        <ion-button expand="block" (click)="dismiss()" fill="outline">
          Fermer
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .success-content {
      text-align: center;
      padding: 20px;
      
      .success-icon {
        margin: 20px 0;
        
        ion-icon {
          font-size: 80px;
        }
      }
      
      h2 {
        margin: 20px 0;
        font-size: 1.5rem;
        color: var(--ion-color-primary);
      }
      
      .credentials-card {
        background: var(--ion-color-light);
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
        
        .credential-item {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          text-align: left;
          
          ion-icon {
            font-size: 24px;
            color: var(--ion-color-primary);
          }
          
          label {
            display: block;
            font-size: 0.9rem;
            color: var(--ion-color-medium);
          }
          
          strong {
            font-size: 1.1rem;
            color: var(--ion-color-dark);
          }
        }
      }
      
      .info-text {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: center;
        color: var(--ion-color-medium);
        margin: 20px 0;
        
        ion-icon {
          font-size: 20px;
        }
      }
      
      .actions {
        margin-top: 30px;
        
        ion-button {
          margin-bottom: 10px;
        }
      }
    }
  `],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class SuccessAlertComponent {
  restaurantName: string = '';
  phone: string = '';
  password: string = '';
  
  constructor(
    private modalController: ModalController,
    private toastController: ToastController
  ) {}
  
  async copyPassword() {
    try {
      await navigator.clipboard.writeText(this.password);
      const toast = await this.toastController.create({
        message: 'Mot de passe copié!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  }
  
  sendByWhatsApp() {
    const message = encodeURIComponent(
      `🎉 *Bienvenue ${this.restaurantName}!*\n\n` +
      `Votre compte restaurant a été créé avec succès.\n\n` +
      `📱 *Informations de connexion:*\n` +
      `Téléphone: ${this.phone}\n` +
      `Mot de passe: ${this.password}\n\n` +
      `⚠️ *Important:* Vous devrez changer ce mot de passe lors de votre première connexion.\n\n` +
      `Connectez-vous sur: https://botrestaurant.com`
    );
    
    const cleanPhone = this.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    this.dismiss();
  }
  
  dismiss() {
    this.modalController.dismiss();
  }
}