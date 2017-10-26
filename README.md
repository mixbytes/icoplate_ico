# icoplate_ico
ICOPlace ICO

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
Use truffle migrate, but since you can't specify which migration to process via truffle migrate
*Don't manage to deploy all the contracts at once. Deploying PreSale remove PreICO AND ICO migrations!
When deploy preICO after preSale - remove ICO accordingly*
