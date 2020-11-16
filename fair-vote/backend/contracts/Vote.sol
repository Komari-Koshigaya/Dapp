// SPDX-License-Identifier: SimPL-2.0
pragma experimental ABIEncoderV2;
pragma solidity ^0.6.4;

contract Vote {
    //ElGamal算法参数
    struct ElGamalValue {
        uint p;
        uint g;
    }
    //时间参数
    struct TimeValue {
        uint registerEndTime;
        uint encryptEndTime;
        uint assistEndTime;
        uint decryptEndTime;
        uint recoverEndTime;
    }
    ElGamalValue _ElGamalValue = ElGamalValue(150001, 7);
    TimeValue _timeValue;
    uint q = 1;    //选票所需参数
    uint s = 13;
    uint o = 0;    //候选人个数
    uint maxnum = 0;    //最大投票人个数
    
    struct VoterInfo {
        uint y;
        uint venc;
        uint vdec;
        uint vass;
        uint vrec;
    }
    
    VoterInfo[] public voterList;
    uint voterNum;    //投票人个数
    mapping(uint => uint) voters;    //投票人编号与公钥对应关系

    address owner;    //投票发起人地址
    string voteName;    //投票名

    //初始化函数，为各个参数赋初值
    constructor(address _address, string memory _voteName, uint option, uint max, uint t1, uint t2, uint t3, uint t4, uint t5) public {
        owner = _address;
        voteName = _voteName;
        //计算q的值
        while(2**q <= max){
            q = q + 1;
        }
        maxnum = max;
        o = option;
        _timeValue = TimeValue(t1, t2, t3, t4, t5);
    }
    
    //投票信息获取函数
    function GetVoteInfo() public view returns(string memory, ElGamalValue memory, TimeValue memory, uint, uint, uint){
        return (voteName, _ElGamalValue, _timeValue, q, s, o);
    }
    
    //投票人信息获取函数
    function GetVoterInfo() public view returns(VoterInfo[] memory){
        return voterList;
    }
    

    function Montgomery(uint g, uint m, uint p) public pure returns (uint){
        uint n = 1;
        while(m > 0){
            if(m % 2 == 1) n = (n * g) % p;
            m >>= 1;
            g = (g * g) % p;
        }
        return n;
    }
    
    //注册函数
    function Register(uint r, uint a, uint c, uint y) public returns (bool success){
        require(_timeValue.registerEndTime > now, "Not Register Time.");
        uint m = Montgomery(y,c,_ElGamalValue.p);
        m =( a * m ) % _ElGamalValue.p;
        uint n = Montgomery(_ElGamalValue.g,r,_ElGamalValue.p);
        
        if( (m == n) && (voterNum<maxnum) ){
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
            if((a[i] != (_ElGamalValue.g**r[i] / y**d[i]) % _ElGamalValue.p) || (b[i] != (Y**r[i] / (_venc/(_ElGamalValue.g**(2**(i*q))))**d[i]) % _ElGamalValue.p)){
                return false;
            }
        }
        voterList[voters[y]].venc = _venc;
        return true;
    }
    
    //解密函数
    function Decrypt(uint r, uint a1, uint a2, uint c, uint _vdec, uint Y, uint y) public returns (bool success){
        require((_timeValue.encryptEndTime < now) && (_timeValue.decryptEndTime > now), "Not Decrypt Time.");
        if ((a1 == (Y**r * _vdec**c) % _ElGamalValue.p) && (a2 == (_ElGamalValue.g**r / y**c) % _ElGamalValue.p)){
            voterList[voters[y]].vdec = _vdec;
            return true;
        }
        return false;
    }
    
    //构造函数
    function Assist(uint r, uint a1, uint a2, uint c, uint _vass, uint h, uint y) public returns (bool success){
        require((_timeValue.encryptEndTime < now) && (_timeValue.assistEndTime > now), "Not Assist Time.");
        if (((h**r) % _ElGamalValue.p == (a1 * _vass**c) % _ElGamalValue.p) && ((_ElGamalValue.g**r) % _ElGamalValue.p == (a2 * y**c) % _ElGamalValue.p)){
            voterList[voters[y]].vass = _vass;
            return true;
        }
        return false;
    }
    
    //恢复函数
    function Recover(uint r, uint a1, uint a2, uint c, uint _vrec, uint h, uint y) public returns (bool success){
        require((_timeValue.decryptEndTime < now) && (_timeValue.recoverEndTime > now), "Not Recover Time.");
        if (((h**r) % _ElGamalValue.p == (a1 * _vrec**c) % _ElGamalValue.p)  && ((_ElGamalValue.g**r) % _ElGamalValue.p == (a2 * y**c) % _ElGamalValue.p)){
            voterList[voters[y]].vrec = _vrec;
            return true;
        }
        return false;
    }

}