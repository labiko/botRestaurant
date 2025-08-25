import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-otp-input',
  templateUrl: './otp-input.component.html',
  styleUrls: ['./otp-input.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class OtpInputComponent implements AfterViewInit {
  @Input() driverPhone: string = '';
  @Input() isLoading: boolean = false;
  @Input() attempts: number = 0;
  @Input() maxAttempts: number = 3;
  
  @Output() otpValidated = new EventEmitter<string>();
  @Output() regenerateRequested = new EventEmitter<void>();

  @ViewChild('digit1') digit1!: ElementRef;
  @ViewChild('digit2') digit2!: ElementRef;
  @ViewChild('digit3') digit3!: ElementRef;
  @ViewChild('digit4') digit4!: ElementRef;

  otp1 = '';
  otp2 = '';
  otp3 = '';
  otp4 = '';
  showError = false;

  ngAfterViewInit() {
    // Focus sur le premier champ
    this.focusFirstInput();
  }

  private focusFirstInput() {
    setTimeout(() => {
      if (this.digit1) {
        this.digit1.nativeElement.focus();
      }
    }, 100);
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(charCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (charCode === 65 && event.ctrlKey) ||
        (charCode === 67 && event.ctrlKey) ||
        (charCode === 86 && event.ctrlKey) ||
        (charCode === 88 && event.ctrlKey)) {
      return true;
    }
    // Ensure that it is a number and stop the keypress
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onDigitInput(event: any, digitNumber: number) {
    const input = event.target;
    let value = input.value;

    // Remove non-numeric characters
    value = value.replace(/[^0-9]/g, '');

    // Update the model with clean value
    switch (digitNumber) {
      case 1: this.otp1 = value; break;
      case 2: this.otp2 = value; break;
      case 3: this.otp3 = value; break;
      case 4: this.otp4 = value; break;
    }

    // Handle paste event
    if (value.length > 1) {
      this.handlePaste(value);
      return;
    }

    // Get next and previous elements
    const nextElement = this.getDigitElement(digitNumber + 1);
    const prevElement = this.getDigitElement(digitNumber - 1);

    // Move to next input
    if (value && nextElement) {
      nextElement.nativeElement.focus();
    }

    // Handle backspace
    if (!value && prevElement && event.inputType === 'deleteContentBackward') {
      prevElement.nativeElement.focus();
    }

    // Auto validate when all digits are entered
    if (this.otp1 && this.otp2 && this.otp3 && this.otp4) {
      setTimeout(() => this.validateOTP(), 100);
    }
  }

  private getDigitElement(digitNumber: number): ElementRef | null {
    switch (digitNumber) {
      case 1: return this.digit1;
      case 2: return this.digit2;
      case 3: return this.digit3;
      case 4: return this.digit4;
      default: return null;
    }
  }

  handlePaste(pastedValue: string) {
    const digits = pastedValue.replace(/\D/g, '').slice(0, 4).split('');
    
    if (digits[0]) this.otp1 = digits[0];
    if (digits[1]) this.otp2 = digits[1];
    if (digits[2]) this.otp3 = digits[2];
    if (digits[3]) this.otp4 = digits[3];

    // Focus last filled input or the next empty one
    if (digits[3] && this.digit4) {
      this.digit4.nativeElement.focus();
    } else if (digits[2] && this.digit3) {
      this.digit3.nativeElement.focus();
    } else if (digits[1] && this.digit2) {
      this.digit2.nativeElement.focus();
    }

    // Auto validate if all digits are pasted
    if (digits.length === 4) {
      setTimeout(() => this.validateOTP(), 100);
    }
  }

  validateOTP() {
    const otp = this.otp1 + this.otp2 + this.otp3 + this.otp4;
    
    if (otp.length !== 4) {
      this.showErrorAnimation();
      return;
    }

    this.showError = false;
    this.otpValidated.emit(otp);
  }

  regenerateOTP() {
    this.clearInputs();
    this.regenerateRequested.emit();
  }

  showErrorAnimation() {
    this.showError = true;
    setTimeout(() => {
      this.showError = false;
    }, 500);
  }

  clearInputs() {
    this.otp1 = '';
    this.otp2 = '';
    this.otp3 = '';
    this.otp4 = '';
    this.showError = false;
    
    // Focus sur le premier champ
    setTimeout(() => {
      if (this.digit1) {
        this.digit1.nativeElement.focus();
      }
    }, 100);
  }

  // Méthode publique pour gérer le résultat de validation depuis le parent
  handleValidationResult(success: boolean) {
    if (!success) {
      this.showErrorAnimation();
      this.clearInputs();
    }
  }

  get isMaxAttemptsReached(): boolean {
    return this.attempts >= this.maxAttempts;
  }

  get remainingAttempts(): number {
    return Math.max(0, this.maxAttempts - this.attempts);
  }
}