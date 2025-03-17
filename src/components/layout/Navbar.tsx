"use client"
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="p-4 border-b border-gray-800">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">F1 Dashboard</Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex space-x-4">
          <Link href="/dashboard" className="hover:text-red-500">Dashboard</Link>
          <Link href="/drivers" className="hover:text-red-500">Drivers</Link>
          <Link href="/constructors" className="hover:text-red-500">Constructors</Link>
          <Link href="/races" className="hover:text-red-500">Races</Link>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 right-4 bg-slate-800 p-4 rounded-md shadow-lg md:hidden">
            <div className="flex flex-col space-y-2">
              <Link href="/dashboard" className="hover:text-red-500">Dashboard</Link>
              <Link href="/drivers" className="hover:text-red-500">Drivers</Link>
              <Link href="/constructors" className="hover:text-red-500">Constructors</Link>
              <Link href="/races" className="hover:text-red-500">Races</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}