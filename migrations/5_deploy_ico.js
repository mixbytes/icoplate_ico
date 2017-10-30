'use strict';

// FIXME
const FundsAddress = '0x03bA0d658578b014b5fEBdAF6992bFd41bd44483'

// FIXME
const PLTTokenAddress = '0x5c3a228510D246b78a3765C20221Cbf3082b44a4';

// FIXME
const _owners = [
    '0xdad209d09b0fec404Da4204672372771bad3D683',
    '0x0Eed5de3487aEC55bA585212DaEDF35104c27bAF',
    '0x06bA0d658578b014b5fEBdAF6992bFd41bd44483'
 ];


const ICOPICO = artifacts.require("./ICOPICO.sol");


module.exports = function(deployer, network) {
    deployer.deploy(ICOPICO, _owners, PLTTokenAddress, FundsAddress);

    // owners have to manually perform
    // PLTToken.setController(address of ICOPICO);
};

