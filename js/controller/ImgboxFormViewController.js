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

		var imgboxForm = document.forms["imgboxForm"];
		
		function initialiseView() {
			console.log("initialiseImgboxForm()");
			//alert("initialiseImgboxForm()");

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","created|read","imgbox"),function(event){
				alert("ImgboxFormViewController: got" + event.type + "event for imgbox:" + JSON.stringify(event.data));
				updateImgboxForm(event.data);
			});

			imgboxForm.addEventListener("submit", function(event) {
				event.preventDefault();
				submitImgboxForm();
			});
	
		}
		
		/*
		 * this function can be called from an event listener when a crud operation has been performed on some object element
		 */
		function updateImgboxForm(imgboxObj) {
			console.log("updateImgboxForm()");

			if (imgboxObj){
			imgboxForm.title.value = imgboxObj.title;
			imgboxForm.src.value = imgboxObj.src;
			imgboxForm._id.value = imgboxObj._id;

			imgboxForm.imgboxFormSubmit.disabled = true;
			}
		}


		/*
		 * this method can be used for implementing submission of object form content to the server
		 */
		function submitImgboxForm() {
			console.log("submitImgboxForm()");

			var imgboxObj = {title: imgboxForm.title.value, src: imgboxForm.src.value, description: "lorem ipsum dolor sit amet"};
			alert("submit: " + JSON.stringify(imgboxObj));

			crudops.createImgbox(imgboxObj, function(created){
				alert("created: " + JSON.stringify(created));
				eventDispatcher.notifyListeners(iam.lib.eventhandling.customEvent("crud","created","imgbox", created));
			});


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
