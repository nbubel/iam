/**
 * @author Jörn Kreutel
 */

// add the functions in this script as a submodule to the iam module
// see http://stackoverflow.com/questions/7508905/how-to-make-a-submodule-via-module-pattern
var iam = (function(parentmodule) {

	console.log("loading navigation as submodule lib.navigation of: " + parentmodule);

	if (!parentmodule.lib) {
		parentmodule.lib = {};
	}

	/*
	 * change the view by setting the html document for the follow-up view and adding the arguments as a query string
	 */
	function nextView(uri, args) {
		console.log("about to access uri: " + uri);
		sessionStorage.setItem("previousView", window.location);
		window.location = uri + "?args=" + JSON.stringify(args);
	}

	/*
	 * go back to the previous view stored in the sessionStorage
	 */
	function previousView() {
		var previousView = sessionStorage.getItem("previousView");

		// note that this solution will append the history:
		if (previousView) {
			console.log("previousView(): going back to previousView fro session storage: " + previousView);
			window.location = previousView;
		} else {
			console.log("previousView(): no previousView specified in session storage. Try to go back one step in history.");
			window.history.go(-1);
		}
	}

	/*
	 * get the arguments that might have been passed when calling the view
	 */
	function getViewargs() {
		console.log("getViewargs(): search string is: " + window.location.search);
		var argstr = decodeURIComponent(window.location.search.substring("?args=".length));
		var args = JSON.parse(argstr);

		return args;
	}

	/*
	 * show the topicview for some topicid (the topicview is the "overview" view that we have been working with so far)
	 */
	function loadTopicview(topicid, typed_overview_prefix) {
		console.log("loadTopicview(): " + topicid);

		nextView("topicview.html", {
			"topicid" : topicid
		});
	}

	// export the functions
	parentmodule.lib.navigation = {

		nextView : nextView,
		previousView : previousView,
		getViewargs : getViewargs,
		loadTopicview : loadTopicview

	}

	// return the parentmodule that now contains the submodule
	return parentmodule;

})(iam || {})
