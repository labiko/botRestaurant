import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Configuration Supabase DEV
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation des données
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email et mot de passe requis'
      }, { status: 400 });
    }


    // Client Supabase avec service role
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Rechercher l'utilisateur par email
    const { data: user, error: fetchError } = await supabase
      .from('login_users')
      .select('id, email, password_hash')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError || !user) {
      console.log('❌ [LOGIN] Utilisateur non trouvé:', email);
      return NextResponse.json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      }, { status: 401 });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      console.log('❌ [LOGIN] Mot de passe incorrect pour:', email);
      return NextResponse.json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      }, { status: 401 });
    }

    // Mettre à jour last_login
    const { error: updateError } = await supabase
      .from('login_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      console.error('⚠️ [LOGIN] Erreur mise à jour last_login:', updateError);
    }

    // Créer JWT token avec expiration 2H
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60) // 2 heures
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET);


    // Créer la réponse avec le cookie défini côté serveur
    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email
      },
      expiresAt: tokenPayload.exp
    });

    // Définir le cookie côté serveur
    response.cookies.set('auth_token', token, {
      path: '/',
      maxAge: 2 * 60 * 60, // 2 heures
      sameSite: 'lax',
      secure: false, // false en développement
      httpOnly: false // false pour permettre la lecture côté client
    });


    return response;

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}