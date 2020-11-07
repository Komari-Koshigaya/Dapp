# 公平投票协议

## 目录结构

~~~plaintext
.
├── backend   # 后端代码 使用 truffle 调试合约、将合约部署到区块链
│   ├── build  # 使用 truffle 编译合约后生成的文件  内含合约的 ABI 信息
│   │   └── contracts
│   │       ├── Migrations.json
│   │       └── Vote.json
│   ├── contracts
│   │   ├── AuctionRepository.sol
│   │   ├── Migrations.sol
│   │   └── utils
│   │       ├── AddressUtils.sol
│   │       └── math
│   │           ├── Math.sol
│   │           └── SafeMath.sol
│   ├── migrations
│   │   ├── 1_initial_migration.js
│   │   └── 2_deploy_contracts.js
│   ├── scripts
│   │   └── prepare.js
│   ├── test
│   │   ├── 1_auctionrepository.js
│   │   ├── 2_deedrepository.js
│   │   └── output.address
│   └── truffle-config.js
├── frontend  # 前端代码 使用 vue.js 用于展示web页面
│   ├── build
│   │   ├── build.js
│   │   ├── check-versions.js
│   │   ├── logo.png
│   │   ├── utils.js
│   │   ├── vue-loader.conf.js
│   │   ├── webpack.base.conf.js
│   │   ├── webpack.dev.conf.js
│   │   └── webpack.prod.conf.js
│   ├── config
│   │   ├── dev.env.js
│   │   ├── index.js
│   │   └── prod.env.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── src
│   │   ├── App.vue
│   │   ├── components
│   │   │   ├── Auction.vue
│   │   │   └── Home.vue
│   │   ├── config.js
│   │   ├── contracts
│   │   │   ├── AuctionRepository.json
│   │   │   └── DeedRepository.json
│   │   ├── main.js
│   │   ├── models
│   │   │   ├── AuctionRepository.js
│   │   │   ├── ChatRoom.js
│   │   │   └── DeedRepository.js
│   │   └── router
│   │       └── index.js
│   └── static
└── README.md  # 本文件 项目的使用说明

~~~

## 环境(和使用的库)

> node.js 、truffle、ganache(用于搭建区块链)、vue.js、web.js、jquery

## 项目使用说明

> 使用前必须确保 合约已经部署到区块链 部署方法见  [./backend/README.md](./backend/README.md)
>
> 启动前端界面 启动方法见 [./frontend/README.md](./frontend/README.md)





