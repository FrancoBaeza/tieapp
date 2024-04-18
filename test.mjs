import fetch from 'node-fetch';

import { BinanceWs } from './ws.mjs';

const time = Date.now();
const preciosBtc = [];

const run = async () => {
    // 1 Buscar los precios de la ultima semana
    const preciosBtc = [
        { timestamp: 1631565600000, precio: 71000 },
        { timestamp: 1631567400000, precio: 71010 },
        { timestamp: 1631569200000, precio: 71020 },
        { timestamp: 1631571000000, precio: 71420 },
        { timestamp: 1631572800000, precio: 71820 },
    ]

    // create websoket
    const ws = new BinanceWs(preciosBtc.reverse());
    ws.start();
};

run();
