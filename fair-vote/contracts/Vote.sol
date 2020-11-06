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
    
    //初始化事件
    event NewInit(uint64 new_p, uint64 new_g, uint8 new_q, uint8 new_s, uint8 new_o);
    //初始化函数，为各个参数赋初值
    function Init(uint8 option, uint8 max, uint64 t1, uint64 t2, uint64 t3, uint64 t4, uint64 t5) public {
        //计算q的值
        while(2^q <= max){
            q = q + 1;
        }

        o = option;
        _timeValue = TimeValue(t1, t2, t3, t4, t5);

        emit NewInit(_ElGamalValue.p, _ElGamalValue.g, q, s, o);
        
    }
}