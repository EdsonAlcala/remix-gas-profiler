pragma solidity ^0.5.1;

contract SimpleStorage {
    uint256 public state;
    
    constructor() public {
        state = 1000;
    }
    
    function getState() public view returns(uint256){
        return state;
    }
}