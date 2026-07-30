import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted/30 px-4 text-center">
      <div className="space-y-2">
        <p className="font-heading text-6xl font-semibold tracking-tight text-foreground">404</p>
        <h1 className="text-lg font-semibold text-foreground">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Link href="/home" className={buttonVariants({ variant: "default" })}>
        Back to Castway
      </Link>
    </div>
  );
}
