import fetch from 'node-fetch';

// 1) Get the lowest BTC price in the last week

const run = async () => {
    const response = await fetch(
        'https://www.binance.com/api/v3/klines?endTime=1712186849106&limit=1000&symbol=BTCUSDT&interval=15m',
    );
    const data = await response.json();
    console.log(data);

    let highestPrice = 0;
    let lowestPrice = 9999999;
    data.forEach((item) => {
        const priceHigh = parseFloat(item[2]);
        const priceLow = parseFloat(item[3]);
        if (priceHigh > highestPrice) {
            highestPrice = priceHigh;
        }
        if (priceLow < lowestPrice) {
            lowestPrice = priceLow;
        }
    });
    console.log('Highest Price:', highestPrice);
    console.log('Lowest Price:', lowestPrice);
};

run();
