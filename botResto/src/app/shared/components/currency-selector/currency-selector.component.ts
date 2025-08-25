import { Component, OnInit } from '@angular/core';
import { CurrencyService, CurrencyConfig } from '../../../core/services/currency.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-currency-selector',
  templateUrl: './currency-selector.component.html',
  styleUrls: ['./currency-selector.component.scss']
})
export class CurrencySelectorComponent implements OnInit {
  availableCurrencies: CurrencyConfig[] = [];
  currentCurrency: CurrencyConfig;

  constructor(
    private currencyService: CurrencyService,
    private modalController: ModalController
  ) {
    this.availableCurrencies = this.currencyService.getAvailableCurrencies();
    this.currentCurrency = this.currencyService.getCurrentCurrency();
  }

  ngOnInit() {}

  selectCurrency(currency: CurrencyConfig) {
    this.currencyService.setCurrency(currency.code);
    this.currentCurrency = currency;
  }

  async close() {
    await this.modalController.dismiss();
  }

  async confirm() {
    await this.modalController.dismiss({
      selectedCurrency: this.currentCurrency
    });
    
    // Recharger la page pour appliquer les changements
    window.location.reload();
  }
}