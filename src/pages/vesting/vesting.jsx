import React from "react";
import { useState } from "react";
import StatItem from "../../components/StatItem";
import DashboardProgress from "../../components/Dashboard/DashboardProgress";
import VestingSchedule from "../../components/VestingSchedule";
import VestingChart from "../../components/Vesting/VestingChart";

import clsx from "clsx";

import NFTStakingSection from "../../components/Staking/NFTStakingSection";
import NFTVestingSection from "../../components/Staking/NFTVestingSection";
import TokenStakingSection from "../../components/Staking/TokenStakingSection";
import TokenVestingSection from "../../components/Staking/TokenVestingSection";

const VestingPage = () => {
  const [tokensAllocated, setTokensAllocated] = useState(7000000000);
  const [cliffAmount, setCliffAmount] = useState(10000);
  const [totalDuration, setTotalDuration] = useState(14.2);
  const [vestingType, setVestingType] = useState("Vesting");

  const onTabSelected = (type) => {
    setVestingType(type);
  };
  return (
    <div className="h-full flex flex-col  items-center">
      <div className="h-full flex flex-col w-11/12 gap-4 ">
        <div className="flex flex-row items-center justify-start  gap-4">
          {/* <img
            className="w-14 hidden dark:flex"
            alt=""
            src="/icons/logo1.svg"
          />
          <img
            className="w-14 dark:hidden flex"
            alt=""
            src="/icons/logo1-light.svg"
          /> */}
          <h1 className="text-2xl font-semibold dark:text-white text-title-light">
            Appkit SOLs Vesting
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 text-white gap-3">
          <StatItem
            iconDark="/icons/logo1.svg"
            iconLight="/icons/logo1-light.svg"
            value={`${tokensAllocated} SOLs`}
            title="Tokens Allocated"
          />
          <StatItem
            iconDark="/icons/logo1.svg"
            iconLight="/icons/logo1-light.svg"
            value={`${cliffAmount} SOLs`}
            title="Cliff Amount"
          />
          <StatItem
            iconDark="/icons/total-duration-circle.svg"
            iconLight="/icons/total-duration-circle-light.svg"
            value={`${totalDuration} Weeks`}
            title="Total Duration"
          />
        </div>
        <div className="flex flex-row items-center justify-start h-16 gap-6 px-3 text-lg bg-white rounded-xl dark:bg-lightBrown md:h-20 dark:text-white text-title-light shadow-custom">
          <div
            className={clsx(
              "h-full flex flex-col justify-center cursor-pointer",
              vestingType === "Vesting" ? "border-b-2 border-[#FB9037]" : ""
            )}
          >
            <div
              className="text-sm capitalize sm:text-base md:text-base lg:text-xl whitespace-nowrap"
              onClick={() => onTabSelected("Vesting")}
            >
              token vesting
            </div>
          </div>
          <div
            className={clsx(
              "h-full flex flex-col justify-center cursor-pointer",
              vestingType === "NFTVesting" ? " border-b-2 border-[#FB9037]" : ""
            )}
          >
            <div
              className="text-sm capitalize sm:text-base md:text-base lg:text-xl whitespace-nowrap"
              onClick={() => onTabSelected("NFTVesting")}
            >
              NFT Vesting
            </div>
          </div>
        </div>
        {vestingType === "Vesting" && <TokenVestingSection />}
        {vestingType === "NFTVesting" && <NFTVestingSection />}
      </div>
    </div>
  );
};

export default VestingPage;
