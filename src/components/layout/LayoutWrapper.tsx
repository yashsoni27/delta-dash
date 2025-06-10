"use client";
import { F1Provider } from "@/context/F1Context";
import { usePathname } from "next/navigation";

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
  const isLivePage = pathname === "/live";

  return (
    <>
      <F1Provider>
        {navbar}
        <main
          id="main-content"
          className={`min-h-screen transition-all duration-300 ${
            !isLivePage ? "md:ml-20" : "ml-0"
          }`}
        >
          {children}
        </main>
        {footer}
      </F1Provider>
    </>
  );
}
