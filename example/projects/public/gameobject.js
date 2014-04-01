/**
 * Created with JetBrains WebStorm.
 * User: duanye
 * Date: 13-8-13
 * Time: 上午2:11
 * To change this template use File | Settings | File Templates.
 */

function repairO(vertices){
    var v = vertices;
    var sum = new THREE.Vector3(0, 0, 0);
    for (var i = 0; i < v.length; i ++)
        sum.add(v[i]);
    sum.divide(new THREE.Vector3(v.length, v.length, v.length));
    for (var i = 0; i < v.length; i ++)
        v[i].sub(sum);
    return sum;
}
function repairD(vertices, avg){
    var v = vertices;
    for (var i = 0; i < v.length; i ++)
        v[i].sub(avg);
}
function multiply(vertices, scale){
    var v = vertices;
    for (var i = 0; i < v.length; i ++)
        v[i].multiply(new THREE.Vector3(scale, scale, scale));
}
function multiply3(vertices, sx, sy, sz){
    var v = vertices;
    for (var i = 0; i < v.length; i ++)
        v[i].multiply(new THREE.Vector3(sx, sy, sz));
}

var GameObject = function(mesh, next, effect, coll){
    this.mesh = mesh;
    this.coll = (coll == undefined)? mesh:coll;
    //console.log(mesh);
    this.effect = (effect == undefined)? undefined:function(){
        if (effect != undefined)
            effect(this);
    }
    this.next = function (delta){
        if (next != undefined)
            next(this, delta);
    }
    this.gc = false;
    this.markGC = function(){
        this.gc = true;
    }
    this.needGC = function(){
        return this.gc;
    }
}

var Tornado = function(next, effect){
    this.speed = -1;
    var particleTexture = THREE.ImageUtils.loadTexture( 'images/smokeparticle.png' );
    var particleGroup = new THREE.Object3D();
    var particleAttributes = { startSize: [], startPosition: [], randomness: [] };

    var totalParticles = 25;
    for( var i = 0; i < totalParticles; i++ )
    {
        var spriteMaterial = new THREE.SpriteMaterial( { map: particleTexture, useScreenCoordinates: false, color: 0xffffff } );

        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set( 32 * Math.sqrt(i) / 3, 32 * Math.sqrt(i) / 3, 1.0 ); // imageWidth, imageHeight
        sprite.position.set( Math.cos(i / 1.25) * i / 1.25 * 3, i * 4, Math.sin(i / 1.25) * i / 1.25 * 3);

        sprite.material.color.setRGB(0.4,0.4,0.4);

        particleGroup.add( sprite );
        particleAttributes.startPosition.push( sprite.position.clone() );
        particleAttributes.randomness.push( Math.random() );
    }

    particleGroup.position.set(0, 150, 0);
    var coll = new THREE.Mesh(new THREE.CylinderGeometry(100, 0, 100, 10, 10), new THREE.MeshBasicMaterial());
    coll.position.set(particleGroup.position.x, particleGroup.position.y + 100, particleGroup.position.z);

    this.time = 0;
    var tnext = function (obj, delta){
        obj.time += delta;
        for ( var c = 0; c < particleGroup.children.length; c ++ )
        {
            var sprite = particleGroup.children[ c ];
            var a = particleAttributes.randomness[c] + 1;
            var pulseFactor = Math.sin(a * obj.time * 4) * 0.5 + 0.5;
            sprite.position.x = particleAttributes.startPosition[c].x * pulseFactor;
            sprite.position.z = particleAttributes.startPosition[c].z * pulseFactor;
        }
        particleGroup.rotation.y = obj.time * 2.75;
        if (next != undefined)
            next(obj, delta);
        coll.position.set(particleGroup.position.x, particleGroup.position.y + 100, particleGroup.position.z);
    }
    GameObject.call(this, particleGroup, tnext, effect, coll);
};

var GuidePost = function(roty, next, callback){
    var t = this;
    this.mesh = new THREE.Mesh();
    var objmtlLoader =  new THREE.OBJMTLLoader();
    objmtlLoader.addEventListener('load',function (event) {
        var object = event.content;
        object.children.splice(4);
        for (var j = 0; j < object.children.length; j ++){
            var vet = object.children[j].geometry.vertices;
            for (var i = 0; i < vet.length; i ++){
                vet[i].y = -vet[i].y;
                vet[i].multiply(new THREE.Vector3(9, 9, 9));
            }
        }
        object.applyMatrix(new THREE.Matrix4().makeRotationY(roty));
        object.position = t.mesh.position;
        GameObject.call(t, object, next, undefined, object);
        //console.log(t);
        callback(t);
    });
    objmtlLoader.load('models/guidepost.obj','models/guidepost.mtl');
};
var IceTree = function(next, callback){
    var t = this;
    this.mesh = new THREE.Mesh();
    var objLoader =  new THREE.OBJLoader();
    objLoader.load('models/tree.obj',function (event) {
        var object = event;
        console.log(event);
        var avg = repairO(object.children[0].geometry.vertices);
        repairD(object.children[1].geometry.vertices, avg);
        multiply3(object.children[1].geometry.vertices, 40, 60, 40);
        multiply3(object.children[0].geometry.vertices, 40, 60, 40);
        object.position = t.mesh.position;
        GameObject.call(t, object, next, undefined, object);
        callback(t);
    });
}

var SnowForeGround = function(){
    var particleGroup = new THREE.Object3D();
    var particleTexture = THREE.ImageUtils.loadTexture( 'images/snow_flake.png' );
    for (var i = 0; i < 200; i ++){
        var spriteMaterial = new THREE.SpriteMaterial( { map: particleTexture, useScreenCoordinates: true, alignment: THREE.SpriteAlignment.topLeft, opacity:1} );
        var sprite = new THREE.Sprite( spriteMaterial );
        var sc = 8 + 8 * Math.random();
        sprite.scale.set( sc, sc, 0 );
        sprite.position.set(Math.random() * SCREEN_WIDTH, Math.random() * SCREEN_HEIGHT, 0);
        particleGroup.add(sprite);
    }
    var snext = function (obj, delta){
        for ( var c = 0; c < particleGroup.children.length; c ++ )
        {
            var sprite = particleGroup.children[ c ];
            sprite.position.x += delta * Math.pow(Math.random(), 0.1) * SCREEN_WIDTH * 0.05;
            sprite.position.y += delta * SCREEN_HEIGHT * 0.1;
            if (sprite.position.x > SCREEN_WIDTH)
                sprite.position.x -= SCREEN_WIDTH;//Math.random() * SCREEN_WIDTH;
            if (sprite.position.y > SCREEN_HEIGHT)
                sprite.position.y -= SCREEN_HEIGHT;//Math.random() * SCREEN_HEIGHT;
        }
        particleGroup.rotation.y = obj.time * 2.75;
    }
    GameObject.call(this, particleGroup, snext, undefined, undefined);
}
var SnowBall = function(next, effect){
    var mapSnow = new THREE.ImageUtils.loadTexture("images/snow.png");
    var snowMaterial = new THREE.MeshLambertMaterial({map:mapSnow, side:THREE.DoubleSide});
    var obj = new THREE.Mesh(new THREE.SphereGeometry(20, 10, 10), snowMaterial);
    GameObject.call(this, obj, next, effect, obj);
}
var Stone = function(next, effect, callback){
    var t = this;
    this.mesh = new THREE.Mesh();
    var objmtlLoader =  new THREE.OBJMTLLoader();
    objmtlLoader.addEventListener('load',function (event) {
        var object = event.content.children[0];
        repairO(object.geometry.vertices);
        multiply(object.geometry.vertices, 1.5);
        object.position = t.mesh.position;
        object.geometry.computeBoundingBox();
        var box = object.geometry.boundingBox;
        var coll = new THREE.Mesh(new THREE.CubeGeometry(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z));
        var snext = function(obj, delta){
            if (next != undefined)
                next(this, delta);
            coll.position = object.position;
        }
        coll.position = object.position;
        GameObject.call(t, object, next, effect, coll);
        callback(t);
    });
    var name = 'models/stone' + Math.floor(Math.random() * 5);
    objmtlLoader.load(name + '.obj', 'models/stone0.mtl');
}
var Tree = function(next, callback){
    var t = this;
    this.mesh = new THREE.Mesh();
    var objmtlLoader =  new THREE.OBJMTLLoader();
    objmtlLoader.addEventListener('load',function (event) {
        var object = event.content.children[0];
        repairO(object.geometry.vertices);
        console.log(object.geometry);
        multiply(object.geometry.vertices,  20);
        object.position = t.mesh.position;
        GameObject.call(t, object, next, undefined, object);
        callback(t);
    });
    objmtlLoader.load('models/songtree.obj', 'models/songtree.mtl');
}

var Mountain = function(next, callback){
    var t = this;
    this.mesh = new THREE.Mesh();
    var objmtlLoader =  new THREE.OBJMTLLoader();
    objmtlLoader.addEventListener('load',function (event) {
        var object = event.content.children[0];
        console.log(event.content);
        repairO(object.geometry.vertices);
        console.log(object.geometry);
        multiply(object.geometry.vertices,  20);
        object.position = t.mesh.position;
        //object.material = new THREE.MeshBasicMaterial({map:object.material.map});
        GameObject.call(t, object, next, undefined, object);
        callback(t);
    });
    objmtlLoader.load('models/terrain0.obj', 'models/terrain.mtl');
}