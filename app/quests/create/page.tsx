"use client";

import { FormEvent, useState } from "react";
import { useAccount } from "wagmi";
import { useCreateQuest } from "@/lib/hooks/useQuestEscrow";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

export default function CreateQuestPage() {
  const { isConnected } = useAccount();
  const { createEthQuest, isPending } = useCreateQuest();
  const [title, setTitle] = useState("Fix wallet connect flow");
  const [description, setDescription] = useState(
    "Implement RainbowKit + wagmi write hooks for createQuest."
  );
  const [rewardEth, setRewardEth] = useState("0.1");
  const [acceptHours, setAcceptHours] = useState("24");
  const [reviewHours, setReviewHours] = useState("2");

  const acceptDeadline = new Date(Date.now() + Number(acceptHours) * 3600 * 1000);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Connect your Web3 wallet first (sidebar)");
      return;
    }
    try {
      await createEthQuest({
        title,
        description,
        rewardEth,
        acceptDeadline,
        reviewPeriodHours: Number(reviewHours),
      });
      toast.success("Quest created — check the board");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transaction failed");
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Post a quest</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Quest details will be written on-chain to the escrow contract.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={onSubmit} className="surface space-y-4 p-6 lg:col-span-2">
          <label className="block space-y-1 text-sm font-medium">
            Title
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="block space-y-1 text-sm font-medium">
            Description
            <textarea
              className="input min-h-[96px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
          <label className="block space-y-1 text-sm font-medium">
            Reward (ETH)
            <input
              className="input"
              value={rewardEth}
              onChange={(e) => setRewardEth(e.target.value)}
              required
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1 text-sm font-medium">
              Accept window (hours)
              <input
                className="input"
                type="number"
                min={1}
                value={acceptHours}
                onChange={(e) => setAcceptHours(e.target.value)}
              />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Review period (hours)
              <input
                className="input"
                type="number"
                min={1}
                value={reviewHours}
                onChange={(e) => setReviewHours(e.target.value)}
              />
            </label>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isPending || !isConnected}>
            {isPending ? "Confirm in wallet…" : "Create quest on-chain"}
          </button>
        </form>

        <aside className="surface h-fit space-y-4 p-6 lg:sticky lg:top-8">
          <h2 className="font-semibold">Summary</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[var(--muted)]">Title</dt>
              <dd className="font-medium">{title || "—"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Reward</dt>
              <dd className="font-medium">{rewardEth} ETH</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Accept by</dt>
              <dd>{format(acceptDeadline, "PPp")}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Review period</dt>
              <dd>{reviewHours} hours</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Payment</dt>
              <dd>ETH (native)</dd>
            </div>
          </dl>
          {!isConnected && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Connect wallet in the sidebar before submitting.
            </p>
          )}
        </aside>
      </div>

      <Link href="/quests" className="text-sm font-medium text-[var(--accent)] hover:underline">
        ← Back to board
      </Link>
    </div>
  );
}
