/**
 *    Copyright 2013 FourDays
 *  
 *   This file is part of SDU_WebJoystick.
 *
 *   WebJoystick is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Lesser General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   WebJoystick is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Lesser General Public License for more details.
 *
 *
 *   You should have received a copy of the GNU Lesser General Public License
 *   along with WebJoystick.  If not, see <http://www.gnu.org/licenses/lgpl.html>.
 */

(function(win) {

    var GameWatcher = function(url) {

        this.url = url;
        this.messageHandlers = {
            connected: this.connected.bind(this)
        };
    };

    GameWatcher.prototype.sendMessage = function(msgs, uuid, datas) {
        this.socket.send(JSON.stringify({
            uid: uuid,
            msg: msgs,
            data: datas
        }));
    }

    GameWatcher.prototype.connect = function() {

        var wsCtor = window['MozWebSocket'] ? MozWebSocket : WebSocket;
        this.socket = new wsCtor(this.url, 'host');
        this.socket.onmessage = this.handleWebsocketMessage.bind(this);
        this.socket.onclose = this.handleWebsocketClose.bind(this);
    };

    GameWatcher.prototype.handleWebsocketMessage = function(message) {
        try {
            var command = JSON.parse(message.data);
            //if (command.msg != "deviceorientation")
            //    console.log(command);
        } catch (e) {
            //console.log(e);
            //cobsole.log("not JSON message");
        }

        if (command) {
            this.dispatchCommand(command);
        }
    };

    GameWatcher.prototype.handleWebsocketClose = function() {
        alert("WebSocket Connection Closed.");
    };

    GameWatcher.prototype.dispatchCommand = function(command) {
        // Do we have a handler function for this command?
        var handler = this.messageHandlers[command.msg];
        if (typeof(handler) === 'function') { //call only when it is function
            // If so, call it and pass the parameter data
            handler.call(this, command.data);
        }
    };

    GameWatcher.prototype.connected = function(command) {
        // what to do when it is connected
        // document.getElementById('message').innerHTML="connected";
        this.serverIP = command.hostIP;
        console.log(command.hostIP);
    };

    GameWatcher.prototype.vibrate = function(uid, ruler) {
        this.sendMessage('vibrate', uid, ruler);
    }

    GameWatcher.prototype.on = function(msg, func) {
        //register when it is a function
        if (typeof(func) === 'function') {
            this.messageHandlers[msg] = func;
        } else {
            //console.log(msg+':you must register a function for the event');   
        }
    }
    win.GameWatcher = GameWatcher;
})(window);
