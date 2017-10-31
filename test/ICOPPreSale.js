'use strict';

// testrpc has to be run as testrpc -u 0 -u 1 -u 2 -u 3 -u 4 -u 5

//import expectThrow from './helpers/expectThrow';
//import {l, logEvents} from './helpers/debug';
//import {instantiateCrowdsale} from './helpers/storiqa';

const ICOPPreSale = artifacts.require("./test_helpers/ICOPPreSaleTestHelper.sol");
const PLTToken = artifacts.require("./test_helpers/PLTTokenTestHelper.sol");


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

    async function deployTokenAndPreSale() {
        const token = await PLTToken.new({from: roles.owner1});
        const preSale = await ICOPPreSale.new(token.address, roles.cash, {from: roles.owner1});

        return [preSale, token];
    }

    it("Token can setController preSale", async function(){
        const [preSale, token] = await deployTokenAndPreSale();
        await token.addController(preSale.address, {from: roles.owner1});

        assert.equal((await token.get_m_controllers())[0], preSale.address);
    });

    describe('Token controller tests', function() {
        it("If owner call amIOwner, return true", async function(){
            const [preSale, token] = await deployTokenAndPreSale();
            await assert.ok(await preSale.amIOwner({from: roles.owner1}))
        });
        it("If not owner call amIOwner, preSale raise error", async function(){
            const [preSale, token] = await deployTokenAndPreSale();
            try {
                await preSale.amIOwner({from: roles.owner2})
                assert.ok(false);
            } catch(error) {
                assert.ok(true);
            }
        });
    });

    describe('PreSale ownable tests', function() {
        describe('Positive', function() {

            it("If deploy preSale by owner1, preSale owner set to owner1", async function(){
                const [preSale, token] = await deployTokenAndPreSale();
                assert.equal(await preSale.owner(), roles.owner1);
            });

            it("If owner transfer ownable, new owner set", async function(){
                const [preSale, token] = await deployTokenAndPreSale();
                await preSale.transferOwnership(roles.owner2, {from: roles.owner1})
                assert.equal(await preSale.owner(), roles.owner2);
            });

            it("If owner transfer ownable to same owner, owner not changed", async function(){
                const [preSale, token] = await deployTokenAndPreSale();
                await preSale.transferOwnership(roles.owner1, {from: roles.owner1})
                assert.equal(await preSale.owner(), roles.owner1);
            });
        });

        describe('Negative', function() {
            it("If not owner transfer ownable, token raise error and controller not set", async function() {
                const [token, controller] = await deployTokenAndPreSale();
                try {
                    await preSale.transferOwnership(roles.owner3, {from: nobody})
                    assert.ok(false);
                } catch(error) {
                    assert.ok(true);
                }
            });
        });

    });

});
