/**
 *    Copyright 2013 FourDays
 *  
 *   This file is part of SDU_WebJoystick.
 *
 *   SDU_WebJoystick is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Lesser General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   SDU_WebJoystick is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Lesser General Public License for more details.
 *
 *
 *   You should have received a copy of the GNU Lesser General Public License
 *   along with SDU_WebJoystick.  If not, see <http://www.gnu.org/licenses/lgpl.html>.
 */

(function(win) {

    var Gamepad = function(url, uid) {
        this.url = url;
        this.uid = uid;
        this.messageHandlers = {
            connected: this.connected.bind(this),
            vibrate: this.vibrate.bind(this)
        };
    }

    Gamepad.prototype.sendMessage = function(msgs, datas) {
        try {
            this.socket.send(JSON.stringify({
                msg: msgs,
                data: {
                    uid: this.uid,
                    gamedata: datas
                }
            }));
        } catch (e) {
            console.log(e);
        }
    }

    Gamepad.prototype.connect = function() {

        var wsCtor = window['MozWebSocket'] ? MozWebSocket : WebSocket;
        this.socket = new wsCtor(url, ['control', this.uid]);

        this.socket.onclose = this.handWebsocketClose.bind(this);
        this.socket.onmessage = this.handleWebsocketMessage.bind(this);
    }

    Gamepad.prototype.handleWebsocketMessage = function(message) {
        try {
            var command = JSON.parse(message.data);
        } catch (e) {
            //cobsole.log("not JSON message")
        }

        if (command) {
            this.dispatchCommand(command);
        }
    };

    Gamepad.prototype.deviceorientationEvt = function(data) {

        this.sendMessage('deviceorientation', {
            alpha: data.alpha,
            beta: data.beta,
            gamma: data.gamma
        }); //deviceorientation
    }

    Gamepad.prototype.devicemotionEvt = function(event) {

        this.sendMessage('devicemotion', {
            accelerationIncludingGravity: {
                x: event.accelerationIncludingGravity.x,
                y: event.accelerationIncludingGravity.y,
                z: event.accelerationIncludingGravity.z
            }
        });

    }

    Gamepad.prototype.startGame = function() {
        this.sendMessage('start', this.uid);
    }

    Gamepad.prototype.stopGame = function() {
        this.sendMessage('stop', this.uid);
    }


    Gamepad.prototype.handWebsocketClose = function() {
        alert("connection closed");
    }

    Gamepad.prototype.connected = function(command) {
        // what to do when it is connected
        //document.getElementById('message').innerHTML="connected";
    };

    //
    Gamepad.prototype.vibrate = function(data) {

        if (navigator.vibrate) {
            navigator.vibrate(data);
        } else if (navigator.webkitVibrate) {
            navigator.webkitVibrate(data);
        } else {
            //do nothing
        }

    }

    Gamepad.prototype.dispatchCommand = function(command) {

        // Do we have a handler function for this command?
        var handler = this.messageHandlers[command.msg];
        if (typeof(handler) === 'function') { //call only when it is function
            // If so, call it and pass the parameter data
            handler.call(this, command.data);
        }

    };
    Gamepad.prototype.stop_deviceorientation = function() {
        if ((window.DeviceOrientationEvent)) {
            window.addEventListener('deviceorientation', function(data) {}, false);
        } else {
            alert("not support deviceorientation");
        }
    }
    Gamepad.prototype.start_deviceorientation = function() {
        if ((window.DeviceOrientationEvent)) {
            window.addEventListener('deviceorientation', this.deviceorientationEvt.bind(this), false);
        } else {
            alert("not support deviceorientation");
        }
    }
    Gamepad.prototype.stop_devicemotion = function() {
        if ((window.DeviceMotionEvent)) {
            window.addEventListener('devicemotion', function(data) {}, false);
        } else {
            alert("not support deviceorientation");
        }
    }
    Gamepad.prototype.start_devicemotion = function() {
        if ((window.DeviceMotionEvent)) {
            window.addEventListener('devicemotion', this.devicemotionEvt.bind(this), true);
        } else {
            alert("not support devicemotion");
        }
    }

    Gamepad.prototype.disable_vibrate = function() {
        this.on('vibrate', function(data) {});
    }

    Gamepad.prototype.enable_vibrate = function() {
        this.on('vibrate', this.vibrate.bind(this));
    }
    
    Gamepad.prototype.on = function(msg, func) {
        //register when it is a function
        if (typeof(func) === 'function') {
            this.messageHandlers[msg] = func;
        } else {
            //console.log(msg+':you must register a function for the event');   
        }
    }
    win.Gamepad = Gamepad;
})(window);