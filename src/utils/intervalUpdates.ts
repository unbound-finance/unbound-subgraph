import { ethereum } from "@graphprotocol/graph-ts";
import { Vault, VaultDayData } from "../../generated/schema";
import { ZERO_BI } from "./constants";

export function updateVaultDayData(event: ethereum.Event): VaultDayData {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayPoolID = event.address
    .toHexString()
    .concat("-")
    .concat(dayID.toString());
  let vault = Vault.load(event.address.toHexString());
  let vaultDayData = VaultDayData.load(dayPoolID);
  if (vaultDayData === null) {
    vaultDayData = new VaultDayData(dayPoolID);
    vaultDayData.date = dayStartTimestamp;
    vaultDayData.vault = vault.id;
    // things that dont get initialized always
    vaultDayData.tvl = ZERO_BI;
    vaultDayData.volume = ZERO_BI;
  }

  vaultDayData.tvl = vault.tvl;
  vaultDayData.volume = vault.volume;

  vaultDayData.save();

  return vaultDayData as VaultDayData;
}
