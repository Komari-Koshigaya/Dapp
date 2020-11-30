class Config{
    static JSONRPC_WS_ENDPOINT = 'ws://192.168.1.103:8545';
    static VOTEFACTORY_ADDRESS = '0x51b27e249E0c419f52211c87F7CE7842fEFd0B71';
    static VOTEFACTORY_ABI = VoteFactoryRepository.abi;

    static VOTE_ABI = VoteRepository.abi;
    static DEFAULT_ACCOUNT = '0xa22BcD941c53791Cc4C6eCD84cd149Bc4556896f';//默认账号地址
    static ACCOUNT_UNLOCK_DURATION = 600;//账号解锁持续时间
}