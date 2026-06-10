# EscrowDesk — Web3 engineer home task

**Time:** ~2–3 hours  
**Build:** `QuestEscrow.sol` + wallet-connected dashboard UI at **http://localhost:3000**

This is the **EscrowDesk** UI variant: sidebar navigation, dashboard home, table quest board, and lifecycle stepper on quest detail. Assessment requirements (contract, tests, routes) match the ChainQuest task.

---

## Setup

```bash
npm install
npm install --prefix contracts
```

---

## Part A — Contract

1. Implement **`contracts/contracts/QuestEscrow.sol`** (replace stubs).
2. Run tests:

```bash
npm run test
# or: cd contracts && npx hardhat test
```

All **9 scenarios (A–I)** in `QuestEscrow.assessment.test.ts` must pass.

**Rules:** 3% fee (`FEE_BPS = 300`); ETH when `token == address(0)`; match revert strings in tests exactly.

| ID | Checks |
| --- | --- |
| A | ETH: accept → submit → approve; worker gets 97% |
| B | Owner withdraws fees |
| C | No accept after deadline |
| D | Only poster approves |
| E | No approve before submit |
| F | ERC20 path |
| G | Cancel + refund |
| H | Worker timeout payout |
| I | Poster refund after review |

---

## Part B — UI + wallet

**Terminal 1:** `npm run contracts:node`  
**Terminal 2:** `npm run contracts:deploy` → copy addresses to `.env.local` (see `.env.example`)  
**Terminal 3:** `npm run dev` → open **http://localhost:3000**

MetaMask: chain **31337**, RPC `http://127.0.0.1:8545`, import two Hardhat accounts.

Connect your wallet via **Connect Wallet** in the **sidebar** (bottom of the left panel).

Implement **`lib/hooks/useQuestEscrow.ts`** (`useCreateQuest`, `useQuestActions`) with `useWriteContract` + `useWaitForTransactionReceipt`.

---

## Part C — UI checklist (required)

| Step | Account | Confirm |
| --- | --- | --- |
| 1 | A | Wallet connected in **sidebar** |
| 2 | A | Create quest on `/quests/create` (two-column form + summary panel) |
| 3 | A | Quest visible on `/quests` table (Open status) |
| 4 | B | Accept on `/quests/[id]` (action panel on the right) |
| 5 | B | Submit deliverable |
| 6 | A | Approve & pay → Completed (lifecycle stepper shows Completed) |
| 7 | B | Balance ≈ 97% of reward |

---

## Submit

- [ ] All tests pass
- [ ] Part C done on localhost:3000
- [ ] **GitHub URL** to your completed task repository (fork or your own repo with your implementation)
- [ ] **Screenshots** of successful UI results with wallet connected in the **sidebar**: dashboard or quest board table (`assets/board.png`), quest detail with stepper and actions (`assets/detail-stepper.png`), completed payout — include under `assets/`
- [ ] `README-SUBMISSION.md` (name, email, contract address, how to run, GitHub repo URL; screenshots in `assets/`)