/**
 * @author Jörn Kreutel
 */
// extend the iam module
var iam = (function(iammodule) {

	// 141220: modified log message
	console.log("loading TopicviewCRUDOperationsSynced as submodule crud.synced of: " + iammodule);

	if (!iammodule.crud) {
		iammodule.crud = {};
	}

	/*
	 * we pass the topicid
	 */
	function TopicviewCRUDOperationsSynced(_topicid) {

		var topicid = _topicid;
		console.log("TopicviewCRUDOperationsSynced topicid is: " + topicid);

		// the initialise function
		this.initialise = function(callback) {
			alert("TopicviewCRUDOperationsSynced is pending to be implemented in LDS2!");
		}
		/*
		 * the crud operations for topicview
		 */
		this.createTopicview = function(topicviewObj, callback) {

		}

		this.readTopicview = function(topicid, callback) {

		}

		this.deleteTopicview = function(topicid, callback) {

		}

		this.updateTopicview = function(topicid, updateObj, callback) {

		}
		
		/*
		 * the crud operations for object
		 */
		this.createImgbox = function(obj, callback) {

		}
		
		this.createImgboxReference = function(obj, callback) {
			
		}

		this.readImgbox = function(objid, callback) {

		}

		this.updateImgbox = function(objid, updateObj, callback) {

		}

		this.deleteImgbox = function(objid, callback) {

		}
		
		/*
		 * this function is needed for creating the imgboxlist view
		 */
		this.readAllImgboxs = function(callback) {

		}
	}

	// a factory method
	function newInstance(topicid) {
		return new TopicviewCRUDOperationsSynced(topicid);
	}


	iammodule.crud.synced = {
		newInstance : newInstance
	}

	// return the module
	return iammodule;

})(iam || {});

