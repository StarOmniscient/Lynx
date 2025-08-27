"use client"
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const [active, setActive] = useState("Logs");

  const tabs = ["Logs", "Commands", "Config", "Database","Chat"];

  return (
    <nav className="w-full bg-[#0c0f1a] shadow-md">
      <div className="max-w-6xl  px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href={"/"}>
        <div className="flex space-x-2">
          <Image
            src="/lynx-logo.png"
            alt="logo"
            width={32}
            height={32}
            priority
          />
          <span className="text-white font-bold text-lg tracking-wide">
            Lynx
          </span>
        </div>
        </Link>

        {/* Tabs */}
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <Link href={`/${tab.toLowerCase()}`} key={tab}>
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className="relative text-white font-medium tracking-wide"
            >
              {tab}
              {active === tab && (
                <motion.div
                  layoutId="underline"
                  className="absolute left-0 right-0 -bottom-1 h-[2px] bg-white rounded-full"
                />
              )}
            </button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
