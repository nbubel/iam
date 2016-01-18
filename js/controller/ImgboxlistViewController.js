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
		var imgboxObjs = null;
		
		function initialiseView() {
			console.log("initialiseImgboxlist()");
			//alert("initialiseImgboxlist()");

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","readall","imgbox"), function (event){

				imgboxObjs = event;

				//alert("imgbox created: " + JSON.stringify(event));
				//showImgbox(event.data);

				alert("IMAGEBOXLIST: read " + event.data.length + " all imgboxes: " + JSON.stringify(event.data));

				var countImgboxes = 0;

				var imgboxObj = null;
				for(var i=0; i<event.data.length;i++){
					imgboxObj = event.data[i];
					countImgboxes++;
					showImgbox(imgboxObj);

				}

				alert("Get " + countImgboxes + " imagesboxes in imgboxList!")

			});

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","choose","formview"), function (event){

				var imgboxlistRoot = document.getElementById("imgboxListTable");
				while (imgboxlistRoot.firstChild) {
					imgboxlistRoot.removeChild(imgboxlistRoot.firstChild);
				}

				alert("IMAGEBOXLIST: read " + imgboxObjs.data.length + " all imgboxes: " + JSON.stringify(imgboxObjs.data));

				var countImgboxes = 0;

				var imgboxObj = null;
				for(var i=0; i<imgboxObjs.data.length;i++){
					imgboxObj = imgboxObjs.data[i];
					countImgboxes++;
					showImgbox(imgboxObj);

				}

				alert("Get " + countImgboxes + " imagesboxes in imgboxList!")

			});

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","deleted","imgbox"), function (event){
				alert("imgbox deleted: " + JSON.stringify(event.data));
				alert("DOM: remove id:" + JSON.stringify(event.data));
				removeImgbox(event.data);
			});

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","created","imgbox"), function (event){
				alert("imgbox created: " + JSON.stringify(event));
				alert("DOM: create to List imgbox" + JSON.stringify(event.data));
				showImgbox(event.data);
			});

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","updated","imgbox"), function (event){
				alert("imgbox created: " + JSON.stringify(event));
				alert("DOM: create to List imgbox" + JSON.stringify(event.data));
				removeImgbox(event.data._id);
				showImgbox(event.data);
			});

			eventDispatcher.addEventListener(iam.lib.eventhandling.customEvent("crud","choose","imgboxlist"),function(event){

				alert("ImgboxListView choose Imgboxlist: got" + event.type + "event for imgbox:" + JSON.stringify(event.data));
				var imgboxlistRoot = document.getElementById("imgboxListTable");
				while (imgboxlistRoot.firstChild) {
					imgboxlistRoot.removeChild(imgboxlistRoot.firstChild);
				}

				alert("IMAGEBOXLIST: read " + event.data.length + " all imgboxes: " + JSON.stringify(event.data));

				var countImgboxes = 0;

				var imgboxObj = null;
				for(var i=0; i<event.data.length;i++){
					imgboxObj = event.data[i];
					countImgboxes++;
					showImgboxRadioboxs(imgboxObj, countImgboxes);

				}

				alert("Get " + countImgboxes + " imagesboxes in imgboxList!")

			});


			crudops.readAllImgboxs(function(imgboxObjs) {
				// check whether some topicview already exists
				if (imgboxObjs) {
					eventDispatcher.notifyListeners(iam.lib.eventhandling.customEvent("crud", "readall", "imgbox", imgboxObjs));
				} else {
					alert("No Imageboxs were found!")
				}
			});


			function showImgbox (imgboxObj) {
				var imgboxlistRoot = document.getElementById("imgboxListTable");
				var row = imgboxlistRoot.insertRow(0);
				var descriptionCell = row.insertCell(0);
				var titleCell = row.insertCell(0);
				var imgboxCell = row.insertCell(0);

				var imgel = document.createElement("img");
				imgel.id = imgboxObj._id;
				imgel.src = imgboxObj.src;

				imgboxCell.appendChild(imgel);
				titleCell.innerHTML = imgboxObj.title;
				descriptionCell.innerHTML = imgboxObj.description;
			}

			function showImgboxRadioboxs (imgboxObj, boxnr) {
				var imgboxlistRoot = document.getElementById("imgboxListTable");
				var row = imgboxlistRoot.insertRow(0);
				var descriptionCell = row.insertCell(0);
				var titleCell = row.insertCell(0);
				var imgboxCell = row.insertCell(0);
				var imgboxradiobutton = row.insertCell(0);

				var imgel = document.createElement("img");
				imgel.id = "img_"+ boxnr;
				imgel.src = imgboxObj.src;

				imgboxCell.appendChild(imgel);
				titleCell.innerHTML = imgboxObj.title;
				descriptionCell.innerHTML = imgboxObj.description;

				var radioboxString = "<input type='radio' name='imgbox' id='"+ imgboxObj._id + "' />" +
					"\u003clabel for='" + imgboxObj._id + "'>Bild " + boxnr +"\u003c/label>";

				var radiobutton = document.createElement("div");
				//radiobutton.setAttribute("id", "img_"+ boxnr);
				radiobutton.innerHTML = radioboxString;
				imgboxradiobutton.appendChild(radiobutton);

				var radioButtons = imgboxlistRoot.querySelectorAll("input[name='imgbox']");
				for (var i=0;i<radioButtons.length;i++) {
					radioButtons[i].onclick = radioButtonSelected;
				}
			}
		}

		function removeImgbox(imgboxid){

			if(imgboxid){
				var imgel = document.getElementById(imgboxid);
				var index = imgel.parentNode.parentNode.rowIndex;
				document.getElementById("imgboxListTable").deleteRow(index);
				//imgel.parentNode.removeChild(imgel);
			}
			else{
				alert("Listview: keine imgboxID zum löschen übergeben worden.")
			}
		}

		/*
		 * function für Radiobuttonselection
		 */

		function radioButtonSelected(event) {
			alert("event.target: " + event.target + "with id: " + event.target.id);

			//var selectedOption = document.querySelector("input[name='imgbox']:checked");
			var imgboxid = event.target.id;//selectedOption.class;

			alert("with id: " + imgboxid);

			eventDispatcher.notifyListeners(iam.lib.eventhandling.customEvent("crud","choose","formview",imgboxid));


			//eventDispatcher.notifyListeners(iam.lib.eventhandling.customEvent("crud","choose","formview",event.target.id));

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
