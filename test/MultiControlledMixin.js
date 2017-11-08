'use strict';

// testrpc has to be run as testrpc -u 0 -u 1

import expectThrow from './helpers/expectThrow';
import skipException from './helpers/skipException';

const MultiControlledMixinHelper = artifacts.require("./test_helpers/MultiControlledMixinHelper.sol");

contract('MultiControlledMixinHelper', function(accounts) {

    const roles = {
        controller1: accounts[0],
        controller2: accounts[1],
        controller3: accounts[2],
        controller4: accounts[3],
        controller5: accounts[4],
        owner1: accounts[5],
        nobody: accounts[9]
    };

    async function deployMultiControlledMixin() {
        const MultiControlledMixin = await MultiControlledMixinHelper.new({from: roles.owner1});
        return [MultiControlledMixin, roles.owner1];
    };

    it("Test isController", async function() {
        const [MultiControlledMixin, owner] = await deployMultiControlledMixin();

        assert(!(await MultiControlledMixin.isControllerPublic(roles.controller1, {from: roles.nobody})));

        await MultiControlledMixin.addController(roles.controller1, {from: roles.owner1});

        assert(await MultiControlledMixin.isControllerPublic(roles.controller1, {from: roles.nobody}));
        assert(!(await MultiControlledMixin.isControllerPublic(roles.controller2, {from: roles.nobody})));
    });

})