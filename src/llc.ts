import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';
import { LLC, LockLPT, UnlockLPT } from '../generated/LLC_DaiUsdt/LLC';
import { Pair } from '../generated/LLC_DaiUsdt/Pair';
import { ERC20 } from '../generated/LLC_DaiUsdt/ERC20';
import { getDailyLLC, getDaily, getAll } from './entities';
import { convertTokenToDecimal } from './helpers';

export function handleLockLPT(event: LockLPT): void {
  let amt: BigInt = event.params.LPTAmt;
  let user: Address = event.params.user;
  let hash: string = event.transaction.hash.toHex();
  let llc: LLC = LLC.bind(event.address);

  let dailyLLC = getDailyLLC(event, event.address.toHex());
  let daily = getDaily(event);
  let all = getAll(event);

  let pair: Address = llc.pair();
  let uniPair = Pair.bind(pair);
  let poolTokenAmount = convertTokenToDecimal(amt, BigInt.fromI32(uniPair.decimals()));

  dailyLLC.lockPoolToken = dailyLLC.lockPoolToken.plus(poolTokenAmount);
  daily.lockPoolToken = daily.lockPoolToken.plus(poolTokenAmount);
  all.lockPoolToken = all.lockPoolToken.plus(poolTokenAmount);

  dailyLLC.save();
  daily.save();
  all.save();
}

export function handleUnlockLPT(event: UnlockLPT): void {
  let amt: BigInt = event.params.LPTAmt;
  let user: Address = event.params.user;
  let hash: string = event.transaction.hash.toHex();
  let llc: LLC = LLC.bind(event.address);

  let dailyLLC = getDailyLLC(event, event.address.toHex());
  let daily = getDaily(event);
  let all = getAll(event);

  let pair: Address = llc.pair();
  let uniPair = Pair.bind(pair);
  let poolTokenAmount = convertTokenToDecimal(amt, BigInt.fromI32(uniPair.decimals()));

  dailyLLC.unlockPoolToken = dailyLLC.unlockPoolToken.plus(poolTokenAmount);
  daily.unlockPoolToken = daily.unlockPoolToken.plus(poolTokenAmount);
  all.unlockPoolToken = all.unlockPoolToken.plus(poolTokenAmount);

  dailyLLC.save();
  daily.save();
  all.save();
}
