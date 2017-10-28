'use strict';

// FIXME
const FundsAddress = '0x03bA0d658578b014b5fEBdAF6992bFd41bd44483'

// FIXME
const ICOPTokenAddress = '0x5c3a228510D246b78a3765C20221Cbf3082b44a4';

const ICOPPreICO = artifacts.require("./ICOPPreICO.sol");


module.exports = function(deployer, network) {
    deployer.deploy(ICOPPreICO, ICOPTokenAddress, FundsAddress);

    // owners have to manually perform
    // ICOPToken.setController(address of ICOPPreICO);
};

