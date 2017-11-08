'use strict';

// testrpc has to be run as testrpc -u 0 -u 1

import expectThrow from './helpers/expectThrow';
import skipException from './helpers/skipException';

const StatefulMixinTestHelper = artifacts.require("./test_helpers/StatefulMixinTestHelper.sol");

contract('StatefulMixinTestHelper', function(accounts) {

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

    async function deployStatefulMixin() {
        const StatefulMixin = await StatefulMixinTestHelper.new({from: roles.owner1});

        return [StatefulMixin, roles.owner1];
    };

//    0 - INIT
//    1 - RUNNING
//    2 - PAUSED
//    3 - FAILED
//    4 - SUCCEEDED

    it("Initial state at start is INIT", async function() {
        const [StatefulMixin, owner] = await deployStatefulMixin();
        assert.equal(await StatefulMixin.m_state(), '0');
    });

    describe('Call pause()', function() {
        it("If call pause and state is INIT, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await expectThrow(StatefulMixin.pause({from:owner}));
        });
        it("If call pause and state is RUNNING, state changed to PAUSED", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(1);
            await StatefulMixin.pause({from:owner});
            assert.equal(await StatefulMixin.m_state(), 2);
        });
        it("If call pause and state is PAUSED, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(2);
            await expectThrow(StatefulMixin.pause({from:owner}));
        });
        it("If call pause and state is FAILED, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(3);
            await expectThrow(StatefulMixin.pause({from:owner}));
        });
        it("If call pause and state is SUCCEEDED, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(4);
            await expectThrow(StatefulMixin.pause({from:owner}));
        });
    });

    describe('Call unpause()', function() {

        it("If not owner call unpause, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(2);
            await expectThrow(StatefulMixin.unpause({from:roles.nobody}));
        });
        it("If call fail and state is INIT, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await expectThrow(StatefulMixin.unpause({from:owner}));
        });
        it("If call unpause and state is RUNNING, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(1);
            await expectThrow(StatefulMixin.unpause({from:owner}));
        });
        it("If call unpause and state is PAUSED, state changed to RUNNING", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(2);
            await StatefulMixin.unpause({from:owner});
            assert.equal(await StatefulMixin.m_state({from:owner}), 1);
        });
        it("If call unpause and state is FAILED, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(3);
            await expectThrow(StatefulMixin.unpause({from:owner}));
        });
        it("If call unpause and state is SUCCEEDED, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(4);
            await expectThrow(StatefulMixin.unpause({from:owner}));
        });
    });

    describe('Change state INIT', function() {
        it("If change State INIT to INIT throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await expectThrow(StatefulMixin.changeStatePublic(0));
        });

        it("If change State INIT to RUNNING throw function changeState, state changed to RUNNING", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.changeStatePublic(1);
            assert.equal(await StatefulMixin.m_state(), 1);
        });

        it("If change State INIT to PAUSED throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await expectThrow(StatefulMixin.changeStatePublic(2));
        });

        it("If change State INIT to FAILED throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await expectThrow(StatefulMixin.changeStatePublic(3));
        });

        it("If change State INIT to SUCCEEDED throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await expectThrow(StatefulMixin.changeStatePublic(4));
        });
    });

    describe('Change state RUNNING', function() {
        it("If change State RUNNING to INIT throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(1);
            await expectThrow(StatefulMixin.changeStatePublic(0));
        });

        it("If change State RUNNING to RUNNING throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(1);
            await expectThrow(StatefulMixin.changeStatePublic(1));
        });

        it("If change State RUNNING to PAUSED throw function changeState, state changed to PAUSED", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(1);
            await StatefulMixin.changeStatePublic(2);
            assert.equal(await StatefulMixin.m_state(), 2);
        });

        it("If change State RUNNING to FAILED throw function changeState, state changed to FAILED", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(1);
            await StatefulMixin.changeStatePublic(3);
            assert.equal(await StatefulMixin.m_state(), 3);
        });

        it("If change State RUNNING to SUCCEEDED throw function changeState, state changed to SUCCEEDED", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(1);
            await StatefulMixin.changeStatePublic(4);
            assert.equal(await StatefulMixin.m_state(), 4);
        });
    });

    describe('Change state PAUSED', function() {
        it("If change State PAUSED to INIT throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(2);
            await expectThrow(StatefulMixin.changeStatePublic(0));
        });

        it("If change State PAUSED to RUNNING throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(2);
            await StatefulMixin.changeStatePublic(1);
            assert.equal(await StatefulMixin.m_state(), 1);
        });

        it("If change State PAUSED to PAUSED throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(2);
            await expectThrow(StatefulMixin.changeStatePublic(2));
        });

        it("If change State PAUSED to FAILED throw function changeState, state changed to FAILED", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(2);
            await StatefulMixin.changeStatePublic(3);
            assert.equal(await StatefulMixin.m_state(), 3);
        });

        it("If change State PAUSED to SUCCEEDED throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(2);
            await expectThrow(StatefulMixin.changeStatePublic(4));
        });
    });

    describe('Change state FAILED', function() {
            it("If change State FAILED to INIT throw function changeState, contract raise error", async function() {
                const [StatefulMixin, owner] = await deployStatefulMixin();
                await StatefulMixin.setState(3);
                await expectThrow(StatefulMixin.changeStatePublic(0));
            });

            it("If change State FAILED to RUNNING throw function changeState, contract raise error", async function() {
                const [StatefulMixin, owner] = await deployStatefulMixin();
                await StatefulMixin.setState(3);
                await expectThrow(StatefulMixin.changeStatePublic(1));
            });

            it("If change State FAILED to PAUSED throw function changeState, contract raise error", async function() {
                const [StatefulMixin, owner] = await deployStatefulMixin();
                await StatefulMixin.setState(3);
                await expectThrow(StatefulMixin.changeStatePublic(2));
            });

            it("If change State FAILED to FAILED throw function changeState, contract raise error", async function() {
                const [StatefulMixin, owner] = await deployStatefulMixin();
                await StatefulMixin.setState(3);
                await expectThrow(StatefulMixin.changeStatePublic(3));
            });

            it("If change State FAILED to SUCCEEDED throw function changeState, contract raise error", async function() {
                const [StatefulMixin, owner] = await deployStatefulMixin();
                await StatefulMixin.setState(3);
                await expectThrow(StatefulMixin.changeStatePublic(4));
            });
        });

    describe('Change state SUCCEEDED', function() {
        it("If change State SUCCEEDED to INIT throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(4);
            await expectThrow(StatefulMixin.changeStatePublic(0));
        });

        it("If change State SUCCEEDED to RUNNING throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(4);
            await expectThrow(StatefulMixin.changeStatePublic(1));
        });

        it("If change State SUCCEEDED to PAUSED throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(4);
            await expectThrow(StatefulMixin.changeStatePublic(2));
        });

        it("If change State SUCCEEDED to FAILED throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(4);
            await expectThrow(StatefulMixin.changeStatePublic(3));
        });

        it("If change State SUCCEEDED to SUCCEEDED throw function changeState, contract raise error", async function() {
            const [StatefulMixin, owner] = await deployStatefulMixin();
            await StatefulMixin.setState(4);
            await expectThrow(StatefulMixin.changeStatePublic(4));
        });
    });

})