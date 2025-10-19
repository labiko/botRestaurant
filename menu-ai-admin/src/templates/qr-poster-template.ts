export function generateQRPosterHTML(restaurant: { name: string; phone: string }, logoBase64: string): string {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=https://wa.me/33753058254?text=${restaurant.phone}&format=svg`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${restaurant.name} - Commande en ligne PREMIUM</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

        @page {
            size: A5 portrait;
            margin: 0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            height: 100%;
            overflow: hidden;
        }

        body {
            width: 148mm;
            height: 210mm;
            font-family: 'Inter', 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 6mm;
            position: relative;
            page-break-after: avoid;
            page-break-inside: avoid;
            margin: 0 auto;
            transform-origin: top center;
        }

        @media screen {
            body {
                transform: scale(var(--scale, 1));
                box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
            }
        }

        /* Effets de lumière d'arrière-plan */
        body::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -30%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(91, 77, 199, 0.08) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }

        body::after {
            content: '';
            position: absolute;
            bottom: -40%;
            left: -30%;
            width: 350px;
            height: 350px;
            background: radial-gradient(circle, rgba(124, 179, 66, 0.08) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
        }

        /* Bordure élégante */
        .border-frame {
            position: absolute;
            top: 4mm;
            left: 4mm;
            right: 4mm;
            bottom: 4mm;
            border: 1.5px solid rgba(91, 77, 199, 0.15);
            border-radius: 16px;
            pointer-events: none;
            z-index: 0;
        }

        /* Header premium */
        .header {
            text-align: center;
            z-index: 1;
            margin-bottom: 1mm;
        }

        .logo-container {
            width: 45mm;
            height: 45mm;
            margin: 0 auto 2mm;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 6px 20px rgba(91, 77, 199, 0.25));
            animation: subtle-float 3s ease-in-out infinite;
        }

        @keyframes subtle-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
        }

        .logo {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .title {
            font-size: 22pt;
            font-weight: 800;
            background: linear-gradient(135deg, #5B4DC7 0%, #7E6FD8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5mm;
            letter-spacing: -0.8px;
            line-height: 1.1;
        }

        .flag {
            font-size: 18pt;
            margin-right: 2px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .tagline {
            font-size: 9pt;
            color: #7CB342;
            font-weight: 600;
            margin-bottom: 0.5mm;
            letter-spacing: 0.3px;
        }

        .restaurant-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 11pt;
            font-weight: 700;
            margin-top: 0.5mm;
            padding: 2mm 6mm;
            background: linear-gradient(135deg, #5B4DC7 0%, #7E6FD8 100%);
            color: white;
            border-radius: 25px;
            box-shadow: 0 4px 12px rgba(91, 77, 199, 0.3);
            position: relative;
            overflow: hidden;
        }

        .restaurant-badge::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
        }

        .restaurant-badge .emoji {
            font-size: 14pt;
        }

        /* QR Code section premium */
        .qr-section {
            background: white;
            padding: 4mm;
            border-radius: 20px;
            box-shadow:
                0 10px 40px rgba(0, 0, 0, 0.08),
                0 2px 8px rgba(0, 0, 0, 0.04);
            text-align: center;
            z-index: 1;
            position: relative;
            border: 1px solid rgba(91, 77, 199, 0.08);
        }

        .qr-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(91, 77, 199, 0.3), transparent);
            border-radius: 20px 20px 0 0;
        }

        .qr-container {
            width: 65mm;
            height: 65mm;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            margin-bottom: 2mm;
            padding: 3mm;
            border: none;
            position: relative;
            box-shadow:
                0 25px 70px rgba(91, 77, 199, 0.30),
                0 12px 35px rgba(91, 77, 199, 0.20),
                0 6px 16px rgba(91, 77, 199, 0.15),
                0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .qr-code {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 8px;
            position: relative;
            z-index: 1;
        }

        .scan-instruction {
            font-size: 11pt;
            color: #2E2E2E;
            font-weight: 700;
            margin-bottom: 0.5mm;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }

        .scan-instruction .emoji {
            font-size: 16pt;
        }

        .qr-hint {
            font-size: 8pt;
            color: #868e96;
            font-style: italic;
            font-weight: 500;
        }

        /* Alternative QR Code */
        .qr-alternative {
            margin-top: 3mm;
            padding-top: 3mm;
            border-top: 1px solid rgba(91, 77, 199, 0.1);
        }

        .separator {
            text-align: center;
            margin-bottom: 2mm;
            position: relative;
        }

        .separator span {
            font-size: 7pt;
            color: #868e96;
            font-weight: 600;
            background: white;
            padding: 0 2mm;
            position: relative;
            z-index: 1;
        }

        .alt-title {
            font-size: 8pt;
            color: #5B4DC7;
            font-weight: 700;
            margin-bottom: 1.5mm;
            text-align: center;
        }

        .alt-steps {
            font-size: 7pt;
            color: #495057;
            line-height: 1.6;
            text-align: center;
        }

        .alt-steps p {
            margin-bottom: 1mm;
        }

        .alt-steps .step-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 14px;
            height: 14px;
            background: linear-gradient(135deg, #5B4DC7 0%, #7E6FD8 100%);
            color: white;
            border-radius: 50%;
            font-size: 6pt;
            font-weight: 800;
            margin-right: 1mm;
        }

        .alt-steps strong {
            color: #5B4DC7;
            font-weight: 700;
        }

        /* Steps section premium */
        .steps {
            text-align: center;
            z-index: 1;
            background: white;
            padding: 3mm 4mm;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .steps-title {
            font-size: 9pt;
            color: #495057;
            font-weight: 700;
            margin-bottom: 2mm;
            letter-spacing: 0.3px;
        }

        .steps-container {
            display: flex;
            justify-content: space-around;
            gap: 4mm;
        }

        .step {
            flex: 1;
            text-align: center;
        }

        .step-number {
            width: 26px;
            height: 26px;
            background: linear-gradient(135deg, #5B4DC7 0%, #7E6FD8 100%);
            color: white;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 10pt;
            margin-bottom: 1mm;
            box-shadow: 0 3px 10px rgba(91, 77, 199, 0.3);
            position: relative;
        }

        .step-number::after {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(91, 77, 199, 0.2), transparent);
            z-index: -1;
        }

        .step-text {
            font-size: 8pt;
            color: #495057;
            font-weight: 600;
            line-height: 1.2;
        }

        /* Footer premium */
        .footer {
            text-align: center;
            font-size: 7.5pt;
            color: #868e96;
            z-index: 1;
            line-height: 1.5;
            font-weight: 500;
        }

        .footer-highlight {
            color: #7CB342;
            font-weight: 700;
        }

        .check-icon {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: linear-gradient(135deg, #7CB342 0%, #8BC34A 100%);
            border-radius: 50%;
            position: relative;
            top: 1px;
            margin-right: 2px;
        }

        .check-icon::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 8px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <!-- Bordure décorative -->
    <div class="border-frame"></div>

    <!-- Header -->
    <div class="header">
        <div class="logo-container">
            <img src="${logoBase64}" alt="Bot Resto" class="logo">
        </div>

        <h1 class="title">
            <span class="flag">🇫🇷</span>Bot Resto
        </h1>
        <p class="tagline">Commandez en ligne - Rapide & Simple</p>

        <div class="restaurant-badge">
            <span class="emoji">🍕</span>
            <span>${restaurant.name}</span>
        </div>
    </div>

    <!-- QR Code -->
    <div class="qr-section">
        <div class="qr-container">
            <img src="${qrCodeUrl}"
                 alt="QR Code Bot Resto WhatsApp"
                 class="qr-code">
        </div>
        <p class="scan-instruction">
            <span class="emoji">👆</span>
            <span>Scannez pour commander</span>
        </p>
        <p class="qr-hint">Ouvrez votre appareil photo et pointez vers le QR code</p>

        <!-- Alternative sans QR -->
        <div class="qr-alternative">
            <div class="separator">
                <span>OU</span>
            </div>
            <p class="alt-title">📱 Commandez par WhatsApp</p>
            <div class="alt-steps">
                <p><span class="step-badge">1</span> Enregistrez : <strong>+33 7 53 05 82 54</strong></p>
                <p><span class="step-badge">2</span> Envoyez : <strong>${restaurant.phone}</strong></p>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>
            <span class="check-icon"></span> Paiement sécurisé •
            <span class="check-icon"></span> Service rapide •
            <span class="check-icon"></span> Zéro attente
        </p>
    </div>
</body>
</html>`;
}
