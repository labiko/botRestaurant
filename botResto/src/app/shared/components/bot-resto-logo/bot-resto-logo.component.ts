import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bot-resto-logo',
  standalone: false,
  template: `
    <div class="logo-container" [style.width]="width" [style.height]="height">
      <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Gradients -->
          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.9" />
            <stop offset="50%" style="stop-color:#764ba2;stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:#f093fb;stop-opacity:0.9" />
          </linearGradient>
          
          <linearGradient id="plateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#48dbfb;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0abde3;stop-opacity:1" />
          </linearGradient>
          
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f093fb;stop-opacity:1" />
          </linearGradient>

          <!-- Drop shadow filter -->
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/>
          </filter>
        </defs>
        
        <!-- Background circle -->
        <circle cx="60" cy="35" r="28" fill="url(#circleGradient)" filter="url(#shadow)" class="bg-circle"/>
        
        <!-- Main plate/dish - Plus grande et plus visible -->
        <circle cx="60" cy="35" r="20" fill="#ffffff" stroke="url(#plateGradient)" stroke-width="2" class="main-plate"/>
        <circle cx="60" cy="35" r="17" fill="url(#plateGradient)" opacity="0.8" class="main-plate"/>
        
        <!-- Food elements on plate - Plus gros et colorés -->
        <circle cx="55" cy="32" r="4" fill="#ffd700" class="food-item"/>
        <circle cx="65" cy="30" r="3.5" fill="#ff6b6b" class="food-item"/>
        <circle cx="58" cy="40" r="3" fill="#4ecdc4" class="food-item"/>
        <circle cx="62" cy="38" r="2.5" fill="#ff9f43" class="food-item"/>
        
        <!-- Fork - Plus grand et visible -->
        <g class="utensil fork" transform="translate(85, 25)">
          <rect x="0" y="0" width="3" height="16" fill="#ffffff" stroke="url(#plateGradient)" stroke-width="0.5"/>
          <rect x="-2" y="0" width="2" height="6" fill="#ffffff"/>
          <rect x="3" y="0" width="2" height="6" fill="#ffffff"/>
          <rect x="6" y="0" width="2" height="4" fill="#ffffff"/>
        </g>
        
        <!-- Knife - Plus grand et visible -->
        <g class="utensil knife" transform="translate(92, 28)">
          <rect x="0" y="0" width="2.5" height="14" fill="#ffffff" stroke="url(#plateGradient)" stroke-width="0.5"/>
          <polygon points="0,0 5,1 5,4 2.5,3" fill="#ffffff"/>
        </g>
        
        <!-- Delivery element - small bike/scooter -->
        <g class="delivery-icon" transform="translate(30, 30)">
          <circle cx="8" cy="8" r="4" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
          <circle cx="16" cy="8" r="4" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
          <path d="M8,8 L16,8 M12,8 L12,4 L16,4" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
        </g>
        
        <!-- Text -->
        <text x="20" y="75" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="url(#textGradient)">Bot Resto</text>
        <text x="30" y="90" font-family="Arial, sans-serif" font-size="10" fill="#764ba2" opacity="0.8">Conakry</text>
        
        <!-- Decorative dots -->
        <circle cx="120" cy="25" r="1.5" fill="#667eea" opacity="0.6" class="deco-dot"/>
        <circle cx="125" cy="30" r="1" fill="#f093fb" opacity="0.6" class="deco-dot"/>
        <circle cx="130" cy="20" r="1.2" fill="#764ba2" opacity="0.6" class="deco-dot"/>
      </svg>
    </div>
  `,
  styles: [`
    .logo-container {
      display: inline-block;
      animation: logoFloat 4s ease-in-out infinite;
    }
    
    .bg-circle {
      animation: pulse 3s ease-in-out infinite;
      transform-origin: center;
    }
    
    .main-plate {
      animation: plateRotate 6s linear infinite;
      transform-origin: center;
    }
    
    .food-item {
      animation: bounce 2s ease-in-out infinite;
    }
    
    .food-item:nth-child(4) { animation-delay: 0.2s; }
    .food-item:nth-child(5) { animation-delay: 0.4s; }
    .food-item:nth-child(6) { animation-delay: 0.6s; }
    
    .utensil {
      animation: wiggle 3s ease-in-out infinite;
      transform-origin: center bottom;
    }
    
    .utensil.knife { animation-delay: 0.5s; }
    
    .delivery-icon {
      animation: drive 4s linear infinite;
      transform-origin: center;
    }
    
    .deco-dot {
      animation: twinkle 2s ease-in-out infinite;
    }
    
    .deco-dot:nth-child(13) { animation-delay: 0.3s; }
    .deco-dot:nth-child(14) { animation-delay: 0.6s; }
    .deco-dot:nth-child(15) { animation-delay: 0.9s; }
    
    @keyframes logoFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-3px); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.05); opacity: 1; }
    }
    
    @keyframes plateRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(2deg); }
      75% { transform: rotate(-2deg); }
    }
    
    @keyframes drive {
      0%, 100% { transform: translateX(0px); }
      50% { transform: translateX(2px); }
    }
    
    @keyframes twinkle {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    
    /* Hover effects */
    .logo-container:hover .main-plate {
      animation-duration: 1s;
    }
    
    .logo-container:hover .food-item {
      animation-duration: 0.5s;
    }
  `]
})
export class BotRestoLogoComponent {
  @Input() width: string = '200px';
  @Input() height: string = '120px';
}