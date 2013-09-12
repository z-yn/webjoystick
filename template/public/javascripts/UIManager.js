/**
 *    Copyright 2013 FourDays
 *
 *   This file is part of WebJoystick.
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
    var UIManager = function( gamepad )
    {
        this.gamepad = gamepad;
    };

    UIManager.prototype.init = function()
    {
        this.preventTouch();
        this.initCircle();
        this.initScroll();
        this.initButton();
    }

    function sendMessage(msg, data){
        this.gamepad.sendMessage(msg, data);
    }
    UIManager.prototype.preventTouch = function() {
        window.addEventListener('touchstart',function(event){
            event.preventDefault();
            event.stopPropagation();
        });
        window.addEventListener('touchmove',function(event){
            event.preventDefault();
            event.stopPropagation();
        });
        window.addEventListener('touchend',function(event){
            event.preventDefault();
            event.stopPropagation();
        });
    }
    UIManager.prototype.initCircle = function(){
        var circles = document.getElementsByClassName("stick");

        function moveHalo(event, type){
            var src = event.srcElement;
            var cir = src.parentNode;
            var rec = cir.getBoundingClientRect();
            //fixRect(rec);
            event.x = event.targetTouches[0].clientX;
            event.y = event.targetTouches[0].clientY;
            var ox = rec.left + rec.width / 2, oy = rec.top + rec.height / 2;

            var dx = event.x - ox, dy = event.y - oy;
            var px = dx / rec.width * 2, py = dy / rec.height * 2;
            var len = Math.sqrt(px * px + py * py);
            if (len > 1){
                dx /= len;
                dy /= len;
                px /= len;
                py /= len;
            }
            src.style.left = dx + rec.width / 4 + "px";
            src.style.top = dy + rec.height / 4 +"px";
            sendMessage(type, {id:cir.id , position:{x:px,y:py}});
        }
        for (var i = 0; i < circles.length; i ++){
            var stick_style = window.getComputedStyle(circles[i],null);
            if(stick_style.width>stick_style.height) {
                circles[i].style.width = stick_style.height;
            } else {
                circles[i].style.height = stick_style.width;
            }

            var stick = document.createElement("div");
            stick.className = "stick-handle";
            var rect = circles[i].getBoundingClientRect();
            stick.style.width = 0.5 * rect.width +"px";
            stick.style.height = 0.5 * rect.height + "px";
            stick.style.left = rect.width / 4 + "px";
            stick.style.top = rect.height / 4 + "px";
            stick.style.borderRadius = "100%";
            circles[i].appendChild(stick);
            stick.addEventListener('touchstart', function(event){
                moveHalo(event, 'dragStart');
                event.preventDefault();
                event.stopPropagation();
            });

            stick.addEventListener('touchmove', function(event) {
                moveHalo(event, 'dragMove');
                event.preventDefault();
                event.stopPropagation();
            });

            stick.addEventListener('touchend', function(event) {

                var src = event.srcElement;
                var cir = src.parentNode;
                var rec = cir.getBoundingClientRect();
                src.style.top = rec.height / 4 + 'px';
                src.style.left = rec.width / 4 + 'px';

                sendMessage('dragEnd', {id:cir.id});
                event.preventDefault();
                event.stopPropagation();
            });

        }

    }
    UIManager.prototype.initButton = function(){
        var buttons = document.getElementsByClassName('pad-button');
        for (var i = 0; i < buttons.length; i ++){
            //alert(this.gamepad);
            buttons[i].addEventListener('touchstart', function(event){
                sendMessage('buttonDown', {id: event.srcElement.id});
            });
            buttons[i].addEventListener('touchmove',function(event){
                event.preventDefault();
                event.stopPropagation();
            })
            buttons[i].addEventListener('touchend', function(event){
                sendMessage('buttonUp', {id: event.srcElement.id});
            });
        }
    }
    UIManager.prototype.initScroll = function() {
        var sliders = document.getElementsByClassName('slider');
        for(var i = 0; i < sliders.length; i ++) {
            var slider = sliders[i];
            var handle = document.createElement('div');
            handle.className = 'slider-handle' ;
            var rect = slider.getBoundingClientRect();
            handle.style.width = 2 * rect.height + "px";
            handle.style.height = 3 * rect.height + "px";
            handle.style.left = rect.width / 2 - rect.height;
            handle.style.top = -rect.height;
            handle.style.borderRadius=rect.height +"px/" +rect.height*3 /2 +"px";

            slider.appendChild(handle);

            handle.addEventListener('touchstart',function(event){
                var src = event.srcElement;
                var slider = src.parentNode;
                var rect = slider.getBoundingClientRect();
                var touch = event.targetTouches[0];
                var ox = rect.left + rect.width / 2;
                var dx = touch.clientX - ox;
                var px = dx / rect.width * 2;
                if (px > 1){
                    dx /= px;
                    px = 1;
                }
                src.style.left = dx + rect.width / 2 - rect.height / 2 + "px";

                sendMessage('sliderStart',{id:slider.id, position:px});
                event.preventDefault();
                event.stopPropagation();
            });
            handle.addEventListener('touchmove',function(event){
                var src = event.srcElement;
                var slider = src.parentNode;
                var rect = slider.getBoundingClientRect();
                var touch = event.targetTouches[0];
                var ox = rect.left + rect.width / 2;
                var dx = touch.clientX - ox;
                var px = dx / rect.width * 2;
                if (px > 1){
                    dx /= px;
                    px = 1;
                }
                src.style.left = dx + rect.width / 2 - rect.height + "px";
                sendMessage('sliderMove',{id:slider.id, position:px});
                event.preventDefault();
                event.stopPropagation();
            });
            handle.addEventListener('touchend',function(event){
                var src = event.srcElement;
                var slider = src.parentNode;
                var rect = slider.getBoundingClientRect();
                src.style.left = rect.width / 2 - rect.height + "px";
                event.preventDefault();
                event.stopPropagation();
                sendMessage('sliderEnd',{id:slider.id});
            })  ;
        }
    }
    win.UIManager = UIManager;
})(window);