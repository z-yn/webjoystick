
var WebSocketServer = require('websocket').server;

var exports = module.exports;

exports.createServer = function(config) {
    var ipAddr =undefined;
    var ifaces=require('os').networkInterfaces();
    for (var dev in ifaces) {
        ifaces[dev].forEach(function(details){
            if (details.family=='IPv4' && !details.internal) {
                ipAddr=details.address;
            }
        });
    }
    console.log("host ip: "+ipAddr);
    var wsServer = new WebSocketServer(config);
    var hostConnection; //game host connection
    var controlConnection = {}; // hold the controlConnections
    wsServer.on('request', function(request) { //request comming
        //distinguish host from gamepad by request.requestedProtocols[0]
        if (request.requestedProtocols[0] === 'host') { //host connection
            //console.log("request host");
            hostConnection = request.accept('host', request.origin);
            hostConnection.sendUTF(JSON.stringify({
                msg: "connected",
                data: {hostIP:ipAddr}
            }));
             for(var i in controlConnection) {
                 controlConnection[i].sendUTF(JSON.stringify({
                     msg: "redirect",
                     data: 0
                 }));
             } ;
            hostConnection.on('message', function(message) {

                var command = JSON.parse(message.utf8Data);
                if ((message.type === 'utf8') && controlConnection[command.uid] && controlConnection[command.uid].connected) {
                    controlConnection[command.uid].sendUTF(JSON.stringify({
                        msg: command.msg,
                        data: command.data
                    }));
                }
            });

            console.log(hostConnection.remoteAddress + " connected - Protocol Version " + hostConnection.webSocketVersion);
            // Handle closed connections
            hostConnection.on('close', function() {
                console.log(hostConnection.remoteAddress + " disconnected");
               // wsServer.closeAllConnections();
                console.log("game exit, disconnect all controler");
            });

        } else if (request.requestedProtocols[0] === 'control') { //controler
            if (hostConnection && hostConnection.connected) {

                var uid = request.requestedProtocols[1];
                var connection = request.accept('control', request.origin);

                connection.sendUTF(JSON.stringify({
                    msg: "connected",
                    data: request.requestedProtocols
                }));
                console.log(connection.remoteAddress + " connected - Protocol Version " + connection.webSocketVersion);
                connection.on('close', function() {
                    console.log(connection.remoteAddress + " disconnected");
                    if (hostConnection && hostConnection.connected) {
                        hostConnection.sendUTF(JSON.stringify({
                            msg: 'stop',
                            data: 'gamepadRemoved'
                        }));
                        hostConnection.sendUTF(JSON.stringify({
                            msg: 'gamepadRemoved',
                            data: uid
                        }));
                    }
                    console.log("game stop");
                });

                // Handle incoming messages from controler,and send it to host
                connection.on('message', function(message) {
                    if (message.type === 'utf8') {
                        var command = JSON.parse(message.utf8Data);
                        hostConnection.sendUTF(JSON.stringify({
                            msg: command.msg,
                            data: command.data
                        }));
                    }
                });
                controlConnection[uid] = connection;
                hostConnection.sendUTF(JSON.stringify({
                    msg: "gamepadAdded",
                    data: uid
                }));
            } else {
                //game not ready, can't connected 
            }
        }
    });

    return wsServer;
};