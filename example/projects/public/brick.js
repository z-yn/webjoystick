/**
 * Created with JetBrains WebStorm.
 * User: duanye
 * Date: 13-9-7
 * Time: 上午12:06
 * To change this template use File | Settings | File Templates.
 */
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var SCREEN_WIDTH = window.innerWidth - 50, SCREEN_HEIGHT = window.innerHeight - 20;;
var pos, look, up;

var gamewatcher;
var eventHandler =  {};
function preset(){
    scene = new THREE.Scene();
    var VIEW_ANGLE = 90, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(0, 20, 0);
    //camera.lookAt(100, 0, 0);
    //camera.quaternion.setFromRotationMatrix( new THREE.Matrix4().lookAt(camera.position, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0)) );
    if (Detector.webgl){
        renderer = new THREE.WebGLRenderer({antialias : true});
        //alert("WebGL!");
    }
    else{
        renderer = new THREE.CanvasRenderer();
        alert("No webGL!");
    }
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor(0x777777);
    container = document.getElementById('Game');

    container.appendChild(renderer.domElement);

    THREEx.WindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({charCode : 'm'.charCodeAt(0)});

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );
};
var brickMeshes = [];
var brickMaterials = [];
var bricks = [];
var ball;
var pad1, px1 = 60, py1 = 0;
var pad2, px2 = 10, py2 = 0;
var through = true;
var speed = new THREE.Vector3(0, 0, 0);
var s2 = Math.sqrt(2);

function init(){
    initControl();
    for (var i = 0; i < 4; i ++)
        brickMaterials[i] = [new THREE.MeshBasicMaterial({opacity:0.3 * i, color:0x000000, wireframe:true}), new THREE.MeshBasicMaterial({opacity:0.3 * i, color:0xdd2222})];
    for (var i = 0; i < 5; i ++){
        brickMeshes[i] = [];
        bricks[i] = [];
        for (var j = 0; j < 7; j ++){
            brickMeshes[i][j] = THREE.SceneUtils.createMultiMaterialObject(new THREE.CubeGeometry(10, 10, 15), brickMaterials[3]);
            bricks[i][j] = 3;
            brickMeshes[i][j].position.set(100 + i * 12, 5, -51 + j * 17);
            scene.add(brickMeshes[i][j]);
        }
    }
    var wallMaterial = new THREE.MeshBasicMaterial({color:0x22dd22});
    var wallTop = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 7 * 17 + 20), wallMaterial);
    wallTop.position.set(105 + 12 * 5, 5, 0);
    scene.add(wallTop);
    var wallLeft = new THREE.Mesh(new THREE.CubeGeometry(160, 10, 10), wallMaterial);
    wallLeft.position.set(80, 5, -64.5);
    scene.add(wallLeft);
    var wallRight = new THREE.Mesh(new THREE.CubeGeometry(160, 10, 10), wallMaterial);
    wallRight.position.set(80, 5, 64.5);
    scene.add(wallRight);
    pad1 = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 20),new THREE.MeshBasicMaterial({color:0x2222dd}));
    pad2 = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 30),new THREE.MeshBasicMaterial({color:0x2222dd}));
    pad1.position.set(60, 5, 0);
    pad2.position.set(10, 5, 0);
    scene.add(pad1);
    scene.add(pad2);
    ball = new THREE.Mesh(new THREE.SphereGeometry(5, 10, 10),new THREE.MeshBasicMaterial({color:0xffffff}));
    ball.position.set(65, 5, 0);
    scene.add(ball);
    var axis = new THREE.AxisHelper(100);
    scene.add(axis);

    render();
}
function dist(x1, y1, x2, y2){
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}
function ballTouchBrickSC(pos, i, j){
    var x = pos.x, y = pos.z;
    var x1 = 100 + i * 12 - 6, x2 = x1 + 12;
    var y1 = -51 + j * 17 - 8.5, y2 = y1 + 17;
    if (x > x1 && x < x2 && y > y1 - 5 && y < y2 + 5)
        return new THREE.Vector3(1, 0, -1);
    if (x > x1 - 5 && x < x2 + 5 && y > y1 && y < y2)
        return new THREE.Vector3(-1, 0, 1);
    if (Math.min(dist(x, y, x1, y1), dist(x, y, x1, y2), dist(x, y, x2, y1), dist(x, y, x2, y2)) < 5)
        return new THREE.Vector3(-1, 0, -1);
    return new THREE.Vector3(1, 0, 1);
}
function ballTouchPad1(pos){
    var x = pos.x, y = pos.z;
    var x1 = px1 - 5, x2 = px1 + 5;
    var y1 = py1 - 10, y2 = py1 + 10;
    if (x > x1 && x < x2 && y > y1 - 7.5 && y < y2 + 7.5)
        return true;
    if (x > x1 - 5 && x < x2 + 5 && y > y1 && y < y2)
        return true;
    if (Math.min(dist(x, y, x1, y1), dist(x, y, x1, y2), dist(x, y, x2, y1), dist(x, y, x2, y2)) < 5)
        return true;
    return false;
}
function ballTouchPad2(pos){
    var x = pos.x, y = pos.z;
    var x1 = px2 - 5, x2 = px2 + 5;
    var y1 = py2 - 15, y2 = py2 + 15;
    if (x > x1 && x < x2 && y > y1 - 7.5 && y < y2 + 7.5)
        return true;
    if (x > x1 - 5 && x < x2 + 5 && y > y1 && y < y2)
        return true;
    if (Math.min(dist(x, y, x1, y1), dist(x, y, x1, y2), dist(x, y, x2, y1), dist(x, y, x2, y2)) < 5)
        return true;
    return false;
}
function SC2BL(sc){
    return sc.x < 0 || sc.z < 0;
}
var lastTouch;
var wlr = new THREE.Mesh(), wt = new THREE.Mesh();
var pause = false;
function update(){
    var delta = clock.getDelta();
    if (pause)
        return;
    var base = new THREE.Vector3(delta * 50, delta * 50, delta * 50);
    for (var i = 0; i < 5; i ++)
        for (var j = 0; j < 7; j ++){
            for (var k = 0; k < 2; k ++){
                brickMeshes[i][j].children[k].material = brickMaterials[bricks[i][j]][k];
            }
            if (bricks[i][j] < 1)
                brickMeshes[i][j].position.set(NaN, NaN, NaN);
            else
                brickMeshes[i][j].position.set(100 + i * 12, 5, -51 + j * 17);
        }
    var pos0 = ball.position.clone();
    ball.position.add(base.multiply(speed));
    var tb = false;
    for (var i = 0; i < 5; i ++)
        for (var j = 0; j < 7; j ++)
            if (bricks[i][j] > 0 && !tb){
                var sc = ballTouchBrickSC(ball.position, i, j);
                var sc0 = ballTouchBrickSC(pos0, i, j);
                if (!SC2BL(sc0) && SC2BL(sc)){
                    bricks[i][j] --;
                    if (!through){
                        console.log(sc, ball.position, i, j);
                        speed.multiply(sc);
                    }
                    tb = true;
                }
            }
    if (pos0.x < 155 && ball.position.x >= 155)
        speed.x = -speed.x;
    if (pos0.z > -54.5 && ball.position.z <= -54.5 || pos0.z < 54.5 && ball.position.z >= 54.5)
        speed.z = -speed.z;
    if (!ballTouchPad1(pos0) && ballTouchPad1(ball.position)){
        console.log("tp1");
        if (ball.position.x > px1){
            speed = new THREE.Vector3(1, 0, (ball.position.z - py1) / 10).setLength(s2);
            through = true;
        }
        else
            speed.x = -speed.x;
    }
    if (!ballTouchPad2(pos0) && ballTouchPad2(ball.position)){
        console.log("tp2");
        if (ball.position.x > px2){
            speed = new THREE.Vector3(1, 0, (ball.position.z - py2) / 15).setLength(s2);
            through = false;
        }
        else
            speed.x = -speed.x;
    }
    if (ball.position.x < -10){
        speed = new THREE.Vector3(0, 0, 0);
        ball.position.addVectors(new THREE.Vector3(10, 0, 0), pad1.position);
    }

    //updateControl(delta);
    controls.update();
    stats.update();
    pad1.position.set(px1, 5, py1);
    pad2.position.set(px2, 5, py2);
}
function updateControl(delta){
    if (speed.length() < 0.5 && keyboard.pressed("space")){
        speed = new THREE.Vector3(1, 0, Math.random() > 0.5? 1:-1);
        through = true;
    }




}
function animate()
{
    requestAnimationFrame( animate );
    update();
    render();
}
function render(){
    renderer.render(scene, camera);
}
function initControl() {

    eventHandler.connectEvent = function(data){
        console.log("connected");
    }
    eventHandler.dragEvent = function(data){
        //console.log(data);
        if(data.uid==='test1') {
            py1 = data.gamedata.position * 49.5;
        } else if(data.uid==='test2') {
            py2 = data.gamedata.position * 44.5;
        }
    }

    eventHandler.dragEndEvent = function(data){
         if(data.uid==='test1') {
             py1=0;
         } else if(data.uid==='test2') {
             py2=0;
         }
    }
    eventHandler.brickStart = function(data){
        if (speed.length() < 0.5 ){
            speed = new THREE.Vector3(1, 0, Math.random() > 0.5? 1:-1);
            through = true;
        }
    }
    eventHandler.connectedEvent = function(data){
        console.log(data.hostIP);
        var cvs1 = createQRCodeCanvas("http://" + data.hostIP + ":3000/scroll.html?uid=test1",150,150);
        document.getElementById('qrcode1').appendChild(cvs1);
        var cvs2 = createQRCodeCanvas("http://" + data.hostIP + ":3000/scroll.html?uid=test2",150,150);
        document.getElementById('qrcode2').appendChild(cvs2);
    }
    var url = "ws://" + document.URL.substr(7).split('/')[0];
    gamewatcher = new GameWatcher(url);
    gamewatcher.connect();
    gamewatcher.on('deviceorientation',eventHandler.orientationEvt);
    gamewatcher.on('gamepadAdded', eventHandler.connectEvent);
    gamewatcher.on('sliderMove', eventHandler.dragEvent);
    gamewatcher.on('sliderEnd', eventHandler.dragEndEvent);
    gamewatcher.on('buttonDown',eventHandler.brickStart);
    gamewatcher.on('connected',eventHandler.connectedEvent) ;

}
