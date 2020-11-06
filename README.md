[The Graph document](https://thegraph.com/docs/introduction)

# In The Graph Website

## Create Subgraph

Sign in with your personal GitHub account.

https://thegraph.com/

Go to dashboard

https://thegraph.com/explorer/dashboard

If you're admin of an organization, you can create a new subgraph as the organization. The subgraph name will be used afterward.

# In Your Local Environment

## Clone this repo

```
$ git clone git@github.com:unbound-finance/unbound-subgraph.git
$ cd unbound-subgraph
```

## Install Graph CLI globally
```
# NPM
$ npm install -g @graphprotocol/graph-cli

# Yarn
$ yarn global add @graphprotocol/graph-cli
```

## Modify subgraph

- Entity

 `/schema.graphql`
 
- Mapping

`/src/mapping.ts`

- Target Contract

  - Name, Address, ABI file name
  
  `/subgraph.yaml`
  
  - ABI
  
  `/abis/xxxx.json`

## Generate graph code

```
$ yarn codegen
```

## Deploy the subgraph

```
$ yarn deploy
```

※ There is the setting in `/package.json`.

It's set as `<GitHub account name>=unbound-finance` and `<Subgraph name>=unbound-subgraph`

or you can call directly

```
$ graph deploy --node https://api.thegraph.com/deploy/ --ipfs https://api.thegraph.com/ipfs/ <GitHub account name>/<Subgraph name>
```

You can deploy multiple times. It overrides the previous one.
