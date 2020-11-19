import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';
import { UnboundDollar, Approval, Burn, Mint, Transfer } from '../generated/UnboundDollar/UnboundDollar';
import { getDaily, getAll, getTransaction, getUser, getLoan, getDailyToken } from './entities';
import { convertTokenToDecimal } from './helpers';

export function handleBurn(event: Burn): void {
  let address: string = event.params.user.toHex();
  let burn: BigInt = event.params.burned;
  let uToken = UnboundDollar.bind(event.address);
  let burnToken: BigDecimal = convertTokenToDecimal(burn, BigInt.fromI32(uToken.decimals()));

  let transaction = getTransaction(event);
  let loan = getLoan(event, address);
  let user = getUser(event, address);
  let dailyToken = getDailyToken(event, event.address.toHex());
  let daily = getDaily(event);
  let all = getAll(event);

  // User
  loan.loaned = loan.loaned.minus(burnToken);
  if (!user.loans.includes(loan.id)) {
    let loanedArray = user.loans;
    loanedArray.push(loan.id);
    user.loans = loanedArray;
  }
  let transactionArray = user.transactions;
  transactionArray.push(transaction.id);
  user.transactions = transactionArray;

  // Transaction
  transaction.uTokenAmount = burnToken;
  transaction.type = 'Burn';
  transaction.blockTime = event.block.timestamp;
  transaction.user = user.id;

  // DailyToken
  dailyToken.burnCount = dailyToken.burnCount.plus(BigInt.fromI32(1));
  dailyToken.burnUnboundToken = dailyToken.burnUnboundToken.plus(burnToken);

  // Daily
  daily.burnCount = daily.burnCount.plus(BigInt.fromI32(1));
  daily.burnUnboundToken = daily.burnUnboundToken.plus(burnToken);

  // ALL
  all.burnCount = all.burnCount.plus(BigInt.fromI32(1));
  all.burnUnboundToken = all.burnUnboundToken.plus(burnToken);

  loan.save();
  user.save();
  transaction.save();
  dailyToken.save();
  daily.save();
  all.save();
}

export function handleMint(event: Mint): void {
  let address: string = event.params.user.toHex();
  let mint: BigInt = event.params.newMint;
  let hash: string = event.transaction.hash.toHex();
  let uToken = UnboundDollar.bind(event.address);
  let mintToken: BigDecimal = convertTokenToDecimal(mint, BigInt.fromI32(uToken.decimals()));
  let transaction = getTransaction(event);
  let loan = getLoan(event, address);
  let user = getUser(event, address);
  let dailyToken = getDailyToken(event, event.address.toHex());
  let daily = getDaily(event);
  let all = getAll(event);

  // User
  loan.loaned = loan.loaned.plus(mintToken);
  if (!user.loans.includes(loan.id)) {
    let loanedArray = user.loans;
    loanedArray.push(loan.id);
    user.loans = loanedArray;
  }
  let transactionArray = user.transactions;
  transactionArray.push(transaction.id);
  user.transactions = transactionArray;

  // Transaction
  transaction.uTokenAmount = mintToken;
  transaction.type = 'Mint';
  transaction.blockTime = event.block.timestamp;
  transaction.user = user.id;

  // DailyToken
  dailyToken.mintCount = dailyToken.mintCount.plus(BigInt.fromI32(1));
  dailyToken.mintUnboundToken = dailyToken.mintUnboundToken.plus(mintToken);

  // Daily
  daily.mintCount = daily.mintCount.plus(BigInt.fromI32(1));
  daily.mintUnboundToken = daily.mintUnboundToken.plus(mintToken);

  // All
  all.mintCount = all.mintCount.plus(BigInt.fromI32(1));
  all.mintUnboundToken = all.mintUnboundToken.plus(mintToken);

  loan.save();
  user.save();
  transaction.save();
  dailyToken.save();
  daily.save();
  all.save();
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
