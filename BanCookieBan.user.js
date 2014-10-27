// ==UserScript==
// @name   		BanCookieBan
// @description fuck cookie bans.
// @namespace   im.a.gay.cat
// @include    	*4chan.org/*
// @author team !kittensORw
// @contributor !LunanonXE2
// @contributor nokosage
// @icon        data:image/png;base64,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
// @version    	0.4
// ==/UserScript==

function bcb(){
    
    var $version = 0.4;
    
    function updateScript(v, n, t){     
       var r=confirm("Ban Cookie Ban has updates ready.\nNew version: " + v + ", your version: " + $version + ".\n Install Update?");
       if (r==true){
          window.open("https://imagesync.org/bancookieban/"+v+"/BanCookieBan.user.js");
       }else{
          localStorage.setItem(v+'upd'+n, 'pass');
       }  
    }
    
    function checkVersion(n, t){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://imagesync.org/kver.php");
          xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
               var $newVer = xhr.responseText.split(n + ':')[1].split(';')[0];
               if(parseFloat($newVer) > $version && localStorage.getItem(parseFloat($newVer)+'upd'+n) != 'pass'){
                   return updateScript(parseFloat($newVer), n, t);
               }else{
                   return false;
               }

           }
        }
        xhr.send();   
    }
    
    checkVersion('bancookieban', 'Ban Cookie Ban');
    
    function a($Name,$Value,$EndH){ 
    		var exdate=new Date(); 
    		$EndH=exdate.getHours()+$EndH; 
    		exdate.setHours($EndH); 
    		document.cookie=$Name+ "=" +escape($Value)+(($EndH==null) ? "" : ";expires="+exdate.toGMTString()+"; path=/;domain=.4chan.org");
    }
    function clearC(){
        var cookiekiller = setInterval(function(){
    		a('4chan_pass','_nope',1);
        },300);
        setTimeout(function(){clearInterval(cookiekiller);},5000);
    }
    clearC();
	
    var isChromium = window.chrome;
	if(isChromium) {
	   document.addEventListener('QRPostSuccessful_', clearC, false);
	} else { 
	   document.addEventListener('QRPostSuccessful', clearC, false);
	}
	
    document.addEventListener("ThreadUpdate", clearC, false);	
}
bcb();