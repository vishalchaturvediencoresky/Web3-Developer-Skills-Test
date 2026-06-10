"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useQuest, useQuestActions } from "@/lib/hooks/useQuestEscrow";
import { StatusBadge } from "@/components/quest/status-badge";
import { QuestStepper } from "@/components/quest/quest-stepper";
import { formatReward, shortAddress } from "@/lib/utils/format";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function QuestDetailPage() {
  const params = useParams();
  const questId = BigInt(params.id as string);
  const { address, isConnected } = useAccount();
  const { quest, refetch, isLoading } = useQuest(questId);
  const actions = useQuestActions(questId);
  const [deliverableUri, setDeliverableUri] = useState("ipfs://QmYourDeliverableHash");

  if (isLoading || !quest) {
    return <p className="text-[var(--muted)]">Loading quest #{String(questId)}…</p>;
  }

  const isPoster = address?.toLowerCase() === quest.poster.toLowerCase();
  const isWorker = address?.toLowerCase() === quest.worker.toLowerCase();
  const now = Math.floor(Date.now() / 1000);
  const reviewEnded = quest.reviewDeadline > 0n && now > Number(quest.reviewDeadline);

  async function run(action: () => Promise<unknown>, label: string) {
    if (!isConnected) {
      toast.error("Connect wallet first (sidebar)");
      return;
    }
    try {
      await action();
      toast.success(label);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }



  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/quests" className="text-sm font-medium text-[var(--accent)] hover:underline">
        ← Quest board
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <header className="surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--muted)]">Quest #{String(quest.id)}</p>
                <h1 className="text-2xl font-bold">{quest.title}</h1>
              </div>
              <StatusBadge status={quest.status} />
            </div>
            <p className="mt-3 text-[var(--muted)]">{quest.description}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--muted)]">Reward</dt>
                <dd className="font-medium">{formatReward(quest.reward, quest.isEth)}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Poster</dt>
                <dd className="font-mono">{shortAddress(quest.poster)}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Worker</dt>
                <dd className="font-mono">
                  {quest.worker === "0x0000000000000000000000000000000000000000"
                    ? "Unassigned"
                    : shortAddress(quest.worker)}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Accept by</dt>
                <dd>{format(Number(quest.acceptDeadline) * 1000, "PP p")}</dd>
              </div>
              {quest.reviewDeadline > 0n && (
                <div>
                  <dt className="text-[var(--muted)]">Review by</dt>
                  <dd>{format(Number(quest.reviewDeadline) * 1000, "PP p")}</dd>
                </div>
              )}
              {quest.deliverableUri && (
                <div className="sm:col-span-2">
                  <dt className="text-[var(--muted)]">Deliverable</dt>
                  <dd className="break-all font-mono text-xs">{quest.deliverableUri}</dd>
                </div>
              )}
            </dl>
          </header>

          <section className="surface p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Lifecycle
            </h2>
            <QuestStepper currentStatus={quest.status} />
          </section>
        </div>

        <section className="surface h-fit space-y-4 p-6 lg:sticky lg:top-8">
          <h2 className="font-semibold">Actions</h2>

          {quest.status === 0 && !isPoster && (
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => run(actions.accept, "Quest accepted")}
            >
              Accept quest
            </button>
          )}

          {quest.status === 1 && isWorker && (
            <div className="space-y-2">
              <input
                className="input"
                value={deliverableUri}
                onChange={(e) => setDeliverableUri(e.target.value)}
              />
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => run(() => actions.submit(deliverableUri), "Work submitted")}
              >
                Submit deliverable
              </button>
            </div>
          )}

          {quest.status === 2 && isPoster && (
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => run(actions.approve, "Payment released")}
            >
              Approve & pay worker
            </button>
          )}

          {quest.status === 2 && isWorker && reviewEnded && (
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => run(actions.claimTimeout, "Timeout payout claimed")}
            >
              Claim timeout payout
            </button>
          )}

          {quest.status === 2 && isPoster && reviewEnded && (
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => run(actions.refund, "Poster refunded")}
            >
              Refund after review window
            </button>
          )}

          {quest.status === 0 && isPoster && (
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => run(actions.cancel, "Quest cancelled")}
            >
              Cancel quest (refund)
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
