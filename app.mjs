import fetch from 'node-fetch';
import pkg from 'lodash';
const { min, max } = pkg;

const time = Date.now();

const run = async () => {
    const response = await fetch(
        `https://www.binance.com/api/v3/klines?endTime=${time}&limit=1000&symbol=BTCUSDT&interval=30m`,
    );
    const data = await response.json();
    console.log(data);

    // let highestPrice = 0;
    // let lowestPrice = 9999999;
    // data.forEach((item) => {
    //     const priceHigh = parseFloat(item[2]);
    //     const priceLow = parseFloat(item[3]);
    //     if (priceHigh > highestPrice) {
    //         highestPrice = priceHigh;
    //     }
    //     if (priceLow < lowestPrice) {
    //         lowestPrice = priceLow;
    //     }
    // });
    // console.log('Highest Price:', highestPrice);
    // console.log('Lowest Price:', lowestPrice);

    const INTERVALO = 15 * 60 * 1000; // 15 minutos en milisegundos
    const PUNTOS_ALTOS = 5;
    const PUNTOS_BAJOS = 5;

    const puntosAltos = [];
    const puntosBajos = [];

    for (const bloque of data) {
        const timestamp = bloque[0];
        const precioApertura = parseFloat(bloque[1]);
        const precioMaximo = parseFloat(bloque[2]);
        const precioMinimo = parseFloat(bloque[3]);
        const precioCierre = parseFloat(bloque[4]);

        // Actualizar puntos altos
        if (puntosAltos.length < PUNTOS_ALTOS) {
            puntosAltos.push({ timestamp, precio: precioMaximo });
        } else {
            const minimoPuntoAlto = min(
                puntosAltos.map((punto) => punto.precio),
            );
            if (precioMaximo > minimoPuntoAlto) {
                puntosAltos.splice(puntosAltos.indexOf(minimoPuntoAlto), 1, {
                    timestamp,
                    precio: precioMaximo,
                });
            }
        }

        // Actualizar puntos bajos
        if (puntosBajos.length < PUNTOS_BAJOS) {
            puntosBajos.push({ timestamp, precio: precioMinimo });
        } else {
            const maximoPuntoBajo = max(
                puntosBajos.map((punto) => punto.precio),
            );
            if (precioMinimo < maximoPuntoBajo) {
                puntosBajos.splice(puntosBajos.indexOf(maximoPuntoBajo), 1, {
                    timestamp,
                    precio: precioMinimo,
                });
            }
        }
    }

    puntosAltos.sort((a, b) => b.precio - a.precio);
    puntosBajos.sort((a, b) => a.precio - b.precio);

    console.log('**5 puntos altos:**');
    console.table(puntosAltos);

    console.log('**5 puntos bajos:**');
    console.table(puntosBajos);
};

run();
