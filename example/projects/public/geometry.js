/**
 * Created with JetBrains WebStorm.
 * User: duanye
 * Date: 13-8-13
 * Time: 上午12:42
 * To change this template use File | Settings | File Templates.
 */
function sig(p){
    if (p > 0)
        return 1;
    if (p < 0)
        return -1;
    return 0;
}
function minDistanceP2S(p, s1, s2){
    var d1 = new THREE.Vector3().subVectors(s1, p);
    var d2 = new THREE.Vector3().subVectors(s2, p);
    var area = new THREE.Vector3().crossVectors(d1, d2).length() / 2;
    var s = new THREE.Vector3().subVectors(s2, s1);
    var P2S = area * 2/ s.length();
    if (sig(d1.dot(s)) != sig(d2.dot(s)))
        return P2S;
    else
        return (Math.min(d1.length(), d2.length()));
}
function minDistanceP2F(p, f1, f2, f3){
    var a = new THREE.Vector3().subVectors(f1, f2);
    var b = new THREE.Vector3().subVectors(f1, f3);
    var fa = new THREE.Vector3().crossVectors(a, b);
    var area = fa.length() / 2;
    var d1 = new THREE.Vector3().subVectors(f1, p);
    var d2 = new THREE.Vector3().subVectors(f2, p);
    var d3 = new THREE.Vector3().subVectors(f3, p);
    var m = new THREE.Matrix3(d1.x, d1.y, d1.z, d2.x, d2.y, d2.z, d3.x, d3.y, d3.z);
    var P2F = Math.abs(m.determinant()) / 2 / area;
    fa.setLength(P2F);
    var p1 = new THREE.Vector3().addVectors(p, fa);
    var p2 = new THREE.Vector3().subVectors(p, fa);
    var tri = new THREE.Triangle(f1, f2, f3);
    if (tri.containsPoint(p1) || tri.containsPoint(p2))
        return P2F;
    return Math.min(minDistanceP2S(p, f1, f2), minDistanceP2S(p, f1, f3), minDistanceP2S(p, f3, f2));
}
function minDistanceP2O(p, obj, debug){
    var vertices = obj.geometry.vertices;
    var faces = obj.geometry.faces;
    var base = obj.position;
    var min = Number.POSITIVE_INFINITY;
    if (debug){
        console.log(obj);
    }
    for (var i = 0; i < faces.length; i ++){
        var f1 = new THREE.Vector3().addVectors(base, vertices[faces[i].a]);
        var f2 = new THREE.Vector3().addVectors(base, vertices[faces[i].b]);
        var f3 = new THREE.Vector3().addVectors(base, vertices[faces[i].c]);
        var dis = minDistanceP2F(p, f1, f2, f3);
        if (faces[i] instanceof THREE.Face4){
            var f4 = new THREE.Vector3().addVectors(base, vertices[faces[i].d]);
            dis = Math.min(dis, minDistanceP2F(p, f1, f3, f4));
        }
        if (dis < min)
            min = dis;
    }
    return min;
}
