"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUserContext } from "../context/UserContext";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { APP_NAME, APP_NAME_SUFFIX } from "@/lib/brand";

export default function Navbar() {
  const user = useUserContext();

  return (
    <motion.nav
      className="flex items-center justify-between px-6 py-4 border-b bg-radial from-purple-500 to-indigo-900 dark:bg-[#0F1826] border-amber-900/10 dark:border-amber-400/10"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold text-[#12213A] dark:text-[#F6F1E7]"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
          {APP_NAME}{" "}
          <span className="text-amber-600 dark:text-amber-400">
            {APP_NAME_SUFFIX}
          </span>
        </Link>
      </div>
      <SignedIn>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <span className="hidden sm:block text-sm text-[#12213A]/70 dark:text-[#F6F1E7]/70">
              {user.name}
            </span>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </motion.nav>
  );
}
