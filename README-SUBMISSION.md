# Submission Details

- **Name:** Vishal Chaturvedi
- **Email:** vishal.chaturvedi@encoresky.com
- **QuestEscrow Contract Address:** `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`
- **MockUSDC Contract Address:** `0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e`
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
