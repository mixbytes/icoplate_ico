'use strict';

// testrpc has to be run as testrpc -u 0 -u 1 -u 2 -u 3 -u 4 -u 5

// require('babel-register');

// FIXME: use import from solidity library. No Copy-paste. Fix problem with babel
//import {crowdsaleUTest} from '../node_modules/mixbytes-solidity/test/utest/Crowdsale';
//import expectThrow from '../node_modules/mixbytes-solidity/test/helpers/expectThrow';

import {crowdsaleUTest} from './utest/Crowdsale';
import expectThrow from './helpers/expectThrow';

const ICOPICO = artifacts.require("./test_helpers/ICOPICOTestHelper.sol");
const PLTToken = artifacts.require("./test_helpers/PLTTokenTestHelper.sol");
const FundsRegistry = artifacts.require("./mixbytes-solidity/contracts/crowdsale/FundsRegistry.sol");

const rate = 100000;
const bonus = 40;


// Crowdsale.js tests
contract('ICOPICOCrowdsaleTest', function(accounts) {
    async function instantiate(role) {
        const token = await PLTToken.new({from: role.owner1});

        const crowdsale = await ICOPICO.new(
            [role.owner1, role.owner2, role.owner3], token.address, {from: role.nobody, gas: 30000000}
        );

        await token.addController(crowdsale.address, {from: role.owner1});
        const funds = await FundsRegistry.at(await crowdsale.getFundsAddress());

        return [crowdsale, token, funds];
    }

    for (const [name, fn] of crowdsaleUTest(accounts, instantiate, {
        usingFund: true,
        extraPaymentFunction: 'buy',
        rate: rate,
        softCap: web3.toWei(1000, 'finney'),
        hardCap: web3.toWei(4000, 'finney'),
        startTime: 1509840000,
        endTime: 1509840000 + 12*24*60*60,
        maxTimeBonus: bonus,
        firstPostICOTxFinishesSale: true,
        postICOTxThrows: true,
        hasAnalytics: true,
        analyticsPaymentBonus: 0,
        // No circulation
        tokenTransfersDuringSale: false
    }))
        it(name, fn);
});


