import { BigInt, log } from '@graphprotocol/graph-ts';
import { Contract, Approval, Burn, Mint, Transfer } from '../generated/Contract/Contract';
import { User, Transaction, Daily, All } from '../generated/schema';

export function handleBurn(event: Burn): void {
  let address: string = event.params.user.toHex();
  let burn: BigInt = event.params.burned;
  let hash: string = event.transaction.hash.toHex();
  let blockTime: BigInt = event.block.timestamp;

  // In the AssemblyScript, Date class can't handle year, month, date, etc..
  // https://www.assemblyscript.org/stdlib/date.html#constructor
  let difference = BigInt.fromI32(330 * 60); // IST(+5:30)
  let ist = blockTime.plus(difference);
  let date = ist.div(BigInt.fromI32(24 * 60 * 60)).toString();

  let transaction = Transaction.load(hash);
  if (transaction == null) {
    transaction = new Transaction(hash);
  }
  let user = User.load(address);
  if (user == null) {
    user = new User(address);
    user.loaned = BigInt.fromI32(0);
    user.burn = BigInt.fromI32(0);
    user.mint = BigInt.fromI32(0);
    user.transactions = [];
  }
  let daily = Daily.load(date);
  if (daily == null) {
    daily = new Daily(date);
    daily.mintCount = BigInt.fromI32(0);
    daily.burnCount = BigInt.fromI32(0);
    daily.mintTotal = BigInt.fromI32(0);
    daily.burnTotal = BigInt.fromI32(0);
  }
  let all = All.load('key');
  if (all == null) {
    all = new All('key');
    all.mintCount = BigInt.fromI32(0);
    all.burnCount = BigInt.fromI32(0);
    all.mintTotal = BigInt.fromI32(0);
    all.burnTotal = BigInt.fromI32(0);
  }

  // User
  user.loaned = user.loaned.minus(burn);
  user.burn = user.burn.plus(burn);
  let transactionArray = user.transactions;
  transactionArray.push(transaction.id);
  user.transactions = transactionArray;

  // Transaction
  transaction.amount = burn;
  transaction.type = 'Burn';
  transaction.blockTime = blockTime;
  transaction.user = user.id;

  // Daily
  daily.burnCount = daily.burnCount.plus(BigInt.fromI32(1));
  daily.burnTotal = daily.burnTotal.plus(burn);

  // ALL
  all.burnCount = all.burnCount.plus(BigInt.fromI32(1));
  all.burnTotal = all.burnTotal.plus(burn);

  user.save();
  transaction.save();
  daily.save();
  all.save();
}

export function handleMint(event: Mint): void {
  let address: string = event.params.user.toHex();
  let mint: BigInt = event.params.newMint;
  let hash: string = event.transaction.hash.toHex();
  let blockTime: BigInt = event.block.timestamp;

  // In the AssemblyScript, Date class can't handle year, month, date, etc..
  // https://www.assemblyscript.org/stdlib/date.html#constructor
  let difference = BigInt.fromI32(330 * 60); // IST(+5:30)
  let ist = blockTime.plus(difference);
  let date = ist.div(BigInt.fromI32(24 * 60 * 60)).toString();

  let transaction = Transaction.load(hash);
  if (transaction == null) {
    transaction = new Transaction(hash);
  }
  let user = User.load(address);
  if (user == null) {
    user = new User(address);
    user.loaned = BigInt.fromI32(0);
    user.burn = BigInt.fromI32(0);
    user.mint = BigInt.fromI32(0);
    user.transactions = [];
  }
  let daily = Daily.load(date);
  if (daily == null) {
    daily = new Daily(date);
    daily.mintCount = BigInt.fromI32(0);
    daily.burnCount = BigInt.fromI32(0);
    daily.mintTotal = BigInt.fromI32(0);
    daily.burnTotal = BigInt.fromI32(0);
  }
  let all = All.load('key');
  if (all == null) {
    all = new All('key');
    all.mintCount = BigInt.fromI32(0);
    all.burnCount = BigInt.fromI32(0);
    all.mintTotal = BigInt.fromI32(0);
    all.burnTotal = BigInt.fromI32(0);
  }

  // User
  user.loaned = user.loaned.plus(mint);
  user.mint = user.mint.plus(mint);
  let transactionArray = user.transactions;
  transactionArray.push(transaction.id);
  user.transactions = transactionArray;

  // Transaction
  transaction.amount = mint;
  transaction.type = 'Mint';
  transaction.blockTime = blockTime;
  transaction.user = user.id;

  // Daily
  daily.mintCount = daily.mintCount.plus(BigInt.fromI32(1));
  daily.mintTotal = daily.mintTotal.plus(mint);

  // All
  all.mintCount = all.mintCount.plus(BigInt.fromI32(1));
  all.mintTotal = all.mintTotal.plus(mint);

  user.save();
  transaction.save();
  daily.save();
  all.save();
}

export function handleApproval(event: Approval): void {}

export function handleTransfer(event: Transfer): void {}

// function initUser(id: string): User {
//   let user = User.load(id);
//   if (user == null) {
//     user = new User(id);
//     user.loaned = BigInt.fromI32(0);
//     user.transactions = [];
//   }
//   return user;
// }

// function initDaily(id: string): Daily {
//   let daily = Daily.load(id);
//   if (daily == null) {
//     daily = new Daily(id);
//     daily.mintCount = BigInt.fromI32(0);
//     daily.burnCount = BigInt.fromI32(0);
//     daily.mintTotal = BigInt.fromI32(0);
//     daily.burnTotal = BigInt.fromI32(0);
//   }
//   return daily;
// }

// function getDateIST(unix: BigInt): string {
//   let difference = BigInt.fromI32(330 * 60);
//   let istTime = unix.plus(difference);
//   let datetime = new Date(istTime.toString() + '000');
//   let year = datetime.getFullYear();
//   let month = ('0' + datetime.getMonth()).substr(-2);
//   let day = ('0' + datetime.getDate()).substr(-2);

//   return year + month + day;
// }

// Note: If a handler doesn't require existing field values, it is faster
// _not_ to load the entity from the store. Instead, create it fresh with
// `new Entity(...)`, set the fields that should be updated and save the
// entity back to the store. Fields that were not set or unset remain
// unchanged, allowing for partial updates to be applied.
// It is also possible to access smart contracts from mappings. For
// example, the contract that has emitted the event can be connected to
// with:
//
// let contract = Contract.bind(event.address)
//
// The following functions can then be called on this contract to access
// state variables and other data:
//
// - contract.DOMAIN_SEPARATOR(...)
// - contract.PERMIT_TYPEHASH(...)
// - contract._decimals(...)
// - contract._devFundAddr(...)
// - contract._name(...)
// - contract._owner(...)
// - contract._safuAddr(...)
// - contract._safuShares(...)
// - contract._stakeAddr(...)
// - contract._stakeShares(...)
// - contract._symbol(...)
// - contract._totalSupply(...)
// - contract._valuator(...)
// - contract.nonces(...)
// - contract.name(...)
// - contract.symbol(...)
// - contract.decimals(...)
// - contract.totalSupply(...)
// - contract.balanceOf(...)
// - contract.transfer(...)
// - contract.transferFrom(...)
// - contract.allowance(...)
// - contract.approve(...)
// - contract.increaseAllowance(...)
// - contract.decreaseAllowance(...)
// - contract.checkLoan(...)
// - contract.isOwner(...)
