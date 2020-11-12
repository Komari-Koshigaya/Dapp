// SPDX-License-Identifier: SimPL-2.0
pragma experimental ABIEncoderV2;
pragma solidity ^0.6.4;

contract Vote {
    //ElGamal算法参数
    struct ElGamalValue {
        uint64 p;
        uint64 g;
    }
    //时间参数
    struct TimeValue {
        uint64 registerEndTime;
        uint64 encryptEndTime;
        uint64 assistEndTime;
        uint64 decryptEndTime;
        uint64 recoverEndTime;
    }
    ElGamalValue _ElGamalValue = ElGamalValue(150001, 7);
    TimeValue _timeValue;
    uint8 q = 1;
    uint8 s = 13;
    uint8 o = 0;
    uint8 maxnum = 0;
    
    struct VoterInfo {
        uint y;
        uint venc;
        uint vdec;
        uint vass;
        uint vrec;
    }
    
    VoterInfo[] public voterList;
    uint voterNum;
    mapping(uint => uint) voters;

    address owner;
    string voteName;

    //初始化函数，为各个参数赋初值
    constructor(address _address, string memory _voteName, uint8 option, uint8 max, uint64 t1, uint64 t2, uint64 t3, uint64 t4, uint64 t5) public {
        owner = _address;
        voteName = _voteName;
        //计算q的值
        while(2^q <= max){
            q = q + 1;
        }
        maxnum = max;
        o = option;
        _timeValue = TimeValue(t1, t2, t3, t4, t5);
    }
    
    function GetVoteInfo() public view returns(string memory, ElGamalValue memory, TimeValue memory, uint8, uint8, uint8){
        return (voteName, _ElGamalValue, _timeValue, q, s, o);
    }
    
    function GetVoterInfo() public view returns(VoterInfo[] memory){
        return voterList;
    }
    
    //注册函数
    function Register(uint r, uint a, uint c, uint y) public returns (bool success){
        require(_timeValue.registerEndTime > now, "Not Register Time.");
        if ((a == _ElGamalValue.g^r * y^c) && (voterNum<maxnum)){
            voterList.push(VoterInfo(y, 0, 0, 0, 0));
            voters[y] = voterNum;
            voterNum++;
            return true;
        }
        return false;
    }
    
    //加密函数
    function Encrypt(uint[] memory a, uint[] memory b, uint[] memory r, uint[] memory d, uint c, uint _venc, uint Y, uint y) public returns (bool success){
        require((_timeValue.registerEndTime < now) && (_timeValue.encryptEndTime > now), "Not Encrypt Time.");
        for(uint i=0; i<o; i++){
            if((a[i] != _ElGamalValue.g^r[i] * y^d[i]) || (b[i] != Y^r[i] * (_venc/(_ElGamalValue.g^(2^(i*q))))^d[i])){
                return false;
            }
        }
        voterList[voters[y]].venc = _venc;
        return true;
    }
    
    //注册函数
    function Decrypt(uint r, uint a1, uint a2, uint c, uint _vdec, uint Y, uint y) public returns (bool success){
        require((_timeValue.encryptEndTime < now) && (_timeValue.decryptEndTime > now), "Not Decrypt Time.");
        if ((a1 == Y^r * _vdec^c) && (a2 == _ElGamalValue.g^r / y^c)){
            voterList[voters[y]].vdec = _vdec;
            return true;
        }
        return false;
    }
    
    //注册函数
    function Assist(uint r, uint a1, uint a2, uint c, uint _vass, uint h, uint y) public returns (bool success){
        require((_timeValue.encryptEndTime < now) && (_timeValue.assistEndTime > now), "Not Assist Time.");
        if ((a1 == h^r * _vass^c) && (a2 == _ElGamalValue.g^r * y^c)){
            voterList[voters[y]].vass = _vass;
            return true;
        }
        return false;
    }
    
    //注册函数
    function Recover(uint r, uint a1, uint a2, uint c, uint _vrec, uint h, uint y) public returns (bool success){
        require((_timeValue.decryptEndTime < now) && (_timeValue.recoverEndTime > now), "Not Recover Time.");
        if ((a1 == h^r * _vrec^c) && (a2 == _ElGamalValue.g^r * y^c)){
            voterList[voters[y]].vrec = _vrec;
            return true;
        }
        return false;
    }

}