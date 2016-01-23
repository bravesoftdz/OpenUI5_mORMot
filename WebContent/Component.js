sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/m/routing/Router',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/json/JSONModel',
    'sap/ui/demo/mORMot/model/Config',
	'sap/ui/demo/mORMot/localService/RestModel/RestModel'
], function (UIComponent,
			Router,
			ResourceModel,
			JSONModel,
			mORMotModel) {

	return UIComponent.extend("sap.ui.demo.mORMot.Component", {
		
		metadata: {
            manifest: "json"
        },
		
		init: function () {
			// call overwritten init (calls createContent)
			UIComponent.prototype.init.apply(this, arguments);
			
			// set i18n model
			var oI18nModel = new ResourceModel({
				bundleName: "sap.ui.demo.mORMot.i18n.appTexts"
			});
			this.setModel(oI18nModel, "i18n");
			
			var mORMotRoot = "root";

			var oModel = new sap.ui.model.rest.RestModel(model.Config.getServiceUrl(mORMotRoot));
			
			oModel.setKey("ID");
			oModel.setmORMotRootResponse(true);
			
			oModel.attachRequestCompleted(function(data) {
				console.log("oModel.attachRequestCompleted");				
				 var model = data.getSource();
				 console.log(model);
			});
			
			// javascript mORMot client ... thanks to esmondb
			var mORMotClient = mORMot.Client.getInstance();
			function onlogin(success, data, statusText) {
				if (success) {
					sap.m.MessageToast.show("Login of " + data + " successfull");
					oModel.refresh();
				} else {
					if (data==400) {
						sap.m.MessageToast.show("Login not needed ... continuing !");
					} else {
						sap.m.MessageToast.show("Login failure due to : " + data + ", " + statusText);
					}
				}
			}
			mORMotClient.logIn(model.Config.getServiceUrl(), mORMotRoot, "User", "synopse", onlogin);
			oModel.mORMotClient = mORMotClient; 
			
			oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);			

			this.setModel(oModel);

			// set device model
			var oDeviceModel = new JSONModel({
				isTouch: sap.ui.Device.support.touch,
				isNoTouch: !sap.ui.Device.support.touch,
				isPhone: sap.ui.Device.system.phone,
				isNoPhone: !sap.ui.Device.system.phone,
				listMode: (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
				listItemType: (sap.ui.Device.system.phone) ? "Active" : "Inactive"
			});
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "device");

			this._router = this.getRouter();

			//navigate to initial page for !phone
			if (!sap.ui.Device.system.phone) {
				this._router.getTargets().display("welcome");
			}

			// initialize the router
			this._router.initialize();
		},

		createContent: function () {
			// create root view
			return sap.ui.view({
				viewName: "sap.ui.demo.mORMot.view.App",
				type: "XML"
			});
		}
	});

});
