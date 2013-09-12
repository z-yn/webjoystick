(function() {
    var c = document,
        j = function(b, d, a) {
            if (b.addEventListener) b.addEventListener(d, a, false);
            else if (b.attachEvent) b.attachEvent("on" + d, a);
            else b["on" + d] = a
        },
        m = function(b, d) {
            var a = c.createElement("script");
            a.type = "text/javascript";
            a.src = b + "?v=" + d;
            l.appendChild(a);
            return a
        },
        g = 0;
    if (/msie (\d+\.\d)/i.test(navigator.userAgent.toLowerCase())) g = c.documentMode || +RegExp.$1;
    var l = c.getElementsByTagName("head")[0] || c.body.firstChild,
        o = function() {
            for (var b = c.scripts || c.getElementsByTagName("script"), d = /(?:\?|&)(.*?)=(.*?)(?=&|$)/g, a, k = {}, h = 0, n = b.length; h < n; h++) {
                var f = b[h].src;
                if (f && f.indexOf("http://api.map.soso.com/v1.0/api.map.soso.com") > -1 && f.indexOf("main.js" /*tpa=http://api.map.soso.com/v1.0/ski.js*/ ) > -1) for (;
                (a = d.exec(f)) != null;) k[a[1]] = decodeURIComponent(a[2])
            }
            return k
        }(),
        e = window[o.callback];
    if (e && !e.__loaded__) {
        e.__loaded__ = true;
        var i = m("app.js" /*tpa=http://api.map.soso.com/v1.0/app.js*/ , "1.0.130116");
        g && g < 9 ? j(i, "readystatechange", function() {
            /loaded|complete/.test(i.readyState) && e()
        }) : j(i, "load", function() {
            e()
        })
    } else c.write("<script type='text/javascript' src='http://api.map.soso.com/v1.0/app.js?v=1.0.130116'><\/script>")
})();