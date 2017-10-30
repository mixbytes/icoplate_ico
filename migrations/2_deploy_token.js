'use strict';

const PLTToken = artifacts.require("./PLTToken.sol");

module.exports = function(deployer, network) {
    deployer.deploy(PLTToken);
};
