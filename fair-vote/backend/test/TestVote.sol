pragma solidity ^0.6.4;

import "truffle/Assert.sol";   // 引入的断言
import "truffle/DeployedAddresses.sol";  // 用来获取被测试合约的地址
import "../contracts/Vote.sol";      // 被测试合约

contract TestAdoption {
  Vote vote = Vote(DeployedAddresses.Vote());

  // 投票初始化测试用例
  function testInit() public {
    // vote.Init(123,78,112,118,119,124,129).then(function(events) {
    //   //测试合约事件 代码有问题 未通过编译
    //   Assert.equal(events[0].args.q.valueOf(), 1, "get the event error"); //测试 newInit() 事件的 大素数p
    //   Assert.equal(events[0].args.s.valueOf(), 13, "get the event error"); //测试 newInit() 事件的 s
    // }).then(done).catch(done);

    vote.Init(123,78,112,118,119,124,129);
    uint expected = 12;
    Assert.equal(0, expected, "result whitespace of Vote Init() should be recorded.");

  }

}