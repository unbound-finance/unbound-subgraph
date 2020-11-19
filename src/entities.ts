import { User, Transaction, Daily, All, Loan, DailyToken } from '../generated/schema';
import { BigInt, BigDecimal, ethereum, Address } from '@graphprotocol/graph-ts';
import { ZERO_BI, ZERO_BD } from './helpers';

export function getDaily(event: ethereum.Event): Daily {
  // Time
  let timestamp = event.block.timestamp.toI32();
  let difference = 330 * 60; // IST(+5:30)
  timestamp += difference;
  let dayID = timestamp / (24 * 60 * 60);
  let dayStartTimestamp = dayID * 86400;

  let daily = Daily.load(dayID.toString());
  if (daily == null) {
    daily = new Daily(dayID.toString());
    daily.date = dayStartTimestamp;
    daily.mintCount = ZERO_BI;
    daily.burnCount = ZERO_BI;
    daily.mintUnboundToken = ZERO_BD;
    daily.burnUnboundToken = ZERO_BD;
    daily.lockPoolToken = ZERO_BD;
    daily.unlockPoolToken = ZERO_BD;
    daily.lockUSD = ZERO_BD;
    daily.unlockUSD = ZERO_BD;
  }

  return daily as Daily;
}

export function getDailyToken(event: ethereum.Event, uTokenAddress: string): DailyToken {
  // Time
  let timestamp = event.block.timestamp.toI32();
  let difference = 330 * 60; // IST(+5:30)
  timestamp += difference;
  let dayID = timestamp / (24 * 60 * 60);
  let dayStartTimestamp = dayID * 86400;
  let tokenDayID: string = uTokenAddress.concat('-').concat(dayID.toString());

  let daily = DailyToken.load(tokenDayID);
  if (daily == null) {
    daily = new DailyToken(tokenDayID);
    daily.date = dayStartTimestamp;
    daily.uTokenAddress = uTokenAddress;
    daily.mintCount = ZERO_BI;
    daily.burnCount = ZERO_BI;
    daily.mintUnboundToken = ZERO_BD;
    daily.burnUnboundToken = ZERO_BD;
    daily.lockPoolToken = ZERO_BD;
    daily.unlockPoolToken = ZERO_BD;
    daily.lockUSD = ZERO_BD;
    daily.unlockUSD = ZERO_BD;
  }

  return daily as DailyToken;
}

export function getAll(event: ethereum.Event): All {
  let all = All.load('key');
  if (all == null) {
    all = new All('key');
    all.mintCount = ZERO_BI;
    all.burnCount = ZERO_BI;
    all.mintUnboundToken = ZERO_BD;
    all.burnUnboundToken = ZERO_BD;
    all.lockPoolToken = ZERO_BD;
    all.unlockPoolToken = ZERO_BD;
    all.lockUSD = ZERO_BD;
    all.unlockUSD = ZERO_BD;
  }

  return all as All;
}

export function getTransaction(event: ethereum.Event): Transaction {
  let hash: string = event.transaction.hash.toHex();

  let transaction = Transaction.load(hash);
  if (transaction == null) {
    transaction = new Transaction(hash);
    transaction.uTokenAddress = event.address.toHex();
  }

  return transaction as Transaction;
}

export function getLoan(event: ethereum.Event, address: string): Loan {
  let tokenAddress: string = event.address.toHex();

  let loanID = address.concat('-').concat(tokenAddress);
  let loan = Loan.load(loanID);
  if (loan == null) {
    loan = new Loan(loanID);
    loan.loaned = ZERO_BD;
  }

  return loan as Loan;
}

export function getUser(event: ethereum.Event, address: string): User {
  let user = User.load(address);
  if (user == null) {
    user = new User(address);
    user.loans = [];
    user.transactions = [];
  }

  return user as User;
}
