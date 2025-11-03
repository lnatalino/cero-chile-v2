import type { ReactNode } from 'react';
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata = {
  title: 'CERO Chile',
  description: 'Centro de Entrenamiento en Recursos y Operaciones (CERO) Chile',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <NavBar />
        <main className="mx-auto max-w-5xl px-4 py-8 space-y-10">{children}</main>
      </body>
    </html>
  );
}
