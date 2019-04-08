sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecCaracteristicaQualidade/services/Session"
], function(Controller, MessageBox, JSONModel, Session) {
	"use strict";

	return Controller.extend("br.com.idxtecCaracteristicaQualidade.controller.CaracteristicaQualidade", {
		onInit: function(){
			var oJSONModel = new JSONModel();
			
			this._operacao = null;
			this._sPath = null;

			this.getOwnerComponent().setModel(oJSONModel, "model");
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},
		
		onRefresh: function(){
			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
			this.getView().byId("tableCaracteristica").clearSelection();
		},
		
		onIncluir: function(){
			var oDialog = this._criarDialog();
			var oTable = this.byId("tableCaracteristica");
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oViewModel = this.getModel("view");
			
			oViewModel.setData({
				titulo: "Inserir Característica de Qualidade",
				msg: "Característica de Qualidade inserida com sucesso!",
				codigoEdit: true
			});
			
			this._operacao = "incluir";
			
			oDialog.setEscapeHandler(function(oPromise){
				if(oJSONModel.hasPendingChanges()){
					oJSONModel.resetChanges();
				}
			});
			
			var oNovoCaracteristica = {
				"Codigo": "",
				"Descricao": "",
				"NaoExibir": false,
				"Empresa" : Session.get("EMPRESA_ID"),
				"Usuario": Session.get("USUARIO_ID"),
				"EmpresaDetails": { __metadata: { uri: "/Empresas(" + Session.get("EMPRESA_ID") + ")"}},
				"UsuarioDetails": { __metadata: { uri: "/Usuarios(" + Session.get("USUARIO_ID") + ")"}}
			};
			
			oJSONModel.setData(oNovoCaracteristica);
			
			oTable.clearSelection();
			oDialog.open();
		},
		
		onEditar: function(){
			var oDialog = this._criarDialog();
			var oTable = this.byId("tableCaracteristica");
			var nIndex = oTable.getSelectedIndex();
			var oModel = this.getOwnerComponent().getModel();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oViewModel = this.getModel("view");
			
			oViewModel.setData({
				titulo: "Editar Característica de Qualidade",
				msg: "Característica de Qualidade alterada com sucesso!",
				codigoEdit: false
			});
			
			this._operacao = "editar";
			
			if(nIndex === -1){
				MessageBox.warning("Selecione uma característica de qualidade da tabela!");
				return;
			}
			
			var oContext = oTable.getContextByIndex(nIndex);
			this._sPath = oContext.sPath;
			
			oModel.read(oContext.sPath, {
				success: function(oData){
					oJSONModel.setData(oData);
				}
			});
			
			oTable.clearSelection();
			oDialog.open();
		},
		
		onRemover: function(){
			var that = this;
			var oTable = this.byId("tableCaracteristica");
			var nIndex = oTable.getSelectedIndex();
			
			if(nIndex === -1){
				MessageBox.warning("Selecione uma Característica de Qualidade da tabela!");
				return;
			}
			
			MessageBox.confirm("Deseja remover essa Característica de Qualidade?", {
				onClose: function(sResposta){
					if(sResposta === "OK"){
						MessageBox.success("Característica de Qualidade removida com sucesso!");
						that._remover(oTable, nIndex);
					} 
				}      
			});
		},
		
		_remover: function(oTable, nIndex){
			var oModel = this.getOwnerComponent().getModel();
			var oContext = oTable.getContextByIndex(nIndex);
			
			oModel.remove(oContext.sPath,{
				success: function(){
					oModel.refresh(true);
					oTable.clearSelection();
				}
			});
		},
		
		_criarDialog: function(){
			var oView = this.getView();
			var oDialog = this.byId("CaracteristicaQualidadeDialog");
			
			if(!oDialog){
				oDialog = sap.ui.xmlfragment(oView.getId(),
				"br.com.idxtecCaracteristicaQualidade.view.CaracteristicaQualidadeDialog", this);
				oView.addDependent(oDialog);
			}
			
			return oDialog;
		},
		
		onSaveDialog: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			if(this._operacao === "incluir"){
				this._createCaracteristica();
				this.getView().byId("CaracteristicaQualidadeDialog").close();
			} else if(this._operacao === "editar"){
				this._updateCaracteristica();
				this.getView().byId("CaracteristicaQualidadeDialog").close();
			} 
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			return oDados;
		},
		
		_createCaracteristica: function(){
			var oModel = this.getOwnerComponent().getModel();
	
			oModel.create("/CaracteristicaQualidades", this._getDados(), {
				success: function() {
					MessageBox.success("Característica de Qualidade inserida com sucesso!");
					oModel.refresh(true);
				}
			});
		},
		
		_updateCaracteristica: function(){
			var oModel = this.getOwnerComponent().getModel();
			
			oModel.update(this._sPath, this._getDados(), {
				success: function(){
					MessageBox.success("Característica de Qualidade alterada com sucesso!");
					oModel.refresh(true);
				}
			});
		},
		
		onCloseDialog: function(){
			var oModel = this.getOwnerComponent().getModel();
			
			if(oModel.hasPendingChanges()){
				oModel.resetChanges();
			} 
			this.byId("CaracteristicaQualidadeDialog").close();
		},
		
		_checarCampos: function(oView){
			if(oView.byId("codigo").getValue() === "" || oView.byId("descricao").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		getModel: function(sModel){
			return this.getOwnerComponent().getModel(sModel);
		}
	});
});