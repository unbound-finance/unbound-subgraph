import { NewVault as VaultCreated } from "../../generated/Factory/Factory";
import { Vault as VaultTemplate } from "../../generated/templates";
import { Factory, Vault } from "../../generated/schema";
import { FACTORY_ADDRESS, ONE_BI, ZERO_BI } from "../utils/constants";

export function handleVaultCreated(event: VaultCreated): void {
  // load factory
  let factory = Factory.load(FACTORY_ADDRESS);
  if (factory == null) {
    factory = new Factory(FACTORY_ADDRESS);
    factory.vaultCount = ZERO_BI;
    factory.txCount = ZERO_BI;
  }

  factory.vaultCount = factory.vaultCount.plus(ONE_BI);

  let vault = new Vault(event.params._vault.toHexString()) as Vault;
  vault.tvl = ZERO_BI;
  vault.volume = ZERO_BI;
  vault.txCount = ZERO_BI;

  vault.save();
  VaultTemplate.create(event.params._vault);
  factory.save();
}
