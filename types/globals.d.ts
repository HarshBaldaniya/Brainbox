export {}

declare global {
  interface CustomJwtSessionClaims {
    email?: string
    image?: string
    fullName?: string
    lastName?: string
    firstName?: string
  }
}