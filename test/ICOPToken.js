'use strict';

// testrpc has to be run as testrpc -u 0 -u 1
const ICOPPreSale = artifacts.require("./ICOPPreSale.sol");
const ICOPPreICO = artifacts.require("./ICOPPreICO.sol");
const ICOPToken = artifacts.require("./ICOPToken.sol");

const name = 'ICOPlate Token';
const symbol = 'ICOP';
const decimals = 18;

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

    async function instantiate() {
        const role = getRoles();

        const token = await ICOPToken.new([role.owner1, role.owner2, role.owner3], {from: role.nobody});

        await token.setController(role.owner1, {from: role.owner1});
        await token.setController(role.owner1, {from: role.owner2});

        await token.mint(role.investor1, ICOP(10), {from: role.owner1});
        await token.mint(role.investor2, ICOP(12), {from: role.owner1});
        await token.disableMinting({from: role.owner1});

        await token.startCirculation({from: role.owner1});

        return token;
    }

    async function deployToken() {
        const roles = getRoles();
        const token = await ICOPToken.new([roles.owner1, roles.owner2, roles.owner3], {from: roles.nobody});
        return [token, roles];
    };

    async function deployTokenWithController() {
        const roles = getRoles();
        const token = await ICOPToken.new([roles.owner1, roles.owner2, roles.owner3], {from: roles.nobody});

        await token.setController(roles.owner1, {from: roles.owner1});
        await token.setController(roles.owner1, {from: roles.owner2});

        return [token, roles, roles.owner1];
    };


    it("If nobody setController, token controller is 0x0.....", async function(){
        const [token, roles] = await deployToken();

        assert.equal(await token.m_controller(), "0x0000000000000000000000000000000000000000");
    });

    it("If not quorum setController, token controller is 0x0.....", async function(){
        const [token, roles] = await deployToken();

        await token.setController(roles.owner1, {from: roles.owner1});

        assert.equal(await token.m_controller(), "0x0000000000000000000000000000000000000000");
    });

    it("If Quorum setController, token controller match with set address", async function(){
        const [token, roles] = await deployToken();

        await token.setController(roles.owner1, {from: roles.owner1});
        await token.setController(roles.owner1, {from: roles.owner2});

        assert.equal(await token.m_controller(), roles.owner1);
    });

    it("If another Quorum setController, token controller match with set address", async function(){
        const [token, roles] = await deployToken();

        await token.setController(roles.owner1, {from: roles.owner1});
        await token.setController(roles.owner1, {from: roles.owner2});

        assert.equal(await token.m_controller(), roles.owner1);
    });

    it("If all owners setController, token controller match with set address", async function(){
        const [token, roles] = await deployToken();

        await token.setController(roles.owner1, {from: roles.owner1});
        await token.setController(roles.owner1, {from: roles.owner2});
        await token.setController(roles.owner1, {from: roles.owner3});

        assert.equal(await token.m_controller(), roles.owner1);
    });

    it("If not owners setController not owner, token raise error and controllers not set", async function(){
        const [token, roles] = await deployToken();

        var result;

        try {
            await token.setController(roles.investor2, {from: roles.investor2})
            result = false;
        } catch(error) {
            result = true;
        }

        assert.ok(result);

        assert.equal(await token.m_controller(), "0x0000000000000000000000000000000000000000");

    });

    it("If not owners setController owner, token raise error and controllers not set", async function(){
        const [token, roles] = await deployToken();

        var result;

        try {
            await token.setController(roles.owner1, {from: roles.investor2})
            result = false;
        } catch(error) {
            result = true;
        }

        assert.ok(result);

        assert.equal(await token.m_controller(), "0x0000000000000000000000000000000000000000");

    });

    it("If owner and not owners setController, token raise error and controllers not set", async function(){
        const [token, roles] = await deployToken();

        var result;

        await token.setController(roles.owner1, {from: roles.owner1});

        try {
            await token.setController(roles.owner1, {from: roles.investor2})
            result = false;
        } catch(error) {
            result = true;
        }

        assert.ok(result);

        assert.equal(await token.m_controller(), "0x0000000000000000000000000000000000000000");

    });

    it("Token name is correctly", async function() {
        const [token, roles] = await deployToken();
        const tokenName = await token.name({from: roles.nobody})
        assert.equal(tokenName, name);
    });

    it("Token symbol is correctly", async function() {
        const [token, roles] = await deployToken();
        const tokenSymbol = await token.symbol({from: roles.nobody})
        assert.equal(tokenSymbol, symbol);
    });

    it("Controller can mint 1 token", async function() {
        const [token, roles, controller] = await deployTokenWithController();
        await token.mint(roles.investor1, ICOP(1), {from: controller});
        console.log(await token.balanceOf(roles.investor1, {from: roles.nobody}))
        assert.equal(await token.balanceOf(roles.investor1, {from: roles.nobody}), ICOP(1));
    });

    it("Controller can mint 1 token", async function() {
        const [token, roles, controller] = await deployTokenWithController();
        await token.mint(roles.investor1, ICOP(1), {from: controller});
        console.log(await token.balanceOf(roles.investor1, {from: roles.nobody}))
        assert.equal(await token.balanceOf(roles.investor1, {from: roles.nobody}), ICOP(1));
    });

    it("Controller can mint 0 token, but it not increase balance", async function() {
        const [token, roles, controller] = await deployTokenWithController();
        await token.mint(roles.investor1, ICOP(0), {from: controller});
        console.log(await token.balanceOf(roles.investor1, {from: roles.nobody}))
        assert.equal(await token.balanceOf(roles.investor1, {from: roles.nobody}), ICOP(0));
    });

    it("!!! Controller can mint -1 token, but it not increase balance", async function() {
        const [token, roles, controller] = await deployTokenWithController();
        await token.mint(roles.investor1, ICOP(-1), {from: controller});
        console.log(await token.balanceOf(roles.investor1, {from: roles.nobody}))
        assert.equal(await token.balanceOf(roles.investor1, {from: roles.nobody}), ICOP(0));
    });

//    it("Controller can disable mint", async function() {
//        const [token, roles, controller] = await deployTokenWithController();
//        await token.disableMinting({from: controller});
//        await token.mint(roles.investor1, ICOP(1), {from: controller});
//        assert.equal(await token.balanceOf(roles.investor1, {from: roles.nobody}), ICOP(1));
//    });

//    it("Not controller can not disable mint", async function() {
//        const [token, roles, controller] = await deployTokenWithController();
//        await token.disableMinting({from: roles.nobody});
//        await token.mint(roles.investor1, ICOP(1), {from: controller});
//        assert.equal(await token.balanceOf(roles.investor1, {from: roles.nobody}), ICOP(1));
//    });



    it("test ERC20 is supported", async function() {
        const role = getRoles();
        const token = await instantiate();

        await token.name({from: role.nobody});
        await token.symbol({from: role.nobody});
        await token.decimals({from: role.nobody});


//        console.log(await token.decimals({from: role.nobody}));

        console.log(await token.totalSupply({from: role.nobody}));
//        console.log(await token.totalSupply({from: role.nobody}).eq(ICOP(22)));


        assert((await token.totalSupply({from: role.nobody})).eq(ICOP(22)));

        console.log(await token.balanceOf(role.investor1, {from: role.nobody}))

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
});
