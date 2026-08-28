"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export default function MarketingHeader() {
  return (
    <motion.nav
      className="flex items-center justify-between px-6 py-4 border-b bg-[#F6F1E7] dark:bg-[#0F1826] border-amber-900/10 dark:border-amber-400/10"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[#12213A] dark:text-[#F6F1E7]"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
        CV Make <span className="text-amber-600 dark:text-amber-400">AI</span>
      </Link>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <SignedOut>
          <Link href="/sign-in">
            <Button
              variant="ghost"
              className="text-[#12213A] dark:text-[#F6F1E7]"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-amber-600 hover:bg-amber-500 text-white">
              Get Started
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <Button className="bg-amber-600 hover:bg-amber-500 text-white">
              Go to Dashboard
            </Button>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </motion.nav>
  );
}
