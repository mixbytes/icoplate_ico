'use strict';

// testrpc has to be run as testrpc -u 0 -u 1 -u 2 -u 3 -u 4 -u 5

// require('babel-register');

// FIXME: use import from solidity library. No Copy-paste. Fix problem with babel
//import {crowdsaleUTest} from '../node_modules/mixbytes-solidity/test/utest/Crowdsale';
//import expectThrow from '../node_modules/mixbytes-solidity/test/helpers/expectThrow';

import {crowdsaleUTest} from './utest/Crowdsale';
import expectThrow from './helpers/expectThrow';

const ICOPICO = artifacts.require("./test_helpers/ICOPICOTestHelper.sol");
const ICOPPreSale = artifacts.require("./test_helpers/ICOPPreSaleTestHelper.sol");

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


// Additional tests
contract('ICOPICO', function(accounts) {
    const roles = {
        cash: accounts[0],
        owner3: accounts[0],
        owner1: accounts[1],
        owner2: accounts[2],
        investor1: accounts[2],
        investor2: accounts[3],
        investor3: accounts[4],
        nobody: accounts[5]
    };

    async function deployTokenAndICO() {
        const token = await PLTToken.new({from: roles.owner1});

        const ico = await ICOPICO.new(
            [roles.owner1, roles.owner2, roles.owner3], token.address, {from: roles.nobody, gas: 30000000}
        );

        await token.addController(ico.address, {from: roles.owner1});
        const funds = await FundsRegistry.at(await ico.getFundsAddress());

        return [ico, token, funds];
    }

    describe('Withdraw', function() {
        /**
         * Start pre-sale. investors buy tokens.
         * Then finish pre-sale ans start ICO. New and old investors buy tokens, but soft cap is not reached.
         * Investors start to withdraw their money back.
         */

        it("Withdraw integration test", async function(){
            const token = await PLTToken.new({from: roles.owner1});
            const presale = await ICOPPreSale.new(token.address, roles.cash, {from: roles.owner1});

            const ico = await ICOPICO.new(
                [roles.owner1, roles.owner2, roles.owner3], token.address, {from: roles.nobody, gas: 30000000}
            );

            const funds = await FundsRegistry.at(await ico.getFundsAddress());

            // Pre-sale
            await token.addController(presale.address, {from: roles.owner1});

            let startTs = await presale._getStartTime();
            await presale.setTime(startTs.plus(1), {from: roles.owner1});

            presale.buy({
                    from: roles.investor1,
                    value: web3.toWei(20, 'finney')
            })
            presale.buy({
                    from: roles.investor2,
                    value: web3.toWei(30, 'finney')
            })

            let balance = await token.balanceOf(roles.investor1, {from: roles.nobody});
            assert(balance.eq(new web3.BigNumber('2.8e+21')));
            balance = await token.balanceOf(roles.investor2, {from: roles.nobody});
            assert(balance.eq(new web3.BigNumber('4.2e+21')));

            let endTs = await presale._getStartTime();
            await presale.setTime(endTs.plus(1), {from: roles.owner1});
            startTs = await presale._getStartTime();
            await ico.setTime(startTs.plus(1), {from: roles.owner1});

            // ICO
            await token.addController(ico.address, {from: roles.owner1});

            ico.buy({
                    from: roles.investor1,
                    value: web3.toWei(30, 'finney')
            })
            ico.buy({
                    from: roles.investor2,
                    value: web3.toWei(40, 'finney')
            })

            ico.buy({
                    from: roles.investor3,
                    value: web3.toWei(20, 'finney')
            })

            endTs = await presale._getEndTime();
            await ico.setTime(endTs.plus(1), {from: roles.owner1});

            balance = await token.balanceOf(roles.investor1, {from: roles.nobody});
            assert(balance.eq(new web3.BigNumber('7.0e+21')));
            balance = await token.balanceOf(roles.investor2, {from: roles.nobody});
            assert(balance.eq(new web3.BigNumber('9.8e+21')));
            balance = await token.balanceOf(roles.investor3, {from: roles.nobody});
            assert(balance.eq(new web3.BigNumber('2.8e+21')));

            await ico.withdrawPayments({from: roles.investor1});
            await ico.withdrawPayments({from: roles.investor2});
            await ico.withdrawPayments({from: roles.investor3});

            balance = await token.balanceOf(roles.investor1, {from: roles.nobody});
            assert(balance.eq(new web3.BigNumber('2.8e+21')));
            balance = await token.balanceOf(roles.investor2, {from: roles.nobody});
            assert(balance.eq(new web3.BigNumber('4.2e+21')));
            balance = await token.balanceOf(roles.investor3, {from: roles.nobody});
            assert(balance.eq(0));
        });
    });

    describe('Invested', function() {
        /**
         * Start ico.
         * Reach hard cap
         * End ICO and check that investments are not allowed
         */

        it("Investment is not allowed after success sale", async function() {
            let [ico, token, funds] = await deployTokenAndICO();

            let startTs = await ico._getStartTime();
            let endTs = await ico._getEndTime();

            await ico.setTime(startTs.plus(1), {from: roles.owner1});

            ico.buy({
                from: roles.investor1,
                value: web3.toWei(50000, 'finney')
            })

            await ico.setTime(endTs.plus(1), {from: roles.owner1});

            let tokenBalanceBefore = await token.balanceOf(roles.investor1, {from: roles.nobody});
            let investorFundsBefore = await web3.eth.getBalance(roles.investor1);

            await expectThrow(ico.buy({
                from: roles.investor1,
                value: web3.toWei(20, 'finney'),
                gasPrice: 0
            }));

            let tokenBalanceAfter = await token.balanceOf(roles.investor1, {from: roles.nobody});
            let investorFundsAfter = await web3.eth.getBalance(roles.investor1);

            assert.equal(tokenBalanceAfter - tokenBalanceBefore, 0);
            assert.equal(investorFundsBefore - investorFundsAfter, 0);
        });
    });
});

