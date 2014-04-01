/**
 * Created with JetBrains WebStorm.
 * User: duanye
 * Date: 13-8-16
 * Time: 上午10:01
 * To change this template use File | Settings | File Templates.
 */
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

function welcome_preset(){
    scene = new THREE.Scene();
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 90, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(-400, 50, 0);
    camera.lookAt(new THREE.Vector3(0, 50, 0));
    if (Detector.webgl)
        renderer = new THREE.WebGLRenderer({antialias : true});
    else
        renderer = new THREE.CanvasRenderer();
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor(0x777777);
    //renderer.shadowMapEnabled = true;
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
var sprites = [];
var positions = [new THREE.Vector3(-150, 0, 0), new THREE.Vector3(0, 0, -150), new THREE.Vector3(150, 0, 0), new THREE.Vector3(0, 0, 150)];
var invisible = new THREE.Vector3(-100000, -100000, -100000);
var splight;
function welcome_init(){
    splight = new THREE.SpotLight(0xffffff);
    splight.position.set(- 400, 200, 0);
    splight.angle = Math.PI/21;
    scene.add(splight);

    var envLight = new THREE.AmbientLight(0x333333);
    scene.add(envLight);

    var floorMap = THREE.ImageUtils.loadTexture("images/checkerboard.jpg");
    floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;
    floorMap.repeat.set(10, 10);
    var floorMaterial = new THREE.MeshLambertMaterial({map:floorMap, side:THREE.DoubleSide});
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), floorMaterial);
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    var objMap = THREE.ImageUtils.loadTexture("images/snow.png");
    var objMaterial = new THREE.MeshLambertMaterial({map:objMap, side:THREE.DoubleSide});

    var axes = new THREE.AxisHelper(100);
    scene.add( axes );

    var start = new THREE.Mesh(new THREE.SphereGeometry(50, 20, 20), objMaterial);
    start.position.set(-100, 50, 0);
    scene.add(start);

    var startSpriteTexture = THREE.ImageUtils.loadTexture( 'images/si.jpg' );
    var startSpriteMaterial = new THREE.SpriteMaterial( { map: startSpriteTexture, useScreenCoordinates: false, alignment: THREE.SpriteAlignment.center  } );
    var startSprite = new THREE.Sprite(startSpriteMaterial);
    startSprite.scale.set(40, 40, 1.0);
    scene.add(startSprite);
    sprites.push(startSprite);

    var help = new THREE.Mesh(new THREE.SphereGeometry(50, 20, 20), objMaterial);
    help.position.set(0, 50, -100);
    scene.add(help);

    var helpSpriteTexture = THREE.ImageUtils.loadTexture( 'si.jpg' );
    var helpSpriteMaterial = new THREE.SpriteMaterial( { map: helpSpriteTexture, useScreenCoordinates: true, alignment: THREE.SpriteAlignment.topLeft  } );
    var helpSprite = new THREE.Sprite(helpSpriteMaterial);
    scene.add(helpSprite);
    sprites.push(helpSprite);

    var about = new THREE.Mesh(new THREE.SphereGeometry(50, 20, 20), objMaterial);
    about.position.set(100, 50, 0);
    scene.add(about);

    var aboutSpriteTexture = THREE.ImageUtils.loadTexture( 'si.jpg' );
    var aboutSpriteMaterial = new THREE.SpriteMaterial( { map: aboutSpriteTexture, useScreenCoordinates: true, alignment: THREE.SpriteAlignment.topLeft  } );
    var aboutSprite = new THREE.Sprite(aboutSpriteMaterial);
    scene.add(aboutSprite);
    sprites.push(aboutSprite);

    var exit = new THREE.Mesh(new THREE.SphereGeometry(50, 20, 20), objMaterial);
    exit.position.set(0, 50, 100);
    scene.add(exit);

    var exitSpriteTexture = THREE.ImageUtils.loadTexture( 'si.jpg' );
    var exitSpriteMaterial = new THREE.SpriteMaterial( { map: exitSpriteTexture, useScreenCoordinates: true, alignment: THREE.SpriteAlignment.topLeft  } );
    var exitSprite = new THREE.Sprite(exitSpriteMaterial);
    scene.add(exitSprite);
    sprites.push(exitSprite);
}

function welcome_animate()
{
    requestAnimationFrame( welcome_animate );
    welcome_update();
    welcome_render();
}
var selected = 0;
var restRotation = 0;
function welcome_update(){
    var delta = clock.getDelta();

    for (var i = 0; i < 4; i ++){
        if (i == selected){
            sprites[i].position = positions[i].clone();
        }else{
            sprites[i].position = invisible.clone();
        }
    }


    if (Math.abs(restRotation) > 1e-2){
        //console.log(restRotation);
        var matrix = new THREE.Matrix4().makeRotationY(0.2 * restRotation);
        restRotation *= 0.8;
        camera.position.applyMatrix4(matrix);
        splight.position.applyMatrix4(matrix);
    }else{
        var matrix = new THREE.Matrix4().makeRotationY(restRotation);
        restRotation = 0;
        camera.position.applyMatrix4(matrix);
        splight.position.applyMatrix4(matrix);
        if (keyboard.pressed("left")){
            selected = (selected + 1) % 4;
            restRotation -= Math.PI / 2;
        }
        if (keyboard.pressed("right")){
            selected = (selected + 3) % 4;
            restRotation += Math.PI / 2;
        }
    }
    //console.log(crossProduct);

    camera.lookAt(new THREE.Vector3(0, 0, 0));
    //controls.update();
    stats.update();
}
function welcome_render(){
    //effect.render(scene, camera);
    renderer.render(scene, camera);
}

function welcome_main(){
    welcome_preset();
    welcome_init();
    welcome_animate();
}