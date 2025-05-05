import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth/register', 
  '/api/auth/signin', 
  '/api/auth/session',
  '/api/auth/callback',
  '/api/auth/csrf',
  '/api/auth/signout',
];

// Define API routes that should be protected but not redirected
const protectedApiRoutes = [
  '/api/tarefas'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is a public route
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check if the route is for static files
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }
  
  // Get the session token
  const session = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  // If the user is not logged in and the path is not a public route
  if (!session) {
    // For API routes that are protected, return 401 Unauthorized
    if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
      return new NextResponse(
        JSON.stringify({ error: 'Não autorizado. Faça login para continuar.' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
    
    // For regular routes, redirect to login page
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // User is authenticated, continue to the requested page
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};


