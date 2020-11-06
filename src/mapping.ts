import { BigInt, log } from '@graphprotocol/graph-ts';
import { Contract, Approval, Burn, Mint, Transfer } from '../generated/Contract/Contract';
import { User, Transaction } from '../generated/schema';

export function handleBurn(event: Burn): void {
  let address: string = event.params.user.toHex();
  let burn: BigInt = event.params.burned;
  let hash: string = event.transaction.hash.toHex();
  let blockTime: BigInt = event.block.timestamp;

  let user = User.load(address);
  if (user == null) {
    user = new User(address);
    user.loaned = BigInt.fromI32(0);
    user.transactions = [];
  }
  let transaction = Transaction.load(hash);
  if (transaction == null) {
    transaction = new Transaction(hash);
  }

  user.loaned = user.loaned.minus(burn);
  let transactionArray = user.transactions;
  transactionArray.push(transaction.id);
  user.transactions = transactionArray;
  transaction.amount = burn;
  transaction.type = 'Burn';
  transaction.blockTime = blockTime;
  transaction.user = user.id;

  transaction.save();
  user.save();
}

export function handleMint(event: Mint): void {
  let address: string = event.params.user.toHex();
  let mint: BigInt = event.params.newMint;
  let hash: string = event.transaction.hash.toHex();
  let blockTime: BigInt = event.block.timestamp;

  let user = User.load(address);
  if (user == null) {
    user = new User(address);
    user.loaned = BigInt.fromI32(0);
    user.transactions = [];
  }
  let transaction = Transaction.load(hash);
  if (transaction == null) {
    transaction = new Transaction(hash);
  }

  user.loaned = user.loaned.plus(mint);
  let transactionArray = user.transactions;
  transactionArray.push(transaction.id);
  user.transactions = transactionArray;
  transaction.amount = mint;
  transaction.type = 'Mint';
  transaction.blockTime = blockTime;
  transaction.user = user.id;

  log.debug('Transaction: {}', [transaction.id]);
  log.debug('User: {}', [user.transactions.toString()]);
  transaction.save();
  user.save();
}

export function handleApproval(event: Approval): void {}

export function handleTransfer(event: Transfer): void {}

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
