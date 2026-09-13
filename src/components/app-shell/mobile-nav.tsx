"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { Logo } from "@/components/logo";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col gap-4 bg-card py-4 shadow-lg">
            <div className="flex items-center justify-between px-4">
              <Logo />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
