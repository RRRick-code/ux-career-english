import type { PropsWithChildren, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils";

type AppShellProps = PropsWithChildren<{
  title: string;
  description?: string;
  actions?: ReactNode;
}>;

export function AppShell({
  title,
  description,
  actions,
  children,
}: AppShellProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,245,245,0.85),_transparent_40%)]">
      <header className="border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-3 text-sm font-semibold tracking-tight"
          >
            <div className="rounded-lg border bg-card p-2">
              <BookOpenText className="h-4 w-4" />
            </div>
            <div>
              <div>UX English Library</div>
              <div className="text-xs font-normal text-muted-foreground">
                Practical English for design work
              </div>
            </div>
          </Link>
          <nav className="flex items-center gap-2 rounded-full bg-muted p-1 text-sm">
            <NavLink href="/" label="Home" current={location.pathname === "/"} />
            <NavLink
              href="/library"
              label="Library"
              current={location.pathname === "/library"}
            />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
        {children}
      </main>
    </div>
  );
}

function NavLink({
  href,
  label,
  current,
}: {
  href: string;
  label: string;
  current: boolean;
}) {
  return (
    <Link
      to={href}
      className={cn(
        "rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground",
        current && "bg-background text-foreground shadow-sm",
      )}
    >
      {label}
    </Link>
  );
}
