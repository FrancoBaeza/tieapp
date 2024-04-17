import fetch from 'node-fetch';

import { BinanceWs } from './ws.mjs';

const time = Date.now();
const preciosBtc = [];

const run = async () => {
    // 1 Buscar los precios de la ultima semana
    const response = await fetch(
        `https://www.binance.com/api/v3/klines?endTime=${time}&limit=336&symbol=BTCUSDT&interval=30m`,
    );
    const data = await response.json();

    for (const bloque of data) {
        const precioMinimo = parseFloat(bloque[3]);
        const timestamp = bloque[0];

        preciosBtc.push({
            timestamp,
            precio: precioMinimo
        });
    }

    // create websoket
    const ws = new BinanceWs(preciosBtc.reverse());
    ws.start();
};

run();
