# Felges - Dashboard Admin

Dashboard de administración hecho con **React + Vite**, con integración a **Firebase** y deploy automático en **Vercel**.

## Stack

- ⚡ React 18 + Vite 6
- 🔥 Firebase (Firestore + Auth)
- 🚀 Vercel (deploy automático)
- 🎨 CSS custom (tema oscuro)

## Setup local

```bash
npm install
npm run dev
```

## Firebase

Copiá `.env.example` a `.env.local` y completá con tus credenciales:

```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Deploy en Vercel

1. Andá a [vercel.com](https://vercel.com)
2. Importá el repo `felges` desde GitHub
3. Agregá las variables de entorno de Firebase en **Settings > Environment Variables**
4. Cada push a `main` se deploya automáticamente
