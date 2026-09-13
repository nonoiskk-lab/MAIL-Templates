import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/app/auth/actions";

export function GoogleButton({ redirectPath }: { redirectPath?: string }) {
  return (
    <form action={signInWithGoogle.bind(null, redirectPath)}>
      <Button type="submit" variant="outline" className="w-full">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48a5.55 5.55 0 0 1-2.4 3.64v3h3.87c2.27-2.09 3.57-5.17 3.57-8.83Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3c-1.08.72-2.46 1.15-4.08 1.15-3.13 0-5.79-2.12-6.74-4.96H1.27v3.1A12 12 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.26 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l3.99-3.1Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.27 6.61l3.99 3.1C6.21 6.87 8.87 4.75 12 4.75Z"
          />
        </svg>
        Continue with Google
      </Button>
    </form>
  );
}
