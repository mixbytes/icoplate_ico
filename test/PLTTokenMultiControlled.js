'use strict';

// testrpc has to be run as testrpc -u 0 -u 1
const PLTToken = artifacts.require("./PLTToken.sol");

const name = 'ICOPlate Token';
const symbol = 'PLT';
const decimals = 18;

const zeroAddress = "0x0000000000000000000000000000000000000000";


contract('PLTToken', function(accounts) {

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

    // converts amount of PLT into PLT-wei
    function PLT(amount) {
        return web3.toWei(amount, 'ether');
    }

    async function deployToken() {
        const token = await PLTToken.new({from: roles.owner1});

        return token;
    };

    async function deployTokenWithController() {
        const token = await PLTToken.new({from: roles.owner1});

        await token.setController(roles.owner2, {from: roles.owner1});

        return [token, roles.owner2];
    };


    it("TEST", async function() {
        const [token, controller] = await deployTokenWithController();
        assert.ok(true);
    });
});
