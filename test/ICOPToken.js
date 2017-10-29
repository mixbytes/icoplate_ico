'use strict';

// testrpc has to be run as testrpc -u 0 -u 1
const ICOPToken = artifacts.require("./ICOPToken.sol");

const name = 'ICOPlate Token';
const symbol = 'ICOP';
const decimals = 18;

const zeroAddress = "0x0000000000000000000000000000000000000000";


contract('ICOPToken', function(accounts) {

    function getRoles() {
        return {
            cash: accounts[0],
            owner3: accounts[0],
            owner1: accounts[1],
            owner2: accounts[2],
            investor1: accounts[2],
            investor2: accounts[3],
            investor3: accounts[4],
            nobody: accounts[5]
        };
    }

    // converts amount of ICOP into ICOP-wei
    function ICOP(amount) {
        return web3.toWei(amount, 'ether');
    }

    async function deployToken() {
        const roles = getRoles();
        const token = await ICOPToken.new({from: roles.owner1});

        return token;
    };

    async function deployTokenWithController() {
        const roles = getRoles();
        const token = await ICOPToken.new({from: roles.owner1});

        await token.setController(roles.owner2, {from: roles.owner1});
        await token.setController(roles.owner1, {from: roles.owner1});

        return [token, roles.owner1];
    };


    it("If nobody setController, token controller is 0x0.....", async function(){
        const token = await deployToken();

        assert.equal(await token.m_controller(), zeroAddress);
    });


    it("If not owners setController not owner, token raise error and controllers not set", async function(){
        const token = await deployToken();
        const roles = getRoles();

        var result;

        try {
            await token.setController(roles.investor2, {from: roles.investor2})
            result = false;
        } catch(error) {
            result = true;
        }

        assert.ok(result);

        assert.equal(await token.m_controller(), zeroAddress);

    });

    it("If not owners setController owner, token raise error and controllers not set", async function(){
        const token = await deployToken();
        const roles = getRoles();

        var result;

        try {
            await token.setController(roles.owner1, {from: roles.investor2})
            result = false;
        } catch(error) {
            result = true;
        }

        assert.ok(result);

        assert.equal(await token.m_controller(), zeroAddress);

    });

    it("Token name is correct", async function() {
        const token = await deployToken();
        const roles = getRoles();

        const tokenName = await token.name({from: roles.nobody})
        assert.equal(tokenName, name);
    });

    it("Token symbol is correct", async function() {
        const token = await deployToken();
        const roles = getRoles();

        const tokenSymbol = await token.symbol({from: roles.nobody})
        assert.equal(tokenSymbol, symbol);
    });

    it("Controller can mint 1 token", async function() {
        const [token, controller] = await deployTokenWithController();
        const roles = getRoles();

        await token.mint(roles.investor1, ICOP(1), {from: controller});
        assert.equal(
            await token.balanceOf(roles.investor1, {from: roles.nobody}),
            ICOP(1)
        );
    });

    it("Controller can mint 0 token, but it doesn't increase balance", async function() {
        const [token, controller] = await deployTokenWithController();
        const roles = getRoles();

        await token.mint(roles.investor1, ICOP(0), {from: controller});
        assert.equal(await token.balanceOf(roles.investor1, {from: roles.nobody}), ICOP(0));
    });

    it("Controller can mint -1 token, but it doesn't increase balance", async function() {
        const [token, controller] = await deployTokenWithController();
        const roles = getRoles();

        await token.mint(roles.investor1, ICOP(-1), {from: controller});
        assert.equal(await token.balanceOf(roles.investor1, {from: roles.nobody}), ICOP(0));
    });

    it("Token can not be transferred at start", async function() {
        const [token, controller] = await deployTokenWithController();
        const roles = getRoles();

        await token.mint(roles.investor1, ICOP(1), {from: controller});

        var result;
        try {
            await token.transfer(roles.investor2, ICOP(1), {from: roles.investor1});
            result = false;
        } catch(error) {
            result = true;
        }

        assert.ok(result);
    });

    it("test ERC20 is supported", async function() {
        const role = getRoles();

        const [token, controller] = await deployTokenWithController();
        const roles = getRoles();

        await token.name({from: role.nobody});
        await token.symbol({from: role.nobody});
        await token.decimals({from: role.nobody});


        assert((await token.totalSupply({from: role.nobody})).eq(ICOP(22)));

        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), ICOP(10));

        await token.transfer(role.investor2, ICOP(2), {from: role.investor1});
        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), ICOP(8));
        assert.equal(await token.balanceOf(role.investor2, {from: role.nobody}), ICOP(14));

        await token.approve(role.investor2, ICOP(3), {from: role.investor1});
        assert.equal(await token.allowance(role.investor1, role.investor2, {from: role.nobody}), ICOP(3));
        await token.transferFrom(role.investor1, role.investor3, ICOP(2), {from: role.investor2});
        assert.equal(await token.allowance(role.investor1, role.investor2, {from: role.nobody}), ICOP(1));
        assert.equal(await token.balanceOf(role.investor1, {from: role.nobody}), ICOP(6));
        assert.equal(await token.balanceOf(role.investor2, {from: role.nobody}), ICOP(14));
        assert.equal(await token.balanceOf(role.investor3, {from: role.nobody}), ICOP(2));
    });

    it("Test Disable controller forever", async function() {
        const [token, controller] = await deployTokenWithController();
        const roles = getRoles();

        await token.detachControllerForever({from: roles.owner1});

        let result = false;
        try {
            await token.setController(roles.owner3, {from: roles.owner1});
        } catch(error) {
            result = true;
        }

        // Yes, we can't set controller now
        assert.ok(result);
    });

    it("Controller can burn valid number of tokens", async function() {
        const [token, controller] = await deployTokenWithController();
        const roles = getRoles();

        await token.mint(roles.investor1, ICOP(10), {from: controller});
        await token.burn(roles.investor1, ICOP(3), {from: controller});

        assert.equal(
            await token.balanceOf(roles.investor1, {from: roles.nobody}),
            ICOP(7)
        );
    });

    it("Controller can't burn invalid number of tokens", async function() {
        const [token, controller] = await deployTokenWithController();
        const roles = getRoles();

        await token.mint(roles.investor1, ICOP(10), {from: controller});

        let result = false;
        try {
            await token.burn(roles.investor1, ICOP(11), {from: controller});
        } catch(error) {
            result = true;
        }

        assert.ok(result);
    });
});
