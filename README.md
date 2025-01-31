# Appkit-stake-sol on Solana

Demo link: [https://appkit-six.vercel.app/](https://appkit-six.vercel.app/)

Backup repo: [github.com/Afoxcute/appkit-stake-sol](https://github.com/Afoxcute/appkit-stake-sol)

This is a decentralized Staking & vesting dapp built on the Solana Devnet network. The application allows users to stake and vest SOL all while ensuring transparency and fairness through blockchain technology.

## Table of Contents

- [Getting Started](#getting-started)
- [Features](#features)
- [Architecture](#architecture)
- [Team Information](#team-information)
- [License](#license)

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/appkit-stake-sol.git
   cd appkit-stake-sol
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser to see the application.

## Features

- **Dashboard Page**: Provides an overview of the Stakes, market details of Sol.
- **Vest Tab**: 
  - **Vest SOL**: Users can vest SOL using the Vesting page.
- **Stake Tab**: 
  - **Stake SOL**: Users can stake SOL using the Staking page.

## Architecture

The application is structured as follows:

- **Frontend**: Built with React.js, utilizing React for the UI and Reown Appkit for Solana Devnet interactions.
- **Blockchain**: All account states and transactions are recorded on the Solana Devnet network.

### Key Components

- **Frontend Pages**: 
  - `src/pages/Dashboard/dashboard.jsx`: Dashboard page.
  - `src/pages/staking/staking.jsx`: Staking page.
  - `src/pages/vesting/vesting.jsx`: Displays Vesting page.
 PS: There are other pages, But above are the important ones.
  
- **Components**: 
  - `src/components/Dashboard`: Contains all the components of the Dashboard page.
  - `src/components/Staking`: Contains all the components of the Staking page.
  - `src/components/Vesting`: Contains all the components of the Vesting page.
 PS: There are other components, But above are the important ones.



