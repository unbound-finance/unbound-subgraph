import { Burn, Factory, Mint, Vault } from "../../generated/schema";
import {
  Lock as LockEvent,
  Unlock as UnlockEvent,
  ChangeLTV as ChangeLTVEvent,
  ChangeCR as ChangeCREvent,
  ChangeProtocolFee as ChangeProtocolFeeEvent,
} from "../../generated/templates/Vault/Vault";
import { FACTORY_ADDRESS, ONE_BI } from "../utils/constants";
import { loadTransaction } from "../utils";
import { updateVaultDayData } from "../utils/intervalUpdates";

export function handleLock(event: LockEvent): void {
  let vault = Vault.load(event.address.toHexString());
  let factory = Factory.load(FACTORY_ADDRESS);

  // update global variables
  factory.txCount = factory.txCount.plus(ONE_BI);

  // vault data
  vault.tvl = vault.tvl.plus(event.params._collateral);
  vault.mintVolume = vault.mintVolume.plus(event.params._collateral);
  vault.volume = vault.volume.plus(event.params._collateral);
  vault.txCount = vault.txCount.plus(ONE_BI);

  let transaction = loadTransaction(event);
  let mint = new Mint(transaction.id.toString() + "#" + vault.txCount.toString());
  mint.transaction = transaction.id;
  mint.timestamp = event.block.timestamp;
  mint.vault = vault.id;
  mint.sender = event.transaction.from;
  mint.amount = event.params._uTokenAmount;

  updateVaultDayData(event);

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
  vault.burnVolume = vault.burnVolume.plus(event.params._collateral);
  vault.volume = vault.volume.plus(event.params._collateral);
  vault.txCount = vault.txCount.plus(ONE_BI);

  let transaction = loadTransaction(event);
  let burn = new Burn(transaction.id.toString() + "#" + vault.txCount.toString());
  burn.transaction = transaction.id;
  burn.timestamp = event.block.timestamp;
  burn.vault = vault.id;
  burn.sender = event.transaction.from;
  burn.amount = event.params._uTokenAmount;

  updateVaultDayData(event);

  burn.save();
  vault.save();
  factory.save();
}

export function handleLTV(event: ChangeLTVEvent): void {
  let vault = new Vault(event.address.toHexString());
  vault.LTV = event.params._LTV;

  vault.save();
}

export function handleCR(event: ChangeCREvent): void {
  let vault = new Vault(event.address.toHexString());
  vault.cr = event.params._CR;

  vault.save();
}

export function handleProtocolFee(event: ChangeProtocolFeeEvent): void {
  let vault = new Vault(event.address.toHexString());
  vault.fee = event.params._PROTOCOL_FEE;

  vault.save();
}
