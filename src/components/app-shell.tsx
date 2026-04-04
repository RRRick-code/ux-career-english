import type { PropsWithChildren, ReactNode } from "react";
import { Link, useHref, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
  const libraryHref = useHref("/library");
  const showLibraryAction = showBrandLink && location.pathname !== "/library";
  const mainClassName =
    contentWidth === "wide"
      ? "w-full px-4 py-8 sm:px-6 lg:px-8 xl:px-10"
      : "mx-auto w-full max-w-2xl px-4 py-8 sm:px-6";
  const descriptionClassName =
    contentWidth === "wide"
      ? "mt-2 max-w-3xl text-sm leading-6 text-muted-foreground"
      : "mt-2 max-w-xl text-sm leading-6 text-muted-foreground";

  return (
    <div className="min-h-screen bg-slate-100">
      <main className={mainClassName}>
        <div className="space-y-8">
          <div className={showHeaderDivider ? "space-y-4 border-b pb-6" : "space-y-4"}>
            {showBrandLink ? (
              <div className="flex items-center justify-between gap-4">
                <Link
                  to="/"
                  className="inline-block text-sm font-semibold tracking-tight text-primary transition-colors hover:text-primary/80"
                >
                  UX CAREER ENGLISH
                </Link>
                {showLibraryAction ? (
                  <Button
                    asChild
                    variant="link"
                    className="h-auto px-0 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <a href={libraryHref} rel="noreferrer" target="_blank">
                      Open Library
                    </a>
                  </Button>
                ) : null}
              </div>
            ) : null}
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
          <div className="space-y-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
