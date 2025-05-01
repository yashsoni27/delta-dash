"use client";
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({
  navbar,
  footer,
  children,
}: {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLivePage = pathname === '/live';

  return (
    <>
      {navbar}
      <main 
        id="main-content" 
        className={`min-h-screen transition-all duration-300 ${
          !isLivePage ? 'ml-60' : 'ml-0'
        }`}
      >
        {children}
      </main>
      {footer}
    </>
  );
}