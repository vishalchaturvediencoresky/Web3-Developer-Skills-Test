"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, zeroAddress } from "viem";
import { QUEST_ESCROW_ADDRESS } from "@/lib/contracts/addresses";
import { questEscrowAbi, QUEST_STATUS_LABELS } from "@/lib/contracts/questEscrowAbi";

type QuestStruct = {
  poster: `0x${string}`;
  worker: `0x${string}`;
  title: string;
  description: string;
  reward: bigint;
  token: `0x${string}`;
  acceptDeadline: bigint;
  reviewPeriod: bigint;
  reviewDeadline: bigint;
  status: number;
  deliverableUri: string;
};

export type QuestView = {
  id: bigint;
  poster: string;
  worker: string;
  title: string;
  description: string;
  reward: bigint;
  token: string;
  acceptDeadline: bigint;
  reviewPeriod: bigint;
  reviewDeadline: bigint;
  status: number;
  statusLabel: (typeof QUEST_STATUS_LABELS)[number];
  deliverableUri: string;
  isEth: boolean;
};

export function useQuestCount() {
  return useReadContract({
    address: QUEST_ESCROW_ADDRESS,
    abi: questEscrowAbi,
    functionName: "questCount",
  });
}

export function useQuest(questId: bigint | undefined) {
  const { data, refetch, isLoading } = useReadContract({
    address: QUEST_ESCROW_ADDRESS,
    abi: questEscrowAbi,
    functionName: "getQuest",
    args: questId !== undefined ? [questId] : undefined,
    query: { enabled: questId !== undefined },
  });

  const row = data as QuestStruct | undefined;
  const quest: QuestView | null =
    row && questId !== undefined
      ? {
        id: questId,
        poster: row.poster,
        worker: row.worker,
        title: row.title,
        description: row.description,
        reward: row.reward,
        token: row.token,
        acceptDeadline: row.acceptDeadline,
        reviewPeriod: row.reviewPeriod,
        reviewDeadline: row.reviewDeadline,
        status: row.status,
        statusLabel: QUEST_STATUS_LABELS[row.status] ?? "Open",
        deliverableUri: row.deliverableUri,
        isEth: row.token.toLowerCase() === zeroAddress,
      }
      : null;

  return { quest, refetch, isLoading };
}

export function useQuestList() {
  const { data: count } = useQuestCount();
  const publicClient = usePublicClient();
  console.log(publicClient, "publicClient")
  const [quests, setQuests] = useState<QuestView[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const total = count as bigint | undefined;
    console.log('total', total, count);

    if (!publicClient || !total || total === 0n) {
      setQuests([]);
      return;
    }

    setLoading(true);
    try {
      const items: QuestView[] = [];
      for (let id = 1n; id <= total; id++) {
        const data = (await publicClient.readContract({
          address: QUEST_ESCROW_ADDRESS,
          abi: questEscrowAbi,
          functionName: "getQuest",
          args: [id],
        })) as QuestStruct;
        items.push({
          id,
          poster: data.poster,
          worker: data.worker,
          title: data.title,
          description: data.description,
          reward: data.reward,
          token: data.token,
          acceptDeadline: data.acceptDeadline,
          reviewPeriod: data.reviewPeriod,
          reviewDeadline: data.reviewDeadline,
          status: data.status,
          statusLabel: QUEST_STATUS_LABELS[data.status] ?? "Open",
          deliverableUri: data.deliverableUri,
          isEth: data.token.toLowerCase() === zeroAddress,
        });
      }
      setQuests(items.reverse());
    } finally {
      setLoading(false);
    }
  }, [publicClient, count]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { quests, loading, refresh };
}

/** Implement write helpers with useWriteContract + useWaitForTransactionReceipt. */
export function useCreateQuest() {
  const { writeContractAsync, data: hash } = useWriteContract();

  const { isLoading: isPending } = useWaitForTransactionReceipt({
    hash,
  });

  const createEthQuest = async ({
    title,
    description,
    rewardEth,
    acceptDeadline,
    reviewPeriodHours,
  }: {
    title: string;
    description: string;
    rewardEth: string;
    acceptDeadline: Date;
    reviewPeriodHours: number;
  }) => {
    const reward = parseEther(rewardEth);
    return writeContractAsync({
      address: QUEST_ESCROW_ADDRESS,
      abi: questEscrowAbi,
      functionName: "createQuest",
      args: [
        title,
        description,
        reward,
        BigInt(Math.floor(acceptDeadline.getTime() / 1000)),
        BigInt(reviewPeriodHours * 60 * 60),
        zeroAddress,
      ],
      value: reward,
    });
  };

  return {
    createEthQuest,
    isPending,
  };
}

export function useQuestActions(questId: bigint) {
  const { writeContractAsync, data: hash } = useWriteContract();

  const { isLoading: isPending } = useWaitForTransactionReceipt({
    hash,
  });

  const accept = async () => {
    return writeContractAsync({
      address: QUEST_ESCROW_ADDRESS,
      abi: questEscrowAbi,
      functionName: "acceptQuest",
      args: [questId],
    });
  };

  const submit = async (deliverableUri: string) => {
    return writeContractAsync({
      address: QUEST_ESCROW_ADDRESS,
      abi: questEscrowAbi,
      functionName: "submitWork",
      args: [questId, deliverableUri],
    });
  };

  const approve = async () => {
    return writeContractAsync({
      address: QUEST_ESCROW_ADDRESS,
      abi: questEscrowAbi,
      functionName: "approveAndPay",
      args: [questId],
    });
  };

  const claimTimeout = async () => {
    return writeContractAsync({
      address: QUEST_ESCROW_ADDRESS,
      abi: questEscrowAbi,
      functionName: "claimTimeoutPayout",
      args: [questId],
    });
  };

  const cancel = async () => {
    return writeContractAsync({
      address: QUEST_ESCROW_ADDRESS,
      abi: questEscrowAbi,
      functionName: "cancelQuest",
      args: [questId],
    });
  };

  const refund = async () => {
    return writeContractAsync({
      address: QUEST_ESCROW_ADDRESS,
      abi: questEscrowAbi,
      functionName: "refundPoster",
      args: [questId],
    });
  };

  return { accept, submit, approve, claimTimeout, cancel, refund, isPending };
}
