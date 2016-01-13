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
		var imgboxObject = null;
		
		function initialiseView() {
			console.log("initialiseImgboxForm()");
			//alert("initialiseImgboxForm()");

			// instantiate the editview
			// var editviewVC = iam.controller.editview.newInstance(topicid, eventDispatcher, crudops);

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","created|read|updated","imgbox"),function(event){
				alert("ImgboxFormViewController: got" + event.type + "event for imgbox:" + JSON.stringify(event.data));
				updateImgboxForm(event.data);
				imgboxObject = event.data;
				changeDeleteButton();
			});

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","deleted","imgbox"),function(event){
				alert("ImgboxFormViewController: got" + event.type + "event for imgbox:" + JSON.stringify(event.data));
				imgboxForm.title.value = "";
				imgboxForm.description.value = "";
				imgboxForm.src.value = "";
				imgboxForm._id.value = "";
				imgboxObject = null;
				changeDeleteButton();
			});

			imgboxForm.addEventListener("submit", function(event) {
				event.preventDefault();
				submitImgboxForm();
			});

			document.getElementById("imgboxFormDelete").addEventListener("click", function(event) {
				event.preventDefault();
				deleteImgbox(imgboxObject);
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

			imgboxForm.imgboxFormSubmit.disabled = false;
			}
		}


		function deleteImgbox(imgboxObj) {
			console.log("updateImgboxForm()");

			if (imgboxObj==null){
				alert("There is not imgbox in this topicview to delete!");
			}
			else {
				console.log("delete imgbox: " + JSON.stringify(imgboxObj));

				crudops.deleteImgbox(imgboxObj._id, function(deleted){
					console.log("got result for deleted imgbox: " + deleted);
					eventDispatcher.notifyListeners(iam.lib.eventhandling.customEvent("crud","deleted","imgbox",imgboxObj._id));
				});

				crudops.deleteImgboxRef(topicid, function(deleted){
					alert("got result for deleted imgboxRef: " + deleted);
				});
			}
		}

		function changeDeleteButton(){
			if(imgboxObject != null){
				document.getElementById("imgboxFormDelete").disabled = false;
			}
			else {
				document.getElementById("imgboxFormDelete").disabled = true;
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
				alert("submit: " + JSON.stringify(imgboxObj));

				if (imgboxObject == null){
					crudops.createImgbox(imgboxObj, function(created){
						alert("created: " + JSON.stringify(created));
						eventDispatcher.notifyListeners(iam.lib.eventhandling.customEvent("crud","created","imgbox", created));
					});
				} else {
					crudops.updateImgbox(imgboxObject._id, imgboxObj, function (updated){
						console.log("TopicviewViewController: imgbox updated: " + JSON.stringify(updated));
						eventDispatcher.notifyListeners(iam.lib.eventhandling.customEvent("crud","updated","imgbox",updated));
					});
				}
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
					if(imgboxObject == null) {
						crudops.createImgbox(JSON.parse(xhr.responseText).data, function (created) {
							eventDispatcher.notifyListeners(iam.lib.eventhandling.customEvent("crud", "created", "imgbox", created));
						});
					}
					else{
						crudops.updateImgbox(imgboxObject._id, JSON.parse(xhr.responseText).data, function (updated){
							console.log("imgbox updated: " + JSON.stringify(updated));
							eventDispatcher.notifyListeners(iam.lib.eventhandling.customEvent("crud","updated","imgbox",updated));
						});
					}
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
