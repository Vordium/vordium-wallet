import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vordium Wallet',
  description: 'Non-custodial wallet for EVM and TRON chains',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
