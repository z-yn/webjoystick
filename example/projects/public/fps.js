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
    camera.position.set(0, -1000, 0);
    pos = camera.position;
    camera.lookAt(new THREE.Vector3(1, -1000, 0));
    look = new THREE.Vector3(1, 0, 0);
    up = new THREE.Vector3(0, 1, 0);
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

    //controls = new THREE.OrbitControls(camera, renderer.domElement);
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );
};
var skybox;
function init(){
    initControl();
    var imagePrefix = "images/";
    var directions  = ["brick-wall.jpg", "brick-wall.jpg", "snow.png", "checkerboard.jpg", "brick-wall.jpg", "brick-wall.jpg"];
    var imageSuffix = "";
    var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );

    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
            side: THREE.BackSide
        }));
    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    skybox = new THREE.Mesh( skyGeometry, skyMaterial )
    scene.add(skybox);
}
var res;
var cx = 0, cy = 0, dx = 0, dy = 0;
var shooting = 0, lastShot = -1000, released;
function update(){
    var delta = clock.getDelta();
    var matrix = new THREE.Matrix4();
    matrix.multiply(new THREE.Matrix4().makeRotationAxis(up, -Math.PI / 8 * cx * delta));
    matrix.multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3().crossVectors(look, up).setLength(1), Math.PI / 8 * cy * delta));
    look = look.applyMatrix4(matrix);
    var vec = new THREE.Vector3(look.x, 0, look.z);
    vec.applyMatrix4(new THREE.Matrix4().makeRotationY(-Math.atan2(dx, dy)));
    vec.setLength(new THREE.Vector3(dx, 0, dy).length() * 10 * delta);
    pos.add(vec);
    camera.position.set(pos.x, pos.y, pos.z);
    camera.lookAt(new THREE.Vector3().addVectors(camera.position, look));
    stats.update();
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
    eventHandler.orientationEvt = function(data) {
        if(data.uid !=='test') {
            dx = data.gamedata.beta;
            dy = data.gamedata.gamma;
        }
    }

    eventHandler.connectEvent = function(data){
        console.log("connected");
    }
    eventHandler.dragEvent = function(data){
        if(data.uid==='test') {
            if (data.gamedata.id == 'circle2'){
                cx = data.gamedata.position.x;
                cy = -data.gamedata.position.y;
            }
            if (data.gamedata.id == 'circle1'){
                dx = data.gamedata.position.x * 180;
                dy = -data.gamedata.position.y * 180;
            }
        }
    }

    eventHandler.dragEndEvent = function(data){
        cx = cy = dx = dy = 0;
    }

    eventHandler.connectedEvent = function(data){
        console.log(data.hostIP);
        var cvs = createQRCodeCanvas("http://" + data.hostIP + ":3000/test.html",150,150);
        document.getElementById('qrcode').appendChild(cvs);
    }

    var url = "ws://" + document.URL.substr(7).split('/')[0];
    gamewatcher = new GameWatcher(url);
    gamewatcher.connect();
    gamewatcher.on('deviceorientation',eventHandler.orientationEvt);
    gamewatcher.on('gamepadAdded', eventHandler.connectEvent);
    gamewatcher.on('dragMove', eventHandler.dragEvent);
    gamewatcher.on('dragEnd', eventHandler.dragEndEvent);
    gamewatcher.on('connected',eventHandler.connectedEvent) ;
}