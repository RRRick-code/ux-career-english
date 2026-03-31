import type { PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router-dom";

type AppShellProps = PropsWithChildren<{
  title: string;
  description?: string;
  actions?: ReactNode;
  actionsPlacement?: "stacked" | "top-right";
  contentWidth?: "compact" | "wide";
  showHeaderDivider?: boolean;
}>;

export function AppShell({
  title,
  description,
  actions,
  actionsPlacement = "stacked",
  contentWidth = "compact",
  showHeaderDivider = true,
  children,
}: AppShellProps) {
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
            <Link
              to="/"
              className="inline-block text-sm font-semibold tracking-tight text-primary transition-colors hover:text-primary/80"
            >
              UX English Library
            </Link>
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
