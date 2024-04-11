import fetch from 'node-fetch';
import pkg from 'lodash';
import TelegramBot from 'node-telegram-bot-api';
import WebSocket from 'ws';

const time = Date.now();
const { min, max } = pkg;
const bot = new TelegramBot('6904069684:AAEi1yT2PWAn-CrMaGAq2BROFGwW7Ju1WNgs');
const chatId = '1809955072';

const puntosAltos = [];
const puntosBajos = [];

async function obtenerPrecioBitcoin() {
    const response = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
    );
    const data = await response.json();
    return data.price;
}

function esBuenMomentoParaComprar(puntosAltos, puntosBajos, precioActual) {
    // Calcular el rango de precios
    const rangoPrecios = puntosAltos[0].precio - puntosBajos[0].precio;

    // Calcular la desviación estándar
    const desviacionEstandar = Math.sqrt(
        puntosAltos
            .map((punto) => Math.pow(punto.precio - precioActual, 2))
            .reduce((a, b) => a + b) / puntosAltos.length,
    );

    // Calcular el ratio de Sharpe
    const ratioSharpe =
        (precioActual - puntosBajos[0].precio) / desviacionEstandar;

    // Indicadores para determinar si es buen momento para comprar
    const comprarSencillo = precioActual < puntosBajos[0].precio;
    const comprarRatioSharpe = ratioSharpe > 1;

    // Mostrar información
    console.log(`**Precio actual:** ${precioActual}`);
    console.log(`**Rango de precios:** ${rangoPrecios}`);
    console.log(`**Desviación estándar:** ${desviacionEstandar}`);
    console.log(`**Ratio de Sharpe:** ${ratioSharpe}`);

    // Devolver la recomendación
    if (comprarSencillo && comprarRatioSharpe) {
        return '¡Es un buen momento para comprar Bitcoin!';
    } else if (comprarSencillo) {
        return 'Podría ser un buen momento para comprar Bitcoin, pero el ratio de Sharpe no es tan favorable.';
    } else if (comprarRatioSharpe) {
        return 'El ratio de Sharpe indica que podría ser un buen momento para comprar Bitcoin, pero el precio actual está por encima del mínimo reciente.';
    } else {
        return 'No es un buen momento para comprar Bitcoin.';
    }
}

const run = async () => {
    const response = await fetch(
        `https://www.binance.com/api/v3/klines?endTime=${time}&limit=1000&symbol=BTCUSDT&interval=30m`,
    );
    const data = await response.json();

    const precioBitcoin = await obtenerPrecioBitcoin();

    const INTERVALO = 15 * 60 * 1000; // 15 minutos en milisegundos
    const PUNTOS_ALTOS = 5;
    const PUNTOS_BAJOS = 5;

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

    console.log(
        esBuenMomentoParaComprar(puntosAltos, puntosBajos, precioBitcoin),
    );
};

run();

const ws = new WebSocket(
    'wss://api.telegram.org/bot' + bot.token + '/websocket',
);

ws.onopen = () => {
    console.log('Conectado al WebSocket de Telegram');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);

    // Si hay un mensaje para el chat, responder
    if (data.message && data.message.chat.id === chatId) {
        bot.sendMessage(chatId, 'Respuesta al mensaje: ' + data.message.text);
        bot.sendMessage(
            chatId,
            esBuenMomentoParaComprar(
                puntosAltos,
                puntosBajos,
                obtenerPrecioBitcoin,
            ),
        );
    }
};

ws.onclose = () => {
    console.log('Desconectado del WebSocket de Telegram');
};
