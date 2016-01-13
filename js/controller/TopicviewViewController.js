/**
 * @author Jörn Kreutel
 */

// extend the iam module
var iam = (function(iammodule) {

	console.log("loading TopicviewViewContoller as submodule controller.topicview of: " + iammodule);

	// create the controller submodule if it doesn't exist yet
	if (!iammodule.controller) {
		iammodule.controller = {};
	}

	for (var mod in iammodule) {
		console.log("found submodule: iam." + mod);
	}

	function TopicviewViewController() {

		/*
		 * the event handling module
		 */
		var eventhandling = iam.lib.eventhandling;

		/**
		 * @author Jörn Kreutel
		 */
		// we read out the topicid from the arguments that had been passed when opening this view
		var topicid;

		// we also read out the title element from the dom, which will be accessed from several methods
		var titleel;

		// the two actionbar parts
		var actionbarTitle;
		var actionbarObject;

		// we add a topicview variable that holds a topicview element description from the server if one exists
		var topicviewObj;

		// this variable will keep the object that wraps the CRUD operations
		var crudops;

		/*
		 * we use an event dispatcher that will be passed to all other view controllers as communication channel
		 */
		var eventDispatcher = eventhandling.newEventDispatcher();

		/*
		 * here, we will store the implementation components of the cruod operations, which can be assigned dynamically
		 */
		var crudopsImpls;

		var imgboxObj;

		/*
		 * this is tun
		 */
		function initialiseView() {
			topicid = iam.lib.navigation.getViewargs().topicid;
			console.log("topicid is: " + topicid);

			// instantiate the variables that bind the ui elements
			titleel = document.getElementById("topicTitle");
			console.log("determined title element: " + titleel);
			actionbarTitle = document.getElementById("actionbarTitle");
			actionbarObject = document.getElementById("actionbarObject");

			// we instantiate the components for the crud operations and set the remote crudops as the ones to be used - this prepares the LDS exercise where crudops shall be switched
			crudopsImpls = {
				local : iam.crud.local.newInstance(topicid),
				synced : iam.crud.synced.newInstance(topicid),
				remote : iam.crud.remote.newInstance(topicid)
			};

			crudops = getCrudopsImpl();

			// prepare switching the implementation
			prepareCrudopsImplSwitch();

			// instantiate the editview
			var editviewVC = iam.controller.editview.newInstance(topicid, eventDispatcher, crudops);

			/*
			 *  instantiate the event handlers that react to crud events: CRUD for topicview
			 */
			eventDispatcher.addEventListener(eventhandling.customEvent("crud", "read|created|updated", "topicview"), function(event) {
				// we update our local representation of the object
				if (event.type == "updated") {
					topicviewObj.title = event.data.title;
				} else {
					topicviewObj = event.data;
				}
				// and we trigger the visualisation of it
				updateTitleView.call(this);
			}.bind(this));

			eventDispatcher.addEventListener(eventhandling.customEvent("crud", "read", "topicview"), function(event) {
				alert("read topicview: " + JSON.stringify(event.data));

				// try to find imgbox reference
				var imgboxid = null;
				for(var i=0; i<event.data.contentItems.length;i++){
					if (event.data.contentItems[i].type == "imgbox"){
						imgboxid = event.data.contentItems[i].imgboxid;
						break;
					}
				}

				if (imgboxid){
					alert("found imgebox: " + imgboxid);
					crudops.readImgbox(imgboxid,function(imgboxObj){
						alert("read imgbox: " + JSON.stringify(imgboxObj));
						eventDispatcher.notifyListeners(iam.lib.eventhandling.customEvent("crud","read","imgbox",imgboxObj));
					});
				}
				else {
					alert("no imgbox exists for topicview!");
				}

			}.bind(this));


			eventDispatcher.addEventListener(eventhandling.customEvent("crud", "deleted", "topicview"), function(event) {
				// we update our local representation of the object
				topicviewObj = null;
				// and we trigger the visualisation of it
				updateTitleView.call(this);
			}.bind(this));

			/*
			 * event handler that reacts to creation of an einfuehrungstext element
			 */
			eventDispatcher.addEventListener(eventhandling.customEvent("crud", "uploaded|created", "einfuehrungstext"), function(event) {
				createEinfuehrungstext.call(this, event.data);
			}.bind(this));


			/*
			 * event handler for imgbox
			 */

			eventDispatcher.addEventListener(eventhandling.customEvent("crud","created|read","imgbox"), function(event){
				//alert("got created event for imgbox: " + JSON.stringify(event));
				imgboxObj = event.data;
				showImgbox(imgboxObj);
			});

			eventDispatcher.addEventListener(eventhandling.customEvent("crud","updated","imgbox"), function(event){
				removeImgbox();
				imgboxObj = event.data;
				alert("AFTER UPDATE: imgbox data: "+ JSON.stringify(event.data));
				showImgbox(imgboxObj);
			});

			eventDispatcher.addEventListener(eventhandling.customEvent("crud","deleted","imgbox"), function(event){
				removeImgbox();
				imgboxObj = null;
			});

			// initialise the crud operations and try to read out a topicview object
			crudops.initialise( function() {

				crudops.readTopicview(topicid, function(_topicviewObj) {
					// check whether some topicview already exists
					if (_topicviewObj) {
						eventDispatcher.notifyListeners(eventhandling.customEvent("crud", "read", "topicview", _topicviewObj));
					} else {
						this.createTopicview();
					}
				}.bind(this));
			}.bind(this));

		}

		/*
		 * this function updates the display of the title heading
		 */
		function updateTitleView() {
			if (topicviewObj) {
				// we update the title element
				titleel.innerHTML = topicviewObj.title;
			} else {
				titleel.innerHTML = "Lorem Ipsum";
			}
		}

		function showImgbox(imgboxObj){

			var section = document.createElement("section");
			section.id = "imgbox";

			var ahead = document.createElement("a");
			ahead.setAttribute("onclick", "alert('" + imgboxObj.description + "')");
			ahead.href = "#";
			var title = document.createElement("h2");
			title.innerHTML = "" + imgboxObj.title;
			ahead.appendChild(title);


			var imgel = document.createElement("img");
			imgel.src = imgboxObj.src;


			imgel.onclick = function(event){
				event.stopPropagation();
				var videoel = document.createElement("video");
				videoel.src = "/content/mov/video.ogv";
				videoel.controls = true;
				videoel.autoplay = true;

				document.getElementById("leftColumn").appendChild(videoel);
				document.getElementById("mainview").classList.add("videoview");
			}
			document.getElementById("leftColumn").appendChild(section);
			document.getElementById("imgbox").appendChild(ahead);
			document.getElementById("imgbox").appendChild(imgel);

			document.getElementById("navigationButton").onclick = function(event) {
				event.stopPropagation();
				document.getElementById("mainview").classList.remove("videoview");
				document.getElementById("leftColumn").removeChild(document.getElementsByTagName("video")[0]);
				return false;
			}
		}


		function removeImgbox(){
			var imgboxel = document.getElementById("imgbox");
			imgboxel.parentNode.removeChild(imgboxel);
		}

		/*********************************************************************************
		 * NJM: these are the actions that will be invoked from the action bar of the gui
		 *********************************************************************************/
		this.toggleActionbar = function() {
			actionbarTitle.classList.toggle("hidden");
			actionbarObject.classList.toggle("hidden");
		}

		this.createTopicview = function() {
			// check whether we have a topicviewObj
			if (topicviewObj) {
				alert("createTopicview action is blocked! topicview already exists for " + topicid);
			} else {
				// we create a simple topicview object with an empty contentItems array
				crudops.createTopicview({
					topicid : topicid,
					title : topicid.replace(/_/g, " "),
					contentItems : []
				}, function(_topicviewObj) {
					// notify listeners for the given event
					eventDispatcher.notifyListeners(eventhandling.customEvent("crud", "created", "topicview", _topicviewObj));
				}.bind(this));
			}
		}

		this.updateTopicview = function() {
			// here we toggle insertion of "_" vs. " " in the title text
			var title = titleel.innerHTML;
			console.log("title is: " + title);
			if (title.indexOf("_") != -1) {
				title = title.replace(/_/g, " ");
			} else {
				title = title.replace(/ /g, "_");
			}

			// if update is successful the callback will be passed the updated attributs, which are actually the ones we put in
			crudops.updateTopicview(topicid, {
				title : title
			}, function(update) {
				eventDispatcher.notifyListeners(eventhandling.customEvent("crud", "updated", "topicview", update));
			}.bind(this));

		}

		this.deleteTopicview = function() {
			crudops.deleteTopicview(topicid, function(deleted) {
				if (deleted) {
					eventDispatcher.notifyListeners(eventhandling.customEvent("crud", "deleted", "topicview"));
				}
			}.bind(this));
		}
		/*
		 * NJM: these functions need to be implemented for the njm exercises
		 */
		this.createImgbox = function() {
			console.log("createImgbox()");

			if (imgboxObj != null) {
				alert("createImgbox action is blocked! imgbox already exists for " + topicid);
			}
			else {
				var imgbox = {title: "lorem ipsum", description: "solor sit amet", src: "http://lorempixel.com/300/200"};

				crudops.createImgbox(imgbox, function (created){
					console.log("TopicviewViewController: imgbox created: " + JSON.stringify(created));
					eventDispatcher.notifyListeners(eventhandling.customEvent("crud","created","imgbox",created));
				});
			}
		}

		this.updateImgbox = function() {
			console.log("updateImgbox()");

			if(imgboxObj == null){
				alert("updateImgbox action is blocked! No image was found in topic: " + topicviewObj.title);
			}
			else {
				if (imgboxObj.title == "updated"){
					var newimgbox = { title: topicviewObj.title, description: topicviewObj.title + " description", src: "http://lorempixel.com/300/200"};
				}
				else {
					var newimgbox = { title: "updated", description: "updated image description", src: "http://lorempixel.com/300/300"};
				}

				alert("update images with: imgboxObj.id=" + imgboxObj._id + " newimgbox=" + JSON.stringify(newimgbox) + "!");

				crudops.updateImgbox(imgboxObj._id, newimgbox, function (updated){
					console.log("TopicviewViewController: imgbox updated: " + JSON.stringify(updated));
					eventDispatcher.notifyListeners(eventhandling.customEvent("crud","updated","imgbox",updated));
				});
			}
		}

		this.deleteImgbox = function() {
			console.log("deleteImgbox()");

			if (imgboxObj==null){
				alert("There is not imgbox in this topicview to delete!");
			}
			else {
				console.log("delete imgbox: " + JSON.stringify(imgboxObj));

				crudops.deleteImgbox(imgboxObj._id, function(deleted){
					console.log("got result for deleted imgbox: " + deleted);
					eventDispatcher.notifyListeners(eventhandling.customEvent("crud","deleted","imgbox",imgboxObj._id));
				});

				crudops.deleteImgboxRef(topicid, function(deleted){
					alert("got result for deleted imgboxRef: " + deleted);
				});
			}
		}
		/*
		 * NJM etc.: this is a helper function that checks whether the contentItems array of topicviewObj contains a reference to an imgbox. If a reference is found, the imgboxid is returned.
		 *
		 * as an alternative to returning the imgboxid, this function may be modified for receiving a callback function that will be passed the imgboxid
		 */
		this.getImgboxIdForTopicview = function() {
			console.log("getImgboxIdForTopicview(): " + topicviewObj);
			var imgboxid = null;

			for (var i = 0; i < topicviewObj.contentItems.length; i++) {
				var currentItem = topicviewObj.contentItems[i];
				if (currentItem.type == "imgbox") {
					imgboxid = currentItem.imgboxid;
					break;
				}
			}

			console.log("getImgboxIdForTopicview(): found imgboxid: " + imgboxid);

			return imgboxid;
		}
		/****************************************************************************************
		 * the following functions deal with switching the implementation of the crud operations
		 ****************************************************************************************/
		function prepareCrudopsImplSwitch() {
			// instantiate the switchImplButton
			var switchImplButton = document.getElementById("switchImplButton");
			switchImplButton.textContent = getCrudopsImplName();
			switchImplButton.onclick = function(event) {
				event.stopPropagation();
				switchCrudopsImpl();
				window.location.reload();
			}
		}

		function getCrudopsImplName() {
			var implname = localStorage.getItem("crudopsImpl");
			if (!implname) {
				implname = "remote";
				localStorage.setItem("crudopsImpl", "remote");
			}

			return implname;
		}

		function getCrudopsImpl() {
			var implname = getCrudopsImplName();
			console.log("using crudopsImpl: " + implname);
			var implobj = crudopsImpls[implname];

			return implobj;
		}

		function switchCrudopsImpl() {
			var impls = ["remote", "local", "synced"];
			var currentImplname = getCrudopsImplName();
			var pos = impls.indexOf(currentImplname);
			if (pos < (impls.length - 1)) {
				nextimplname = impls[pos + 1];
			} else {
				nextimplname = impls[0];
			}
			localStorage.setItem("crudopsImpl", nextimplname);
		}

		/*********************************************************************************
		 * MFM: these functions are used for displaying the einfuehrungstext element
		 *********************************************************************************/
		function createEinfuehrungstext(contentItem) {
			console.log("createEinfuehrungstext()");

			// we determine to which column the element shall be added
			var column = document.getElementById(contentItem.renderContainer + "Column");

			// then we create the element dynamically
			var section = document.createElement("section");
			section.id = "einfuehrungstext";
			var div1 = document.createElement("div");
			div1.classList.add("contentfragment");
			section.appendChild(div1);
			var div2 = document.createElement("div");
			div2.classList.add("fullcontentLink");
			section.appendChild(div2);
			var a = document.createElement("a");
			div2.appendChild(a);
			a.href = "#";
			a.appendChild(document.createTextNode("weiter lesen"));
			// append the section to the column
			column.appendChild(section);

			// check whether we have a text attribute that specifies the text that shall be displayed
			if (contentItem.txt) {
				div1.innerHTML = contentItem.txt;
			} else {
				// then we access the server and load the content into the section element - it is ok to do this here rather than in the model operations as we simply access a resource whose url is given by the src attribute
				iam.lib.xhr.xhr("GET", contentItem.src, null, function(xmlhttp) {
					console.log("received response for textauszug");
					div1.innerHTML = xmlhttp.responseText;
				});
			}
		}

		/*
		 * multipart responses will result in invoking this method via a <script> element sent to the page's iframe
		 */
		this.onMultipartResponse = function(mpuri, mpobj) {
			console.log("onMultipartResponse: " + mpobj);
			// check which kind of object we have created by the multipart request
			switch (mpobj.type) {
				case "einfuehrungstext":
					eventDispatcher.notifyListeners(eventhandling.customEvent("crud", "uploaded", "einfuehrungstext", mpobj));
					break;
			}
		}
		// at the very end of the constructor execution, call the initialiseView() function
		initialiseView.call(this);
	}

	// a factory method
	function newInstance() {
		return new TopicviewViewController();
	}

	// export the factory method
	iammodule.controller.topicview = {
		newInstance : newInstance
	}

	// return the module
	return iammodule;

})(iam || {});
