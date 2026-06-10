# Submission Details

- **Name:** Vishal Chaturvedi
- **Email:** vishal.chaturvedi@encoresky.com
- **QuestEscrow Contract Address:** `0xa513E6E4b8f2a923D98304ec87F64353C4D5C853`
- **MockUSDC Contract Address:** `0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6`
- **GitHub Repository URL:** `https://github.com/vishalchaturvediencoresky/Web3-Developer-Skills-Test.git`

## How to Run

1. **Install Dependencies:**
   ```bash
   npm install
   npm install --prefix contracts
   ```

2. **Start Local Hardhat Node:**
   ```bash
   npm run contracts:node
   ```

3. **Deploy Contracts:**
   ```bash
   npm run contracts:deploy
   ```
   *Note: This will deploy the escrow contract and the mock USDC token to configure in your `.env`.*

4. **Start Web Application:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

## Verification & Screenshots
All Part A unit tests pass successfully.
Please include your screenshot files under the `assets/` directory:
- `assets/board.png` (Dashboard or quest board table)
- `assets/detail-stepper.png` (Quest detail with stepper and actions)
