import { QUEST_STATUS_LABELS } from "@/lib/contracts/questEscrowAbi";

const STEPS = [
  { status: 0, label: "Open" },
  { status: 1, label: "Accepted" },
  { status: 2, label: "Submitted" },
  { status: 3, label: "Completed" },
] as const;

export function QuestStepper({ currentStatus }: { currentStatus: number }) {
  const terminal = currentStatus === 4 || currentStatus === 5;
  const terminalLabel = QUEST_STATUS_LABELS[currentStatus] ?? "Ended";

  if (terminal) {
    return (
      <div className="surface p-4">
        <p className="text-sm text-[var(--muted)]">Quest ended</p>
        <p className="mt-1 font-semibold text-[var(--foreground)]">{terminalLabel}</p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-center">
      {STEPS.map((step, i) => {
        const done = currentStatus + 1 > step.status;
        const active = currentStatus === step.status;
        return (
          <li key={step.status} className="flex flex-1 items-center gap-2 sm:flex-col sm:gap-1">
            <div className="flex items-center gap-2 sm:flex-col">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${done
                  ? "bg-[var(--accent)] text-white"
                  : active
                    ? "border-2 border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-hover)]"
                    : "border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)]"
                  }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`text-xs font-medium ${active ? "text-[var(--accent-hover)]" : done ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                  }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`hidden h-0.5 flex-1 sm:block ${currentStatus > step.status ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                  }`}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
