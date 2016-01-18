var iam =

/**
 * @author Jörn Kreutel
 */
(function(iammodule) {

	console.log("loading TopicviewCRUDOperations as submodule crud.remote of: " + iammodule);

	// we declare a local variable for the xhr module
	var xhr = iam.lib.xhr;

	// we add another submodule for different implementations
	if (!iammodule.crud) {
		iammodule.crud = {};
	}

	function TopicviewCRUDOperationsRemote(_topicid) {

		var topicid = _topicid;
		console.log("TopicviewCRUDOperationsRemote: topicid is: " + topicid);

		/*
		 * the crud operations should not use any instance attributes representing "state", configuration information or state information indicating whether we are offline or online could be represented by attributes, though
		 */

		this.initialise = function(callback) {
			callback();
		}

		this.createTopicview = function(topicviewObj, callback) {

			console.log("createTopicview()");

			xhr.create("/topicviews", topicviewObj, function(created) {
				/* this is also meant for providing an example for NJM3: we show how a new element can be added to the contentItems list */

				// send another xhr adding some dummy element to the contentItems list - note that the url is created by adding the static segment "/contentItems" behind the dynamic segment that specifies the topicid. This url pattern is then evaluated in the http2mdb script's updateTopicview() function
				xhr.update("/topicviews/" + topicid + "/contentItems", {
					type : "demoElement",
					renderContainer : "none"
				}, function(updated) {
					if (callback) {
						callback(created);
					}
				});
			});

		}

		this.readTopicview = function(topicid, callback) {

			console.log("readTopicview()");

			// we read out a topicview for a given topicid, appending the id on the base url for the topicviews
			xhr.read("/topicviews/" + topicid, null, function(read) {
				// pass the object to the callback if we have one
				if (callback) {
					callback(read);
				}
			});

		}
		/*
		 * the server-side implementation of this function demonstrates how the ids assigned internally by mongodb are handled, therefore we pass both the manuylly assigned topicid (e.g. die_umsiedlerin) and the internal id
		 */
		this.deleteTopicview = function(topicid, callback) {

			console.log("deleteTopicview()");

			// show how to delete an element from a collection that is contained in another element - note that we use the value of the type attribute ("demoElement") as identifier - for Imgbox this could be dealt with anagously
			xhr.deleat("/topicviews/" + topicid + "/contentItems/demoElement", null, function(deleted) {
				console.log("got response from deletion of demoElement from contentItems: " + deleted);
				if (deleted < 1) {
					alert("demoElement could not be deleted!");
				} else {
					console.log("demoElement was deleted successfully");
				}
				// we then delete the rest of the topicview
				xhr.deleat("/topicviews/" + topicid, null, function(deleted2) {
					if (deleted2 > 0) {
						if (callback) {
							callback(true);
						}
					} else {
						alert("The topicview element could not be deleted!");
					}
				});

			});

		}

		this.updateTopicview = function(topicid, updateObj, callback) {

			console.log("updateTopicview()");

			// for updating, we identify the topicview passing the id and then only pass the attributes to be updated
			xhr.update("/topicviews/" + topicid, updateObj, function(updated) {
				// if the update was successful, we pass the update object to the callback
				if (updated > 0) {
					if (callback) {
						callback(updateObj);
					}
				} else {
					alert("The topicview element could not be updated!");
				}
			});

		}
		/*
		 * these functions need to be implemented for the njm exercises
		 */
		this.createImgbox = function(obj, callback) {
			xhr.create("/imgboxs/", obj, function(created){
				console.log("TopicViewCRUDOperationsRemote: created imgbox: " + JSON.stringify(created));
				var imgboxref = {type: "imgbox", renderContainer: "left", imgboxid: created._id};
				// HTTP Request mit PUT Methode bezueglich URL /topicviews/<topicid>/contentItems
				xhr.update("/topicviews/" + topicid + "/contentItems", imgboxref, function (updated){
					if (updated > 0) {
						callback(created);
					}
					else {
						alert("topicviewCRUDOperationsRemote: update of contentItems could not be completed!");
					}
				});
			});
		}

		this.createImgboxReference = function(imgboxref, callback) {
			alert("ImgboxReference: " + JSON.stringify(imgboxref));
			xhr.update("/topicviews/" + topicid + "/contentItems", imgboxref, function (updated){
				if (updated > 0) {
					alert("Update:" + JSON.stringify(imgboxref));
					callback(imgboxref);
				}
				else {
					alert("topicviewCRUDOperationsRemote: set imgboxRef in topicview could not be completed!");
				}
			});

		}
		
		/*
		 * the id of the imgbox to be read/updated/deleted is determined given the contentItems array of the topicview using the helper function getImgboxIdForTopicview() in TopicviewViewController
		 *
		 * note that in order for this to work the imgbox reference must be set in contentItems.
		 * Currently this is only the case if the imgbox element has already been created when entering a topicview.
		 * If an imgbox is created, currently the reference is set/created in the db afterwards (mongodb or indexeddb),
		 * but not added to the local topicviewObj used by TopicviewViewController.
		 *
		 * adding of references could be done within an event handler for imgbox creation in TopicviewViewController
		 */
		this.readImgbox = function(objid, callback) {
			xhr.read("/imgboxs/" + objid, null, callback);
		}

		this.updateImgbox = function(objid, updateObj, callback) {

			console.log("updateImgbox()" + objid);

			// for updating, we identify the topicview passing the id and then only pass the attributes to be updated
			xhr.update("/imgboxs/"+objid, updateObj, function(updated) {
				// if the update was successful, we pass the update object to the callback
				if (updated > 0) {
					if (callback) {
						xhr.read("/imgboxs/" + objid, null, callback);
					}
				} else {
					alert("The imgbox element could not be updated!");
				}
			});
		}


		this.deleteImgbox = function(objid, callback) {
			xhr.deleat("/imgboxs/"+objid, null, function(deleted){
				alert("imgbox deleted: "+ deleted);
				if (deleted > 0){
					callback(objid);
				}
				else {
					alert("imgbox could not be deleted");
				}
			});

		}

		this.deleteImgboxRef = function(topicid, callback){
			xhr.deleat("/topicviews/" + topicid + "/contentItems/imgbox", null, function (deleted){
				if (deleted > 0) {
					callback(true);
				}
				else {
					alert("topicviewCRUDOperationsRemote: delete of contentItems could not be completed!");
				}
			});
		}


		/*
		 * this function is needed for creating the objectlist view
		 */
		this.readAllImgboxs = function(imgboxObjs) {
			xhr.read("/imgboxs/", null, imgboxObjs);
		}
	}

	// a factory method
	function newInstance(topicid) {
		return new TopicviewCRUDOperationsRemote(topicid);
	}

	// export the factory method
	iammodule.crud.remote = {
		newInstance : newInstance
	}

	// return the module
	return iammodule;

})(iam || {});
