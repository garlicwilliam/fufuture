## 项目初始

初始化，进入项目根目录运行
```
npm install
```

## 构建生产版本
```
npm run build:shield
```
生成build文件夹是编译后的文件，将编译后的文件夹```build```完全替换服务器上的文件夹```/var/www/app/html```进行部署。
(需要将 build 文件夹改名并替换服务器上的 html 文件夹)

## 配置

1. ### 配置默认交易对
文件```src/components/shield-option-trade/const/default.ts``` 中
配置不同网络环境下的默认交易对。
```
const PAIR_CONFIG = {
  [NET_GOERLI]: {
    indexUnderlying: IndexUnderlyingType.BTC,
    quoteToken: {
      symbol: 'POT',
      address: '0x08B524a8Ff5eAfD618CC8563D4A74f19e54A9715',
      decimal: 18,
      network: NET_GOERLI,
    },
  },
  [NET_BNB]: {
    indexUnderlying: IndexUnderlyingType.BTC,
    quoteToken: {
      symbol: 'POT',
      address: '0x5150404c61706b6874cF43DC34c9CA88DaA5F9e3',
      decimal: 18,
      network: NET_BNB,
    },
  },
};
```

2. ### 配置当前网络

文件```src/components/shield-option-trade/const/default.ts``` 中
配置当前默认网络
``` 
  export const SUPPORT_NETWORK = NET_BNB;
```
目前测试网络使用goerli测试网，因为Subgraph 不支持 BSC Testnet

3. ### 配置不同token的Icon图标。

文件```src/components/shield-option-trade/const/imgs.ts``` 中

``` 
export const tokenIconConfigFile = 'https://static.fufuture.io/token-icon.json';
```
指定了不同token icon的配置文件的URL地址。目前存储在服务器上（static）。
``` 
例如
{
  "56": {
    "0x5150404c61706b6874cF43DC34c9CA88DaA5F9e3": "https://static.fufuture.io/tokens/pot.svg"
  },
  "5": {
    "0x1cF4e12B820d99F45d126671D46ff622a95De569": "https://static.fufuture.io/tokens/sld.svg",
    "0x6d966b5d0511c53B508343EA39dF3060A3925259": "https://static.fufuture.io/tokens/sld.svg",
    "0x08B524a8Ff5eAfD618CC8563D4A74f19e54A9715": "https://static.fufuture.io/tokens/pot.svg"
  }
}
```
格式说明
``` 
{
  "网络ID": {
    "token地址": "Icon URL"
  }
}
```
