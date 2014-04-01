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
        this.x = this.y = this.z = this.last_x = this.last_y = this.last_z =0;
        this.lastUpdate = 0;
        this.SHAKE_THRESHOLD =1000;
        this.time = 0;
        this.oldtime=0;
        this.isEnableShake =false;
        this.isEnableMotion=false;
        this.orientation = [0, 0, 0];

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
    }   ;

    Gamepad.prototype.connect = function() {

        var wsCtor = window['MozWebSocket'] ? MozWebSocket : WebSocket;
        this.socket = new wsCtor(url, ['control', this.uid]);

        this.socket.onclose = this.handWebsocketClose.bind(this);
        this.socket.onmessage = this.handleWebsocketMessage.bind(this);
    };

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
        if (data.x && !data.y){
            this.orientation[0] = data.x * (180 / Math.PI);
            this.orientation[1] = data.y * (180 / Math.PI);
            this.orientation[2] = data.z * (180 / Math.PI);
        }else if(data.accelerationIncludingGravity){
            this.orientation[0] = -data.accelerationIncludingGravity.x*10;
            this.orientation[1] = data.accelerationIncludingGravity.y*10;
            this.orientation[2] = data.accelerationIncludingGravity.z*10;
        }
        else{
            this.orientation[0] = data.alpha;
            this.orientation[1] = data.beta;
            this.orientation[2] = data.gamma;
        }
        this.sendMessage('deviceorientation', {
            alpha: this.orientation[0],
            beta: this.orientation[1],
            gamma: this.orientation[2]
        }); //deviceorientation
    } ;

    Gamepad.prototype.checkShake = function(data) {
        var acceleration = data.accelerationIncludingGravity;

        var curTime = new Date().getTime();

        if ((curTime - this.lastUpdate) > 100) {

            var diffTime = (curTime - this.lastUpdate);
            this.lastUpdate = curTime;

            this.x = acceleration.x;
            this.y = acceleration.y;
            this.z = acceleration.z;

            var sd = Math.abs(this.x+this.y+this.z-this.last_x-this.last_y-this.last_z) / diffTime * 10000;
            this.time = new Date().getTime();

            if ((sd > this.SHAKE_THRESHOLD)&&((this.time-this.oldtime)>500) ){

                this.oldtime = this.time;
                this.sendMessage('shake',{direction:{x:(this.x-this.last_x),y:(this.y-this.last_y),z:(this.z-this.last_z)}});    ;
            }
            this.last_x = this.x;
            this.last_y = this.y;
            this.last_z = this.z;
        }
    } ;

    Gamepad.prototype.devicemotionEvt = function(event) {

        if(this.isEnableShake) {
            this.checkShake(event).bind(this);
        }

        if(this.isEnableMotion) {
            this.sendMessage('devicemotion', {
                accelerationIncludingGravity: {
                    x: event.accelerationIncludingGravity.x,
                    y: event.accelerationIncludingGravity.y,
                    z: event.accelerationIncludingGravity.z
                }
            });
        }
    } ;

    Gamepad.prototype.startGame = function() {
        this.sendMessage('start', this.uid);
    } ;

    Gamepad.prototype.stopGame = function() {
        this.sendMessage('stop', this.uid);
    }  ;


    Gamepad.prototype.handWebsocketClose = function() {
        alert("connection closed");
    }   ;

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
            window.removeEventListener('devicemotion', this.deviceorientationEvt.bind(this), true);
         } else {
         alert("not support deviceorientation");
         }
    }
    Gamepad.prototype.start_deviceorientation = function() {
        if (window.DeviceOrientationEvent){
          //  window.addEventListener('deviceorientation', this.deviceorientationEvt.bind(this), true);
          //  window.addEventListener('MozOrientation', this.deviceorientationEvt.bind(this), true);
            window.addEventListener('devicemotion', this.deviceorientationEvt.bind(this), true);
        } else {
            alert("not support deviceorientation");
        }
    }
    Gamepad.prototype.enable_shake = function() {

        if ((window.DeviceMotionEvent)) {
            this.isEnableShake = true;
            window.addEventListener('devicemotion', this.devicemotionEvt.bind(this), true);
        } else {
            alert("not support devicemotion");
        }
    }

    Gamepad.prototype.disable_shake = function() {
        this.isEnableShake =false;
        if ((window.DeviceMotionEvent)) {
            this.isEnableShake =false;
        } else {
            alert("not support deviceorientation");
        }
    }
    Gamepad.prototype.stop_devicemotion = function() {
        if ((window.DeviceMotionEvent)) {
            this.isEnableMotion =false;
        } else {
            alert("not support deviceorientation");
        }
    }
    Gamepad.prototype.start_devicemotion = function() {
        if ((window.DeviceMotionEvent)) {
            this.isEnableMotion = true;
            window.addEventListener('devicemotion', this.devicemotionEvt.bind(this), true);
        } else {
            alert("not support devicemotion");
        }
    }

    Gamepad.prototype.stop_devicemotion = function() {
        if ((window.DeviceMotionEvent)) {
            this.isEnableMotion = false;
            window.removeEventListener('devicemotion', this.devicemotionEvt.bind(this), true);
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