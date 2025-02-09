import axios from "axios";

import {
  decodeTokenMetadata,
  getParsedNftAccountsByOwner,
  getSolanaMetadataAddress,
  isValidSolanaAddress,
} from "@nfteyez/sol-rayz";
import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  WalletNotConnectedError
} from "@solana/wallet-adapter-base";
import {
  PublicKey,
  Transaction
} from "@solana/web3.js";

import {
  MAINNET_RPC,
  PROGRAM_ID
} from "../contracts/NFTstaking/constantsNFT";

import {
  VEST_PROGRAM_ID
} from "./NFTVesting/constantsNFTVesting";

import {
  IDL
} from "./NFTstaking/nftstaking";
import {
  NFT_VESTING_IDL
} from "./NFTVesting/nftvesting";

const opts = {
  preflightCommitment: "processed",
};

// const network = clusterApiUrl(NETWORK);
// const network = "https://solana-api.projectserum.com";
const network = MAINNET_RPC;

const PACKET_DATA_SIZE = 1280 - 40 - 8;

/** Get provider of connected wallet on the current solana network */

export const getProvider = async (wallet, connection) => {
  // const connection = new Connection(network, opts.preflightCommitment);
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    opts.preflightCommitment
  );
  return provider;
};

export const getProgram = (wallet, connection) => {
  let provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(IDL, PROGRAM_ID, provider);
  return program;
};

export const getVestingProgram = (wallet, connection) => {
  let provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(
    NFT_VESTING_IDL,
    VEST_PROGRAM_ID,
    provider
  );
  return program;
};

/** Get Token Account Information */

export const getTokenAccount = async (wallet, connection, mintPk) => {
  let provider = await getProvider(wallet, connection);
  let tokenAccount = await provider.connection.getProgramAccounts(
    TOKEN_PROGRAM_ID, {
      filters: [{
          dataSize: 165,
        },
        {
          memcmp: {
            offset: 0,
            bytes: mintPk.toBase58(),
          },
        },
        {
          memcmp: {
            offset: 32,
            bytes: wallet.publicKey.toBase58(),
          },
        },
      ],
    }
  );
  return tokenAccount && tokenAccount[0]?.pubkey;
};

export const getNFTTokenAccount = async (wallet, connection, nftMintPk) => {
  let provider = await getProvider(wallet, connection);
  let tokenAccount = await provider.connection.getProgramAccounts(
    TOKEN_PROGRAM_ID, {
      filters: [{
          dataSize: 165,
        },
        {
          memcmp: {
            offset: 64,
            bytes: "2",
          },
        },
        {
          memcmp: {
            offset: 0,
            bytes: nftMintPk.toBase58(),
          },
        },
      ],
    }
  );
  return tokenAccount[0].pubkey;
};

export const getAssociatedTokenAccount = async (ownerPubkey, mintPk) => {
  let associatedTokenAccountPubkey = (
    await PublicKey.findProgramAddress(
      [
        ownerPubkey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mintPk.toBuffer(), // mint address
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
  return associatedTokenAccountPubkey;
};

/** Get NFT Information */

export const getOwnerOfNFT = async (wallet, connection, nftMintPk) => {
  let provider = await getProvider(wallet, connection);
  let tokenAccountPK = await getNFTTokenAccount(wallet, nftMintPk);
  let tokenAccountInfo = await provider.connection.getAccountInfo(
    tokenAccountPK
  );

  if (tokenAccountInfo && tokenAccountInfo.data) {
    let ownerPubkey = new PublicKey(tokenAccountInfo.data.slice(32, 64));
    return ownerPubkey;
  }
  return new PublicKey("");
};

export const getAllNftData = async (wallet, connection) => {
  try {
    let provider = await getProvider(wallet, connection);

    const result = isValidSolanaAddress(wallet.publicKey.toBase58());
    if (result) {
      const nfts = await getParsedNftAccountsByOwner({
        publicAddress: wallet.publicKey.toBase58(),
        connection: provider.connection,
        serialization: true,
      });

      return nfts;
    }
  } catch (error) {
    console.log("[error] => getAllNftData() ", error);
  }
};

export const getNftMetadataURI = async (wallet, connection, nftMintPk) => {
  try {
    let provider = await getProvider(wallet, connection);
    let nftMetadataAddr = await getSolanaMetadataAddress(nftMintPk);
    let metadataByte = await provider.connection.getAccountInfo(
      nftMetadataAddr
    );
    let metadata = await decodeTokenMetadata(metadataByte.data);
    let uri = await axios.get(metadata.data.uri);
    return uri.data;
  } catch (e) {
    console.log("[error] => getNftMetadataURI() : ", e);
  }
  return null;
};

/** Send Multiple Transactions */

export async function getMultipleTransactions(
  connection,
  wallet,
  instructions = [],
  signers = []
) {
  const recentBlockhash = (await connection.getRecentBlockhash("processed"))
    .blockhash;
  const instructionSet = splitTransaction(
    wallet,
    instructions,
    signers,
    recentBlockhash
  );
  return instructionSet;
}

export async function sendMultiTransactions(
  connection,
  wallet,
  instructionSet,
  signers = []
) {
  let {
    txs,
    result
  } = await sendTransactions(
    connection,
    wallet,
    instructionSet,
    signers,
    SequenceType.Sequential,
    "single"
  );
  return {
    txs: txs,
    result: result
  };
}

function splitTransaction(wallet, instructions, signers = [], recentBlockhash) {
  let arrIxSet = [];
  let setId = 0;
  for (let i = 0; i < instructions.length;) {
    if (arrIxSet[setId] === undefined) arrIxSet[setId] = [];
    arrIxSet[setId].push(instructions[i]);
    let tx = new Transaction().add(...arrIxSet[setId]);
    tx.recentBlockhash = recentBlockhash;
    tx.feePayer = wallet.publicKey;
    if (getTransactionSize(tx, signers) > PACKET_DATA_SIZE) {
      arrIxSet[setId].pop();
      setId++;
      continue;
    }
    i++;
  }
  return arrIxSet;
}

export function getTransactionSize(
  transaction,
  signers = [],
  hasWallet = true
) {
  const signData = transaction.serializeMessage();
  const signatureCount = [];
  encodeLength(signatureCount, signers.length);
  const transactionLength =
    signatureCount.length +
    (signers.length + (hasWallet ? 1 : 0)) * 64 +
    signData.length;
  return transactionLength;
}

function encodeLength(bytes, len) {
  let rem_len = len;
  for (;;) {
    let elem = rem_len & 0x7f;
    rem_len >>= 7;
    if (rem_len === 0) {
      bytes.push(elem);
      break;
    } else {
      elem |= 0x80;
      bytes.push(elem);
    }
  }
}

export const sendTransactions = async (
  connection,
  wallet,
  instructionSet,
  signers,
  sequenceType = SequenceType.Parallel,
  commitment = "singleGossip",
  block
) => {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  let resStr = "success";
  const unsignedTxns = [];

  if (!block) {
    block = await connection.getRecentBlockhash(commitment);
  }

  for (let i = 0; i < instructionSet.length; i++) {
    const instructions = instructionSet[i];

    if (instructions.length === 0) {
      continue;
    }

    let transaction = new Transaction();
    instructions.forEach((instruction) => transaction.add(instruction));
    transaction.recentBlockhash = block.blockhash;
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map((s) => s.publicKey)
    );

    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }

    unsignedTxns.push(transaction);
  }

  const signedTxns = await wallet.signAllTransactions(unsignedTxns);
  let txIds = [];
  if (signedTxns.length > 0) {
    if (signedTxns.length === 1) {
      // let confirming_id = showToast("Confirming Transaction ...", -1, 2);
      let txId = await sendSignedTransaction(connection, signedTxns[0]);
      txIds.push(txId);

      let res = await connection.confirmTransaction(txId, "confirmed");
      // toast.dismiss(confirming_id);
      if (res.value.err) resStr = "failed"; //showToast(`Transaction Failed`, 2000, 1);
      // else showToast(`Transaction Confirmed`, 2000)
    } else {
      // let confirming_id = showToast(`Confirming Transaction 1 of ${signedTxns.length}...`, -1, 2);
      for (let i = 0; i < signedTxns.length; i++) {
        let txId = await sendSignedTransaction(connection, signedTxns[i]);
        txIds.push(txId);

        let res = await connection.confirmTransaction(txId, "confirmed");
        if (res.value.err) {
          resStr = "failed"; //showToast(`Transaction Failed`, 2000, 1);
          break;
        }
        // else showToast(`Transaction Confirmed`, 2000)

        // if ( i + 2 <= signedTxns.length)
        //   toast.update(confirming_id, { render: `Confirming Transaction ${i+2} of ${signedTxns.length}...`});
        // else toast.dismiss(confirming_id);
      }
    }
  }
  return {
    result: resStr,
    number: signedTxns.length,
    txs: txIds
  };
};

export const SequenceType = {
  Sequential: 0,
  Parallel: 1,
  StopOnFailure: 2,
};

export async function sendSignedTransaction(connection, signedTransaction) {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const rawTransaction = signedTransaction.serialize();

  let maxTry = 10;
  let real_txid = "";

  while (maxTry > 0 && real_txid == "") {
    maxTry--;
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      preflightCommitment: "confirmed",
    });
    let softTry = 3;
    while (softTry > 0) {
      softTry--;
      await delay(700);

      // @ts-ignore
      const resp = await connection._rpcRequest("getSignatureStatuses", [
        [txid],
      ]);

      if (resp && resp.result && resp.result.value && resp.result.value[0]) {
        return txid;
      }
    }
  }

  return "";
}