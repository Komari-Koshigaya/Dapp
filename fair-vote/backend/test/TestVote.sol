pragma solidity ^0.6.4;

import "truffle/Assert.sol";   // 引入的断言
import "truffle/DeployedAddresses.sol";  // 用来获取被测试合约的地址
import "../contracts/Vote.sol";      // 被测试合约

contract TestAdoption {
  Vote vote = Vote(DeployedAddresses.Vote());

  // 投票初始化测试用例
  function testInit() public {
    vote.Init(123,78,112,118,119,124,129);

    uint expected = 12;
    Assert.equal(0, expected, "result whitespace of Vote Init() should be recorded.");
  }

}