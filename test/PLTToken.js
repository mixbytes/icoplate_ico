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

        await token.addController(roles.owner2, {from: roles.owner1});

        return [token, roles.owner2];
    };

    describe('Token ownable tests', function() {
        describe('Positive', function() {

            it("If owner transfer ownable, new owner set", async function(){
                const token = await deployToken();
                await token.transferOwnership(roles.owner3, {from: roles.owner1})
                assert.equal(await token.owner(), roles.owner3);
            });

            it("If owner transfer ownable to same owner, owner not changed", async function(){
                const token = await deployToken();
                await token.transferOwnership(roles.owner1, {from: roles.owner1})
                assert.equal(await token.owner(), roles.owner1);
            });
        });

        describe('Negative', function() {
            it("If not owner transfer ownable, token raise error and controller not set", async function() {
                const [token, controller] = await deployTokenWithController();
                try {
                    await token.transferOwnership(roles.owner3, {from: nobody})
                    assert.ok(false);
                } catch(error) {
                    assert.ok(true);
                }
            });

            it("If controller transfer ownable, token raise error and controller not set", async function() {
                const [token, controller] = await deployTokenWithController();
                try {
                    await token.transferOwnership(roles.owner3, {from: controller})
                    assert.ok(false);
                } catch(error) {
                    assert.ok(true);
                }
            });
        });
    });

    describe('Token controller tests', function() {
        describe('Positive', function() {

            it("If nobody addControllers, m_controllers is empty", async function(){
                const token = await deployToken();
                assert.deepEqual(await token.getControllers({from: roles.owner1}), []);
            });

            it("If owner addController, controller added", async function(){
                const token = await deployToken();
                await token.addController(roles.owner2, {from: roles.owner1})
                assert.deepEqual(await token.getControllers({from: roles.owner1}), [roles.owner2]);
            });

            it("If owner add 5 controllers, controller added", async function(){
                const token = await deployToken();
                await token.addController(accounts[2], {from: roles.owner1})
                await token.addController(accounts[3], {from: roles.owner1})
                await token.addController(accounts[4], {from: roles.owner1})
                await token.addController(accounts[5], {from: roles.owner1})
                await token.addController(accounts[6], {from: roles.owner1})
                assert.deepEqual(
                    await token.getControllers({from: roles.nobody}),
                    [accounts[2], accounts[3], accounts[4], accounts[5], accounts[6]]
                );
            });

            it("If owner Disable controller, setController is disabled forever", async function() {
                const [token, controller] = await deployTokenWithController();

                await token.detachControllersForever({from: roles.owner1});

                try {
                    await token.addController(roles.owner3, {from: roles.owner1});
                    assert.ok(false);
                } catch(error) {
                    assert.ok(true);
                }
            });

        });

        describe('Negative', function() {

            it("If owner add 6 controllers, 5 controller added, and 6th not added", async function(){
                const token = await deployToken();
                await token.addController(accounts[2], {from: roles.owner1})
                await token.addController(accounts[3], {from: roles.owner1})
                await token.addController(accounts[4], {from: roles.owner1})
                await token.addController(accounts[5], {from: roles.owner1})
                await token.addController(accounts[6], {from: roles.owner1})
                try {
                    await token.addController(accounts[7], {from: roles.owner1})
                    assert.ok(false);
                } catch(error) {
                    assert.ok(true);
                }
                assert.deepEqual(
                    await token.getControllers({from: roles.nobody}),
                    [accounts[2], accounts[3], accounts[4], accounts[5], accounts[6]]
                );
            });

            it("If not owner addController, token raise error and controller not set", async function(){
                const token = await deployToken();
                try {
                    await token.addController(roles.investor2, {from: roles.investor2})
                    assert.ok(false);
                } catch(error) {
                    assert.ok(true);
                }
                assert.deepEqual(await token.getControllers({from: roles.owner1}), []);
            });

            it("If controller addController, token raise error and controller not set", async function(){
                const [token, controller] = await deployTokenWithController();
                try {
                    await token.addController(roles.investor2, {from: controller})
                    assert.ok(false);
                } catch(error) {
                    assert.ok(true);
                }
                console.log(roles.investor2)
                assert.deepEqual(await token.getControllers({from: roles.owner1}), [controller]);
            });

            it("If not owner disable controller, token raise error and controller not set", async function() {
                const [token, controller] = await deployTokenWithController();
                try {
                    await token.detachControllersForever({from: roles.nobody});
                    assert.ok(false);
                } catch(error) {
                    assert.ok(true);
                }
            });

            it("If controller disable controller, token raise error and controller not set", async function() {
                const [token, controller] = await deployTokenWithController();
                try {
                    await token.detachControllersForever({from: controller});
                    assert.ok(false);
                } catch(error) {
                    assert.ok(true);
                }
            });

        });
    })

    describe('Token information tests', function() {
        it("Token name is correct", async function() {
            const token = await deployToken();
            const tokenName = await token.name({from: roles.nobody})
            assert.equal(tokenName, name);
        });

        it("Token symbol is correct", async function() {
            const token = await deployToken();
            const tokenSymbol = await token.symbol({from: roles.nobody})
            assert.equal(tokenSymbol, symbol);
        });
    });

    // Mint tests
    describe('Minting tests', function() {
        describe('Positive', function() {
            it("Controller can mint 1 token", async function() {
                const [token, controller] = await deployTokenWithController();

                await token.mint(roles.investor1, PLT(1), {from: controller});
                assert.equal(
                    await token.balanceOf(roles.investor1, {from: roles.nobody}),
                    PLT(1)
                );
            });

            it("Controller can mint 0 token, but it doesn't increase balance", async function() {
                const [token, controller] = await deployTokenWithController();

                await token.mint(roles.investor1, PLT(0), {from: controller});
                assert.equal(await token.balanceOf(roles.investor1, {from: roles.nobody}), PLT(0));
            });

        });

        describe('Negative', function() {
            it("Not controller can't mint", async function() {
                const [token, controller] = await deployTokenWithController();

                var result;

                try {
                    await token.mint(roles.investor1, PLT(1), {from: roles.nobody});
                    result = false;
                } catch(error) {
                    result = true;
                }

                assert.ok(result);
                assert.equal(
                    await token.balanceOf(roles.investor1, {from: roles.nobody}),
                    PLT(0)
                );
            });

            it("Controller can mint -1 token, but it doesn't increase balance", async function() {
                const [token, controller] = await deployTokenWithController();

                await token.mint(roles.investor1, PLT(-1), {from: controller});
                assert.equal(await token.balanceOf(roles.investor1, {from: roles.nobody}), PLT(0));
            });
        });
    });

    describe('Token transfer tests', function() {
        describe('Positive', function(){
            it("Token can be transferred after start", async function() {
                const [token, controller] = await deployTokenWithController();
                await token.startCirculation({from: controller})
                await token.mint(roles.investor1, PLT(3), {from: controller});
                await token.transfer(roles.investor2, PLT(1), {from: roles.investor1});

                assert.equal(await token.balanceOf(roles.investor1, {from: roles.nobody}), PLT(2));
                assert.equal(await token.balanceOf(roles.investor2, {from: roles.nobody}), PLT(1));
            });
        });

        describe('Negative', function(){
            it("Token can not be transferred at start", async function() {
                const [token, controller] = await deployTokenWithController();

                await token.mint(roles.investor1, PLT(1), {from: controller});

                var result;
                try {
                    await token.transfer(roles.investor2, PLT(1), {from: roles.investor1});
                    result = false;
                } catch(error) {
                    result = true;
                }

                assert.ok(result);
            });

        });
    });

    describe('Token circulation tests', function() {
        describe('Positive', function() {
            it("Circulation disable at start", async function() {
                const [token, controller] = await deployTokenWithController();
                assert.equal(await token.m_isSetControllerDisabled(), false)
            });
        });

        describe('Negative', function() {

        });
    });


    it("Controller can burn valid number of tokens", async function() {
        const [token, controller] = await deployTokenWithController();

        await token.mint(roles.investor1, PLT(10), {from: controller});
        await token.burn(roles.investor1, PLT(3), {from: controller});

        assert.equal(
            await token.balanceOf(roles.investor1, {from: roles.nobody}),
            PLT(7)
        );
    });

    it("Controller can't burn invalid number of tokens", async function() {
        const [token, controller] = await deployTokenWithController();

        await token.mint(roles.investor1, PLT(10), {from: controller});


        let result = false;
        try {
            await token.burn(roles.investor1, PLT(11), {from: controller});
        } catch(error) {
            result = true;
        }

        assert.ok(result);
    });
});
