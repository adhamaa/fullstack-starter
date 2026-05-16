// Next.js 16 Identity session gate — not Upload intake BFF (see lib/upload-intake-bff.ts).
export { auth as proxy } from './auth'

export const config = {
  matcher: ['/dashboard/:path*'],
}
