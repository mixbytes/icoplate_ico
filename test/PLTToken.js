'use strict';

// testrpc has to be run as testrpc -u 0 -u 1

import expectThrow from './helpers/expectThrow';

const PLTToken = artifacts.require("./test_helpers/PLTTokenTestHelper.sol");

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
        controller1: accounts[2],
        controller2: accounts[3],
        controller3: accounts[4],
        investor1: accounts[2],
        investor2: accounts[4],
        investor3: accounts[5],
        nobody: accounts[9]
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

        await token.addController(roles.controller1, {from: roles.owner1});

        return [token, roles.owner2];
    };

    describe('Token circulation tests', function() {
            describe('Positive', function() {
                it("Circulation disable at start", async function() {
                    const token = await deployToken();
                    assert.equal(await token.m_isSetControllerDisabled(), false);
                });
                it("If start circulation from controller, m_isCirculating == true", async function() {
                    const [token, controller] = await deployTokenWithController();
                    await token.startCirculation({from: controller});
                    assert.equal(await token.m_isCirculating(), true);
                });
                it("If start circulation from controller, token doesn't raise error", async function() {
                    const [token, controller] = await deployTokenWithController();
                    await token.startCirculation({from: controller});
                });
            });

            describe('Negative', function() {
                it("If start circulation again from controller, m_isCirculating not changed", async function() {
                    const [token, controller] = await deployTokenWithController();
                    await token.startCirculation({from: controller});
                    await expectThrow(token.startCirculation({from: controller}));
                    assert.equal(await token.m_isCirculating(), true);
                });
                it("m_isCirculating = true, if start circulation from controller, token raise error", async function() {
                    const [token, controller] = await deployTokenWithController();
                    await token.startCirculation({from: controller});
                    await expectThrow(token.startCirculation({from: controller}));
                });
                // owner
                it("If start circulation from owner, token raise error", async function() {
                    const token = await deployToken();
                    await expectThrow(token.startCirculation({from: roles.owner1}));
                });
                it("m_isCirculating = true, if start circulation from owner, token raise error", async function() {
                    const [token, controller] = await deployTokenWithController();
                    await token.startCirculation({from: controller});
                    await expectThrow(token.startCirculation({from: roles.owner1}));
                });
                it("m_isCirculating = true, if start circulation from owner, m_isCirculating not changed", async function() {
                    const [token, controller] = await deployTokenWithController();
                    token.startCirculation({from: controller});
                    await expectThrow(token.startCirculation({from: roles.owner1}));
                    assert.equal(await token.m_isCirculating(), true);
                });
                it("If start circulation from owner, m_isCirculating not changed", async function() {
                    const [token, controller] = await deployTokenWithController();
                    await expectThrow(token.startCirculation({from: roles.owner1}));
                    assert.equal(await token.m_isSetControllerDisabled(), false);
                });
                // nobody
                it("If start circulation from nobody, token raise error", async function() {
                    const token = await deployToken();
                    await expectThrow(token.startCirculation({from: roles.nobody}));
                });
                it("If start circulation from nobody, m_isCirculating not changed", async function() {
                    const token = await deployToken();
                    await expectThrow(token.startCirculation({from: roles.nobody}));
                    assert.equal(await token.m_isSetControllerDisabled(), false);
                });
                it("m_isCirculating = true, if start circulation from nobody, token raise error", async function() {
                    const [token, controller] = await deployTokenWithController();
                    await token.startCirculation({from: controller});
                    await expectThrow(token.startCirculation({from: roles.nobody}));
                });
                it("m_isCirculating = true, if start circulation from nobody, m_isCirculating not changed", async function() {
                    const [token, controller] = await deployTokenWithController();
                    await token.startCirculation({from: controller});
                    await expectThrow(token.startCirculation({from: roles.nobody}));
                    assert.equal(await token.m_isCirculating(), true);
                });
            });
        });
});
