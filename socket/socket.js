var ws = require('ws')
var http = require('../bin/www')
var lastman = require('../socket/routes/lastman')

module.exports = (http) => {
    const wss = new ws.Server({server: http});
    console.log("Birisi bağlandı")

    wss.on('connection', function connection(ws) {
        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true
        });

        ws.on('message', function incoming(data) {
            let json = JSON.parse(data);
            console.log(data)

            switch (json.route) {
                case "lastman":
                    lastman(json,ws)
                    break;
            }
        })

        ws.on('close', function () {
            /*servers.forEach(server => {
                if (server.id == ws.server_id) {

                    server.RemovePlayer(ws)
                    server.players.forEach(player => {
                        console.log("id2" + ws.id)
                        player.send("Sunucundaki eleman çıktı")
                        console.log("Eleman Sayısı: " + server.player_count)
                        console.log("Eleman Sayısı2: " + server.players.length)
                    })
                }
            })*/
        })
    })

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping(noop);
        });
    }, 1000);

    function heartbeat() {
        this.isAlive = true;
    }

    function noop() {
    }
}