import type { PropsWithChildren, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
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
          <div className="w-full h-14 px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-row items-center justify-start gap-12 sm:gap-24">
            <Link
              to="/"
              className="inline-block text-base font-bold tracking-tight text-primary transition-colors hover:text-primary/80"
            >
              UXCE
            </Link>
            <nav className="flex items-center gap-5 sm:gap-12 h-full">
              <Link
                to="/"
                data-text="Practice"
                className={cn(
                  "h-full px-0 text-sm font-medium transition-colors flex flex-col items-center justify-center relative",
                  "after:content-[attr(data-text)] after:block after:font-semibold after:h-0 after:invisible after:overflow-hidden",
                  "before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[3px] before:rounded-full before:transition-all",
                  location.pathname === "/" || location.pathname.startsWith("/study")
                    ? "text-primary font-semibold before:bg-primary before:opacity-100"
                    : "text-muted-foreground hover:text-foreground before:bg-transparent before:opacity-0 hover:before:bg-slate-200 hover:before:opacity-100"
                )}
              >
                Practice
              </Link>
              <Link
                to="/interview"
                data-text="Interview Prep"
                className={cn(
                  "h-full px-0 text-sm font-medium transition-colors flex flex-col items-center justify-center relative",
                  "after:content-[attr(data-text)] after:block after:font-semibold after:h-0 after:invisible after:overflow-hidden",
                  "before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[3px] before:rounded-full before:transition-all",
                  location.pathname.startsWith("/interview")
                    ? "text-primary font-semibold before:bg-primary before:opacity-100"
                    : "text-muted-foreground hover:text-foreground before:bg-transparent before:opacity-0 hover:before:bg-slate-200 hover:before:opacity-100"
                )}
              >
                Interview Prep
              </Link>
              <Link
                to="/library"
                data-text="Vocabulary"
                className={cn(
                  "h-full px-0 text-sm font-medium transition-colors flex flex-col items-center justify-center relative",
                  "after:content-[attr(data-text)] after:block after:font-semibold after:h-0 after:invisible after:overflow-hidden",
                  "before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[3px] before:rounded-full before:transition-all",
                  location.pathname.startsWith("/library")
                    ? "text-primary font-semibold before:bg-primary before:opacity-100"
                    : "text-muted-foreground hover:text-foreground before:bg-transparent before:opacity-0 hover:before:bg-slate-200 hover:before:opacity-100"
                )}
              >
                Vocabulary
              </Link>
            </nav>
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
