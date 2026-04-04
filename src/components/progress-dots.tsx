import { cn } from "@/lib/utils";

export function ProgressDots({ progress }: { progress: number }) {
  const totalSteps = 5;
  const activeSteps = Math.min(
    totalSteps,
    Math.max(0, progress <= 0 ? 0 : Math.ceil(progress / 20)),
  );

  return (
    <div
      aria-label={`Progress ${progress} out of 100`}
      className="shrink-0"
      role="img"
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: totalSteps }, (_, index) => (
          <span
            key={index}
            className={cn(
              "size-1 rounded-full bg-slate-200",
              index < activeSteps && "bg-primary",
            )}
          />
        ))}
      </div>
    </div>
  );
}
