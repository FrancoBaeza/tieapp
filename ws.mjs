import fetch from 'node-fetch';
import WebSocket from 'ws';

export class BinanceWs {
    baseUrl = "wss://fstream.binance.com/ws/btcusdt@markPrice";

    constructor(btcPrices) {
        this.btcPrices = btcPrices;
        this.ws = new WebSocket(this.baseUrl);
    }

    async start() {
        console.log('starting websocket')


        this.ws.on("open", () => {
            console.log("Conexión establecida con el servidor WebSocket");
        });

        this.ws.on("message", (data) => {
            const jsonString = data.toString();
            const parsedData = JSON.parse(jsonString);
            // this.executeAlogrithm(parsedData);
            this.runAlgorithm(parsedData);
        });

        this.ws.on("close", () => {
            console.log("Conexión cerrada con el servidor WebSocket");
        });

        this.ws.on("error", (err) => {
            console.log(err);
        });
    }

    async runAlgorithm(data) {
        console.log('running algorithm, price is: ', data.p)
        const miliseconds  = 30 * 60 * 1000; // 30 minutes
        const dataTime = data.E;

        // update btc prices array
        if((this.btcPrices[0].timestamp + Number(miliseconds)) < dataTime) {
            console.log(' --- updating btc prices array')
            // remove first element from array
            const newPrices = this.btcPrices.slice(0, this.btcPrices.length - 1)
            newPrices.push({
                timestamp: dataTime,
                precio: Number(data.p)
            });

            this.btcPrices = newPrices;
        }

        // if we are on the lowest price of the last week we b'
        if(this.isLowestPrice(Number(data.p))) {
            console.log(' --- sending alert')
            await this.sendTeelgramAlert();
        }

    }

    async sendTeelgramAlert () {
        // send telegram alert
        await fetch(
            'https://api.telegram.org/bot5949104836:AAG9TOJdvxYWIX9v30Pk0N5fF1ngHjGy4Io/sendMessage?chat_id=5457970997&text=COMPRA BITCOIN PA'
        );
    }

    isLowestPrice(price) {
        const lastWeekPrices = this.btcPrices.map(p => p.precio)
        const lowestPrice = Math.min(...lastWeekPrices);

        return price < lowestPrice;
    }

}