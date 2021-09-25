import { NewVault as VaultCreated } from "../../generated/Factory/Factory";
import { Vault as VaultTemplate } from "../../generated/templates";
import { Factory, Token, Vault } from "../../generated/schema";
import { Vault as VaultABI } from "../../generated/templates/Vault/Vault";
import { Pool as PoolABI } from "../../generated/templates/Vault/Pool";
import { FACTORY_ADDRESS, ONE_BI, ZERO_BI } from "../utils/constants";
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol, fetchTokenTotalSupply } from "../utils/token";
import { log } from "@graphprotocol/graph-ts";

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
  let vaultContract = VaultABI.bind(event.params._vault);

  vault.tvl = ZERO_BI;
  vault.mintVolume = ZERO_BI;
  vault.burnVolume = ZERO_BI;
  vault.volume = ZERO_BI;
  vault.txCount = ZERO_BI;
  vault.LTV = vaultContract.LTV();
  vault.fee = vaultContract.PROTOCOL_FEE();
  vault.cr = vaultContract.CR();

  // load pool
  let pool = PoolABI.bind(vaultContract.pair());
  let token0Address = pool.token0();
  let token1Address = pool.token1();

  // load token
  let token0 = Token.load(token0Address.toHexString());
  let token1 = Token.load(token1Address.toHexString());

  // fetch token0 info if null
  if (token0 === null) {
    token0 = new Token(token0Address.toHexString());
    token0.symbol = fetchTokenSymbol(token0Address);
    token0.name = fetchTokenName(token0Address);
    token0.totalSupply = fetchTokenTotalSupply(token0Address);
    let decimals = fetchTokenDecimals(token0Address);

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug("mybug the decimal on token 0 was null", []);
      return;
    }

    token0.decimals = decimals;
  }

  // fetch token1 info if null
  if (token1 === null) {
    token1 = new Token(token1Address.toHexString());
    token1.symbol = fetchTokenSymbol(token1Address);
    token1.name = fetchTokenName(token1Address);
    token1.totalSupply = fetchTokenTotalSupply(token1Address);
    let decimals = fetchTokenDecimals(token1Address);

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug("mybug the decimal on token 0 was null", []);
      return;
    }

    token1.decimals = decimals;
  }

  vault.token0 = token0.id;
  vault.token1 = token1.id;

  vault.save();
  VaultTemplate.create(event.params._vault);
  factory.save();
  token0.save();
  token1.save();
}
