"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";

export function RoleGuard({
  allowed,
  redirectTo,
  children,
}: {
  allowed: readonly string[];
  redirectTo: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data, isLoading } = useGetSessionQuery();
  const role = data?.user?.role ?? null;
  const permitted = role != null && allowed.includes(role);

  useEffect(() => {
    if (!isLoading && !permitted) router.replace(redirectTo);
  }, [isLoading, permitted, redirectTo, router]);

  if (isLoading || !permitted) {
    return <div className="flex min-h-[50vh] items-center justify-center" />;
  }

  return <>{children}</>;
}
