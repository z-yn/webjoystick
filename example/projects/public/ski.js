/**
 * Created with JetBrains WebStorm.
 * User: duanye
 * Date: 13-8-12
 * Time: 下午11:51
 * To change this template use File | Settings | File Templates.
 */
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var SCREEN_WIDTH = window.innerWidth - 50, SCREEN_HEIGHT = window.innerHeight - 20;
var popup = false;
//preset();
//init();
//animate();

var r = 50, o = new THREE.Vector3(0, r, 0), role;
var upSpeed = 0, fSpeed = 5, sSpeed = 0.01, zSpeed = 0;
var newMaterial, newFactor;
var components = [];
var len = 0
var effect ;
var locus = [], lc;
var gamewatcher;
var left=false;
var right=false;
var invisible = new THREE.Vector3(-100000, -100000, -100000);
var counter, total = 0;
var eventHandler =  {};
var popUpManager;



function signUp(obj){
    components[len ++] = obj;
    scene.add(obj.mesh);
}
var mapSnow = new THREE.ImageUtils.loadTexture("images/snow.png");
var snowMaterial = new THREE.MeshLambertMaterial({map:mapSnow, side:THREE.DoubleSide});
var mapStone = new THREE.ImageUtils.loadTexture("images/stone.jpg");
var stoneMaterial = new THREE.MeshLambertMaterial({map:mapStone, side:THREE.DoubleSide});
var mapFloor = new THREE.ImageUtils.loadTexture("images/ice.jpg")
var floorMaterial = new THREE.MeshBasicMaterial({map:mapFloor, side:THREE.DoubleSide});
var refreshpage = function(){
    window.location.reload();
};
var back = function(){
    popup = false;
};
var pausePopUp = new PopUp("images/sky.jpg", [new PopUpOption("continue", back), new PopUpOption("restart", refreshpage)]);
function pause(){
    popup = true;
    popUpManager.popUp(pausePopUp);
}
function init(){
    var envLight = new THREE.PointLight(0xffffff);
    envLight.position.set(-10000, 1000, 0);
    scene.add(envLight);

    initControl();
    //initLocus();
    initDomElement();
    createFloor();
    createGuidePost();
    createTornado();
    createSnowForeground();
    createSnowBalls();
    createEnv();
    createStones();


    role = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 20), snowMaterial);
    var vet = role.geometry.vertices;
    for (var i = 0; i < vet.length; i ++)
        for (var j = 0; j < vet.length; j ++){
            if (new THREE.Vector3().subVectors(vet[i], vet[j]).length() < 0.0001)
                vet[i] = vet[j];
        }
    /*for (var i = 0; i < vet.length; i ++){
     vet[i].setLength(vet[i].length() * (1 - Math.random() / 10));
     }*/
    role.position.set(0, r, 0);
    role.castShadow = true;
    scene.add(role);

    var axes = new THREE.AxisHelper(100);
    scene.add( axes );
}
function animate()
{
    requestAnimationFrame( animate );
    update();
    render();
}
/*function createLocus(sx, sy){
 if (lc >= 150)
 lc = 0;
 locus[lc].scale.x = sx * role.scale.x;
 locus[lc].scale.y = sy * role.scale.x;
 locus[lc].position.set(role.position.x, 1, role.position.z);
 lc ++;
 }*/
var newAdd;
function roleUpdate(delta){
    if (r < 5){
        alert("died");
    }
    role.scale.sub(new THREE.Vector3(delta * sSpeed, delta * sSpeed, delta * sSpeed));
    r = 50 * role.scale.x;
    /*if (role.position.y < r + 1 && clock.getElapsedTime() > 3 && role.material == snowMaterial){
     if (keyboard.pressed("left") || keyboard.pressed("right"))
     createLocus(1, 1);
     else
     createLocus(1, 1);
     }*/

    role.position.y += upSpeed * delta;
    upSpeed -= 1800 * delta;
    if (role.position.y < r){
        role.position.y = r;
        upSpeed = 0;
    }
    role.rotation.z -= Math.PI * delta * fSpeed;
    if (keyboard.pressed("left") || left ){
        zSpeed = -1;
    }
    if (keyboard.pressed("right") || right){
        zSpeed = 1;
    }
    role.position.z += 200 * delta * zSpeed;
    if (role.position.z + r > 400)
        role.position.z = 400 - r;
    if (role.position.z - r < -400)
        role.position.z = -400 + r;
    if (keyboard.pressed("left") || left ){
        zSpeed = 0;
    }
    if (keyboard.pressed("right") || right){
        zSpeed = 0;
    }
    if ( keyboard.pressed("space") && role.position.y < r + 1){
        upSpeed = 900;
    }
    if (newMaterial != undefined){
        if (role.material != newMaterial)
            role.material.opacity -= delta * 2;
        else
            role.material.opacity += delta * 2;
        if (role.material.opacity < 0){
            role.material = newMaterial;
            role.material.opacity = 0;
            fSpeed *= newFactor;
            sSpeed += newAdd;
        }
        if (role.material.opacity > 1){
            role.material.opacity = 1;
            newMaterial = undefined;
        }
    }
    /*if ( keyboard.pressed("s") && newMaterial == undefined){
        if (role.material == snowMaterial){
            newMaterial = stoneMaterial;
            newFactor = 2;
            newAdd = -0.01;
        }else{
            newMaterial = snowMaterial;
            newFactor = 0.5;
            newAdd = 0.01;
        }
    }*/
}
var debug = false;
function pausemill(millisecondi)
{
    var now = new Date();
    var exitTime = now.getTime() + millisecondi;

    while(true)
    {
        now = new Date();
        if(now.getTime() > exitTime) return;
    }
}
function update(){
    var delta = clock.getDelta();
    if (popup){
        var pp = popUpManager.getPopUp();
        if (keyboard.pressed("down")){
            pp.setSelected(pp.getSelected() + 1);
            pausemill(1000);
        }
        if (keyboard.pressed("up")){
            pp.setSelected(pp.getSelected() - 1);
            pausemill(1000);
        }
        if (keyboard.pressed("space")){
            pp.act();
        }
        return;
    }
    total += delta * fSpeed * 2;
    counter.innerHTML = Math.round(total);
    for (var i = 0; i < len; i ++){
        components[i].next(delta);
    }
    var diff = 0;
    for (var i = 0; i + diff < len; i ++){
        if (components[i].needGC()){
            diff ++;
            scene.remove(components[i].mesh);
        }
        components[i] = components[i + diff];
    }
    len = i;
    roleUpdate(delta);
    collisionDetect();
    if (debug)
        console.log(scene.children.length);
    //controls.update();
    stats.update();
}
function render(){
    renderer.render(scene, camera);
}
function collisionDetect(){
    for (var i = 0; i < len; i ++){
        if (components[i].effect != undefined ){
            if (minDistanceP2O(role.position, components[i].coll) < r){
                components[i].effect();
            }
        }
    }
    return false;
}
function main(){
    preset();
    init();
    //animate();
}


function preset(){
    scene = new THREE.Scene();
    var VIEW_ANGLE = 90, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(-100, 150, 0);
    camera.lookAt(new THREE.Vector3(600, 0, 0));
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
    //renderer.shadowMapEnabled = true;
    container = document.getElementById('Game');

    container.appendChild(renderer.domElement);

    popUpManager = new PopUpManager(container);

    THREEx.WindowResize(renderer, camera);
    THREEx.FullScreen.bindKey({charCode : 'm'.charCodeAt(0)});

    //controls = new THREE.OrbitControls(camera, renderer.domElement);
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild( stats.domElement );
};
function initControl() {
    eventHandler.orientationEvt = function(data) {
        //console.log(data.gamedata);
        if(data.uid==='test') {
            var beta = data.gamedata.beta;
            zSpeed = beta / 20;
            zSpeed = Math.min(Math.max(zSpeed, -1), 1);
            //console.log(zSpeed);
        }
    }
    eventHandler.shakeEvt = function(data) {
        console.log(data.gamedata.direction);
        if (popup){
            var pop = popUpManager.getPopUp();
            if (data.gamedata.speed < 0)
                pop.setSelected(pop.getSelected() - 1);
            else
                pop.setSelected(pop.getSelected() + 1);
        }
		
        if (role.position.y < r + 1){
            upSpeed = 900;
            console.log(data.gamedata);
        }
    }
    eventHandler.connectEvent = function(data){
        console.log("con");
        animate();
    }
    eventHandler.connectedEvent = function(data){
        var cvs1 = createQRCodeCanvas("http://" + data.hostIP + ":3000/mobile.html",150,150);
        document.getElementById('qrcode').appendChild(cvs1);
    }
    eventHandler.changeEvent = function(data) {
		if(popup) {
			var pop = popUpManager.getPopUp();           
            pop.act();           
			return ;
		} 
        if ( newMaterial == undefined){
             if (role.material == snowMaterial){
                 newMaterial = stoneMaterial;
                 newFactor = 2;
                 newAdd = -0.01;
             }else{
                 newMaterial = snowMaterial;
                 newFactor = 0.5;
                 newAdd = 0.01;
             }
         }
    }
    var url = "ws://" + document.URL.substr(7).split('/')[0];
    gamewatcher = new GameWatcher(url);
    gamewatcher.connect();
    gamewatcher.on('deviceorientation',eventHandler.orientationEvt);
    gamewatcher.on('shake',eventHandler.shakeEvt);
    gamewatcher.on('gamepadAdded', eventHandler.connectEvent);
    gamewatcher.on('connected',eventHandler.connectedEvent) ;
    gamewatcher.on('change',eventHandler.changeEvent);
	gamewatcher.on('pause',pause);
    //gamewatcher.on
}

/*function initLocus(){
 lc = 0;
 var locusNext = function(obj, delta){
 obj.mesh.position.x -= 200 * delta;
 }

 for (var i = 0; i < 150; i ++){
 locus[i] = new THREE.Mesh(new THREE.CircleGeometry(20, 20), snowMaterial);
 locus[i].rotation.x = Math.PI / 2;
 locus[i].position.set(-10000, 0, 0);
 signUp(new GameObject(locus[i], locusNext));
 }
 }*/
function createFloor(){
    var floorNext = function(obj, delta){
        obj.mesh.position.x -= delta * 200 * fSpeed;
        if (obj.mesh.position.x < -5000){
            obj.mesh.position.x += 16000;
        }
    }


    var floor1 = new THREE.Mesh(new THREE.PlaneGeometry(8000, 800), floorMaterial);
    floor1.rotation.x = Math.PI / 2;
    floor1.position.set(-800 + 4000, 0 , 0);
    //floor1.receiveShadow = false;
    signUp(new GameObject(floor1, floorNext, undefined));
    var floor2 = new THREE.Mesh(new THREE.PlaneGeometry(8000, 800), floorMaterial);
    floor2.rotation.x = Math.PI / 2;
    floor2.position.set(-800 + 12000, 0 , 0);
    //floor2.receiveShadow = true;
    signUp(new GameObject(floor2, floorNext, undefined));
}
var injure = true;
setTimeout("injure=false", 3000);
var obEffect = function(obj){
    if (!injure){
        injure = true;
        sSpeed += 0.3;
        setTimeout("sSpeed -= 0.3", 1000);
        setTimeout("injure = false", 1000);
    }
    gamewatcher.vibrate('test',100);
}
function createGuidePost(){
    var guideNext = function (obj, delta){
        obj.mesh.position.x -= delta * 200 * fSpeed;
        if (obj.mesh.position.x < -800)
            obj.mesh.position.x += 8000;
    };
    for (var j = -1; j < 2; j += 2){
        for (var i = 0; i < 5; i ++){
            var guide = new Tree(guideNext, signUp);
            guide.mesh.position.set(100 + i * 1600, 200, j * 600);
        }
    }
}

function createTornado(){
    var torNext = function (obj, delta){
        obj.mesh.position.x -= delta * 200 * fSpeed;
        obj.mesh.position.z += obj.speed * delta * 400;
        if (obj.mesh.position.z > 400)
            obj.speed = -Math.random();
        if (obj.mesh.position.z < -800)
            obj.speed = Math.random();
        if (obj.mesh.position.x < -100)
            obj.mesh.position.x += 4000 + 8000 * Math.random();
    }
    for (var j = 0; j < 4; j ++){
        var tor = new Tornado(torNext, obEffect);
        tor.mesh.position.set(-800 + j * 2000, 0, 0);
        signUp(tor);
    }
}

function createSnowForeground(){
    signUp(new SnowForeGround());
}

function createSnowBalls(){
    var snbNext = function(obj, delta){
        obj.mesh.position.x -= delta * 200 * fSpeed;
        if (obj.mesh.position.x < - 400)
            obj.mesh.position.x += 40000 + 8000 * Math.random();
    }
    var snbEffect = function(obj, delta){
        obj.mesh.position.x += 40000 + 8000 * Math.random();
        sSpeed -= 0.5;
        setTimeout("sSpeed += 0.5", 1000);
    }
    var snb = new SnowBall( snbNext, snbEffect);
    snb.mesh.position.set(4080, 20, 0);
    signUp(snb);
}

function createStones(){
    var sNext = function (obj, delta){
        obj.mesh.position.x -= delta * 200 * fSpeed;
        if (obj.mesh.position.x < -100){
            obj.mesh.position.x += 4000 * (Math.random() - 0.5) + 8000;
            obj.mesh.position.z = (Math.random() - 0.5) * 800;
        }
    }
    for (var j = 0; j < 8; j ++){
        var st = new Stone(sNext, obEffect, signUp);
        st.mesh.position = new THREE.Vector3(1600 + (j * 2000) + (Math.random() - 0.5) * 2000, 0, (Math.random() - 0.5) * 800);
        //console.log(new THREE.Vector3(-400 + (j * 2000) + (Math.random() - 0.5) * 2000, 0, (Math.random() - 0.5) * 800));
    }
}

function createEnv(){
    var mNext = function(obj, delta){
        obj.mesh.position.x -= delta * 100 * fSpeed;
        if (obj.mesh.position.x < -4000)
            obj.mesh.position.x += 8196 * 2;
    }
    var mtMap = THREE.ImageUtils.loadTexture("images/mountain-light.png");
    var mtMaterial = new THREE.MeshBasicMaterial({map:mtMap, side: THREE.DoubleSide, transparent:true});
    var mtl1 = new THREE.Mesh(new THREE.PlaneGeometry(8196, 2048), mtMaterial);
    var mtl2 = new THREE.Mesh(new THREE.PlaneGeometry(8196, 2048), mtMaterial);
    mtl1.position.set(0, 1024, -3200);
    mtl2.position.set(8196, 1024, -3200);

    var mtr1 = new THREE.Mesh(new THREE.PlaneGeometry(8196, 2048), mtMaterial);
    var mtr2 = new THREE.Mesh(new THREE.PlaneGeometry(8196, 2048), mtMaterial);
    mtr1.position.set(0, 1024, 3200);
    mtr2.position.set(8196, 1024, 3200);
    mtr1.rotation.y = Math.PI;
    mtr1.rotation.y = Math.PI;
    signUp(new GameObject(mtr1, mNext, undefined, mtr1));
    signUp(new GameObject(mtl1, mNext, undefined, mtl1));
    signUp(new GameObject(mtr2, mNext, undefined, mtr2));
    signUp(new GameObject(mtl2, mNext, undefined, mtl2));
    var skyMap = THREE.ImageUtils.loadTexture("images/sky_cloud.jpg");
    var skyMaterial = new THREE.MeshBasicMaterial({map:skyMap, side: THREE.DoubleSide});
    var sky = new THREE.Mesh(new THREE.PlaneGeometry(20000, 15000), skyMaterial);
    sky.rotation.x = Math.PI / 2;
    sky.rotation.y = -Math.PI / 6;
    sky.position.set(5000, 3000, 0);
    scene.add(sky);

    var mapGround = THREE.ImageUtils.loadTexture("images/ground.png");
    var gndl = new THREE.Mesh(new THREE.PlaneGeometry(18196, 4096), new THREE.MeshBasicMaterial({map:mapGround, side:THREE.DoubleSide}));
    gndl.rotation.x = -Math.PI / 2;
    gndl.position.set(0, -2, -2448);
    scene.add(gndl);
    var gndr = new THREE.Mesh(new THREE.PlaneGeometry(18196, 4096), new THREE.MeshBasicMaterial({map:mapGround, side:THREE.DoubleSide}));
    gndr.rotation.x = -Math.PI / 2;
    gndr.position.set(0, -2, 2448);
    scene.add(gndr);
    // var mt = new Mountain(undefined, signUp);
    // mt.mesh.position.set(0, 600, 250);
}
function initDomElement(){
    counter = document.getElementById("counter");
}