import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;


  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPaths = ['/login'];

  // Si c'est une page publique, laisser passer
  if (publicPaths.includes(pathname)) {
    console.log('✅ [MIDDLEWARE] Public path - Autorisé:', pathname);
    return NextResponse.next();
  }

  // Récupérer le token depuis les cookies ou headers
  const token = request.cookies.get('auth_token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');


  // Si pas de token, rediriger vers login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {

    // Vérifier et décoder le token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;


    // Vérifier si le token a expiré
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && now >= decoded.exp) {
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);

      // Supprimer le cookie expiré
      response.cookies.delete('auth_token');
      return response;
    }

    // Token valide - continuer
    return NextResponse.next();

  } catch (error) {
    // Token invalide - rediriger vers login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);

    // Supprimer le cookie invalide
    response.cookies.delete('auth_token');
    return response;
  }
}

// Configuration des routes à protéger
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (page de connexion)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|auth).*)',
  ],
  runtime: 'nodejs', // Forcer l'utilisation de Node.js runtime au lieu d'Edge Runtime
};