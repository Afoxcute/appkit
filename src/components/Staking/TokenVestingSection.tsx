import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useSearchParams } from "react-router-dom";

import * as anchor from "@project-serum/anchor";
import * as token from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

import {
  claim_vesting,
  getMyVestedAndReward,
  getTokenFromType,
  unvest,
  vest,
} from "../../contracts/TokenVesting/web3_vesting";
import Button from "../Button";
import StatItem from "../StatItem";
import PlusMinusButton from "./PlusMinusButton";
import StakingSummaryItem from "./StakingSummaryItem";
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import type { Provider } from '@reown/appkit';
import { PublicKey } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";


const TokenVestingSection = () => {
      const [solBalance, setSolBalance] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalVesting, setTotalVesting] = useState(250000);
  const [vestAmount, setVestAmount] = useState(0);
  const [vestedAmount, setVestedAmount] = useState(0);
    const [isVesting, setIsVesting] = useState(false);
  
  const [totalVested, setTotalVested] = useState(0);
  const [setimatedAward, setEstimatedAward] = useState(15);
  const [dailyReward, setDailyReward] = useState(0.15);
  const [tokenprice, setTokenPrice] = useState(0.0001);
  const [totalSupply, setTotalSupply] = useState(1000000);
  const [unVestAmount, setUnVestAmount] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
      const [vestingStartTime, setVestingStartTime] = useState(0);
        const [isUnvesting, setIsUnvesting] = useState(false);
          const [price] = useState(0.0001);
        
      
  
  const APY = 15;

  const SOLANA_HOST = "https://mainnet.helius-rpc.com/?api-key=ad83cc9c-52a4-4ad4-8b6e-d96fd392c9d5";//clusterApiUrl("devnet");
  // const connection = new anchor.web3.Connection(SOLANA_HOST);
  const STAKE_WALLET_ADDRESS = "5KyiTnuXdPXSaApMb9MkoRs2fJhJVUphoBr5MqU4JYcB";
  const MINIMUM_STAKING_PERIOD = 24 * 60 * 60; // 24 hours in seconds



  // const wallet = useWallet();

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

  const tokenMint = useMemo(() => {
    return getTokenFromType("FRENS");
  }, ["FRENS"]);

  // const getReward = async () => {
  //   const [amount, reward_amount] = await getMyVestedAndReward(
  //     wallet,
  //     tokenMint
  //   );
  //   setVestedAmount(amount);
  //   setRewards(reward_amount);
  // };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchBalance();
  //     getReward();
  //   }, 2000);

  //   return () => clearInterval(interval);
  // });

  // useEffect(() => {
  //   setTimeout(() => {
  //     console.log("timer");
  //     // fetchBalance();
  //     // getReward();
  //   }, 1000);
  // }, []);

  // const fetchBalance = useCallback(async () => {
  //   try {
  //     const balance1 = await connection.getBalance(wallet.publicKey);
  //     const mint = tokenMint;
  //     const userAta = await token.getOrCreateAssociatedTokenAccount(
  //       connection,
  //       wallet,
  //       mint,
  //       wallet.publicKey,
  //       false
  //     );
  //     const userAta_balance = parseInt(userAta.amount) / LAMPORTS_PER_SOL;
  //     setWalletBalance(userAta_balance);
  //   } catch (error) {
  //     // Handle errors appropriately
  //     console.error("Error fetching balance:", error);
  //   }
  // }, [connection, wallet]);

  // useEffect(() => {
  //   fetchBalance();
  //   getReward();
  // }, [connection, wallet]);

  // const onVest = async () => {
  //   let referral = getRef();
  //   if (referral === null) referral = wallet.publicKey.toString();
  //   try {
  //     let txHash = await vest(wallet, vestAmount, tokenMint, referral);
  //     console.log("txHash:", txHash);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // const onUnvest = async () => {
  //   let referral = getRef();
  //   if (referral === null) referral = wallet.publicKey.toString();
  //   try {
  //     await unvest(
  //       wallet,
  //       vestedAmount + (vestedAmount * APY) / 100,
  //       tokenMint,
  //       referral
  //     );
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // const onClaim = async () => {
  //   try {
  //     await claim_vesting(wallet, tokenMint);
  //     setDataUpdate(!dataUpdate);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  const getRef = () => {
    const ref = searchParams.get("ref");
    return ref;
  };

   // Utility functions
   const canUnvest = () => {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime - vestingStartTime >= MINIMUM_STAKING_PERIOD;
  };

    // Transaction handlers
    const handleVest = async () => {
      if (!isConnected || !address || vestAmount <= 0) return;
  
      try {
        if (!connection) return;
        
        setIsVesting(true);
        const wallet = new PublicKey(address);
        const vestingWallet = new PublicKey(STAKE_WALLET_ADDRESS);
        const lamports = vestAmount * LAMPORTS_PER_SOL;
  
        const latestBlockhash = await connection.getLatestBlockhash();
        const transaction = new Transaction({
          feePayer: wallet,
          recentBlockhash: latestBlockhash.blockhash,
        }).add(
          SystemProgram.transfer({
            fromPubkey: wallet,
            toPubkey: vestingWallet,
            lamports,
          })
        );
  
        const signature = await walletProvider.sendTransaction(transaction, connection);
        console.log("Vest Transaction Signature:", signature);
  
        setVestedAmount((prev) => prev + vestAmount);
        setVestingStartTime(Math.floor(Date.now() / 1000));
        await fetchSolBalance();
        setVestAmount(0);
        
        alert("Vest successful!");
      } catch (error) {
        console.error("Vesting error:", error);
        alert("Failed to vest. Please try again.");
      } finally {
        setIsVesting(false);
      }
    };

     const handleUnvest = async () => {
        if (!isConnected || !address || vestedAmount <= 0) return;
        
        if (!canUnvest()) {
          const hoursLeft = Math.ceil((MINIMUM_STAKING_PERIOD - (Math.floor(Date.now() / 1000) - vestingStartTime)) / 3600);
          alert(`Cannot unstake yet. Please wait ${hoursLeft} more hours.`);
          return;
        }
    
        try {
          setIsUnvesting(true);
          const wallet = new PublicKey(address);
          const totalUnstakeAmount = vestedAmount + rewards;
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
    
          setVestedAmount(0);
          setVestingStartTime(0);
          setRewards(0);
          await fetchSolBalance();
          
          alert("Unstake successful!");
        } catch (error) {
          console.error("Unstaking error:", error);
          alert("Failed to unstake. Please try again.");
        } finally {
          setIsUnvesting(false);
        }
      };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <div className="flex flex-col w-full gap-3 p-4 bg-white dark:bg-lightBrown shadow-custom rounded-xl dark:text-white text-title-light ">
        <div className="flex flex-row items-center justify-start gap-4 my-6 dark:text-white text-title-light">
          <img
            className="hidden w-14 dark:flex"
            alt=""
            src="/icons/logo1.svg"
          />
          <img
            className="flex w-14 dark:hidden"
            alt=""
            src="/icons/logo1-light.svg"
          />
          <h1 className="text-2xl font-semibold">Appkit Vesting</h1>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col w-2/5 gap-6 ">
            <p>Available In Wallet</p>
            <div className="flex flex-row justify-between">
              <p>{solBalance}</p>
              <button
                onClick={() => setVestAmount(walletBalance)}
                className="underline text-[#FB9037]"
              >
                Max
              </button>
            </div>

            <div className="flex flex-row items-center justify-between gap-x-1">
              <PlusMinusButton
                value="-"
                onClick={() => setVestAmount((prev) => Math.max(prev - 1, 0))} className={undefined}              />

              <input
                type="number"
                value={vestAmount}
                min={0}
                onChange={(e) => setVestAmount(parseInt(e.target.value))}
                className="w-24 grow h-12 text-center bg-transparent rounded border-2 border-[#9D8B70]"
              />
              <PlusMinusButton
                value="+"
                onClick={() => setVestAmount((vestAmount) => Math.min(vestAmount + 1, totalVesting)
                )} className={undefined}              />
            </div>
            <div className="h-11">
            <Button
                text={isVesting ? "Vesting..." : "vest"}
                onClick={handleVest}
                variant={undefined}
                iconSrc={undefined}
                className={undefined}
                disabled={!isConnected || vestAmount <= 0 || isVesting}
              />            </div>
          </div>

          <div className="flex flex-col w-2/5 gap-6 ">
            <p>Total Vested</p>
            <div className="flex flex-row justify-between">
              <p>{vestedAmount}</p>
            </div>
            <div className="flex flex-row items-center justify-between w-full gap-x-1 ">
              <input
                type="number"
                value={vestedAmount + (vestedAmount * APY) / 100}
                // onChange={(e) => setUnVestAmount(e.target.value)}
                className="w-24 grow h-12 text-center bg-transparent rounded border-2 border-[#9D8B70]"
              />
            </div>
            <div className="h-11">
            <Button
                text={isUnvesting ? "Unvesting..." : "Unvest"}
                disabled={!isConnected || vestedAmount <= 0 || isUnvesting}
                onClick={handleUnvest}
                variant={undefined}
                iconSrc={undefined}
                className={undefined}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full gap-3">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="w-full ">
          <StatItem
              value={`${totalVesting} SOL`}
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
        <div className="flex flex-col w-full h-full gap-3 p-6 bg-white dark:bg-lightBrown shadow-custom rounded-xl ">
          <h2 className="pb-6 font-semibold dark:text-white text-title-light">
            Vesting Summary
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

export default TokenVestingSection;
