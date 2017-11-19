'use strict';

// testrpc has to be run as testrpc -u 0 -u 1 -u 2 -u 3 -u 4 -u 5

require('babel-register');

// FIXME: use import from solidity library. No Copy-paste. Fix problem with babel
//import {crowdsaleUTest} from '../node_modules/mixbytes-solidity/test/utest/Crowdsale';
//import expectThrow from '../node_modules/mixbytes-solidity/test/helpers/expectThrow';

import {crowdsaleUTest} from './utest/Crowdsale';
import expectThrow from './helpers/expectThrow';


const ICOPPreSale = artifacts.require("./test_helpers/ICOPPreSaleTestHelper.sol");
const PLTToken = artifacts.require("./test_helpers/PLTTokenTestHelper.sol");


const rate = 100000;
const bonus = 40;

// Crowdsale.js tests
contract('ICOPPreSaleCrowdsaleTest', function(accounts) {
    async function instantiate(role) {
        const token = await PLTToken.new({from: role.owner1});
        const crowdsale = await ICOPPreSale.new(token.address, role.owner3, {from: role.nobody});

        await crowdsale.transferOwnership(role.owner1, {from: role.nobody});

        await token.addController(crowdsale.address, {from: role.owner1});

        return [crowdsale, token, role.owner3];
    }

    for (const [name, fn] of crowdsaleUTest(accounts, instantiate, {
        extraPaymentFunction: 'buy',
        rate: rate,
        //
        //softCap: web3.toWei(10, 'finney'),
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
contract('ICOPPreSale', function(accounts) {
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

    async function deployTokenAndCrowdSale() {
        const token = await PLTToken.new({from: roles.owner1});
        const CrowdSale = await ICOPPreSale.new(token.address, roles.cash, {from: roles.owner1});

        await token.addController(CrowdSale.address, {from: roles.owner1});

        return [CrowdSale, token];
    }

    describe('Control token', function() {
        it("Token can setController preSale", async function(){
            const [CrowdSale, token] = await deployTokenAndCrowdSale();
            await token.addController(CrowdSale.address, {from: roles.owner1});

            assert.deepEqual(await token.getControllers({from: roles.owner1}), [CrowdSale.address]);
        });
    });

    describe('Function wcOnCrowdsaleSuccess', function() {

        it("If CrowdSale success contract detach itself from controllers", async function(){
            const [CrowdSale, token] = await deployTokenAndCrowdSale();
            await token.addController(CrowdSale.address, {from: roles.owner1});
            await CrowdSale.setState(1);
            await CrowdSale.wcOnCrowdsaleSuccessPublic({from: roles.owner1})
            assert.deepEqual(await token.getControllers({from: roles.owner1}), []);
        });



    });

    describe('Function wcOnCrowdsaleFailure', function() {
        it("If CrowdSale fail contract detach itself from controllers", async function(){
            const [CrowdSale, token] = await deployTokenAndCrowdSale();
            await token.addController(CrowdSale.address, {from: roles.owner1});
            await CrowdSale.setState(1);
            await CrowdSale.wcOnCrowdsaleFailurePublic({from: roles.owner1})
            assert.deepEqual(await token.getControllers({from: roles.owner1}), []);
        });
    });


    describe('Token controller tests', function() {
        it("If owner call amIOwner, return true", async function(){
            const [CrowdSale, token] = await deployTokenAndCrowdSale();
            await assert.ok(await CrowdSale.amIOwner({from: roles.owner1}))
        });
        it("If not owner call amIOwner, preSale raise error", async function(){
            const [CrowdSale, token] = await deployTokenAndCrowdSale();
            try {
                await CrowdSale.amIOwner({from: roles.owner2})
                assert.ok(false);
            } catch(error) {
                assert.ok(true);
            }
        });
    });

    describe('PreSale ownable tests', function() {
        describe('Positive', function() {

            it("If deploy preSale by owner1, preSale owner set to owner1", async function(){
                const [CrowdSale, token] = await deployTokenAndCrowdSale();
                assert.equal(await CrowdSale.owner(), roles.owner1);
            });

            it("If owner transfer ownable, new owner set", async function(){
                const [CrowdSale, token] = await deployTokenAndCrowdSale();
                await CrowdSale.transferOwnership(roles.owner2, {from: roles.owner1})
                assert.equal(await CrowdSale.owner(), roles.owner2);
            });

            it("If owner transfer ownable to same owner, owner not changed", async function(){
                const [CrowdSale, token] = await deployTokenAndCrowdSale();
                await CrowdSale.transferOwnership(roles.owner1, {from: roles.owner1})
                assert.equal(await CrowdSale.owner(), roles.owner1);
            });

            it("Owner can make investment before starting sale, but investor not", async function(){
                const [CrowdSale, token] = await deployTokenAndCrowdSale();

                await token.addController(CrowdSale.address, {from: roles.owner1});
                await CrowdSale.setTime(CrowdSale._getStartTime() - 1, {from: roles.owner1});

                await expectThrow(CrowdSale.buy({
                    from: roles.investor1,
                    value: web3.toWei(20, 'finney')
                }));

                assert.equal(await token.balanceOf(roles.investor1, {from: roles.nobody}), 0);
                await CrowdSale.buy({from: roles.owner1, value: web3.toWei(20, 'finney')});
                assert.isAbove(await token.balanceOf(roles.owner1, {from: roles.nobody}), (20*rate)*(100+bonus)/100);
            });
        });

        describe('Negative', function() {
            it("If not owner transfer ownable, token raise error and controller not set", async function() {
                const [CrowdSale, token] = await deployTokenAndCrowdSale();
                try {
                    await CrowdSale.transferOwnership(roles.owner3, {from: nobody})
                    assert.ok(false);
                } catch(error) {
                    assert.ok(true);
                }
            });
        });

        describe('States', function() {
            it("Can't invest during pause", async function() {
                const [CrowdSale, token] = await deployTokenAndCrowdSale();

                // TODO
            });
        });

    });
});
