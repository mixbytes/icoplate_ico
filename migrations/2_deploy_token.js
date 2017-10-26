'use strict';

const _owners = [
    '0xdad209d09b0fec404Da4204672372771bad3D683',
    '0x0Eed5de3487aEC55bA585212DaEDF35104c27bAF',
    '0x06bA0d658578b014b5fEBdAF6992bFd41bd44483'
];

const ICOPToken = artifacts.require("./ICOPToken.sol");


module.exports = function(deployer, network) {
    deployer.deploy(ICOPToken, _owners);
};
