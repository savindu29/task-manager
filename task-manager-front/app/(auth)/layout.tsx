"use client";

/** Public auth shell (login/register); redirects authenticated users to the app. */
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Spinner } from "@/components/ui/spinner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/my-task");
    }
  }, [status, router]);

  if (status !== "unauthenticated") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-foreground text-background">
              <Layers className="size-4" />
            </div>
            Trackr
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-muted lg:block">
        <Image
          src="/wallpaper/wallpaper.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        {/* Scrim so the overlaid white text stays readable. */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/40" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-white/15 backdrop-blur">
              <Layers className="size-4" />
            </div>
            Trackr
          </div>
          <blockquote className="space-y-2">
            <p className="text-lg leading-relaxed">
              &ldquo;Stay on top of every task, every project, every
              deadline — all in one place.&rdquo;
            </p>
            <footer className="text-sm text-white/70">The Trackr team</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
