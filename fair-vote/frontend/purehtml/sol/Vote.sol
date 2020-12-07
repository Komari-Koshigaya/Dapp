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
    ElGamalValue _ElGamalValue = ElGamalValue(63, 5);
    TimeValue _timeValue;
    uint q = 1;    //选票所需
    uint o = 0;    //候选人个数
    uint s = 13;    //安全参数
    uint maxnum = 0;    //最大投票人个数
    
    struct VoterInfo {
        bool notFailer;
        bool isHonest;
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

    event NewResult(bool status, string msg);
    
    //初始化函数，为各个参数赋初值
    constructor(address _address, string memory _voteName, uint option, uint max, uint t1, uint t2, uint t3, uint t4, uint t5) public {
        owner = _address;
        voteName = _voteName;
        //计算q的值
        uint res = 2;
        while(res <= max){
            q = q + 1;
            res = res * 2;
        }
        maxnum = max;
        o = option;
        _timeValue = TimeValue(t1, t2, t3, t4, t5);
    }
    
    //投票信息获取函数
    function GetVoteInfo() public view returns(string memory, ElGamalValue memory, TimeValue memory, uint, uint, uint){
        return (voteName, _ElGamalValue, _timeValue, q, o, s);
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
    function Register(uint r, uint a, uint c, uint y) public {
        require(_timeValue.registerEndTime > now, "Not Register Time.");
        uint m = Montgomery(y,c,_ElGamalValue.p);
        uint n = Montgomery(_ElGamalValue.g,r,_ElGamalValue.p);
        
        if(voterNum<maxnum){
            if(a == (m*n) % _ElGamalValue.p){
                voterList.push(VoterInfo(false, false, y, 0, 0, 0, 0));
                voters[y] = voterNum;
                voterNum++;
                emit NewResult(true,"Register success");
                return;
            } else{
                emit NewResult(false,"the proof is wrong");
                return;
            }
        }
        emit NewResult(false,"the number of voters is enough");
    }
    
    //加密函数
    function Encrypt(uint[] memory a, uint[] memory b, uint[] memory r, uint[] memory d, uint c, uint _venc, uint Y, uint y) public{
        //require((_timeValue.registerEndTime < now) && (_timeValue.encryptEndTime > now), "Not Encrypt Time.");
        uint m1;
        uint m2;
        uint n1;
        uint n2;
        for(uint256 i=0; i<o; i++){
            m1 = Montgomery(y,d[i],_ElGamalValue.p);
            n1 = Montgomery(_ElGamalValue.g,r[i],_ElGamalValue.p);
            m2 = Montgomery(Y,r[i],_ElGamalValue.p);
            n2 = Montgomery(_venc/(_ElGamalValue.g**(2**(i*q))),d[i],_ElGamalValue.p);
            if((a[i] != (m1 * n1) % _ElGamalValue.p) || (b[i] != (m2 * n2) % _ElGamalValue.p)){
                emit NewResult(false,"the proof is wrong");
                return;
            }
        }
        voterList[voters[y]].venc = _venc;
        voterList[voters[y]].notFailer = true;
        emit NewResult(true,"Encrypt success");
    }
    
    //解密函数
    function Decrypt(uint r, uint a1, uint a2, uint c, uint _vdec, uint Y, uint y) public{
        //require((_timeValue.encryptEndTime < now) && (_timeValue.decryptEndTime > now), "Not Decrypt Time.");
        uint m1 = Montgomery(Y,r,_ElGamalValue.p);
        uint n1 = Montgomery(_vdec,c,_ElGamalValue.p);
        uint m2 = Montgomery(y,c,_ElGamalValue.p);
        uint n2 = Montgomery(_ElGamalValue.g,r,_ElGamalValue.p);
        if ((a1 == (m1 * n1) % _ElGamalValue.p) && (a2 == (m2 * n2) % _ElGamalValue.p)){
            voterList[voters[y]].vdec = _vdec;
            voterList[voters[y]].isHonest = true;
            emit NewResult(true,"Decrypt success");
            return;
        }
        emit NewResult(false,"the proof is wrong");
    }
    
    //构造函数
    function Assist(uint r, uint a1, uint a2, uint c, uint _vass, uint h, uint y) public{
        //require((_timeValue.encryptEndTime < now) && (_timeValue.assistEndTime > now), "Not Assist Time.");
        uint m1 = Montgomery(h,r,_ElGamalValue.p);
        uint n1 = Montgomery(_vass,c,_ElGamalValue.p);
        uint m2 = Montgomery(y,c,_ElGamalValue.p);
        uint n2 = Montgomery(_ElGamalValue.g,r,_ElGamalValue.p);
        if ((a1 == (m1 * n1) % _ElGamalValue.p) && (a2 == (m2 * n2) % _ElGamalValue.p)){
            voterList[voters[y]].vass = _vass;
            voterList[voters[y]].isHonest = true;
            emit NewResult(true,"Assist success");
            return;
        }
        emit NewResult(false,"the proof is wrong");
    }
    
    //恢复函数
    function Recover(uint r, uint a1, uint a2, uint c, uint _vrec, uint h, uint y) public{
        //require((_timeValue.decryptEndTime < now) && (_timeValue.recoverEndTime > now), "Not Recover Time.");
        uint m1 = Montgomery(h,r,_ElGamalValue.p);
        uint n1 = Montgomery(_vrec,c,_ElGamalValue.p);
        uint m2 = Montgomery(y,c,_ElGamalValue.p);
        uint n2 = Montgomery(_ElGamalValue.g,r,_ElGamalValue.p);
        if ((a1 == (m1 * n1) % _ElGamalValue.p) && (a2 == (m2 * n2) % _ElGamalValue.p)){
            voterList[voters[y]].vrec = _vrec;
            emit NewResult(true,"Recover success");
            return;
        }
        emit NewResult(false,"the proof is wrong");
    }

}