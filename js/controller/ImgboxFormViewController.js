/**********************************************************************************************
 *           control the form for displaying and edting object properties (FRM2+MFM2)
 **********************************************************************************************/
// extend the iam module
var iam = (function(iammodule) {

	console.log("loading ImgboxFormViewContoller as submodule controller.imgboxform of: " + iammodule);

	// create the controller submodule if it doesn't exist yet
	if (!iammodule.controller) {
		iammodule.controller = {};
	}

	function ImgboxFormViewController(_topicid, _eventDispatcher, _crudops) {

		var topicid = _topicid;
		var crudops = _crudops;
		var eventDispatcher = _eventDispatcher;
		
		function initialiseView() {
			console.log("initialiseImgboxForm()");
			//alert("initialiseImgboxForm()");

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","created","imgbox"),function(event){
				console.log("ImgboxFormViewController: got created event for imgbox:" + JSON.stringify(event.data));
			});
	
		}
		
		/*
		 * this function can be called from an event listener when a crud operation has been performed on some object element
		 */
		function updateImgboxForm(imgboxElement) {
			console.log("updateImgboxForm()");	
		}


		/*
		 * this method can be used for implementing submission of object form content to the server
		 */
		function submitImgboxForm() {
			console.log("submitImgboxForm()");

		}
		
		// at the end of construction, call the initialiseView function
		initialiseView.call(this);
		
	}

	function newInstance(topicid, eventDispatcher, crudops) {
		return new ImgboxFormViewController(topicid, eventDispatcher, crudops);
	}

	// export the module
	iammodule.controller.imgboxform = {
		newInstance : newInstance
	}

	return iammodule;

}(iam || {}));
