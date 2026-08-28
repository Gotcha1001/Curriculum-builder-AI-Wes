// app/(dashboard)/dashboard/settings/page.tsx
"use client";

import { UserProfile, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Image from "next/image";
import { useUserContext } from "@/app/context/UserContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { user: clerkUser } = useUser();
  const dbUser = useUserContext();
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      {/* Full-bleed background photo, faded so text stays readable —
          matches the dashboard page treatment exactly. `isolate` pins a
          local stacking context so the -z-10 layers below stay behind
          this page's content but don't escape behind the dashboard
          layout's own background. */}
      <Image
        src="/cvcolleague.jpg"
        alt=""
        fill
        priority
        className="object-cover opacity-20 dark:opacity-10 -z-10 pointer-events-none select-none"
      />
      {/* Soft purple/indigo wash over the photo for depth in both themes.
          Light mode gets its own darker wash (rather than falling through
          to `transparent`) — a low-opacity photo on white reads as washed
          out, so the wash carries most of the depth and the image opacity
          above is raised too so it doesn't disappear entirely. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-950/30 via-slate-900/20 to-purple-950/35 dark:from-indigo-950/40 dark:via-black/60 dark:to-purple-950/30 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto space-y-8 px-6 pt-16 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-semibold text-[#12213A] dark:text-[#F6F1E7]">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and how CV Make AI looks.
          </p>
        </motion.div>

        <Card className="bg-white/60 dark:bg-white/5">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Synced from your sign-in provider.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Name</Label>
              <span className="text-sm text-muted-foreground">
                {dbUser?.name ?? clerkUser?.fullName ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Label>Email</Label>
              <span className="text-sm text-muted-foreground">
                {dbUser?.email ??
                  clerkUser?.primaryEmailAddress?.emailAddress ??
                  "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Label>Role</Label>
              <Badge variant="secondary">{dbUser?.role ?? "user"}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-white/5">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose how CV Make AI looks on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-select">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme-select" className="w-36">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Deliberately not a Card — Clerk's UserProfile ships its own
            panelled UI (its own borders, background, and internal nav),
            so wrapping it in another bordered box just fights Clerk for
            space and forces a scrollbar. A plain heading here matches the
            style of the sections above without constraining Clerk's
            width; Clerk sizes itself and centers on its own. */}
        <div>
          <h2 className="text-lg font-semibold text-[#12213A] dark:text-[#F6F1E7]">
            Profile & security
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Update your photo, password, and connected accounts via Clerk.
          </p>
        </div>
      </div>

      {/* Full-width, outside the max-w-2xl column above, so Clerk's
          UserProfile can lay out at whatever width it needs instead of
          being squeezed into the settings column. */}
      <div className="relative z-10 w-full flex justify-center px-6 pb-20">
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}
