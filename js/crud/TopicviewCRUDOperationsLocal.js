/**
 * @author Jörn Kreutel
 */
// extend the iam module
var iam = (function(iammodule) {

	// 141220: modified log message
	console.log("loading TopicviewCRUDOperationsLocal as submodule crud.local of: " + iammodule);

	if (!iammodule.crud) {
		iammodule.crud = {};
	}

	/*
	 * we pass the topicid
	 */
	function TopicviewCRUDOperationsLocal(_topicid) {
		
		// this controls the way ids for imgboxs are assigned - for full compliance with LDS2 manualids should be set to true. The demo from December 16, 2014 uses
		var manualids = true;
		var topicid = _topicid;
		console.log("TopicviewCRUDOperationsLocal: topicid is: " + topicid);
		
		// we create a local instance of the generic implementation of the crud operations. Three objectstores will be used:
		// - topicviews, identified by topicid
		// - imgboxs, identified by the _id which will be assigned by indexeddb (if manualids are NOT used), or manually
		// - imgrefs (which will keep the references from topicviews to imgboxs), identified by topicid
		var idbcrud = null;
		if (!manualids) {
			idbcrud = iam.lib.indexeddb.newInstance("mydb1", 1, ["topicviews", "imgboxs", "imgboxrefs"], [{
				keyPath : "topicid"
			}, null, {
				keyPath : "topicid"
			}], function(astorename, astoreobj) {
				console.log("created objectstore " + astorename + ": " + astoreobj);
			}, [false, true, false]);
		} else {
			idbcrud = iam.lib.indexeddb.newInstance("mydb2", 1, ["topicviews", "imgboxs", "imgboxrefs"], [{
				keyPath : "topicid"
			}, {
				keyPath : "_id"
			}, {
				keyPath : "topicid"
			}], function(astorename, astoreobj) {
				console.log("created objectstore " + astorename + ": " + astoreobj);
			}, [false, false, false]);
		}

		// the initialise function
		this.initialise = function(callback) {
			alert("TopicviewCRUDOperationsLocal is pending to be implemented in LDS2!");

			idbcrud.initialise(callback, function() {
				alert("indexeddb is not available!");
			}, function() {
				alert("error trying to initialise indexeddb!");
			});
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
		 * the crud operations for imgbox
		 */
		this.createImgbox = function(obj, callback) {
			if (manualids && !obj._id) {
				obj._id = nextId();
			}

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
		 * this function is needed for creating the objectlist view
		 */
		this.readAllImgboxs = function(callback) {

		}
		/*
		 * a helper function that gives us a String-valued id based on the current time - this is required for LDS2, requirement 2 (local ids)
		 */
		function nextId() {
			return new Date().getTime().toString();
		}

	}

	// a factory method
	function newInstance(topicid) {
		return new TopicviewCRUDOperationsLocal(topicid);
	}


	iammodule.crud.local = {
		newInstance : newInstance
	}

	// return the module
	return iammodule;

})(iam || {});

