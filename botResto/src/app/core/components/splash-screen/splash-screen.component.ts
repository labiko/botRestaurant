import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  standalone: false,
  template: `
    <div class="splash-container" [class.fade-out]="isHiding">
      <!-- Background with gradient -->
      <div class="splash-background">
        <div class="animated-particles">
          <div class="particle particle-1"></div>
          <div class="particle particle-2"></div>
          <div class="particle particle-3"></div>
          <div class="particle particle-4"></div>
          <div class="particle particle-5"></div>
        </div>
      </div>
      
      <!-- Main content -->
      <div class="splash-content">
        <!-- Logo avec animation -->
        <div class="logo-container">
          <div class="logo-wrapper">
            <img src="assets/images/botlogo.png" alt="Bot Resto Conakry" class="splash-logo" />
            <div class="logo-glow"></div>
          </div>
        </div>
        
        <!-- Titre animé -->
        <div class="title-container">
          <h1 class="app-title">
            <span class="word word-1">Bot</span>
            <span class="word word-2">Resto</span>
            <span class="word word-3">Conakry</span>
          </h1>
          <div class="title-underline"></div>
        </div>
        
        <!-- Tagline -->
        <p class="tagline">
          <span class="tagline-text">Système moderne de gestion</span>
          <span class="tagline-highlight">de commandes et livraisons</span>
        </p>
        
        <!-- Loading animation -->
        <div class="loading-container">
          <div class="loading-dots">
            <div class="dot dot-1"></div>
            <div class="dot dot-2"></div>
            <div class="dot dot-3"></div>
          </div>
          <p class="loading-text">Chargement...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .splash-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 1;
      transition: opacity 0.8s ease-out;
      
      &.fade-out {
        opacity: 0;
        pointer-events: none;
      }
    }

    .splash-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, 
        #8B5CF6 0%, 
        #A78BFA 25%, 
        #84CC16 50%, 
        #A3E635 75%, 
        #8B5CF6 100%
      );
      background-size: 400% 400%;
      animation: gradientShift 6s ease-in-out infinite;
    }

    .animated-particles {
      position: absolute;
      width: 100%;
      height: 100%;
      
      .particle {
        position: absolute;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        animation: floatParticles 8s ease-in-out infinite;
        
        &.particle-1 {
          width: 80px;
          height: 80px;
          top: 10%;
          left: 15%;
          animation-delay: 0s;
        }
        
        &.particle-2 {
          width: 120px;
          height: 120px;
          top: 20%;
          right: 10%;
          animation-delay: 2s;
        }
        
        &.particle-3 {
          width: 60px;
          height: 60px;
          bottom: 30%;
          left: 10%;
          animation-delay: 4s;
        }
        
        &.particle-4 {
          width: 90px;
          height: 90px;
          bottom: 15%;
          right: 20%;
          animation-delay: 1s;
        }
        
        &.particle-5 {
          width: 70px;
          height: 70px;
          top: 60%;
          left: 50%;
          animation-delay: 3s;
        }
      }
    }

    .splash-content {
      position: relative;
      z-index: 10;
      text-align: center;
      color: white;
      max-width: 90%;
      width: 400px;
    }

    .logo-container {
      position: relative;
      margin-bottom: 40px;
      display: flex;
      justify-content: center;
      
      .logo-wrapper {
        position: relative;
        
        .splash-logo {
          width: 150px;
          height: 150px;
          border-radius: 25px;
          animation: logoEntrance 2s ease-out forwards,
                     logoPulse 3s ease-in-out 2s infinite;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
          transform: scale(0) rotate(180deg);
          opacity: 0;
        }
        
        .logo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: glowPulse 3s ease-in-out infinite;
          opacity: 0;
          animation-delay: 2s;
        }
      }
    }

    .title-container {
      margin-bottom: 30px;
      
      .app-title {
        margin: 0 0 20px 0;
        font-size: clamp(2.5rem, 6vw, 4rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.1;
        
        .word {
          display: inline-block;
          opacity: 0;
          transform: translateY(50px);
          animation: wordSlideIn 1s ease-out forwards;
          
          &.word-1 {
            animation-delay: 0.5s;
            background: linear-gradient(45deg, #ffffff, #f8fafc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          &.word-2 {
            animation-delay: 0.8s;
            background: linear-gradient(45deg, #ffffff, #e2e8f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0 0.2em;
          }
          
          &.word-3 {
            animation-delay: 1.1s;
            background: linear-gradient(45deg, #ffffff, #f1f5f9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        }
      }
      
      .title-underline {
        width: 120px;
        height: 4px;
        background: linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4), rgba(255,255,255,0.8));
        margin: 0 auto;
        border-radius: 2px;
        transform: scaleX(0);
        animation: underlineExpand 1s ease-out 1.4s forwards;
      }
    }

    .tagline {
      margin: 0 0 50px 0;
      font-size: clamp(1rem, 3vw, 1.4rem);
      line-height: 1.6;
      opacity: 0;
      animation: fadeInUp 1s ease-out 1.7s forwards;
      
      .tagline-text,
      .tagline-highlight {
        display: block;
        color: rgba(255, 255, 255, 0.9);
      }
      
      .tagline-highlight {
        font-weight: 600;
        margin-top: 5px;
        color: rgba(255, 255, 255, 1);
      }
    }

    .loading-container {
      opacity: 0;
      animation: fadeInUp 1s ease-out 2s forwards;
      
      .loading-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 15px;
        
        .dot {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          animation: dotBounce 1.5s ease-in-out infinite;
          
          &.dot-1 { animation-delay: 0s; }
          &.dot-2 { animation-delay: 0.2s; }
          &.dot-3 { animation-delay: 0.4s; }
        }
      }
      
      .loading-text {
        margin: 0;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
      }
    }

    // Animations
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    @keyframes floatParticles {
      0%, 100% { 
        transform: translateY(0px) rotate(0deg);
        opacity: 0.3;
      }
      25% { 
        transform: translateY(-30px) rotate(90deg);
        opacity: 0.6;
      }
      50% { 
        transform: translateY(-15px) rotate(180deg);
        opacity: 0.4;
      }
      75% { 
        transform: translateY(-40px) rotate(270deg);
        opacity: 0.7;
      }
    }

    @keyframes logoEntrance {
      0% {
        transform: scale(0) rotate(180deg);
        opacity: 0;
      }
      60% {
        transform: scale(1.1) rotate(-10deg);
        opacity: 1;
      }
      100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
    }

    @keyframes logoPulse {
      0%, 100% { 
        transform: scale(1);
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
      }
      50% { 
        transform: scale(1.05);
        box-shadow: 0 12px 50px rgba(0, 0, 0, 0.4);
      }
    }

    @keyframes glowPulse {
      0%, 100% { 
        opacity: 0.3;
        transform: translate(-50%, -50%) scale(1);
      }
      50% { 
        opacity: 0.6;
        transform: translate(-50%, -50%) scale(1.1);
      }
    }

    @keyframes wordSlideIn {
      0% {
        opacity: 0;
        transform: translateY(50px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes underlineExpand {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }

    @keyframes fadeInUp {
      0% {
        opacity: 0;
        transform: translateY(30px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes dotBounce {
      0%, 100% { 
        transform: translateY(0);
        opacity: 0.7;
      }
      50% { 
        transform: translateY(-15px);
        opacity: 1;
      }
    }
  `]
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  isHiding = false;
  private hideTimeout?: number;

  ngOnInit() {
    // Masquer automatiquement après 4 secondes
    this.hideTimeout = window.setTimeout(() => {
      this.hide();
    }, 4000);
  }

  ngOnDestroy() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }

  hide() {
    this.isHiding = true;
    // Supprimer complètement l'élément après l'animation
    setTimeout(() => {
      const element = document.querySelector('app-splash-screen');
      if (element) {
        element.remove();
      }
    }, 800);
  }
}