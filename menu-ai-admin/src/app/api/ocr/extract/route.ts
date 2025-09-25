// /api/ocr/extract
import { OCRService } from '@/lib/ocr/ocr-service';

const ocrService = new OCRService();

export async function POST(request: Request) {
  try {
    // Vérifier qu'au moins un provider est configuré
    if (!ocrService.isAnyProviderConfigured()) {
      return Response.json({
        success: false,
        error: 'Aucun provider OCR configuré'
      }, { status: 500 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const provider = formData.get('provider') as string;

    if (!image) {
      return Response.json({
        success: false,
        error: 'Aucune image fournie'
      }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());

    const result = await ocrService.extractMenu(imageBuffer, {
      provider: provider || undefined
    });

    return Response.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('OCR Extract Error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}