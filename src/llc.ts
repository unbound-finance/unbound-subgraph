import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts';
import { LLC, LockLPT, UnlockLPT, KillSwitch } from '../generated/LLC/LLC';
import { Pair } from '../generated/LLC/Pair';
import { ERC20 } from '../generated/LLC/ERC20';
import { getDailyToken, getDaily, getAll } from './entities';
import { convertTokenToDecimal } from './helpers';

export function handleLockLPT(event: LockLPT): void {
  let amt: BigInt = event.params.LPTamt;
  let user: Address = event.params.user;
  let uToken: Address = event.params.uToken;
  let hash: string = event.transaction.hash.toHex();
  let llc: LLC = LLC.bind(event.address);

  let dailyToken = getDailyToken(event, uToken.toHex());
  let daily = getDaily(event);
  let all = getAll(event);

  let position: number = llc._position();
  let pair: Address = llc.pair();
  let uniPair = Pair.bind(pair);

  let reserves = uniPair.getReserves();
  let total = uniPair.totalSupply();
  let two = BigInt.fromI32(2);
  let totalUSD: BigInt = position === 0 ? reserves.value0.times(two) : reserves.value1.times(two);
  let baseTokenAddress: Address = position === 0 ? uniPair.token0() : uniPair.token1();
  let baseToken = ERC20.bind(baseTokenAddress);

  let valueUSD: BigDecimal = convertTokenToDecimal(
    totalUSD.times(amt).div(total),
    BigInt.fromI32(baseToken.decimals())
  );
  let poolTokenAmount = convertTokenToDecimal(amt, BigInt.fromI32(uniPair.decimals()));

  dailyToken.lockUSD = dailyToken.lockUSD.plus(valueUSD);
  dailyToken.lockPoolToken = dailyToken.lockPoolToken.plus(poolTokenAmount);

  daily.lockUSD = daily.lockUSD.plus(valueUSD);
  daily.lockPoolToken = daily.lockPoolToken.plus(poolTokenAmount);

  all.lockUSD = all.lockUSD.plus(valueUSD);
  all.lockPoolToken = all.lockPoolToken.plus(poolTokenAmount);

  dailyToken.save();
  daily.save();
  all.save();
}

export function handleUnlockLPT(event: UnlockLPT): void {
  let amt: BigInt = event.params.LPTamt;
  let user: Address = event.params.user;
  let uToken: Address = event.params.uToken;
  let hash: string = event.transaction.hash.toHex();
  let llc: LLC = LLC.bind(event.address);

  let dailyToken = getDailyToken(event, uToken.toHex());
  let daily = getDaily(event);
  let all = getAll(event);

  let position: number = llc._position();
  let pair: Address = llc.pair();
  let uniPair = Pair.bind(pair);

  let reserves = uniPair.getReserves();
  let total = uniPair.totalSupply();
  let two = BigInt.fromI32(2);
  let totalUSD: BigInt = position === 0 ? reserves.value0.times(two) : reserves.value1.times(two);
  let baseTokenAddress: Address = position === 0 ? uniPair.token0() : uniPair.token1();
  let baseToken = ERC20.bind(baseTokenAddress);

  let valueUSD: BigDecimal = convertTokenToDecimal(
    totalUSD.times(amt).div(total),
    BigInt.fromI32(baseToken.decimals())
  );
  let poolTokenAmount = convertTokenToDecimal(amt, BigInt.fromI32(uniPair.decimals()));

  dailyToken.unlockUSD = dailyToken.unlockUSD.plus(valueUSD);
  dailyToken.unlockPoolToken = dailyToken.unlockPoolToken.plus(poolTokenAmount);

  daily.unlockUSD = daily.unlockUSD.plus(valueUSD);
  daily.unlockPoolToken = daily.unlockPoolToken.plus(poolTokenAmount);

  all.unlockUSD = all.unlockUSD.plus(valueUSD);
  all.unlockPoolToken = all.unlockPoolToken.plus(poolTokenAmount);

  dailyToken.save();
  daily.save();
  all.save();
}

export function handleKillSwitch(event: KillSwitch): void {}
