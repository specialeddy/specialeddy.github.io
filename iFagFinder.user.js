// ==UserScript==
// @name        iFagFinder
// @namespace   im.a.gay.cat
// @author      team !kittens
// @description a tripfag finder for 4chan mobile
// @include     *boards.4chan.org/b/*
// @version     0.2
// @grant       none
// ==/UserScript==

function iFagFinder(){
    
    var d, db, h, namespace, $, $$;
 
    d = document;
    db = document.body;
    h = document.getElementsByTagName('head')[0];

    namespace = "iFagFinder";

    $ = function(s, p){
        if(!p || p == null){
            p = db;
        }
        return p.querySelector(s);
    };

    $$ = function(s, p){
        if(!p || p == null){
            p = db;
        }
        return p.querySelectorAll(s);
    };

    $.getVal = function(k, v){
        if(typeof(Storage) !=="undefined"){
            if(v == null){
                if(localStorage.getItem(namespace + "." + k) != null){
                    return localStorage.getItem(namespace  + "." + k);
                }else{
                    return 'undefined';
                }
            }else{
                if(localStorage.getItem(namespace + "." + k) != null){
                    return localStorage.getItem(namespace + "." + k);
                }else{
                    return v;
                }
            }
        }else{
            return 'storage unavailable';
        }
    };

    $.setVal = function(k, v){
        if(typeof(Storage) !=="undefined"){
                if(v == null){
                    return 'undefined';
                }else{
                    return localStorage.setItem(namespace  + "." + k, v);
                }
        }else{
            return 'storage unavailable';
        }
    };

    $.delVal = function(k){
        return localStorage.removeItem(namespace + "." + k);
    };
    
    $.elm = function(t, a, s){
        var e = d.createElement(t);
        if(a){
            for (key in a){
                e.setAttribute(key, a[key]);
            }
        }
        if(s){
            s.appendChild(e);
        }
        return e;
    };
    
    $.htm = function(s, v){
        if(v == null){
            return s.innerHTML;
        }else{
            s.innerHTML = v;
        }
        return s;
    };
    
    $.each = function(a, c, e){
        for(var i = 0; i < a.length; i++){
            c(a[i], i);
            if(i == (a.length)-1){
                if(e && e != null){
                    return e(a[i], i);
                }else{
                    return a;
                }
            }
        }
    };
    
    $.xhr = function(t, u, i, c, p){
        if(i != null){
            if(t == 'POST'){
                var xd = new FormData();
                for (key in i){
                    xd.append(key, i[key]);
                }
            }else{
                xd = '?';
                for (key in i){
                    xd += key + '=' + i[key] + '&';
                }
                xd = xd.substring(0, (xd.length-1));
                u += xd;
            }
        }
        var x = new XMLHttpRequest();
        x.open(t, u);
        if(p != null){
            for (key in p){
                x.setRequestHeader(key, p[key]);
            }
        }
        x.onreadystatechange = function(){
            if (x.readyState == 4) {
                return c(x);
            }
        }
        if(t == 'POST' && i != null){
            x.send(xd);
        }else{
            x.send();
        }
    };
    
    $.JSON = function(s){
        if(typeof s == 'string'){
            return JSON.parse(s);
        }else{
            return JSON.stringify(s);
        }
    };
    
    $.time = function(t, c, l){
        if(c == false){
            return clearInterval(t);
        }else{
            if(l == true){
                return setInterval(function(){
                    c();
                },t);
            }else{
                return setTimeout(function(){
                    c();
                },t);
            }
        }
    };
    
    function build(){
        var $win = {};
        $win['style'] = 'margin-left:auto;margin-right:auto;width:200px;text-align:center;border:1px solid;padding-bottom:10px;';
        $win = $.elm('div', $win, $('#absbot'));
        $.htm($win, '<h3 style="background:#EEAA88;margin-top:0px;">Finder<span style="position:absolute;margin-left:50px;">[ <a id="iFinderRefresh" style="font-weight:bold;cursor:pointer;">&#8635;</a> ]</span></h3><span></span><div id="iThreadFinderBody"></div>');
    }
    
    function load(){
        $.htm($('#iFinderRefresh'), '...');
        var $data = {};
        $data['a'] = 'get';
        if(window.location.href.indexOf('/thread/') > 1){
           $data['t'] = window.location.href.split('/thread/')[1].split('/')[0].split('#')[0];
        }else{
            $data['t'] = 0;
        }
        $data['v'] = '2.0.2';
        $data['p'] = '';
        $data['ap'] = '';
        $.xhr("POST", window.location.protocol + '//api.b-stats.org/finder/api.php', $data, function(x){
            if(x.status == 200){
                try{
                    var data = $.JSON(x.responseText);
                    var html = '';
                    if(data['data'].length < 1){
                        $.htm($('#iThreadFinderBody'), 'No Threads :c');
                    }else{
                        $.each(data['data'], function(a, i){
                            html += '<a href="' + window.location.protocol + '//boards.4chan.org/b/thread/' + a['thread'] + '">' + a['type'] + ' - ' + a['r'] + '/' + a['i'] + '</a><br>';
                        });
                        $.htm($('#iThreadFinderBody'), html);
                    }
                    }
                catch(e){
                    $.htm($('#iThreadFinderBody'), 'Server Error :c');
                }
            }else{
                $.htm($('#iThreadFinderBody'), 'Server Error :c');
            }
            $.htm($('#iFinderRefresh'), '&#8635;');
        });
        
    }
    
    build();
    load();
    $.time(30000, function(){ load(); }, true);
    $('#iFinderRefresh').addEventListener('click', function(){ load(); }, false);
    
}
iFagFinder();