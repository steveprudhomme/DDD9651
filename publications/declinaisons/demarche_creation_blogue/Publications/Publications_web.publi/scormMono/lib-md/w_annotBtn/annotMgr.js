/*
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
 * sylvain.spinelli@kelis.fr
 *
 * Portions created by the Initial Developer are Copyright (C) 2007-2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * samuel.monsarrat@kelis.fr
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
 
 var annotMgr = {
	fEditModeBtnPath : "ide:annotBtn/chi:a",
	fEditContainerId : "tplCo",
	onUpdate: function(pEvent){
		if (!pEvent) pEvent = window.event;
		var vValue = this.value
		annotMgr.fData[this.parentNode.parentNode.getAttribute("id")] = vValue;
		if( ! vValue) {
			if(annotMgr.fLastAchor && annotMgr.fLastAchor.fAnnot == this) {
				this.style.height = "";
				var vIdx = this.className.lastIndexOf(" annotFilled");
				if(vIdx>0) this.className = this.className.substring(0, vIdx);
			} else {
				annotMgr.deleteField(this);
			}
		}
		scServices.annotSvc.setAnnot(annotMgr.fIdPage, scServices.dataUtil.serialiseObjJs(annotMgr.fData));
	},
	onFocus: function(pEvent){
		if (!pEvent) pEvent = window.event;
		if(this.className.indexOf("annotFilled") < 0) this.className += " annotFilled";
		this.style.height = (annotMgr.getHeigth(this.value) + 55)+"px";
	},
	
	getHeigth: function(pText) {
		var vCarPerLine = 60; //TODO to compute
		var vLine = 1;
		var vLastOffset = -1;
		var vOffset = -1;
		while((vOffset = pText.indexOf("\n", vLastOffset+1)) >=0 ) {
			vLine = vLine + Math.max(1, (vOffset-vLastOffset-vCarPerLine)/vCarPerLine);
			vLastOffset = vOffset;
		}
		return vLine * 18;
	},
	fEditMode: false,
	toggleEditMode: function(pBtn) {
		if(pBtn.className=='annotBtnOn') {
			this.resetAnchor();
			this.fEditMode = false;
			pBtn.className='annotBtn';
			this.fEditContainer.onmouseover = null;
		} else {
			this.fEditMode = true;
			pBtn.className='annotBtnOn';
			this.fEditContainer.onmouseover = this.onMouseOver;
		}
	},
	
	onMouseOver: function(pEvent){
		if (!pEvent) pEvent = window.event;
		if (pEvent.target) {
			if (pEvent.target.nodeType != 1) pEvent.target = pEvent.target.parentNode;
		} else if (pEvent.srcElement) {
			pEvent.target = pEvent.srcElement;
		}
		var vNode = pEvent.target;
		if(vNode.className=="annotField") return;
		while(vNode && vNode != annotMgr.fEditContainer) {
			if(vNode.className.indexOf("annotAnchor")>=0) {
				if(annotMgr.fLastAchor != vNode) {
					annotMgr.resetAnchor();
					annotMgr.fLastAchor = vNode;
					vNode.onclick=annotMgr.onClickAnchor;
					vNode.className += " annotAnchorOn";
					if( ! vNode.fAnnot) annotMgr.addField(vNode);
				}
				return;
			}
			vNode = vNode.parentNode;
		}
		annotMgr.resetAnchor();
	},
	onClickAnchor: function(pEvent){
		if (!pEvent) pEvent = window.event;
		if(annotMgr.fLastAchor && annotMgr.fLastAchor.fAnnot) annotMgr.fLastAchor.fAnnot.focus();
	},
	
	resetAnchor: function(){
		if(this.fLastAchor) {
			this.fLastAchor.onclick = null;
			this.fLastAchor.className = this.fLastAchor.className.substring(0, this.fLastAchor.className.length - 14);
			var vField = this.fLastAchor.fAnnot;
			if(vField && ! vField.value) this.deleteField(vField);
			this.fLastAchor = null;
		}
	},
	
	addField: function (pParent, pValue) {
		var vAnnot = pParent.fAnnot = document.createElement("textarea");
		vAnnot.className = "annotField";
		var vFrm = document.createElement("span");
		vFrm.className = "annotFieldFrm";
		vFrm.appendChild(vAnnot);
		pParent.appendChild(vFrm);
		vAnnot.onblur = this.onUpdate;
		vAnnot.onfocus = this.onFocus;
		if(pValue) {
			vAnnot.value = pValue;
			vAnnot.style.height = this.getHeigth(pValue)+"px";
			vAnnot.className += " annotFilled";
		}
	},

	deleteField: function (pField) {
		var vCt = pField.parentNode.parentNode;
		vCt.removeChild(pField.parentNode);
		vCt.fAnnot = null;
	},

	onLoad: function(){
		var vBtn = scPaLib.findNode(this.fEditModeBtnPath);
		if(scServices.annotSvc.isActive()) {
			this.fEditContainer = sc$(this.fEditContainerId);
			vBtn.className = "annotBtn";
			this.fIdPage = scServices.scLoad.getUrlFromRoot(window.location.href);
			try {
				this.fData = scServices.dataUtil.deserialiseObjJs(scServices.annotSvc.getAnnot(this.fIdPage));
			} catch(e){
				this.fData = {};
			}
		
			for(var vId in this.fData) {
				var vNode = sc$(vId);
				if(vNode) this.addField(vNode, this.fData[vId]);
			}
		}
	},
	loadSortKey: "3annotMgr"
}

scOnLoads[scOnLoads.length] = annotMgr;
