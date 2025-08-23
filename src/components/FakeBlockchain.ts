import sha256 from 'crypto-js/sha256';

export interface Transaction {
  blockNumber: number;
  from: string;
  to: string;
  product: string;
  timestamp: string;
  hash: string;
  previousHash: string;
}

let ledger: Transaction[] = [];

export function addTransaction(from: string, to: string, product: string, timestampOverride?: string): Transaction {
  const timestamp = timestampOverride || new Date().toISOString();
  const blockNumber = ledger.length + 1;
  const previousHash = ledger.length > 0 ? ledger[ledger.length - 1].hash : '0';
  const hashInput = `${blockNumber}-${from}-${to}-${product}-${timestamp}-${previousHash}`;
  const hash = sha256(hashInput).toString();
  const transaction: Transaction = {
    blockNumber,
    from,
    to,
    product,
    timestamp,
    hash,
    previousHash,
  };
  ledger = [...ledger, transaction];
  return transaction;
}

export function getTransactions(): Transaction[] {
  return ledger;
}
