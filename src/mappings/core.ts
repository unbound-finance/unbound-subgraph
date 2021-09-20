import { Burn, Factory, Mint, Vault } from "../../generated/schema";
import { Lock as LockEvent, Unlock as UnlockEvent } from "../../generated/templates/Vault/Vault";
import { FACTORY_ADDRESS, ONE_BI } from "../utils/constants";
import { loadTransaction } from "../utils";

export function handleLock(event: LockEvent): void {
  let vault = Vault.load(event.address.toHexString());
  let factory = Factory.load(FACTORY_ADDRESS);

  // update global variables
  factory.txCount = factory.txCount.plus(ONE_BI);

  // vault data
  vault.tvl = vault.tvl.plus(event.params._collateral);
  vault.volume = vault.tvl.plus(event.params._collateral);
  vault.txCount = vault.txCount.plus(ONE_BI);

  let transaction = loadTransaction(event);
  let mint = new Mint(transaction.id.toString() + "#" + vault.txCount.toString());
  mint.transaction = transaction.id;
  mint.timestamp = event.block.timestamp;
  mint.vault = vault.id;
  mint.sender = event.transaction.from;
  mint.amount = event.params._uTokenAmount;

  // TODO: update interval data

  mint.save();
  vault.save();
  factory.save();
}

export function handleUnlock(event: UnlockEvent): void {
  let vault = Vault.load(event.address.toHexString());
  let factory = Factory.load(FACTORY_ADDRESS);

  // update global variables
  factory.txCount = factory.txCount.plus(ONE_BI);

  // vault data
  vault.tvl = vault.tvl.minus(event.params._collateral);
  vault.txCount = vault.txCount.plus(ONE_BI);

  let transaction = loadTransaction(event);
  let burn = new Burn(transaction.id.toString() + "#" + vault.txCount.toString());
  burn.transaction = transaction.id;
  burn.timestamp = event.block.timestamp;
  burn.vault = vault.id;
  burn.sender = event.transaction.from;
  burn.amount = event.params._uTokenAmount;

  // TODO: update interval data

  burn.save();
  vault.save();
  factory.save();
}
