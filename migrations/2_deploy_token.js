'use strict';

const ICOPToken = artifacts.require("./ICOPToken.sol");

module.exports = function(deployer, network) {
    deployer.deploy(ICOPToken);
};
