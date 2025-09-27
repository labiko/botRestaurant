// /api/ocr/providers
import { OCRService } from '@/lib/ocr/ocr-service';

export async function GET() {
  try {
    const ocrService = new OCRService();

    return Response.json({
      providers: ocrService.getAvailableProviders(),
      default: ocrService.getDefaultProvider()
    });

  } catch (error) {
    console.error('OCR Providers Error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}