# icoplate_ico
ICOPlace ICO

![](https://travis-ci.org/mixbytes/icoplate_ico.svg?branch=master)

## Install
Make sure testrpc is running:
```
testrpc -u 0 -u 1 -u 2 -u 3 -u 4 -u 5 --gasPrice 2000 &
```
Then run
```
npm install
truffle compile
trufle test
```

## Deployment
### PreSale
- deploy token
- deploy contract
- token.setController
- transferOwnerShip if necessary

### PreICO
- deploy contract
- token.setController

### ICO
- deploy contract
- token.setController

### After ICO
- token.disableControllersForever()

Use truffle migrate, but since you can't specify which migration to process via truffle migrate
*don't manage to deploy all the contracts at once. Deploying PreSale remove PreICO and ICO migrations!
When deploy preICO after preSale - remove ICO accordingly.*
