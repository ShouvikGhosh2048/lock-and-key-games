import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lock and key games',
  description: 'An editor for lock and key games',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        <nav className="bg-slate-900 w-full h-10 flex gap-5 items-center p-2">
          <Link href="/" className="text-white text-lg">Home</Link>
          <Link href="/editor" className="text-white text-lg">Editor</Link>
        </nav>
        <div className="flex-grow">
          {children}
        </div>
      </body>
    </html>
  )
}
