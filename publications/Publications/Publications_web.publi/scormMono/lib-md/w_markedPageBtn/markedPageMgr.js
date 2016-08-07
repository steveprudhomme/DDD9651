/* === Opale template manager =============================================== */
var markedPageMgr = {
	
/* === Public API =========================================================== */
	/** init function */
	init : function(pFraPath, pCoPath){
		try {
			this.fCurrentUrl = window.location.href;
			// Mise en place du statut de page vue si le svc markedPages est présent, les templates page qui possède la classe tplPge (on exclut donc la page de début, les subwindow, ...)
			if(scServices.markedPages && scPaLib.findNode("des:.tplPge")){
				if(!scPaLib.findNode("des:.assmntUaContent") && !scPaLib.findNode("des:.mainContent").className.match('folderPage')){
					// Affectation du statut "vu", sauf pour l'activité d'évaluation pour laquelle c'est affecté une fois le test terminé
					this.addPageMarkedStatus(this.fCurrentUrl, true);
				}
				this.initPagesSeen();
			}
		} catch(e) {
			alert("L'initialisation de la page a échouée : "+e);
		}
	},
	/** status "view" des pages **/
	/* Change l'état du noeud id (et de ses fils si pDisableMarkSub!=true)
	 * @param pPageId */
	toggleMarkPageId: function(pPageId, pDisableMarkSub) {
		var vIsSeen = scServices.markedPages.togglePageMarkedId(pPageId);
		if(!pDisableMarkSub){
			// On marque également les pages filles
			// @pParentNode : div
			function fMarkChildren(pOutlineNode, vIsSeen){
				if(pOutlineNode){
					if(pOutlineNode.children){
						for (var i=0; i < pOutlineNode.children.length; i++){
							var vChi = pOutlineNode.children[i];
							markedPageMgr.addPageMarkedStatus(vChi.url, vIsSeen, true);
							var vSubPageId = scServices.markedPages.getIdFromUrl(vChi.url);
							fMarkChildren(vChi, vIsSeen);
						}
					}
				}
			}
			var vMenuNode = $(pPageId);
			if(vMenuNode) fMarkChildren(markedPageMgr.xGetOutlineNode(vMenuNode.parentNode.id), vIsSeen);
		}
		this.xRefreshPageSeenStatusUi(pPageId, vIsSeen);
		return vIsSeen;
	},
	toggleMarkCurrentPage: function(pDisableMarkSub) {
		var vPageId = scServices.markedPages.getIdFromUrl(this.fCurrentUrl);
		// refresh du statut des ascendants
		return this.toggleMarkPageId(vPageId, pDisableMarkSub);
	},
	xGetOutlineNode: function(pHref){
		if(!outMgr.fOutline) outMgr.xInitOutline();
		if(outMgr.fOutline){
			function fExploreChildren(pParentNode){
				if(pParentNode.children){
					for (var i=0; i < pParentNode.children.length; i++){
						var vChi = pParentNode.children[i];
						if(vChi.url && vChi.url.match("/"+pHref)) 
							return vChi;
						else{
							var vFindNode = fExploreChildren(vChi);
							if(vFindNode) return vFindNode;
						}
					}
				}
			}
			return fExploreChildren(outMgr.fOutline);
		}
	},
	/* Refresh l'arbre en affectant la class "seen" aux entrées parcourues */
	initPagesSeen : function() {
		// Refresh des pages vues
		var vPages = scServices.markedPages.getPagesMarked();
		for(var vId in vPages) {
			this.xRefreshPageSeenStatusUi(vId, true);
		}
		// Refresh de la page courante
		var vCurrentPageId = scServices.markedPages.getIdFromUrl(this.fCurrentUrl);
		this.xRefreshPageSeenStatusUi(vCurrentPageId, scServices.markedPages.isPageMarkedId(vCurrentPageId));
	},
	// pNode : li
	refreshPagesSeenOnBranch : function(pNode) {
		var vAncLi = scPaLib.findNode("anc:li.mnu_b",pNode);
		var vAncDiv= scPaLib.findNode("anc:div",pNode);
		
		// S'il existe et non déja affecté on crée un tableau contenant les frères du li courant
		if(vAncLi) var vBroLis = scPaLib.findNodes("psi:li",pNode).concat(scPaLib.findNodes("nsi:li",pNode)).concat(pNode);
		// Si ce tableau existe
		if(vBroLis) {
			// On lance un compteur
			var vCounter = 0;
			// Pour chaque fils, on regarde s'il a la classe Seen, si oui on monte le compteur
			for(var i=0;i<vBroLis.length;i++) if(vBroLis[i].className.match("seen")) vCounter++;
			// Si le compteur est égale au nombre de frères, c'est qu'ils ont tous été vu
			var vHasSetNewStatus = false;
			var  vAnCliId = scPaLib.findNode("des:span.viewBtn",vAncLi).id;
			if(vBroLis.length == vCounter && !vAncLi.className.match("seen")) {
				scServices.markedPages.addPageMarkedId(vAnCliId);
				this.xRefreshPageSeenStatusUi(vAnCliId, true);
				vHasSetNewStatus = true;
			}else if(vBroLis.length != vCounter && vAncLi.className.match("seen")){
				scServices.markedPages.addPageMarkedId(vAnCliId);
				this.xRefreshPageSeenStatusUi(vAnCliId, false);
				vHasSetNewStatus = true;
			}
			if(vHasSetNewStatus){
				// On maj les ascendants (sauf ous ie9- pour contourner bug)
				if(scCoLib.isIE && parseFloat(scCoLib.userAgent.substring(scCoLib.userAgent.indexOf("msie")+5)) < 9) return;
				else this.refreshPagesSeenOnBranch(vAncLi);
			}
		}
	},
	/* Affecte les statuts "seen" à une url donnée : ui + markedPages */
	addPageMarkedStatus : function(pUrl, pIsSeen, pNotRefreshAncestors) {
		if(scServices.markedPages){
			pIsSeen ? scServices.markedPages.addPageMarked(pUrl) : scServices.markedPages.removePageMarked(pUrl);
			var  vPageId = scServices.markedPages.getIdFromUrl(pUrl);
			if(vPageId) this.xRefreshPageSeenStatusUi(vPageId, pIsSeen, pNotRefreshAncestors);
		}
	},
	xRefreshPageSeenStatusUi : function(pPageId, pIsSeen, pNotRefreshAncestors) {
		// - outline
		var vNode = $(pPageId);
		if(vNode) {
			var vLi = vNode.parentNode.parentNode;
			if(pIsSeen && !vLi.className.match("seen")){
				vLi.className += " seen";
				if(!pNotRefreshAncestors) this.refreshPagesSeenOnBranch(vLi);
			}else if(!pIsSeen && vLi.className.match("seen")){
				this.xRemoveClass(vLi, "seen");
				if(!pNotRefreshAncestors) this.refreshPagesSeenOnBranch(vLi);
			}
		}
		// - toogleBtn
		var vCurrentPageId = scServices.markedPages.getIdFromUrl(this.fCurrentUrl);
		if(pPageId == vCurrentPageId){
			var vToogleBtn = $('markedPageBtn');
			if(vToogleBtn){
				vToogleBtn.className= pIsSeen ? 'markedPageBtnOn' : 'markedPageBtn';
			}
		}
	},
	
	/** xRemoveClass - supprime a class name. */
	xRemoveClass : function(pNode, pClass) {
		var vTab = pNode.className.split(" ");
		var vClass = "";
		for (var i = 0; i < vTab.length; i++) {
			if (vTab[i] != pClass && vTab[i] != "")
				vClass += " " + vTab[i];
		}
		pNode.className = vClass;
	}
}