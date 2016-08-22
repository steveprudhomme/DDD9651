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
 * Portions created by the Initial Developer are Copyright (C) 2006-2013
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * samuel.monsarrat@kelis.fr
 *
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
 
 /** API

### Module d'annotation actif ou pas.
isActive()

### Valeur des annotations
setAnnot(pId, pAnnot)
getAnnot(pId)

hasAnnot(pId)

*/

//Instanciation du service
scServices.annotSvc = scOnLoads[scOnLoads.length] = {
	_isActive : false,
	isActive : function(){return this._isActive},
	onLoad: function(){
		if(scServices.scorm2k4 && scServices.scorm2k4.isScorm2k4Active()) {
			this._isActive = true;
			var vApi = scServices.scorm2k4.getScorm2k4API();
			var vCount = vApi.GetValue("cmi.comments_from_learner._count");
			this._annotMap = {};
			for(var i = 0; i < vCount; i++) this._annotMap[vApi.GetValue("cmi.comments_from_learner."+i+".location")] = i;
			this.getAnnot = function(pId){
				var vApi = scServices.scorm2k4.getScorm2k4API();
				if(pId in this._annotMap) return vApi.GetValue("cmi.comments_from_learner."+this._annotMap[pId]+".comment");
				return null;
			};
			this.setAnnot = function(pId, pAnnot){
				var vApi = scServices.scorm2k4.getScorm2k4API();
				if(pId in this._annotMap) {
					vApi.SetValue("cmi.comments_from_learner."+this._annotMap[pId]+".comment", pAnnot);
					//vApi.Commit(""); commit déporté de façon plus globale
				} else {
					var vIdx = vApi.GetValue("cmi.comments_from_learner._count");
					vApi.SetValue("cmi.comments_from_learner."+vIdx+".location", pId);
					vApi.SetValue("cmi.comments_from_learner."+vIdx+".comment", pAnnot);
					this._annotMap[pId] = vIdx;
					//vApi.Commit(""); commit déporté de façon plus globale
				}
			};
			this.hasAnnot = function(pId){if (pId in this._annotMap) return true;return false;};
		} else if(scServices.storage && scServices.storage.isStorageActive()) {
			this._isActive = true;
			this.getAnnot = function(pId){
				var vItem = scServices.storage.getStorage().getItem(scServices.storage.getRootKey()+"annot/"+pId);
				return vItem ? vItem : null;
			};
			this.setAnnot = function(pId, pAnnot){
				scServices.storage.getStorage().setItem(scServices.storage.getRootKey()+"annot/"+pId, pAnnot);
			};
			this.hasAnnot = function(pId){if (pId in this._annot) return true;return false;};
		} else {
			//Pour tests : mettre this._isActive = true;
			this._isActive = false;
			this._annot = {};
			this.getAnnot = function(pId){return this._annot[pId] || null;};
			this.setAnnot = function(pId, pAnnot){this._annot[pId] = pAnnot;};
			this.hasAnnot = function(pId){if (pId in this._annot) return true;return false;};
		}
	},
	loadSortKey: "2annotSvc"
};
