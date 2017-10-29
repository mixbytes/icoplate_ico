'use strict';

// testrpc has to be run as testrpc -u 0 -u 1 -u 2 -u 3 -u 4 -u 5

//import expectThrow from './helpers/expectThrow';
//import {l, logEvents} from './helpers/debug';
//import {instantiateCrowdsale} from './helpers/storiqa';

const ICOPPreSale = artifacts.require("./ICOPPreSale.sol");
const ICOPToken = artifacts.require("./ICOPToken.sol");


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
        const token = await ICOPToken.new(roles.owner1, {from: roles.nobody});
        const preSale = await ICOPPreSale.new(token.address, roles.cash, {from: roles.nobody});

        return [preSale, token];
    }

    async function instantiate() {
        const token = await ICOPToken.new(roles.owner1, {from: roles.nobody});
        const preSale = await ICOPPreSale.new(token.address, roles.cash, {from: roles.nobody});

        preSale.transferOwnership(roles.owner1, {from: roles.nobody});

        await token.setController(preSale.address, {from: roles.owner1});
        await token.setController(preSale.address, {from: roles.owner2});

        return [preSale, token, roles.cash];
    }

    async function assertBalances(preSale, token, cash, cashInitial, added) {
        assert.equal(await web3.eth.getBalance(preSale.address), 0);
        assert.equal(await web3.eth.getBalance(token.address), 0);
        assert((await web3.eth.getBalance(cash)).sub(cashInitial).eq(added));
    }

    // converts amount of STQ into STQ-wei
    function STQ(amount) {
        // decimals is the same as in ether, so..
        return web3.toWei(amount, 'ether');
    }

    async function checkNoTransfers(token) {

        await expectThrow(token.transfer(roles.nobody, STQ(2.5), {from: roles.nobody}));
        await expectThrow(token.transfer(roles.investor3, STQ(2.5), {from: roles.nobody}));
        await expectThrow(token.transfer(roles.investor3, STQ(2.5), {from: roles.investor2}));
    }


    it("test instantiation", async function() {
        const cashInitial = await web3.eth.getBalance(roles.cash);

        const [preSale, token, cash] = await instantiate();

        assert.equal(await token.m_controller(), preSale.address);

        await assertBalances(preSale, token, cash, cashInitial, 0);
    });

    it("Token can setController preSale", async function(){
        const [preSale, token] = await deployTokenAndPreSale();

        await token.setController(preSale.address, {from: roles.owner1});
        await token.setController(preSale.address, {from: roles.owner2});

        assert.equal(await token.m_controller(), preSale.address);
    });


});
