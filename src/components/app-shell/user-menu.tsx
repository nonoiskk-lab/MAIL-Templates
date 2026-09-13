"use client";

import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { signOut } from "@/app/auth/actions";

export function UserMenu({
  name,
  email,
}: {
  name: string | null;
  email: string | null;
}) {
  const router = useRouter();
  const display = name || email || "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80">
          <Avatar>
            <AvatarFallback>{initials(display)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{display}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
          <UserIcon className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
