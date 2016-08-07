/**
 * LICENCE[[
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1/CeCILL 2.O
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is kelis.fr code.
 *
 * The Initial Developer of the Original Code is 
 * samuel.monsarrat@kelis.fr
 *
 * Portions created by the Initial Developer are Copyright (C) 2007-2013
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * or the CeCILL Licence Version 2.0 (http://www.cecill.info/licences.en.html),
 * in which case the provisions of the GPL, the LGPL or the CeCILL are applicable
 * instead of those above. If you wish to allow use of your version of this file
 * only under the terms of either the GPL, the LGPL or the CeCILL, and not to allow
 * others to use your version of this file under the terms of the MPL, indicate
 * your decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL, the LGPL or the CeCILL. If you do not
 * delete the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL, the LGPL or the CeCILL.
 * ]]LICENCE
 */
/* ====================== SCENARI preload service ==============================
   This service preloads web pages in iframes before showing them thus resulting
   in a smoother experience.
   Prerequisites : 
    * The web generator's uiFrame must use a transparentIframe rootContext,
    * scPaLib.js must be loaded,
    * All links that open new pages must be well defined and their DOM scPaLib
      path properly declared through addLnkPath().
*/
scServices.scPreload = scOnLoads[scOnLoads.length] = {

	fMainFraPath : "ide:mainFrame",
	fDebug : false,
	fLnkPaths : [],
	fCallbacks : [],

	/* == onLoad =================================================================
	   PUBLIC - SCENARI onload system. */
	onLoad : function() {
		this.xLog("onLoad");
		this.fCurFra = scPaLib.findNode(this.fMainFraPath);
		if (!this.fCurFra) return;
		this.fRoot = this.fCurFra.parentNode;
		this.fFraId = this.fCurFra.id;
		this.xInitFra(this.fCurFra);
		if (scServices.scLoad && scServices.scLoad.loadFromRoot) scServices.scLoad.loadFromRoot = function(pUrl) {scServices.scPreload.goTo(scServices.scLoad.getRootUrl()+"/"+pUrl)};
	},
	/* == addLnkPath =============================================================
	 PUBLIC - Add a scPaLib path of nav links to manage.
	 pPath : path to links */
	addLnkPath : function (pPath){
		this.fLnkPaths.push(pPath);
	},
	/* == registerOnGoToCallback =================================================
	 PUBLIC - Register a callback function that will be called when 
	 scServices.scPreload.goTo() if called. The list of callbacks is purged once
	 it has been called.
	 pFunc : function to add to the callback list */
	registerOnGoToCallback : function (pFunc){
		this.fCallbacks.push(pFunc);
	},
	/* == setMainFraPath =========================================================
	 PUBLIC - Set the path to the initial iframe object.
	 pPath : path initial iframe */
	setMainFraPath : function (pPath){
		this.fMainFraPath = pPath;
	},
	/* == goTo ===================================================================
	 PUBLIC - Load the given url in a new iframe.
	 pUrl : url to load */
	goTo : function (pUrl){
		this.xLog("goTo: "+pUrl);
		if (!pUrl || pUrl.length==0) return;
		if (this.fCurFra.fNavStarted) return;
		this.fCurFra.fNavStarted = true;
		this.fNxtFra = this.xAddFra();
		for (var i=0; i<this.fCallbacks.length; i++){
			try{if (this.fCallbacks[i]) this.fCallbacks[i](pUrl);} catch (e){this.xLog("goTo error : "+e);}
		}
		this.fCallbacks = [];
		this.fNxtFra.src = pUrl;
		return false;
	},
	/* == reload =================================================================
	 PUBLIC - Reload the current url in a new iframe.
	 pUrl : url to load */
	reload : function (){
		this.goTo(this.fCurFra.src);
	},
	/* == parseLinks =============================================================
	 PUBLIC - Parse a given node taking control of all nav links in it's descendants.
	 pNode : node to parse */
	parseLinks : function (pNode){
		var vMgr = scServices.scPreload;
		for(var i=0; i<vMgr.fLnkPaths.length; i++) {
			var vLnks = scPaLib.findNodes(vMgr.fLnkPaths[i],pNode);
			for (var j=0; j<vLnks.length; j++) vMgr.xInitLnk(vLnks[j]);
		}
	},
	/* == sOnLoadPage ============================================================
	 PRIVATE - iframe onload callback.
	 this == iframe */
	sOnLoadPage : function (){
		try{
			if(scCoLib.isIE && this.readyState != "complete") return;
			scServices.scPreload.xInitPage(this);
		} catch(e){scServices.scPreload.xLog("ERROR error loading page: "+e)}
	},
	/* == xInitPage ==============================================================
	 PRIVATE - Init a new page, taking control of all nav links.
	 pFra : iframe */
	xInitPage : function (pFra){
		var vPgeDoc = pFra.contentWindow.document;
		scServices.scPreload.xLog("xInitPage: "+vPgeDoc.title);
		var vMgr = scServices.scPreload;
		if (vMgr.fNxtFra) {
			vMgr.fNxtFra.style.visibility="";
			vMgr.fCurFra.parentNode.removeChild(vMgr.fCurFra);
			vMgr.fCurFra = vMgr.fNxtFra;
			vMgr.fNxtFra = null;
			vMgr.fCurFra.id = vMgr.fFraId;
		}
		vMgr.parseLinks(vPgeDoc);
		var vSubScDynUiMgr = pFra.contentWindow.scDynUiMgr;
		if (vSubScDynUiMgr) vSubScDynUiMgr.subWindow.addOnLoadListener(vMgr.xInitPage);
	},
	/* == xInitLnk ===============================================================
	 PRIVATE - Init a nav link.
	 pLnk : link */
	xInitLnk : function (pLnk){
		if (pLnk.onclick) pLnk.funcOnclick = pLnk.onclick;
		pLnk.onclick = function() {try{if(this.funcOnclick) this.funcOnclick();}catch(e){} return scServices.scPreload.goTo(pLnk.href)};
	},
	/* == xAddFra ================================================================
	 PRIVATE - Add a new iframe. */
	xAddFra : function (){
		var vFra;
		var vDoc = this.fCurFra.contentWindow.document;
		if(scCoLib.isIE) {
			//BUG IE : impossible de masquer les bordures si on ajoute l'iframe via l'API DOM.
			var vFrmHolder = document.createElement("div");
			vDoc.body.appendChild(vFrmHolder);
			vFrmHolder.innerHTML = "<iframe scrolling='no' frameborder='0'></iframe>";
			vFra = vFrmHolder.firstChild;
			this.fRoot.appendChild(vFra);
			vDoc.body.removeChild(vFrmHolder);
		} else {
			vFra = vDoc.createElement("iframe");
			vFra.setAttribute("frameborder","0");
			this.fRoot.appendChild(vFra);
		}
		vFra.style.width = "100%";
		vFra.style.height = "100%";
		vFra.style.visible = "hidden";
		this.xInitFra(vFra);
		return vFra;
	},
	/* == xInitFra ===============================================================
	 PRIVATE - Init a new iframe.
	 pFra : iframe */
	xInitFra : function (pFra){
		if(scCoLib.isIE) pFra.onreadystatechange = scServices.scPreload.sOnLoadPage;
		else pFra.onload = scServices.scPreload.sOnLoadPage;
	},
	/* == xLog ===================================================================
	 PRIVATE - Log a message to console.
	 pStr : string */
	xLog : function(pStr){
			try{
				if (this.fDebug) console.log("scServices.scPreload: "+pStr);
			} catch(e){}
	},
	loadSortKey : "zscPreload"
}
