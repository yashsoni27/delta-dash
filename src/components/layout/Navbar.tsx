"use client";
import {
  ChartColumn,
  Crown,
  Flag,
  Flame,
  IdCard,
  LucideIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Swords,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Tooltip from "./Tooltip";
import { usePathname } from "next/navigation";
import { useF1Context } from "@/context/F1Context";

type NavItemProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  isExpanded: boolean;
  onLinkClick: () => void;
};

const NavItem = ({ href, icon: Icon, label, isExpanded, onLinkClick }: NavItemProps) => {
  if (!isExpanded) {
    return (
      <Tooltip text={label}>
        <Link
          href={href}
          onClick={onLinkClick}
          className="flex items-center p-2 my-1 hover:bg-slate-800 rounded-lg transition-colors justify-center"
        >
          <Icon strokeWidth={1} size={22} />
        </Link>
      </Tooltip>
    );
  }
  return (
    <Link
      href={href}
      onClick={onLinkClick}
      className="flex items-center gap-3 p-2 my-1 hover:bg-slate-800 rounded-lg transition-colors"
    >
      <Icon strokeWidth={1} size={22} />
      <span>{label}</span>
    </Link>
  );
};

const navigationItems = [
  { href: "/live", icon: Radio, label: "Live" },
  { href: "/drivers", icon: IdCard, label: "Drivers" },
  {
    href: "/standings?title=Drivers",
    icon: Trophy,
    label: "Drivers Championship",
  },
  { href: "/teams", icon: Users, label: "Constructors" },
  {
    href: "/standings?title=Constructors",
    icon: Crown,
    label: "Constructors Championship",
  },
  { href: "/stats", icon: ChartColumn, label: "Driver Stats" },
  { href: "/races", icon: Flag, label: "Races" },
  { href: "/pitstop", icon: Timer, label: "Pit Stops" },
  { href: "/comparison", icon: Swords, label: "Head to Head" },
];

export default function Navbar() {
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const pathName = usePathname();
  const isLivePage = pathName === "/live";
  const {isLive} = useF1Context();

  const toggleSidebar = () => {
    setSidebarExpanded(!isSidebarExpanded);
  };

  const handleLinkClick = () => {
    if (isSidebarExpanded) {
      setSidebarExpanded(false);
    }
  };

  // Filter navigation items based on live status
  const filteredNavigationItems = navigationItems.filter(item => {
    if (item.href === '/live') {
      // return isLive;
      return true;
    }
    return true; 
  });

  return (
    <>
      <nav className="top-0 left-0 right-0 p-4 border-b border-gray-800 z-50">
        <div className="flex justify-between items-center">
          <Link href="/" className="md:ml-16 text-xl">
            Delta Dash
          </Link>
          {!isLivePage && (
            <button
              onClick={toggleSidebar}
              className="md:hidden p-1 hover:bg-slate-800 rounded-lg"
            >
              {isSidebarExpanded ? (
                <PanelLeftClose size={20} />
              ) : (
                <PanelLeftOpen size={20} />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Backdrop */}
      {!isLivePage && isSidebarExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar navigation */}
      {!isLivePage && (
        <nav
          className={`fixed md:fixed left-0 top-0 h-full bg-slate-900 border-r border-gray-800 transition-all duration-300 z-50 ${
            isSidebarExpanded ? "w-60" : "w-16"
          }
            md:translate-x-0
            ${isSidebarExpanded ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <div className="flex flex-col h-full">
            {/* Logo Header */}
            <div className="p-4 flex items-center justify-between">
              {isSidebarExpanded && (
                <Link href="/" className="flex items-center gap-2">
                  <Flame className="text-f1-red" />
                  <span className="font-bold">Delta Dash</span>
                </Link>
              )}
              <button
                onClick={toggleSidebar}
                className="hidden md:block p-1 hover:bg-slate-800 rounded-lg"
              >
                {isSidebarExpanded ? (
                  <PanelLeftClose size={20} />
                ) : (
                  <PanelLeftOpen size={20} />
                )}
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-1 p-2 mt-6 text-sm">
              {filteredNavigationItems.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  isExpanded={isSidebarExpanded}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
