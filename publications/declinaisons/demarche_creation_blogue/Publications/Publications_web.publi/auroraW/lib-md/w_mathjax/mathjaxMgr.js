/* === MathJax manager =============================================== */
var mathjaxMgr = {

	init : function(){
		if (scCoLib.userAgent.match("msie [678]")) {
			// Gestion fallback pour IE < 8
			var vMathJaxElements = scPaLib.findNodes("des:math");
			for (var i=0; i < vMathJaxElements.length; i++){
				vMathJaxElements[i].syle.display = "none";
			}
			var vMathJaxFallbacks = scPaLib.findNodes("des:.mathJaxFallback");
			for (var i=0; i < vMathJaxFallbacks.length; i++){
				var vMathJaxFallback = vMathJaxFallbacks[i];
				var vImg = scPaLib.findNode("des:img", vMathJaxFallback);
				var vSrc = vImg.getAttribute("data-src");
				if (vSrc) vImg.src = vSrc;
				vMathJaxFallbacks[i].syle.display = "";
			}
		} else {
			var vScript = document.createElement("script");
			vScript.type = "text/javascript";
			vScript.src  = scServices.scLoad.resolveDestUri("/lib-md/w_mathjax/MathJax.js?locale=fr");

			var vConfig = 'MathJax.Hub.Config({';
			vConfig +=    'jax: ["input/MathML","input/TeX","output/SVG"],';
			vConfig +=    'extensions: ["tex2jax.js","mml2jax.js","MathML/content-mathml.js","MathMenu.js","MathZoom.js"],';
			vConfig +=    'imageFont: null,';
			vConfig +=    'webFont: "TeX",';
			vConfig +=    'MathMenu: {showLocale: false, showRenderer: false},';
			vConfig +=    'TeX: {extensions:["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]}';
			vConfig +=    '});';

			if (window.opera) {vScript.innerHTML = vConfig}
			else {vScript.text = vConfig}

			document.getElementsByTagName("head")[0].appendChild(vScript);
		}
	}
}


