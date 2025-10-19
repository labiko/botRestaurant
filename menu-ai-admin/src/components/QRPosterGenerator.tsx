'use client';

import { useState, useEffect } from 'react';
import { generateQRPosterHTML } from '@/templates/qr-poster-template';

interface Restaurant {
  id: number;
  name: string;
  phone: string;
}

interface Props {
  restaurants: Restaurant[];
}

export function QRPosterGenerator({ restaurants }: Props) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string>('');

  const handleGenerate = async () => {
    if (!selectedRestaurant) return;

    // Charger le logo et le convertir en base64
    const response = await fetch('/botlogo.png');
    const blob = await response.blob();
    const reader = new FileReader();

    reader.onloadend = () => {
      const logoBase64 = reader.result as string;

      // Générer HTML avec logo en base64
      const html = generateQRPosterHTML(selectedRestaurant, logoBase64);

      // Créer blob URL
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(htmlBlob);

      setPosterUrl(url);
      setShowPreview(true);
    };

    reader.readAsDataURL(blob);
  };

  const handleClose = () => {
    if (posterUrl) URL.revokeObjectURL(posterUrl);
    setShowPreview(false);
    setPosterUrl('');
  };

  // Fermer avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPreview) {
        handleClose();
      }
    };

    if (showPreview) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [showPreview, posterUrl]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Générer une affiche QR Code</h2>

      {/* Sélection restaurant */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Restaurant</label>
        <select
          onChange={(e) => {
            const resto = restaurants.find(r => r.id === Number(e.target.value));
            setSelectedRestaurant(resto || null);
          }}
          className="max-w-md p-2 border rounded"
        >
          <option value="">-- Sélectionner un restaurant --</option>
          {restaurants.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Bouton générer */}
      <button
        onClick={handleGenerate}
        disabled={!selectedRestaurant}
        className="bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-300"
      >
        🖨️ Générer & Prévisualiser
      </button>

      {/* Prévisualisation plein écran */}
      {showPreview && (
        <div className="fixed inset-0 bg-gray-100 z-50 overflow-auto flex items-center justify-center p-4">
          <iframe
            src={posterUrl}
            className="border-0 shadow-2xl"
            title="Affiche QR Code"
            style={{
              width: '148mm',
              height: '210mm',
              overflow: 'hidden',
              transform: 'scale(1)',
              transformOrigin: 'center center'
            }}
          />
        </div>
      )}
    </div>
  );
}
