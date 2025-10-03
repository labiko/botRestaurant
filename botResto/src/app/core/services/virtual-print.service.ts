import { Injectable } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class VirtualPrintService {

  constructor(
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  simulatePrint(ticketText: string): void {
    // Option 1: Console
    console.log(ticketText);

    // Option 2: Modal Ionic
    this.showPrintPreview(ticketText);

    // Option 3: Télécharger comme fichier texte
    this.downloadTicket(ticketText);
  }

  private async showPrintPreview(ticketText: string): Promise<void> {
    const alert = await this.alertController.create({
      header: '🖨️ Aperçu Ticket',
      message: `<pre style="font-family: monospace; font-size: 12px;">${ticketText}</pre>`,
      buttons: ['OK'],
      cssClass: 'print-preview-alert'
    });

    await alert.present();
  }

  private downloadTicket(ticketText: string): void {
    const blob = new Blob([ticketText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket_${Date.now()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}