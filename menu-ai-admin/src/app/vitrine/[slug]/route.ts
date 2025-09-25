import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Rediriger vers la version statique
  redirect(`/api/vitrine-static/${params.slug}`);
}