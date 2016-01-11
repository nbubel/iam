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

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","created|read|updated","imgbox"),function(event){
				alert("ImgboxFormViewController: got" + event.type + "event for imgbox:" + JSON.stringify(event.data));
				updateImgboxForm(event.data);
			});

			imgboxForm.addEventListener("submit", function(event) {
				event.preventDefault();
				submitImgboxForm();
			});

			/*
			 * function für Radiobuttonselection
			 */

			function radioButtonSelected(event) {
				//alert("event.target: " + event.target + "with id: " + event.target.id);
				if (event.target.id == "inputModeUrl"){
					imgboxForm.src.disabled = false;
					imgboxForm.upload.disabled = true;
				}
				else {
					imgboxForm.src.disabled = true;
					imgboxForm.upload.disabled = false;
				}
			}

			var radioButtons = imgboxForm.querySelectorAll("input[name='inputMode']");
			for (var i=0;i<radioButtons.length;i++) {
				radioButtons[i].onclick = radioButtonSelected;
			}
	
		}
		
		/*
		 * this function can be called from an event listener when a crud operation has been performed on some object element
		 */
		function updateImgboxForm(imgboxObj) {
			console.log("updateImgboxForm()");

			if (imgboxObj){
			imgboxForm.title.value = imgboxObj.title;
			imgboxForm.description.value = imgboxObj.description;
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

			var selectedOption = imgboxForm.querySelector("input[name='inputMode']:checked");
			if (selectedOption.id == "inputModeUrl"){

				var imgboxObj = {title: imgboxForm.title.value, src: imgboxForm.src.value, description: imgboxForm.description.value};
				//alert("submit: " + JSON.stringify(imgboxObj));

				crudops.createImgbox(imgboxObj, function(created){
					alert("created: " + JSON.stringify(created));
					eventDispatcher.notifyListeners(iam.lib.eventhandling.customEvent("crud","created","imgbox", created));
				});
			}
			else if ("inputModeUrl"){
				submitImgboxFormWithUpload();
			}
		}

		function submitImgboxFormWithUpload() {
			alert("submitImgboxFormWithUpload()!")

			var formData = new FormData();
			formData.append("title",imgboxForm.title.value);
			formData.append("description", imgboxForm.description.value);
			formData.append("src", imgboxForm.upload.files[0]);

			alert("created formdata: " + formData);

			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && xhr.status == 200){
					//alert("got response " + xhr.responseText);
					crudops.createImgbox(JSON.parse(xhr.responseText).data,function(created){
						eventDispatcher.notifyListeners(iam.lib.eventhandling.customEvent("crud","created","imgbox", created));
					});

				}
				else if (xhr.readyState == 4 && xhr.status == 500){
					alert("got error, check server Log!");
				}
			}

			xhr.open("POST","/http2mdb/imgboxs");
			xhr.send(formData);
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
