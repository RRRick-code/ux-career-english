import type { PropsWithChildren, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LearningRecordsMenu } from "@/components/learning-records-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellProps = PropsWithChildren<{
  title: string;
  description?: string;
  actions?: ReactNode;
  actionsPlacement?: "stacked" | "top-right";
  contentWidth?: "compact" | "wide";
  showHeaderDivider?: boolean;
  showBrandLink?: boolean;
  reserveBrandSpace?: boolean;
}>;

export function AppShell({
  title,
  description,
  actions,
  actionsPlacement = "stacked",
  contentWidth = "compact",
  showHeaderDivider = true,
  showBrandLink = true,
  reserveBrandSpace = false,
  children,
}: AppShellProps) {
  const location = useLocation();
  const mainClassName =
    contentWidth === "wide"
      ? "w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10"
      : "mx-auto w-full max-w-2xl px-4 py-8 sm:px-6";
  const descriptionClassName =
    contentWidth === "wide"
      ? "mt-2 max-w-3xl text-sm leading-6 text-muted-foreground"
      : "mt-2 max-w-xl text-sm leading-6 text-muted-foreground";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {showBrandLink ? (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white">
          <div className="relative w-full h-14 px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-row items-center justify-between">
            <Link
              to="/"
              className="inline-block text-base font-bold tracking-tight text-primary transition-colors hover:text-primary/80"
            >
              UXCE
            </Link>
            <nav className="absolute left-1/2 flex h-full -translate-x-1/2 items-center gap-4">
              <Link to="/" className="relative flex h-full items-center">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                    location.pathname === "/" || location.pathname.startsWith("/study")
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                  )}
                >
                  PRACTICE
                </span>
                <span
                  className={cn(
                    "absolute bottom-0 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full transition-all",
                    location.pathname === "/" || location.pathname.startsWith("/study")
                      ? "bg-primary opacity-100"
                      : "bg-transparent opacity-0"
                  )}
                />
              </Link>
              <Link to="/library" className="relative flex h-full items-center">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                    location.pathname.startsWith("/library")
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                  )}
                >
                  LIBRARY
                </span>
                <span
                  className={cn(
                    "absolute bottom-0 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full transition-all",
                    location.pathname.startsWith("/library")
                      ? "bg-primary opacity-100"
                      : "bg-transparent opacity-0"
                  )}
                />
              </Link>
              <Link to="/interview" className="relative flex h-full items-center">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                    location.pathname.startsWith("/interview")
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                  )}
                >
                  INTERVIEW
                </span>
                <span
                  className={cn(
                    "absolute bottom-0 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full transition-all",
                    location.pathname.startsWith("/interview")
                      ? "bg-primary opacity-100"
                      : "bg-transparent opacity-0"
                  )}
                />
              </Link>
            </nav>
            <div className="flex items-center">
              <LearningRecordsMenu />
            </div>
          </div>
        </header>
      ) : null}

      <main className={cn(mainClassName, "flex-1")}>
        <div className="space-y-8">
          {title ? (
            <div className={showHeaderDivider ? "space-y-4 border-b pb-6" : "space-y-4"}>
              {!showBrandLink && reserveBrandSpace ? (
                <div aria-hidden="true" className="h-5" />
              ) : null}
              {actionsPlacement === "top-right" ? (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                    {description ? (
                      <p className={descriptionClassName}>{description}</p>
                    ) : null}
                  </div>
                  {actions ? <div className="shrink-0">{actions}</div> : null}
                </div>
              ) : (
                <>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                    {description ? (
                      <p className={descriptionClassName}>{description}</p>
                    ) : null}
                  </div>
                  {actions ? <div className="space-y-2">{actions}</div> : null}
                </>
              )}
            </div>
          ) : null}
          <div className="space-y-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
