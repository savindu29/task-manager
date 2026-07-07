"use client";

import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-2 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{user ? `, ${user.name}` : ""}
        </h1>
        {user && <Badge variant="secondary">{user.role}</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">
        {user?.email
          ? `Signed in as ${user.email}.`
          : "Your task overview will appear here."}
      </p>
    </div>
  );
}
