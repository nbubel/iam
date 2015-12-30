/**
 * @author Jörn Kreutel
 */
// extend the iam module
var iam = (function(iammodule) {

	console.log("loading EditviewViewContoller as submodule controller.editview of: " + iammodule);

	// create the controller submodule if it doesn't exist yet
	if (!iammodule.controller) {
		iammodule.controller = {};
	}

	// for (var mod in iammodule) {
	// console.log("found submodule: iam." + mod);
	// }

	function EditviewViewController(_topicid, _eventDispatcher, _crudOperations) {

		/*
		 * the event handling module
		 */
		var eventhandling = iam.lib.eventhandling;

		/*
		 * ui elements that are used at various places in the code;
		 */
		var tabsContainer = null;
		var inactiveTabsContainer = null;
		var newElementTab = null;
		var editview = null;
		var tabSelection = null;

		/*
		 * the topicid
		 */
		var topicid = _topicid;

		/*
		 * the event dispatcher used for communication between the single view controllers of a composite view
		 */
		var eventDispatcher = _eventDispatcher;

		/*
		 * the implementation of the crud operations that we use
		 */
		var crudops = _crudOperations;

		function initialiseView() {
			console.log("initialiseEditview()");

			// initialise the ui elements
			editview = document.getElementById("editview");
			tabsContainer = document.getElementsByClassName("tabsContainer")[0];
			inactiveTabsContainer = document.getElementsByClassName("inactiveTabsContainer")[0];
			newElementTab = document.getElementById("newElementTab");

			// initialise the long press handling
			initialiseLongPressHandling.call(this);

			// initialise the form for adding elements
			initialiseAddElementForm.call(this);

			// initialise the tabSelectionMenu (alternative navigation for portrait mode presentation)
			initialiseTabSelectionMenu.call(this);

			// in case a topicview is created we add the newElementTab to the tab bar
			eventDispatcher.addEventListener(eventhandling.customEvent("crud", "read|created", "topicview"), function(event) {
				//iam.lib.uiutils.cutNpasteElement(newElementTab, tabsContainer);
				showTabForElementtype("newElement");
			}.bind(this));
			// in case it is deleted, we remove the element again
			eventDispatcher.addEventListener(eventhandling.customEvent("crud", "deleted", "topicview"), function(event) {
				//iam.lib.uiutils.cutNpasteElement(newElementTab, inactiveTabsContainer);
				hideTabForElementtype("newElement");	
				if (editview.classList.contains("overlay")) {
					editview.classList.toggle("overlay");
				}
			}.bind(this));

			// initialise the controller for the title form
			iam.controller.titleform.newInstance(topicid, eventDispatcher, crudops);

			// for MFM: show some extended form example
			iam.controller.einfuehrungstextform.newInstance(topicid, eventDispatcher, crudops);

			// for FRM/MFM: prepare the view controllers for the object form and object list
			iam.controller.imgboxlist.newInstance(topicid, eventDispatcher, crudops);
			iam.controller.imgboxform.newInstance(topicid, eventDispatcher, crudops);

		}

		/***************************************************************************************
		 *                            tab selection
		 **************************************************************************************/
		function initialiseTabSelectionMenu() {
			// read out the select element
			tabSelection = document.getElementById("tabSelection");
			tabSelection.onchange = function(event) {
				console.log("got onchange on tabSelector. selected value is: " + tabSelection.value);
				event.stopPropagation();
				selectTab(tabSelection.value);
			}
			tabSelection.onclick = function(event) {
				event.stopPropagation();
			}
		}

		/***************************************************************************************
		 *                               long press handling
		 ***************************************************************************************/
		function initialiseLongPressHandling() {
			// we enable longpress on the maincontent view which will result in opening the ediview
			iam.lib.uiutils.enableLongpress(document.getElementById("mainview"), openEditview);

			// these two onclick handlers deal with keeping/closing the editview
			editview.onclick = function(event) {
				closeEditview(event);
			}.bind(this);

			tabsContainer.onclick = function(event) {
				keepEditview(event);
			}
			// we allow for another way to open the editview: click on the header
			document.getElementsByTagName("header")[0].onclick = openEditview;
			// we block propagation of onclick in the zurück button (otherwise the above onclick handler will be invoked)
			document.getElementById("navigationButton").onclick = function(event) {
				event.stopPropagation();
			}
		}

		/***************************************************************************************
		 *                               adding new elements
		 ***************************************************************************************/
		function initialiseAddElementForm() {
			console.log("initialiseAddElementForm");
			document.getElementById("addElementForm").onsubmit = function(event) {
				console.log("got submit on addElement form: " + event.target);

				// // get the type of element that shall be created
				var elementType = event.target.elementType.value
				console.log("selected element type is: " + elementType);
				showAddElementForm(elementType);
				return false;
			}
		}

		/*
		 * show the form that allows to select new elements
		 */
		function showAddElementForm(elementType) {
			console.log("showAddElementForm: " + elementType);
			switch (elementType) {
				case "einfuehrungstext":
					showTabForElementtype(elementType);
					selectTab(elementType);
					break;
				case "imgbox":
					showTabForElementtype(elementType);
					showTabForElementtype("imgboxlist");
					selectTab(elementType);
					break;
				default:
					iam.lib.uiutils.showToast("Derzeit kein Editor verfügbar für Elementtyp " + elementType + "!");
			}
		}

		/***************************************************************************************
		 *                               UTILITY FUNCTIONS
		 ***************************************************************************************/

		/*
		 * add / remove / select tabs
		 */
		function showTabForElementtype(elementType) {
			console.log("showTabForElementtype(): " + elementType);
			if (elementType != "newElement") {
				iam.lib.uiutils.cutNpasteElementById(elementType + "Tab", tabsContainer, "newElementTab");
			}
			else {
				iam.lib.uiutils.cutNpasteElementById(elementType + "Tab", tabsContainer);
			}
			// we also need to add an option element for the new element to the selection menu - we need to place it before the newElementOption
			var option = document.createElement("option");
			option.id = elementType + "TabSelection";
			option.value = elementType;
			option.appendChild(document.createTextNode(elementType));
			tabSelection.appendChild(option);
		}

		function hideTabForElementtype(elementType) {
			iam.lib.uiutils.cutNpasteElementById(elementType + "Tab", inactiveTabsContainer);
			// lookup the option element from the selection menu
			var option = document.getElementById(elementType + "TabSelection");
			if (option) {
				console.log("will remove option " + option.value + " from the tab selection");
				option.parentNode.removeChild(option);
			} else {
				console.log("could not remove option element for " + elementType + ". element does not seem to exist!");
			}
		}

		function selectTab(elementType) {
			console.log("selectTab: " + elementType);
			window.location.hash = elementType + "Tab";
			// we also need to change the selection on the tabSelection element
			tabSelection.value = elementType;
			// we dispatch a ui event that allows the controllers inside the tab to react on tab selection (e.g. by setting focus)
			eventDispatcher.notifyListeners(eventhandling.customEvent("ui", "tabSelected", elementType));
		}

		/*
		 * methods for handling opening and closing the editview
		 */
		function openEditview() {
			console.log("openEditview()");
			editview.classList.toggle("overlay");
			// we will set the fragement identifier to the title tab to trigger the :target selector for foreground style assignment
			selectTab("title");
		}

		function closeEditview() {
			console.log("closeEditview()...");
			// reset the fragment identifier. This will keep the # in the browser location field
			selectTab("");
			editview.classList.toggle("overlay");
		}

		function keepEditview(event) {
			console.log("keepEditview()");
			event.stopPropagation();
		}

		// at the end of the constructor execution, call the initialiseView() function
		initialiseView.call(this);
	}

	// a factory method
	function newInstance(topicid, eventDispatcher, crudOperations) {
		return new EditviewViewController(topicid, eventDispatcher, crudOperations);
	}


	iammodule.controller.editview = {
		newInstance : newInstance
	}

	// return the module
	return iammodule;

})(iam || {});
