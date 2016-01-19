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
			localStorage.setItem("topicview_" + topicviewObj.topicid,JSON.stringify(topicviewObj));
			callback(topicviewObj);
		}

		this.readTopicview = function(topicid, callback) {
			var topicviewStr = localStorage.getItem("topicview_" + topicid);
			var topicviewObj = JSON.parse(topicviewStr);
			callback(topicviewObj);
		}

		this.deleteTopicview = function(topicid, callback) {
			localStorage.removeItem("topicview_"+topicid);
			callback(true);
		}

		this.updateTopicview = function(topicid, updateObj, callback) {
			var topicviewStr = localStorage.getItem("topicview_" + topicid);
			var topicviewObj = JSON.parse(topicviewStr);
			console.log("add: " + JSON.stringify(updateObj));
			topicviewObj.title = updateObj.title;
			console.log("after add new title: " + JSON.stringify(topicviewObj));
			localStorage.setItem("topicview_" + topicid, JSON.stringify(topicviewObj));

			callback(updateObj);
		}

		/*
		 * the crud operations for imgbox
		 */
		this.createImgbox = function(obj, callback) {
			if (true/*manualids && !obj._id*/) {
				obj._id = nextId();
			}
			localStorage.setItem("imgbox_" + obj._id, JSON.stringify(obj));
			var topicviewObj = JSON.parse(localStorage.getItem("topicview_" + topicid));
			topicviewObj.contentItems.push({type: "imgbox", renderContainer: "right", _id: obj._id});
			localStorage.setItem("topicview_" + topicid, JSON.stringify(topicviewObj));

			//this.createImgboxReference({type: "imgbox", renderContainer: "right", imgboxid: obj._id}, function(){
			callback(obj);
			// });
		}

		// obj: imgbox-reference
		// callback: function when reference creation is done
		this.createImgboxReference = function(obj, callback) {
			this.readTopicview(topicid, function(topicviewObj){
				topicviewObj.contentItems.push(obj);
				localStorage.setItem("topicview_"+ topicid,JSON.stringify(topicviewObj));
				callback(obj);
			});
		}

		this.readImgbox = function(objid, callback) {
			console.log("readImgbox: " + objid);
			var imgboxObj = JSON.parse(localStorage.getItem("imgbox_" + objid));
			callback(imgboxObj);
		}

		this.updateImgbox = function(objid, updateObj, callback) {
			var imgboxObj = JSON.parse(JSON.stringify(updateObj));
			var imgboxID = JSON.parse(JSON.stringify(objid));

			console.log("want to update imgbox: " + JSON.stringify(imgboxObj));
			console.log("imgboxID: " +imgboxID);

			imgboxObj._id = imgboxID;

			//process(imgboxObj,imgboxID);

			console.log("want to update imgbox: " + JSON.stringify(imgboxObj));
			console.log("imgboxID: " +imgboxID);
			localStorage.setItem("imgbox_" + imgboxID, JSON.stringify(imgboxObj));

			var imgboxUpdateObj = JSON.parse(localStorage.getItem("imgbox_" + imgboxID));

			callback(imgboxObj);
		}

		this.deleteImgbox = function(objid, callback) {
			var imgboxID = JSON.parse(JSON.stringify(objid));
			var imgboxKey = "imgbox_" + imgboxID;
			console.log("want delete: " + imgboxKey);
			localStorage.removeItem(imgboxKey);
			callback(objid);
		}

		this.deleteImgboxRef = function(topicid, callback) {
			var topicviewObj = JSON.parse(localStorage.getItem("topicview_" + topicid));
			console.log("want to remove imgbox Referenz: " + JSON.stringify(topicviewObj));
			topicviewObj = (resetContentitems(JSON.stringify(topicviewObj), 'contentItems'));
			console.log("removed imgbox Referenz: " + JSON.stringify(topicviewObj));
			localStorage.setItem("topicview_" + topicid,JSON.stringify(topicviewObj));
			callback(true);
		}

		/*
		 * this function is needed for creating the objectlist view
		 */
		this.readAllImgboxs = function(callback) {
			console.log("readAllImgboxs!");
			var i, imgboxObjs = [];
			for (i in localStorage) {
				if (localStorage.hasOwnProperty(i)) {
					if (i.match("imgbox_.*")) {
						value = JSON.parse(localStorage.getItem(i));
						imgboxObjs.push(value);
					}
				}
			}
			var imgboxs = JSON.parse(JSON.stringify(imgboxObjs));
			console.log("imgboxs were found: " + JSON.stringify(imgboxs));

			callback(imgboxs);
		}
		/*
		 * a helper function that gives us a String-valued id based on the current time - this is required for LDS2, requirement 2 (local ids)
		 */
		function nextId() {
			return new Date().getTime().toString();
		}

		function format(json_string, key_to_skip) {

			return JSON.parse(json_string, function (key, value) {
				if (key !== key_to_skip) {
					return value;
				}
			});
		}

		function resetContentitems(json_string, key_to_reset) {

			return JSON.parse(json_string, function (key, value) {
				if (key !== key_to_reset) {
					return value;
				}
				if (key == key_to_reset) {
					return [];
				}
			});
		}

		function process(val,imgboxID) {
			val._id = JSON.parse(JSON.stringify(imgboxID));
			alert("imgebox: " + JSON.parse(JSON.stringify(val)));
			alert("set id to " + JSON.parse(JSON.stringify(imgboxID)));

			for(var i = 0, len = val.items.length; i < len; i++) {
				process(val.items[i],imgboxID);
			}
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

