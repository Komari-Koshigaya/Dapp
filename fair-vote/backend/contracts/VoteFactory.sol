// SPDX-License-Identifier: SimPL-2.0
pragma experimental ABIEncoderV2;
pragma solidity ^0.6.4;

import './Vote.sol';

contract VoteFactory
{

    struct VoteInfo
    {
        string name;
        Vote vote;
    }
    
    VoteInfo[] public voteList;
    
    function CreateVote(string memory name, uint8 option, uint8 max, uint64 t1, uint64 t2, uint64 t3, uint64 t4, uint64 t5) public{
        require((t1 > now) && (t2 > t1) && (t3 > t2) && (t4 > t3) && (t5 > t4), "TIME PARAMETER ERROR");
        Vote vote = new Vote(msg.sender, name, option, max, t1, t2, t3, t4, t5);
        voteList.push(VoteInfo(name, vote));
    }
    
    function GetVoteList() public view returns(VoteInfo[] memory) {
        return voteList;
    }
}