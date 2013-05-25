
## webjoystick
SDU_WebJoystick a open source project create by FourDays base on Html5
websocket and Device API.  we aim to develop a new way to play game--- use
your mobile as gamepad, so you can play your web games in your PC and use
he special feature of your phone.
## Install
it's a module of Node.js. first you need install node,see < http://nodejs.org/>
with the help of Node Packaged Modules tool npm, you can easily install it by

```bash
    # npm install webjoystick -g
```
    or download the source by
    
```bash
    $ git clone https://github.com/z-yn/webjoystick.git
```
and run

```bash
    # npm install ./webjoystick/ -g
```

## Quick start
if you install webjoystick as global with option -g
you can create a simple template project by 

```bash
    $ webjoystick <foldername>
```
or just deploy a simple example by

```bash
    $ webjoystick -e <foldername>
```
## Usage
### webjoystick
```javascript
  var webjoystick = require('webjoystick');
  var server = webjoystick.createServer(config);
```
  config is used to create a websocket server,so you can see
  <https://github.com/Worlize/WebSocket-Node/wiki/Documentation>
  
### GameWatcher
 you need add public/javascripts/gamewatcher.js of the template
#### Methods

##### GameWatcher(url)

*Arguments*

* `url`: the url of the websocket

*Example*

```javascript
var url = "ws://" + document.URL.substr(7).split('/')[0];
var gamewatcher = new GameWatcher(url)
```
##### connect()
connect to the websocket server
##### on(msg,func)
handle the event named `msg` with the function `func`
*Arguments*
* `msg`: then event name
* `func(data)`: the function to handle this event.
    data.uid---the uid of gamepad ;data.gamedata--- the data about the event
##### vabrate(uid,ruler)
send vabrate message to the gamepad

*Arguments*
* `uid`: the uid of gamepad
* `ruler`: the ruler of vibration

####  Events
* connected--connected to server
* stop---stop game signal, the reason given by data
* gamepadAdded---new gamepad added to server, uid given by data
* gamepadRemoved----gamepad removed from server, it's uid given by data
* start---gamepad send start game signal, it's uid given by data 
* deviceorientation-----DeviceOrientation Event of html5 Device API
* devicemotion-----DeviceMotion Event of html5 Device API

### Gamepad
    you need add public/javascripts/gamepad.js of the template
    
#### Methods

##### Gamepad(url,uid)

*Arguments*
* `url`: the url of the websocket
* `uid`: the unique id of a gamepad

*Example*

```javascript
var url = "ws://" + document.URL.substr(7).split('/')[0];
var gamepad = new Gamepad(url,'gamepad1')
```
##### connect()
connect to the websocket server

##### on(msg,func)
handle the event named `msg` with the function `func`
*Arguments*
* `msg`: then event name
* `func(data)`: the function to handle this event.
    data.uid---the uid of gamepad ;data.gamedata--- the data about the event
    
##### sendMessage（msg,data)
send message to GameWatcher,it can deal with by on(msg,data) in GameWatcher

*Arguments*
* `msg`: title of the message
* `data`: data of the message ,can be json object

*Example*
 send 'hello' as title and 'world' as data to GameWatcher
```javascript
var url = "ws://" + document.URL.substr(7).split('/')[0];
var gamepad = new Gamepad(url,'gamepad1')
gamepad.sendMessage('hello','world');
```
and GameWatcher get message like

```javascript
gamewatcher.on('hello',function(data) {
    console.log(data.uid);//"gamepad1"
    console.log(data.gamedata);//"world"
});
```
##### start_devicemotion() / stop_devicemotion()
start/stop the devicemotion event listen
##### start_deviceorientation / stop_deviceorientation()
start/stop the deviceorientation event listen
##### disable_vibrate() / enable_vibrate()
disable/enable vibrate 

#### Events
* connected---connected to server


## License 

(The LGPL License)
Copyright 2013 FourDays

SDU_WebJoystick is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at your
option) any later version.

SDU_WebJoystick is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public
License for more details.

You should have received a copy of the GNU Lesser General Public License
along with SDU_WebJoystick.  If not, see <http://www.gnu.org/licenses/>.

We referred to Node.js with honor, here is its license
====
Copyright Joyent, Inc. and other Node contributors. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
====
