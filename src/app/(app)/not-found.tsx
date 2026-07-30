import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center">
      <div className="space-y-2">
        <p className="font-heading text-6xl font-semibold tracking-tight text-foreground">404</p>
        <h1 className="text-lg font-semibold text-foreground">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Link href="/home" className={buttonVariants({ variant: "default" })}>
        Back to Home
      </Link>
    </div>
  );
}
