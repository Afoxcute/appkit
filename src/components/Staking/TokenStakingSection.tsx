// import React, { useCallback, useEffect, useState } from "react";
// import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
// import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
// import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
// import type { Provider } from '@reown/appkit';
// import Button from "../Button";
// import StatItem from "../StatItem";
// import PlusMinusButton from "./PlusMinusButton";

// const TokenStakingSection = () => {
//   // State variables
//   const [solBalance, setSolBalance] = useState(0);
//   const [stakeAmount, setStakeAmount] = useState(0);
//   const [stakedAmount, setStakedAmount] = useState(0);
//   const [rewards, setRewards] = useState(0);
//   const [stakingStartTime, setStakingStartTime] = useState(0);
//   const [lastClaimTime, setLastClaimTime] = useState(0);
//   const [isStaking, setIsStaking] = useState(false);
//   const [isUnstaking, setIsUnstaking] = useState(false);
//   const [isClaiming, setIsClaiming] = useState(false);

//   // Constants
//   const STAKE_WALLET_ADDRESS = "5KyiTnuXdPXSaApMb9MkoRs2fJhJVUphoBr5MqU4JYcB";
//   const APY = 40; // 40% APY
//   const MINIMUM_STAKING_PERIOD = 24 * 60 * 60; // 24 hours in seconds
//   const CLAIM_COOLDOWN = 24 * 60 * 60; // 24 hours cooldown

//   // Hooks
//   const { isConnected, address } = useAppKitAccount();
//   const { connection } = useAppKitConnection();
//   const { walletProvider } = useAppKitProvider<Provider & { sendTransaction: (transaction: Transaction, connection: any) => Promise<string> }>('solana');

//   // Fetch SOL balance
//   const fetchSolBalance = useCallback(async () => {
//     if (!isConnected || !address || !connection) return;

//     try {
//       const wallet = new PublicKey(address);
//       const balance = await connection.getBalance(wallet);
//       setSolBalance(balance / LAMPORTS_PER_SOL);
//     } catch (error) {
//       console.error("Error fetching SOL balance:", error);
//     }
//   }, [connection, isConnected, address]);

//   // Auto-fetch balance
//   useEffect(() => {
//     fetchSolBalance();
//     const intervalId = setInterval(fetchSolBalance, 30000);
//     return () => clearInterval(intervalId);
//   }, [fetchSolBalance]);

//   // Calculate rewards
//   useEffect(() => {
//     if (stakedAmount <= 0 || stakingStartTime <= 0) {
//       setRewards(0);
//       return;
//     }

//     const intervalId = setInterval(() => {
//       const currentTime = Math.floor(Date.now() / 1000);
//       const timeElapsed = currentTime - stakingStartTime;
//       const annualSeconds = 365 * 24 * 3600;
//       const rewardAmount = (stakedAmount * APY * timeElapsed) / (100 * annualSeconds);
//       setRewards(parseFloat(rewardAmount.toFixed(5)));
//     }, 1000);

//     return () => clearInterval(intervalId);
//   }, [stakedAmount, stakingStartTime]);

//   // Utility functions
//   const canUnstake = () => {
//     const currentTime = Math.floor(Date.now() / 1000);
//     return currentTime - stakingStartTime >= MINIMUM_STAKING_PERIOD;
//   };

//   const canClaim = () => {
//     if (rewards <= 0) return false;
//     const currentTime = Math.floor(Date.now() / 1000);
//     return currentTime - lastClaimTime >= CLAIM_COOLDOWN;
//   };

//   // Transaction handlers
//   const handleStake = async () => {
//     if (!isConnected || !address || stakeAmount <= 0) return;

//     try {
//       if (!connection) return;
      
//       setIsStaking(true);
//       const wallet = new PublicKey(address);
//       const stakingWallet = new PublicKey(STAKE_WALLET_ADDRESS);
//       const lamports = stakeAmount * LAMPORTS_PER_SOL;

//       const latestBlockhash = await connection.getLatestBlockhash();
//       const transaction = new Transaction({
//         feePayer: wallet,
//         recentBlockhash: latestBlockhash.blockhash,
//       }).add(
//         SystemProgram.transfer({
//           fromPubkey: wallet,
//           toPubkey: stakingWallet,
//           lamports,
//         })
//       );

//       const signature = await walletProvider.sendTransaction(transaction, connection);
//       console.log("Stake Transaction Signature:", signature);

//       setStakedAmount((prev) => prev + stakeAmount);
//       setStakingStartTime(Math.floor(Date.now() / 1000));
//       await fetchSolBalance();
//       setStakeAmount(0);
      
//       alert("Stake successful!");
//     } catch (error) {
//       console.error("Staking error:", error);
//       alert("Failed to stake. Please try again.");
//     } finally {
//       setIsStaking(false);
//     }
//   };

//   const handleUnstake = async () => {
//     if (!isConnected || !address || stakedAmount <= 0) return;
    
//     if (!canUnstake()) {
//       const hoursLeft = Math.ceil((MINIMUM_STAKING_PERIOD - (Math.floor(Date.now() / 1000) - stakingStartTime)) / 3600);
//       alert(`Cannot unstake yet. Please wait ${hoursLeft} more hours.`);
//       return;
//     }

//     try {
//       setIsUnstaking(true);
//       const wallet = new PublicKey(address);
//       const totalUnstakeAmount = stakedAmount + rewards;
//       const lamports = Math.floor(totalUnstakeAmount * LAMPORTS_PER_SOL);

//       const latestBlockhash = await connection.getLatestBlockhash();
//       const transaction = new Transaction({
//         feePayer: new PublicKey(STAKE_WALLET_ADDRESS),
//         recentBlockhash: latestBlockhash.blockhash,
//       }).add(
//         SystemProgram.transfer({
//           fromPubkey: new PublicKey(STAKE_WALLET_ADDRESS),
//           toPubkey: wallet,
//           lamports,
//         })
//       );

//       const signature = await walletProvider.sendTransaction(transaction, connection);
//       console.log("Unstake Transaction Signature:", signature);

//       setStakedAmount(0);
//       setStakingStartTime(0);
//       setRewards(0);
//       await fetchSolBalance();
      
//       alert("Unstake successful!");
//     } catch (error) {
//       console.error("Unstaking error:", error);
//       alert("Failed to unstake. Please try again.");
//     } finally {
//       setIsUnstaking(false);
//     }
//   };

//   const handleClaim = async () => {
//     if (!isConnected || !address || rewards <= 0 || !connection) return;

//     if (!canClaim()) {
//       const hoursLeft = Math.ceil((CLAIM_COOLDOWN - (Math.floor(Date.now() / 1000) - lastClaimTime)) / 3600);
//       alert(`Cannot claim yet. Please wait ${hoursLeft} more hours.`);
//       return;
//     }

//     try {
//       setIsClaiming(true);
//       const wallet = new PublicKey(address);
//       const lamports = Math.floor(rewards * LAMPORTS_PER_SOL);

//       const latestBlockhash = await connection.getLatestBlockhash();
//       const transaction = new Transaction({
//         feePayer: new PublicKey(STAKE_WALLET_ADDRESS),
//         recentBlockhash: latestBlockhash.blockhash,
//       }).add(
//         SystemProgram.transfer({
//           fromPubkey: new PublicKey(STAKE_WALLET_ADDRESS),
//           toPubkey: wallet,
//           lamports,
//         })
//       );

//       const signature = await walletProvider.sendTransaction(transaction, connection);
//       console.log("Claim Transaction Signature:", signature);

//       setLastClaimTime(Math.floor(Date.now() / 1000));
//       setRewards(0);
//       await fetchSolBalance();
      
//       alert(`Successfully claimed ${rewards.toFixed(5)} SOL!`);
//     } catch (error) {
//       console.error("Claiming error:", error);
//       alert("Failed to claim rewards. Please try again.");
//     } finally {
//       setIsClaiming(false);
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
//       <div className="w-full flex flex-col gap-3 dark:bg-lightBrown bg-white shadow-custom rounded-xl p-4 dark:text-white text-title-light">
//         {/* Header */}
//         <div className="flex flex-row items-center justify-start my-6 dark:text-white text-title-light gap-4">
//           <img className="w-14 hidden dark:flex" alt="" src="/icons/logo1.svg" />
//           <img className="w-14 dark:hidden flex" alt="" src="/icons/logo1-light.svg" />
//           <h1 className="text-2xl font-semibold">SOL Staking</h1>
//         </div>

//         {/* Main Content */}
//         <div className="flex justify-between">
//           {/* Staking Section */}
//           <div className="w-2/5 flex flex-col gap-6">
//             <p>Available SOL Balance</p>
//             <div className="flex flex-row justify-between">
//               <p>{solBalance.toFixed(4)} SOL</p>
//               <button
//                 onClick={() => setStakeAmount(solBalance)}
//                 className="underline text-[#FB9037]"
//               >
//                 Max
//               </button>
//             </div>

//             <div className="flex flex-row justify-between items-center gap-x-1">
//               <PlusMinusButton
//                 value="-"
//                 onClick={() => setStakeAmount((prev) => Math.max(prev - 1, 0))} className={undefined}              />
//               <input
//                 type="number"
//                 value={stakeAmount}
//                 min={0}
//                 max={solBalance}
//                 onChange={(e) => {
//                   const value = parseFloat(e.target.value);
//                   setStakeAmount(value >= 0 ? Math.min(value, solBalance) : 0);
//                 }}
//                 className="w-24 grow h-12 text-center bg-transparent rounded border-2 border-[#9D8B70]"
//               />
//               <PlusMinusButton
//                 value="+"
//                 onClick={() => setStakeAmount((prev) => Math.min(prev + 1, solBalance))} className={undefined}              />
//             </div>

//             <div className="h-11">
//               <Button
//                 text={isStaking ? "Staking..." : "Stake"}
//                 onClick={handleStake}
//                 disabled={!isConnected || stakeAmount <= 0 || isStaking || stakeAmount > solBalance} variant={undefined} iconSrc={undefined} className={undefined}              />
//             </div>
//           </div>

//           {/* Unstaking Section */}
//           <div className="w-2/5 flex flex-col gap-6">
//             <p>Total Staked</p>
//             <div className="flex flex-row justify-between">
//               <p>{stakedAmount.toFixed(4)} SOL</p>
//             </div>

//             <div className="h-11">
//               <Button
//                 text={isUnstaking ? "Unstaking..." : "Unstake"}
//                 onClick={handleUnstake}
//                 disabled={!isConnected || stakedAmount <= 0 || isUnstaking || !canUnstake()} variant={undefined} iconSrc={undefined} className={undefined}              />
//             </div>

//             {stakingStartTime > 0 && !canUnstake() && (
//               <p className="text-sm text-red-500">
//                 Unstaking available in {Math.ceil((MINIMUM_STAKING_PERIOD - (Math.floor(Date.now() / 1000) - stakingStartTime)) / 3600)} hours
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Rewards Section */}
//         <div className="flex justify-between items-center">
//           <div className="flex flex-col gap-2">
//             <p>Pending Rewards: {rewards.toFixed(5)} SOL</p>
//             {lastClaimTime > 0 && !canClaim() && (
//               <p className="text-sm text-yellow-500">
//                 Next claim available in {Math.ceil((CLAIM_COOLDOWN - (Math.floor(Date.now() / 1000) - lastClaimTime)) / 3600)} hours
//               </p>
//             )}
//           </div>

//           <div className="w-24 h-11">
//             <Button
//               text={isClaiming ? "Claiming..." : "Claim"}
//               iconSrc="/icons/download.svg"
//               className="px-10"
//               onClick={handleClaim}
//               disabled={!isConnected || rewards <= 0 || isClaiming || !canClaim()} variant={undefined}            />
//           </div>
//         </div>

//         {/* Statistics */}
//         <div className="grid grid-cols-2 gap-4 mt-6">
//           <StatItem
//             title="APY"
//             value={`${APY}%`} iconDark={undefined} iconLight={undefined} info={undefined}          />
//           <StatItem
//             title="Total Value"
//             value={`${(stakedAmount + rewards).toFixed(5)} SOL`} iconDark={undefined} iconLight={undefined} info={undefined}          />
//           <StatItem
//             title="Staking Start Time"
//             value={stakingStartTime > 0 ? new Date(stakingStartTime * 1000).toLocaleString() : 'Not staking'} iconDark={undefined} iconLight={undefined} info={undefined}          />
//           <StatItem
//             title="Last Claim Time"
//             value={lastClaimTime > 0 ? new Date(lastClaimTime * 1000).toLocaleString() : 'No claims yet'} iconDark={undefined} iconLight={undefined} info={undefined}          />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TokenStakingSection;

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import type { Provider } from '@reown/appkit';

import Button from "../Button";
import StatItem from "../StatItem";
import PlusMinusButton from "./PlusMinusButton";
import StakingSummaryItem from "./StakingSummaryItem";

const TokenStakingSection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
    const [solBalance, setSolBalance] = useState(0);

  const [totalStaking] = useState(250000);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [totalStaked] = useState(0);
  const [setimatedAward] = useState(150);
  const [price] = useState(0.0001);
  const [rewards, setRewards] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [userAta_balance, setUserAta_balance] = useState(0);
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
    const [stakingStartTime, setStakingStartTime] = useState(0);
        // const [solBalance, setSolBalance] = useState(0);

  const [lastClaimTime, setLastClaimTime] = useState(0);


  // Constants
  const STAKE_WALLET_ADDRESS = "5KyiTnuXdPXSaApMb9MkoRs2fJhJVUphoBr5MqU4JYcB";
  const APY = 40; // 40% APY
  const MINIMUM_STAKING_PERIOD = 24 * 60 * 60; // 24 hours in seconds
  const CLAIM_COOLDOWN = 24 * 60 * 60; // 24 hours cooldown

  // Hooks




  const { isConnected, address } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider & { sendTransaction: (transaction: Transaction, connection: any) => Promise<string> }>('solana');

  // ... your existing functionality code ...

    // Fetch SOL balance
  const fetchSolBalance = useCallback(async () => {
    if (!isConnected || !address || !connection) return;

    try {
      const wallet = new PublicKey(address);
      const balance = await connection.getBalance(wallet);
      setSolBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching SOL balance:", error);
    }
  }, [connection, isConnected, address]);

  // Auto-fetch balance
  useEffect(() => {
    fetchSolBalance();
    const intervalId = setInterval(fetchSolBalance, 30000);
    return () => clearInterval(intervalId);
  }, [fetchSolBalance]);

  // Calculate rewards
  useEffect(() => {
    if (stakedAmount <= 0 || stakingStartTime <= 0) {
      setRewards(0);
      return;
    }

    const intervalId = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeElapsed = currentTime - stakingStartTime;
      const annualSeconds = 365 * 24 * 3600;
      const rewardAmount = (stakedAmount * APY * timeElapsed) / (100 * annualSeconds);
      setRewards(parseFloat(rewardAmount.toFixed(5)));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [stakedAmount, stakingStartTime]);

  // Utility functions
  const canUnstake = () => {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime - stakingStartTime >= MINIMUM_STAKING_PERIOD;
  };

  const canClaim = () => {
    if (rewards <= 0) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime - lastClaimTime >= CLAIM_COOLDOWN;
  };

  // Transaction handlers
  const handleStake = async () => {
    if (!isConnected || !address || stakeAmount <= 0) return;

    try {
      if (!connection) return;
      
      setIsStaking(true);
      const wallet = new PublicKey(address);
      const stakingWallet = new PublicKey(STAKE_WALLET_ADDRESS);
      const lamports = stakeAmount * LAMPORTS_PER_SOL;

      const latestBlockhash = await connection.getLatestBlockhash();
      const transaction = new Transaction({
        feePayer: wallet,
        recentBlockhash: latestBlockhash.blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: wallet,
          toPubkey: stakingWallet,
          lamports,
        })
      );

      const signature = await walletProvider.sendTransaction(transaction, connection);
      console.log("Stake Transaction Signature:", signature);

      setStakedAmount((prev) => prev + stakeAmount);
      setStakingStartTime(Math.floor(Date.now() / 1000));
      await fetchSolBalance();
      setStakeAmount(0);
      
      alert("Stake successful!");
    } catch (error) {
      console.error("Staking error:", error);
      alert("Failed to stake. Please try again.");
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!isConnected || !address || stakedAmount <= 0) return;
    
    if (!canUnstake()) {
      const hoursLeft = Math.ceil((MINIMUM_STAKING_PERIOD - (Math.floor(Date.now() / 1000) - stakingStartTime)) / 3600);
      alert(`Cannot unstake yet. Please wait ${hoursLeft} more hours.`);
      return;
    }

    try {
      setIsUnstaking(true);
      const wallet = new PublicKey(address);
      const totalUnstakeAmount = stakedAmount + rewards;
      const lamports = Math.floor(totalUnstakeAmount * LAMPORTS_PER_SOL);

      const latestBlockhash = await connection.getLatestBlockhash();
      const transaction = new Transaction({
        feePayer: new PublicKey(STAKE_WALLET_ADDRESS),
        recentBlockhash: latestBlockhash.blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(STAKE_WALLET_ADDRESS),
          toPubkey: wallet,
          lamports,
        })
      );

      const signature = await walletProvider.sendTransaction(transaction, connection);
      console.log("Unstake Transaction Signature:", signature);

      setStakedAmount(0);
      setStakingStartTime(0);
      setRewards(0);
      await fetchSolBalance();
      
      alert("Unstake successful!");
    } catch (error) {
      console.error("Unstaking error:", error);
      alert("Failed to unstake. Please try again.");
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaim = async () => {
    if (!isConnected || !address || rewards <= 0 || !connection) return;

    if (!canClaim()) {
      const hoursLeft = Math.ceil((CLAIM_COOLDOWN - (Math.floor(Date.now() / 1000) - lastClaimTime)) / 3600);
      alert(`Cannot claim yet. Please wait ${hoursLeft} more hours.`);
      return;
    }

    try {
      setIsClaiming(true);
      const wallet = new PublicKey(address);
      const lamports = Math.floor(rewards * LAMPORTS_PER_SOL);

      const latestBlockhash = await connection.getLatestBlockhash();
      const transaction = new Transaction({
        feePayer: new PublicKey(STAKE_WALLET_ADDRESS),
        recentBlockhash: latestBlockhash.blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(STAKE_WALLET_ADDRESS),
          toPubkey: wallet,
          lamports,
        })
      );

      const signature = await walletProvider.sendTransaction(transaction, connection);
      console.log("Claim Transaction Signature:", signature);

      setLastClaimTime(Math.floor(Date.now() / 1000));
      setRewards(0);
      await fetchSolBalance();
      
      alert(`Successfully claimed ${rewards.toFixed(5)} SOL!`);
    } catch (error) {
      console.error("Claiming error:", error);
      alert("Failed to claim rewards. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="w-full flex flex-col gap-3 dark:bg-lightBrown bg-white shadow-custom rounded-xl p-4 dark:text-white text-title-light ">
        <div className="flex flex-row items-center justify-start my-6 dark:text-white text-title-light gap-4">
          <img
            className="w-14 hidden dark:flex"
            alt=""
            src="/icons/logo1.svg"
          />
          <img
            className="w-14 dark:hidden flex"
            alt=""
            src="/icons/logo1-light.svg"
          />
          <h1 className="text-2xl font-semibold">Appkit Staking</h1>
        </div>

        <div className="flex justify-between">
          <div className="w-2/5 flex flex-col gap-6 ">
            <p>Available In Wallet</p>
            <div className="flex flex-row justify-between">
              <p>{solBalance}</p>
              <button
                onClick={() => setStakeAmount(solBalance)}
                className="underline text-[#FB9037]"
              >
                Max
              </button>
            </div>

            <div className="flex flex-row justify-between items-center gap-x-1">
              <PlusMinusButton
                value="-"
                onClick={() => setStakeAmount((prev) => Math.max(prev - 1, 0))}
                className=""
              />
              <input
                type="number"
                value={stakeAmount}
                min={0}
                onChange={(e) => setStakeAmount(parseInt(e.target.value))}
                className="w-24 grow h-12 text-center bg-transparent rounded border-2 border-[#9D8B70]"
              />
              <PlusMinusButton
                value="+"
                onClick={() => setStakeAmount((prev) => Math.min(prev + 1, totalStaking))}
                className=""
              />
            </div>

            <div className="h-11">
              <Button
                text={isStaking ? "Staking..." : "Stake"}
                onClick={handleStake}
                variant={undefined}
                iconSrc={undefined}
                className={undefined}
                disabled={!isConnected || stakeAmount <= 0 || isStaking}
              />
            </div>
          </div>

          <div className="w-2/5 flex flex-col gap-6 ">
            <p>Total Staked</p>
            <div className="flex flex-row justify-between">
              <p>{stakedAmount}</p>
            </div>

            <div className="h-11">
              <Button
                text={isUnstaking ? "Unstaking..." : "Unstake"}
                disabled={!isConnected || stakedAmount <= 0 || isUnstaking}
                onClick={handleUnstake}
                variant={undefined}
                iconSrc={undefined}
                className={undefined}
              />
            </div>
            {/* <div className="h-11">
              <Button
                text="Compound"
                className="px-10"
                onClick={handleCompound}
                variant={undefined}
                iconSrc={undefined}
                disabled={!isConnected || stakedAmount <= 0}
              />
            </div> */}
          </div>
        </div>

        <div className="flex justify-between items-center ">
          <p>Pending Rewards: {rewards}</p>
          <div className="w-24 h-11">
            <Button
              text={isClaiming ? "Claiming..." : "Claim"}
              iconSrc="/icons/download.svg"
              className="px-10"
              onClick={handleClaim}
              variant={undefined}
              disabled={!isConnected || rewards <= 0 || isClaiming}
            />
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
          <div className="w-full">
            <StatItem
              value={`${totalStaking} SOL`}
              title="Total Staking"
              info="/icons/info.svg"
              iconDark={undefined}
              iconLight={undefined}
            />
          </div>
          <div className="w-full">
            <StatItem
              value={`${setimatedAward}% APR`}
              title="Estimated Award"
              info="/icons/info.svg"
              iconDark={undefined}
              iconLight={undefined}
            />
          </div>
        </div>

        <div className="w-full h-full flex flex-col gap-3 dark:bg-lightBrown bg-white shadow-custom rounded-xl p-6 ">
          <h2 className="font-semibold pb-6 dark:text-white text-title-light">
            Staking Summary
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <StakingSummaryItem title="SOL Price" value={`$${price}`} icon={undefined} info={undefined} />
            <StakingSummaryItem
              title="Daily Rewards"
              value={`$${price}`}
              info={true} icon={undefined}            />
            <StakingSummaryItem
              title="Total Supply"
              value={`$${price}`}
              info={true} icon={undefined}            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenStakingSection;