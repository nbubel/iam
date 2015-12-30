/**********************************************************************************************
 *             control the objectlist view (FRM3+MFM3)
 **********************************************************************************************/
// extend the iam module
var iam = (function(iammodule) {

	console.log("loading ImgboxlistViewContoller as submodule controller.imgboxlist of: " + iammodule);

	// create the controller submodule if it doesn't exist yet
	if (!iammodule.controller) {
		iammodule.controller = {};
	}

	function ImgboxlistViewController(_topicid, _eventDispatcher, _crudops) {

		var topicid = _topicid;
		var crudops = _crudops;
		var eventDispatcher = _eventDispatcher;
		
		function initialiseView() {
			console.log("initialiseImgboxlist()");
			//alert("initialiseImgboxlist()");

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","created","imgbox"), function (event){
				alert("imgbox created: " + JSON.stringify(event));
				showImgbox(event.data);
			});

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","deleted","imgbox"), function (event){
				alert("imgbox deleted: " + JSON.stringify(event));
				removeImgbox(event.data);
			});

			function showImgbox (imgboxObj) {
				var imgboxlistRoot = document.querySelector("#imgboxlistTab .scrollview");

				var imgel = document.createElement("img");
				imgel.id = imgboxObj._id;
				imgel.src = imgboxObj.src;

				imgboxlistRoot.appendChild(imgel);
			}
		}

		function removeImgbox(imgboxid){

			var imgel = document.getElementById(imgboxid);
			imgel.parentNode.removeChild(imgel);
		}
		
		initialiseView.call(this);
	}

	function newInstance(topicid, eventDispatcher, crudops) {
		// we combine instance creation with calling the initialise function
		return new ImgboxlistViewController(topicid, eventDispatcher, crudops);
	}

	// export the module
	iammodule.controller.imgboxlist = {
		newInstance : newInstance
	}

	return iammodule;

}(iam || {}));
