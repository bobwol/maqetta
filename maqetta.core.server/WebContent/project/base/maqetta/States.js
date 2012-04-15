// Runtime version, used by preview-in-browser

// Various functions extracted from dojo for use in non-dojo environments
(function(){

	if (typeof davinci == "undefined") {
		davinci = {};
	}
	davinci.dojo = {};
	var d = davinci.dojo;
	
	/*=====
	davinci.dojo.doc = {
		// summary:
		//		Alias for the current document. 'davinci.dojo.doc' can be modified
		//		for temporary context shifting. Also see davinci.dojo.withDoc().
		// description:
		//    Refer to davinci.dojo.doc rather
		//    than referring to 'window.document' to ensure your code runs
		//    correctly in managed contexts.
		// example:
		// 	|	n.appendChild(davinci.dojo.doc.createElement('div'));
	}
	=====*/
	d.doc = window["document"] || null;
	d.global = window;
	
	var n = navigator;
	var dua = n.userAgent,
		dav = n.appVersion,
		tv = parseFloat(dav);

	if(dua.indexOf("Opera") >= 0){ d.isOpera = tv; }
	d.isWebKit = parseFloat(dua.split("WebKit/")[1]) || undefined;

	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	if(document.all && !d.isOpera){
		d.isIE = parseFloat(dav.split("MSIE ")[1]) || undefined;
		//In cases where the page has an HTTP header or META tag with
		//X-UA-Compatible, then it is in emulation mode.
		//Make sure isIE reflects the desired version.
		//document.documentMode of 5 means quirks mode.
		//Only switch the value if documentMode's major version
		//is different from isIE's major version.
		var mode = document.documentMode;
		if(mode && mode != 5 && Math.floor(d.isIE) != mode){
			d.isIE = mode;
		}
	}
	//>>excludeEnd("webkitMobile");

	/*=====
	davinci.dojo.byId = function(id, doc){
		//	summary:
		//		Returns DOM node with matching `id` attribute or `null`
		//		if not found. If `id` is a DomNode, this function is a no-op.
		//
		//	id: String|DOMNode
		//	 	A string to match an HTML id attribute or a reference to a DOM Node
		//
		//	doc: Document?
		//		Document to work in. Defaults to the current value of
		//		davinci.dojo.doc.  Can be used to retrieve
		//		node references from other documents.
		//
		//	example:
		//	Look up a node by ID:
		//	|	var n = davinci.dojo.byId("foo");
		//
		//	example:
		//	Check if a node exists, and use it.
		//	|	var n = davinci.dojo.byId("bar");
		//	|	if(n){ doStuff() ... }
		//
		//	example:
		//	Allow string or DomNode references to be passed to a custom function:
		//	|	var foo = function(nodeOrId){
		//	|		nodeOrId = davinci.dojo.byId(nodeOrId);
		//	|		// ... more stuff
		//	|	}
	=====*/

	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	if(d.isIE || d.isOpera){
		d.byId = function(id, doc){
			if(typeof id != "string"){
				return id;
			}
			var _d = doc || d.doc, te = _d.getElementById(id);
			// attributes.id.value is better than just id in case the 
			// user has a name=id inside a form
			if(te && (te.attributes.id.value == id || te.id == id)){
				return te;
			}else{
				var eles = _d.all[id];
				if(!eles || eles.nodeName){
					eles = [eles];
				}
				// if more than 1, choose first with the correct id
				var i=0;
				while((te=eles[i++])){
					if((te.attributes && te.attributes.id && te.attributes.id.value == id)
						|| te.id == id){
						return te;
					}
				}
			}
		};
	}else{
	//>>excludeEnd("webkitMobile");
		d.byId = function(id, doc){
			// inline'd type check
			return (typeof id == "string") ? (doc || d.doc).getElementById(id) : id; // DomNode
		};
	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	}
	//>>excludeEnd("webkitMobile");
	
		// Although we normally eschew argument validation at this
	// level, here we test argument 'node' for (duck)type,
	// by testing nodeType, ecause 'document' is the 'parentNode' of 'body'
	// it is frequently sent to this function even 
	// though it is not Element.
	var gcs;
	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	if(d.isWebKit){
	//>>excludeEnd("webkitMobile");
		gcs = function(/*DomNode*/node){
			var s;
			if(node.nodeType == 1){
				var dv = node.ownerDocument.defaultView;
				s = dv.getComputedStyle(node, null);
				if(!s && node.style){
					node.style.display = "";
					s = dv.getComputedStyle(node, null);
				}
			}
			return s || {};
		};
	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	}else if(d.isIE){
		gcs = function(node){
			// IE (as of 7) doesn't expose Element like sane browsers
			return node.nodeType == 1 /* ELEMENT_NODE*/ ? node.currentStyle : {};
		};
	}else{
		gcs = function(node){
			return node.nodeType == 1 ?
				node.ownerDocument.defaultView.getComputedStyle(node, null) : {};
		};
	}
	//>>excludeEnd("webkitMobile");
	d.getComputedStyle = gcs;

	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	if(!d.isIE){
	//>>excludeEnd("webkitMobile");
		d._toPixelValue = function(element, value){
			// style values can be floats, client code may want
			// to round for integer pixels.
			return parseFloat(value) || 0;
		};
	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	}else{
		d._toPixelValue = function(element, avalue){
			if(!avalue){ return 0; }
			// on IE7, medium is usually 4 pixels
			if(avalue == "medium"){ return 4; }
			// style values can be floats, client code may
			// want to round this value for integer pixels.
			if(avalue.slice && avalue.slice(-2) == 'px'){ return parseFloat(avalue); }
			with(element){
				var sLeft = style.left;
				var rsLeft = runtimeStyle.left;
				runtimeStyle.left = currentStyle.left;
				try{
					// 'avalue' may be incompatible with style.left, which can cause IE to throw
					// this has been observed for border widths using "thin", "medium", "thick" constants
					// those particular constants could be trapped by a lookup
					// but perhaps there are more
					style.left = avalue;
					avalue = style.pixelLeft;
				}catch(e){
					avalue = 0;
				}
				style.left = sLeft;
				runtimeStyle.left = rsLeft;
			}
			return avalue;
		}
	}
	//>>excludeEnd("webkitMobile");
	var px = d._toPixelValue;

	// FIXME: there opacity quirks on FF that we haven't ported over. Hrm.
	/*=====
	davinci.dojo._getOpacity = function(node){
			//	summary:
			//		Returns the current opacity of the passed node as a
			//		floating-point value between 0 and 1.
			//	node: DomNode
			//		a reference to a DOM node. Does NOT support taking an
			//		ID string for speed reasons.
			//	returns: Number between 0 and 1
			return; // Number
	}
	=====*/

	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	var astr = "DXImageTransform.Microsoft.Alpha";
	var af = function(n, f){
		try{
			return n.filters.item(astr);
		}catch(e){
			return f ? {} : null;
		}
	};

	//>>excludeEnd("webkitMobile");
	d._getOpacity =
	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		d.isIE ? function(node){
			try{
				return af(node).Opacity / 100; // Number
			}catch(e){
				return 1; // Number
			}
		} :
	//>>excludeEnd("webkitMobile");
		function(node){
			return gcs(node).opacity;
		};

	/*=====
	davinci.dojo._setOpacity = function(node, opacity){
			//	summary:
			//		set the opacity of the passed node portably. Returns the
			//		new opacity of the node.
			//	node: DOMNode
			//		a reference to a DOM node. Does NOT support taking an
			//		ID string for performance reasons.
			//	opacity: Number
			//		A Number between 0 and 1. 0 specifies transparent.
			//	returns: Number between 0 and 1
			return; // Number
	}
	=====*/

	d._setOpacity =
		//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		d.isIE ? function(/*DomNode*/node, /*Number*/opacity){
			var ov = opacity * 100, opaque = opacity == 1;
			node.style.zoom = opaque ? "" : 1;

			if(!af(node)){
				if(opaque){
					return opacity;
				}
				node.style.filter += " progid:" + astr + "(Opacity=" + ov + ")";
			}else{
				af(node, 1).Opacity = ov;
			}

			// on IE7 Alpha(Filter opacity=100) makes text look fuzzy so disable it altogether (bug #2661),
			//but still update the opacity value so we can get a correct reading if it is read later.
			af(node, 1).Enabled = !opaque;

			if(node.nodeName.toLowerCase() == "tr"){
				d.query("> td", node).forEach(function(i){
					d._setOpacity(i, opacity);
				});
			}
			return opacity;
		} :
		//>>excludeEnd("webkitMobile");
		function(node, opacity){
			return node.style.opacity = opacity;
		};

	var _pixelNamesCache = {
		left: true, top: true
	};
	var _pixelRegExp = /margin|padding|width|height|max|min|offset/;  // |border
	var _toStyleValue = function(node, type, value){
		type = type.toLowerCase(); // FIXME: should we really be doing string case conversion here? Should we cache it? Need to profile!
		//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		if(d.isIE){
			if(value == "auto"){
				if(type == "height"){ return node.offsetHeight; }
				if(type == "width"){ return node.offsetWidth; }
			}
			if(type == "fontweight"){
				switch(value){
					case 700: return "bold";
					case 400:
					default: return "normal";
				}
			}
		}
		//>>excludeEnd("webkitMobile");
		if(!(type in _pixelNamesCache)){
			_pixelNamesCache[type] = _pixelRegExp.test(type);
		}
		return _pixelNamesCache[type] ? px(node, value) : value;
	};

	var _floatStyle = d.isIE ? "styleFloat" : "cssFloat",
		_floatAliases = { "cssFloat": _floatStyle, "styleFloat": _floatStyle, "float": _floatStyle }
	;

	// public API

	d.style = function(	/*DomNode|String*/ node,
							/*String?|Object?*/ style,
							/*String?*/ value){
		//	summary:
		//		Accesses styles on a node. If 2 arguments are
		//		passed, acts as a getter. If 3 arguments are passed, acts
		//		as a setter.
		//	description:
		//		Getting the style value uses the computed style for the node, so the value
		//		will be a calculated value, not just the immediate node.style value.
		//		Also when getting values, use specific style names,
		//		like "borderBottomWidth" instead of "border" since compound values like
		//		"border" are not necessarily reflected as expected.
		//		If you want to get node dimensions, use `davinci.dojo.marginBox()`, 
		//		`davinci.dojo.contentBox()` or `davinci.dojo.position()`.
		//	node:
		//		id or reference to node to get/set style for
		//	style:
		//		the style property to set in DOM-accessor format
		//		("borderWidth", not "border-width") or an object with key/value
		//		pairs suitable for setting each property.
		//	value:
		//		If passed, sets value on the node for style, handling
		//		cross-browser concerns.  When setting a pixel value,
		//		be sure to include "px" in the value. For instance, top: "200px".
		//		Otherwise, in some cases, some browsers will not apply the style.
		//	example:
		//		Passing only an ID or node returns the computed style object of
		//		the node:
		//	|	davinci.dojo.style("thinger");
		//	example:
		//		Passing a node and a style property returns the current
		//		normalized, computed value for that property:
		//	|	davinci.dojo.style("thinger", "opacity"); // 1 by default
		//
		//	example:
		//		Passing a node, a style property, and a value changes the
		//		current display of the node and returns the new computed value
		//	|	davinci.dojo.style("thinger", "opacity", 0.5); // == 0.5
		//
		//	example:
		//		Passing a node, an object-style style property sets each of the values in turn and returns the computed style object of the node:
		//	|	davinci.dojo.style("thinger", {
		//	|		"opacity": 0.5,
		//	|		"border": "3px solid black",
		//	|		"height": "300px"
		//	|	});
		//
		// 	example:
		//		When the CSS style property is hyphenated, the JavaScript property is camelCased.
		//		font-size becomes fontSize, and so on.
		//	|	davinci.dojo.style("thinger",{
		//	|		fontSize:"14pt",
		//	|		letterSpacing:"1.2em"
		//	|	});
		//
		//	example:
		//		davinci.dojo.NodeList implements .style() using the same syntax, omitting the "node" parameter, calling
		//		davinci.dojo.style() on every element of the list. See: `davinci.dojo.query()` and `davinci.dojo.NodeList()`
		//	|	davinci.dojo.query(".someClassName").style("visibility","hidden");
		//	|	// or
		//	|	davinci.dojo.query("#baz > div").style({
		//	|		opacity:0.75,
		//	|		fontSize:"13pt"
		//	|	});

		var n = d.byId(node), args = arguments.length, op = (style == "opacity");
		style = _floatAliases[style] || style;
		if(args == 3){
			return op ? d._setOpacity(n, value) : n.style[style] = value; /*Number*/
		}
		if(args == 2 && op){
			return d._getOpacity(n);
		}
		var s = gcs(n);
		if(args == 2 && typeof style != "string"){ // inline'd type check
			for(var x in style){
				d.style(node, x, style[x]);
			}
			return s;
		}
		return (args == 1) ? s : _toStyleValue(n, style, s[style] || n.style[style]); /* CSS2Properties||String||Number */
	};
	
		d._listener = {
		// create a dispatcher function
		getDispatcher: function(){
			// following comments pulled out-of-line to prevent cloning them 
			// in the returned function.
			// - indices (i) that are really in the array of listeners (ls) will 
			//   not be in Array.prototype. This is the 'sparse array' trick
			//   that keeps us safe from libs that take liberties with built-in 
			//   objects
			// - listener is invoked with current scope (this)
			return function(){
				var ap=Array.prototype, c=arguments.callee, ls=c._listeners, t=c.target;
				// return value comes from original target function
				var r = t && t.apply(this, arguments);
				// make local copy of listener array so it is immutable during processing
				var i, lls;
				lls = [].concat(ls);

				// invoke listeners after target function
				for(i in lls){
					if(!(i in ap)){
						lls[i].apply(this, arguments);
					}
				}
				// return value comes from original target function
				return r;
			};
		},
		// add a listener to an object
		add: function(/*Object*/ source, /*String*/ method, /*Function*/ listener){
			// Whenever 'method' is invoked, 'listener' will have the same scope.
			// Trying to supporting a context object for the listener led to 
			// complexity. 
			// Non trivial to provide 'once' functionality here
			// because listener could be the result of a davinci.dojo.hitch call,
			// in which case two references to the same hitch target would not
			// be equivalent. 
			source = source || davinci.dojo.global;
			// The source method is either null, a dispatcher, or some other function
			var f = source[method];
			// Ensure a dispatcher
			if(!f || !f._listeners){
				var d = this.getDispatcher();
				// original target function is special
				d.target = f;
				// dispatcher holds a list of listeners
				d._listeners = []; 
				// redirect source to dispatcher
				f = source[method] = d;
			}
			// The contract is that a handle is returned that can 
			// identify this listener for disconnect. 
			//
			// The type of the handle is private. Here is it implemented as Integer. 
			// DOM event code has this same contract but handle is Function 
			// in non-IE browsers.
			//
			// We could have separate lists of before and after listeners.
			return f._listeners.push(listener); /*Handle*/
		},
		// remove a listener from an object
		remove: function(/*Object*/ source, /*String*/ method, /*Handle*/ handle){
			var f = (source || davinci.dojo.global)[method];
			// remember that handle is the index+1 (0 is not a valid handle)
			if(f && f._listeners && handle--){
				delete f._listeners[handle];
			}
		}
	};
	
	d._topics = {};
	
	d.publish = function(/*String*/ topic, /*Array*/ args){
		//	summary:
		//	 	Invoke all listener method subscribed to topic.
		//	topic:
		//	 	The name of the topic to publish.
		//	args:
		//	 	An array of arguments. The arguments will be applied 
		//	 	to each topic subscriber (as first class parameters, via apply).
		//	example:
		//	|	davinci.dojo.subscribe("alerts", null, function(caption, message){ alert(caption + "\n" + message); };
		//	|	davinci.dojo.publish("alerts", [ "read this", "hello world" ]);	

		// Note that args is an array, which is more efficient vs variable length
		// argument list.  Ideally, var args would be implemented via Array
		// throughout the APIs.
		var f = this._topics[topic];
		if(f){
			f.apply(this, args||[]);
		}
	};
	
	d.subscribe = function(/*String*/ topic, /*Object|null*/ context, /*String|Function*/ method){
		//	summary:
		//		Attach a listener to a named topic. The listener function is invoked whenever the
		//		named topic is published (see: davinci.dojo.publish).
		//		Returns a handle which is needed to unsubscribe this listener.
		//	context:
		//		Scope in which method will be invoked, or null for default scope.
		//	method:
		//		The name of a function in context, or a function reference. This is the function that
		//		is invoked when topic is published.
		//	example:
		//	|	davinci.dojo.subscribe("alerts", null, function(caption, message){ alert(caption + "\n" + message); });
		//	|	davinci.dojo.publish("alerts", [ "read this", "hello world" ]);																	

		// support for 2 argument invocation (omitting context) depends on hitch
		return [topic, this._listener.add(this._topics, topic, this.hitch(context, method))]; /*Handle*/
	};

	d.unsubscribe = function(/*Handle*/ handle){
		//	summary:
		//	 	Remove a topic listener. 
		//	handle:
		//	 	The handle returned from a call to subscribe.
		//	example:
		//	|	var alerter = davinci.dojo.subscribe("alerts", null, function(caption, message){ alert(caption + "\n" + message); };
		//	|	...
		//	|	davinci.dojo.unsubscribe(alerter);
		if(handle){
			this._listener.remove(this._topics, handle[0], handle[1]);
		}
	};
	
	d._hitchArgs = function(scope, method /*,...*/){
		var pre = this._toArray(arguments, 2);
		var named = this.isString(method);
		return function(){
			// arrayify arguments
			var args = this._toArray(arguments);
			// locate our method
			var f = named ? (scope||this.global)[method] : method;
			// invoke with collected args
			return f && f.apply(scope || this, pre.concat(args)); // mixed
		} // Function
	};

	d.hitch = function(/*Object*/scope, /*Function|String*/method /*,...*/){
		//	summary:
		//		Returns a function that will only ever execute in the a given scope.
		//		This allows for easy use of object member functions
		//		in callbacks and other places in which the "this" keyword may
		//		otherwise not reference the expected scope.
		//		Any number of default positional arguments may be passed as parameters 
		//		beyond "method".
		//		Each of these values will be used to "placehold" (similar to curry)
		//		for the hitched function.
		//	scope:
		//		The scope to use when method executes. If method is a string,
		//		scope is also the object containing method.
		//	method:
		//		A function to be hitched to scope, or the name of the method in
		//		scope to be hitched.
		//	example:
		//	|	davinci.dojo.hitch(foo, "bar")();
		//		runs foo.bar() in the scope of foo
		//	example:
		//	|	davinci.dojo.hitch(foo, myFunction);
		//		returns a function that runs myFunction in the scope of foo
		//	example:
		//		Expansion on the default positional arguments passed along from
		//		hitch. Passed args are mixed first, additional args after.
		//	|	var foo = { bar: function(a, b, c){ console.log(a, b, c); } };
		//	|	var fn = davinci.dojo.hitch(foo, "bar", 1, 2);
		//	|	fn(3); // logs "1, 2, 3"
		//	example:
		//	|	var foo = { bar: 2 };
		//	|	davinci.dojo.hitch(foo, function(){ this.bar = 10; })();
		//		execute an anonymous function in scope of foo
		
		if(arguments.length > 2){
			return this._hitchArgs.apply(d, arguments); // Function
		}
		if(!method){
			method = scope;
			scope = null;
		}
		if(this.isString(method)){
			scope = scope || this.global;
			if(!scope[method]){ throw(['davinci.dojo.hitch: scope["', method, '"] is null (scope="', scope, '")'].join('')); }
			return function(){ return scope[method].apply(scope, arguments || []); }; // Function
		}
		return !scope ? method : function(){ return method.apply(scope, arguments || []); }; // Function
	};
	
	var efficient = function(obj, offset, startWith){
		return (startWith||[]).concat(Array.prototype.slice.call(obj, offset||0));
	};

	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	var slow = function(obj, offset, startWith){
		var arr = startWith||[];
		for(var x = offset || 0; x < obj.length; x++){
			arr.push(obj[x]);
		}
		return arr;
	};
	//>>excludeEnd("webkitMobile");

	d._toArray =
		//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		this.isIE ?  function(obj){
			return ((obj.item) ? slow : efficient).apply(this, arguments);
		} :
		//>>excludeEnd("webkitMobile");
		efficient;
		
	d.isString = function(/*anything*/ it){
		//	summary:
		//		Return true if it is a String
		return (typeof it == "string" || it instanceof String); // Boolean
	};

})();


davinci.States = function(){};
davinci.States.prototype = {

	NORMAL: "Normal",
	ATTRIBUTE: "dvStates",

	/**
	 * Returns the array of states declared by the widget, plus the implicit normal state. 
	 * Called by:
	 * 		EventSelection.js: _buildSelectionValues
	 * 		Context.js: _attachChildren
	 * 		Context.js: _restoreStates
	 * 		StatesView.js: _updateList
	 * 		StatesView.js: _hideShowToolBar
	 * 		(this routine): isVisible (indirect for VisualEditorOutline.js: isToggleOn)
	 */ 
	getStates: function(node, associative){
//console.trace();
		node = this._getWidgetNode(node); 
		var names = associative ? {"Normal": "Normal"} : ["Normal"];
		var states = node && node.states;
		if (states) {
			for (var name in states) {
				if (states[name].origin && name != "Normal") {
					if (associative) {
						names[name] = name;
					} else {
						names.push(name);
					}
				}
			}
		}
		return names;
	},
	
	_getWidgetNode: function(node) {
//console.trace();
		if (!node) {
			var doc = this.getDocument();
			node = doc && doc.body;
		}
		return node;
	},
	
	_updateSrcState: function (node)
	{
//console.trace();
	},
	
	/**
	 * Returns true if the node declares the state, false otherwise.
	 */
	hasState: function(node, state, property){ 
//console.trace();
		if (arguments.length < 2) {
			state = arguments[0];
			node = undefined;
		}
		node = this._getWidgetNode(node);
		return !!(node && node.states && node.states[state] && (property || node.states[state].origin));
	},

	/**
	 * Returns the current state of the widget.
	 * Called by:
	 * 		(this routine): normalizeArray
	 * 		(this routine): resetState
	 * 		(this routine): isVisible
	 * 		(this routine): initialize.subscribed
	 * 		StatesView.js: _updateSelection
	 *		VisualEditorOutline.js: _toggle
	 *		(anonymous function)States.js:208
	 *		StyleCommand.js: execute
	 */
	getState: function(node){ 
//console.trace();
		node = this._getWidgetNode(node);
		return node && node.states && node.states.current;
	},
	
	/**
	 * Sets the current state of the widget.  
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/changed", callback).
	 * Called by:
	 * 		(this routine): resetState
	 * 		StatesView.js: (anonymous:81)
	 * 		StatesView.js: (anonymous function)536 - many, many times
	 */
	setState: function(node, newState, updateWhenCurrent, _silent){
//console.trace();
		if (arguments.length < 2) {
			newState = arguments[0];
			node = undefined;
		}
		node = this._getWidgetNode(node);
		if (!node || !node.states || (!updateWhenCurrent && node.states.current == newState)) {
			return;
		}
		var oldState = node.states.current;
		
		if (this.isNormalState(newState)) {
			if (!node.states.current) { return; }
			delete node.states.current;
			newState = undefined;
		} else {
			//FIXME: For time being, only the BODY holds states.current.
			if(node.tagName == 'BODY'){
				node.states.current = newState;
			}else{
				delete node.states.current;
			}
		}
		if (!_silent) {
			this.publish("/davinci/states/state/changed", [{node:node, newState:newState, oldState:oldState}]);
		}
		this._updateSrcState (node);
		
	},
	
	/**
	 * If the current state is not Normal, force a call to setState
	 * so that styling properties get reset for a subtree.
	 */
	resetState: function(node){
//console.trace();
		if(!node || !node.ownerDocument || !node.ownerDocument.body){
			return;
		}
		var body = node.ownerDocument.body;
		var currentState = this.getState(body);
		//if(!this.isNormalState(currentState)){
			//this.setState(node, currentState, true/*updateWhenCurrent*/, false /*silent*/);
			this.setState(node, currentState, true/*updateWhenCurrent*/, true /*silent*/);
		//}		
	},
	
	isNormalState: function(state) {
		if (arguments.length == 0) {
			state = this.getState();
		}
		return !state || state == this.NORMAL;
	},
	
	/**
	 * Called by:
	 * 		(this routine): normalizeArrayStates (indirectly from _Widget.js:_styleText)
	 * 		(this routine): _update (indirectly/inherited from davinci.ve.States:_update)
	 * 		(this routine): _resetAndCacheNormalStyleStates.js
	 * @param widget
	 * @param state
	 * @param name
	 * @returns
	 */
	getStyle: function(node, state, name) {
//console.trace();
		var styleArray, newStyleArray;
		node = this._getWidgetNode(node);
		if (arguments.length == 1) {
			state = this.getState();
		}
		// return all styles specific to this state
		styleArray = node && node.states && node.states[state] && node.states[state].style;
		newStyleArray = dojo.clone(styleArray); // don't want to splice out of original
		if (arguments.length > 2) {
			// Remove any properties that don't match 'name'
			if(newStyleArray){
				for(var j=newStyleArray.length-1; j>=0; j--){
					var item = newStyleArray[j];
					for(var prop in item){		// should be only one prop per item
						if(prop != name){
							newStyleArray.splice(j, 1);
							break;
						}
					}
				}
			}
		}
		return newStyleArray;
	},

	hasStyle: function(node, state, name) {
//console.trace();
		node = this._getWidgetNode(node);

		if (!node || !name) { return; }
		
		if(node.states && node.states[state] && node.states[state].style){
			var valueArray = node.states[state].style;
			for(var i=0; i<valueArray[i]; i++){
				if(valueArray[i].hasProperty(name)){
					return true;
				}
			}
		}else{
			return false;
		}
	},

	
	/**
	 * Called by:
	 * 		VisualEditorOutline.js: _toggle
	 * 		(this routine): _resetAndCacheNormalStyle
	 * @param widget
	 * @param state
	 * @param name
	 * @returns
	 */
	setStyle: function(node, state, styleArray, silent) {
//console.trace();
		node = this._getWidgetNode(node);

		if (!node || !styleArray) { return; }
			

		node.states = node.states || {};
		node.states[state] = node.states[state] || {};
		node.states[state].style = node.states[state].style || [];
		
		// Remove existing entries that match any of entries in styleArray
		var oldArray = node.states[state].style;
		if(styleArray){
			for (var i=0; i<styleArray.length; i++){
				var newItem = styleArray[i];
				for (var newProp in newItem){	// There should be only one prop per item
					for (var j=oldArray.length-1; j>=0; j--){
						var oldItem = oldArray[j];
						for (var oldProp in oldItem){	// There should be only one prop per item
							if(newProp == oldProp){
								oldArray.splice(j, 1);
								break;
							}
						}
					}
				}
			}
		}
		//Make sure all new values are properly formatted (e.g, add 'px' to end of certain properties)
		var newArray;
		if(styleArray){
			for(var j=0; j<styleArray.length; j++){
				for(var p in styleArray[j]){	// should be only one prop per item
					var value =  styleArray[j][p];
					if (typeof value != "undefined" && value !== null) {
						if(typeof newArray == 'undefined'){
							newArray = [];
						}
						var o = {};
						o[p] = this._getFormattedValue(p, value);
						newArray.push(o)
					}
				}
			}
		}
		if(oldArray && newArray){
			node.states[state].style = oldArray.concat(newArray);
		}else if(oldArray){
			node.states[state].style = oldArray;
		}else if(newArray){
			node.states[state].style = newArray;
		}else{
			node.states[state].style = undefined;
		}
			
		if (!silent) {
			this.publish("/davinci/states/state/style/changed", [{node:node, state:state, style:styleArray}]);
		}
		this._updateSrcState (node);
	},
	
	_convertStyleName: function(name) {
		if(name.indexOf("-") >= 0){
			// convert "property-name" to "propertyName"
			var names = name.split("-");
			name = names[0];
			for(var i = 1; i < names.length; i++){
				var n = names[i];
				name += (n.charAt(0).toUpperCase() + n.substring(1));
			}
		}
		return name;
	},
	
	_DYNAMIC_PROPERTIES: { width:1, height:1, top:1, right:1, bottom:1, left:1 },
	
	_getFormattedValue: function(name, value) {
		//FIXME: This code needs to be analyzed more carefully
		// Right now, only checking six properties which might be set via dynamic
		// drag actions on canvas. If just a raw number value, then add "px" to end.
		if(name in this._DYNAMIC_PROPERTIES){
			if(typeof value != 'string'){
				return value+"px";
			}
			var trimmed_value = require("dojo/_base/lang").trim(value);
			// See if value is a number
			if(/^[-+]?[0-9]*\.?[0-9]+$/.test(trimmed_value)){
				value = trimmed_value+"px";
			}
		}
		return value;			
	},
	_resetAndCacheNormalStyle: function(node, oldState) {
//console.trace();
		var oldStateStyleArray = this.getStyle(node, oldState);
		var normalStyleArray = this.getStyle(node, undefined);
		
		// Clear out any styles corresponding to the oldState
		if(oldStateStyleArray){
			for(var j=0; j<oldStateStyleArray.length; j++){
				var oItem = oldStateStyleArray[j];
				for(var oProp in oItem){	// Should only be one prop
					var convertedName = this._convertStyleName(oProp);
					node.style[convertedName] = '';
				}
			}
		}
		
		// Reset normal styles
		if(normalStyleArray){
			for(var i=0; i<normalStyleArray.length; i++){
				var nItem = normalStyleArray[i];
				for(var nProp in nItem){	// Should only be one prop
					var convertedName = this._convertStyleName(nProp);
					node.style[convertedName] = this._getFormattedValue(nProp, nItem[nProp]);
				}
			}
		}
/*
		// Remember style values from the normal state
		if (!this.isNormalState(newState)) {
			if(styleArray){
				for(var i=0; i<styleArray.length; i++){
					var style = styleArray[i];
					for (var name in style) {	// should only be one prop in each normalStyle
						if(!this.hasStyle(node, undefined, name)) {
							var convertedName = this._convertStyleName(name);
							var value = this._getFormattedValue(name, davinci.dojo.style(node, convertedName));
							var o = {};
							o[name] = value;
							this.setStyle(node, undefined, [o], true);
						}
					}
				}
			}
		}
*/
	},
	
	_update: function(node, oldState, newState) {
//console.trace();
		node = this._getWidgetNode(node);
		if (!node || !node.states){
			return;
		}
		
		var styleArray = this.getStyle(node, newState);
		
		this._resetAndCacheNormalStyle(node, oldState);

		// Apply new style
		if(styleArray){
			for(var i=0; i<styleArray.length; i++){
				var style = styleArray[i];
				for (var name in style) {	// should be only one prop in style
					var convertedName = this._convertStyleName(name);
					node.style[convertedName] = style[name];
				}
			}
		}
		
		//FIXME: This is Dojo-specific. Other libraries are likely to need a similar hook.
		var dijitWidget, parent;
		if(node.id && node.ownerDocument && node.ownerDocument.defaultView && node.ownerDocument.defaultView.dijit){
			dijitWidget = node.ownerDocument.defaultView.dijit.byId(node.id);
		}
		if(dijitWidget && dijitWidget.getParent){
			parent = dijitWidget.getParent();
		}
		if(parent && parent.resize){
			parent.resize();
		}else if(dijitWidget && dijitWidget.resize){
			dijitWidget.resize();
		}
	},
		
	isContainer: function(node) {
		var result = false;
		if (node) {
			var doc = this.getDocument();
			if (node === (doc && doc.body) || node.tagName == "BODY") {
				result = true;
			}
		}
		return result;
	},
	
	getContainer: function() {
		return this._getWidgetNode();
	},
	
	/**
	 * Adds a state to the list of states declared by the widget.  
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/added", callback).
	 */
	add: function(node, state){ 
//console.trace();
		if (arguments.length < 2) {
			state = arguments[0];
			node = undefined;
		}
		node = this._getWidgetNode(node);
		if (!node || this.hasState(node, state)) {
			//FIXME: This should probably be an error of some sort
			return;
		}
		node.states = node.states || {};
		node.states[state] = node.states[state] || {};
		node.states[state].origin = true;
		this.publish("/davinci/states/state/added", [{node:node, state:state}]);
		this._updateSrcState (node);
	},
	
	/** 
	 * Removes a state from the list of states declared by the widget.  
	 * Subscribe using davinci.states.subscribe("/davinci/states/state/removed", callback).
	 */
	remove: function(node, state){ 
		if (arguments.length < 2) {
			state = arguments[0];
			node = undefined;
		}
		node = this._getWidgetNode(node);
		if (!node || !this.hasState(node, state)) {
			return;
		}
		
		var currentState = this.getState(node);
		if (state == currentState) {
			this.setState(node, undefined);
		}
		
		delete node.states[state].origin;
		if (this._isEmpty(node.states[state])) {
			delete node.states[state];
		}
		this.publish("/davinci/states/state/removed", [{node:node, state:state}]);
		this._updateSrcState (node);
	},
	
	/**
	 * Renames a state in the list of states declared by the widget.
	 * Subscribe using davinci.states.subscribe("/davinci/states/renamed", callback).
	 */
	rename: function(node, oldName, newName, property){ 
		if (arguments.length < 3) {
			newName = arguments[1];
			oldName = arguments[0];
			node = undefined;
		}
		node = this._getWidgetNode(node);
		if (!node || !this.hasState(node, oldName, property) || this.hasState(node, newName, property)) {
			return false;
		}
		node.states[newName] = node.states[oldName];
		delete node.states[oldName];
		if (!property) {
			this.publish("/davinci/states/state/renamed", [{node:node, oldName:oldName, newName:newName}]);
		}
		this._updateSrcState (node);
		return true;
	},

	/**
	 * Returns true if the widget is set to visible within the current state, false otherwise.
	 */ 
	isVisible: function(node, state){ 
//console.trace();
		if (arguments.length == 1) {
			state = this.getState();
		}
		node = this._getWidgetNode(node);
		if (!node){
			return;
		}
		// FIXME: The way the code is now, sometimes there is an "undefined" property
		// within widget.states. That code seems somewhat accidental and needs
		// to be studied and cleaned up.
		var isNormalState = (typeof state == "undefined" || state == "undefined");
		if(isNormalState){
			return node.style.display != "none";
		}else{
			if(node.states && node.states[state] && node.states[state].style && typeof node.states[state].style.display == "string"){
				return node.states[state].style.display != "none";
			}else{
				return node.style.display != "none";
			}
		}
	},
	
	_isEmpty: function(object) {
		for (var name in object) {
			if (object.hasOwnProperty(name)) {
				return false;
			}
		}
		return true;
	},
	
	serialize: function(node) {
//console.trace();
		if (!node){
			return;
		}
		var value = "";
		if (node.states) {
			var states = require("dojo/_base/lang").clone(node.states);
			delete states["undefined"];
			if (!this._isEmpty(states)) {
				value = JSON.stringify(states);
				// Escape single quotes that aren't already escaped
				value = value.replace(/(\\)?'/g, function($0, $1){ 
					return $1 ? $0 : "\\'";
				});
				// Replace double quotes with single quotes
				value = value.replace(/"/g, "'");
			}
		}
		return value;
	},

	/**
	 * Convert a string representation of widget-specific states information into a JavaScript object
	 * using JSON.parse.
	 * The string representation is typically the value of the this.ATTRIBUTE (dvStates)
	 * Called by:
	 * 		(this routine): store()
	 * 		Context.js: _attachChildren()
	 * 		(this routine): _restoreStates()
	 * @param states  string representation of widget-specific states information
	 * @return {object}  JavaScript result from JSON.parse
	 */
	deserialize: function(states) {
//console.trace();
		if (typeof states == "string") {
			// Replace unescaped single quotes with double quotes, unescape escaped single quotes
			states = states.replace(/(\\)?'/g, function($0, $1){ 
					return $1 ? "'" : '"';
			});
			states = JSON.parse(states);
			this._upgrate_p4_p5(states);	// Upgrade old files
		}
		return states;
	},
	
	_upgrate_p4_p5: function(states){
		// We changed the states structure for Preview5 release. It used to be
		// a JSON representation of an associative array: {'display':'none', 'color':'red'}
		// But with Preview5 it is now an array of single property declarations such as:
		// [{'display':'none'}, {'color':'red';}]. The array approach was necessary to
		// deal with complexities of background-image, where there might be multiple values
		// for a single property.
		for (var s in states){
			var state = states[s];
			var style = state.style;
			if(style && !style.length){	// if style exists but isn't an array
				var statesArray = [];
				for(var prop in style){
					var o = {};
					o[prop] = style[prop];
					statesArray.push(o);
				}
				state.style = statesArray;
			}
		}
	},

	
	/**
	 * Stuffs a JavaScript property (the states object) onto the "widget",
	 * which in page editor is a davinci.ve._Widget object, and when running directly in browser,
	 * is an Element DOM node.
	 * Called by:
	 * 		Context.js: _parse() - why ????
	 * 		Context.js: _restoreStates() - why ????
	 * @param widget  Pointer to widget. For page editor, it's a davinci.ve._Widget object.
	 * 		When actually running in browser outside of page editor, it's an Element DOM node.
	 * @param states   the string value of the widget-specific states information.
	 * 				This is the string that is stuffed into the attribute that 
	 * 				holds widget-specific states information (dvStates)
	 */
	store: function(node, states) {
//console.trace();
		if (!node || !states){
			return;
		}
		
		this.clear(node);
		//FIXME: Shouldn't be stuffing a property with such a generic name ("states") onto DOM elements
		node.states = states = this.deserialize(states);
		this.publish("/davinci/states/stored", [{node:node, states:states}]);
	},
	
	/**
	 * Returns the string value of the attribute that holds widget-specific states information (dvStates)
	 * Called by:
	 * 		(this routine): _preserveStates
	 * 		Context.js: _preserveStates
	 * @param widget  Pointer to widget. For page editor, it's a davinci.ve._Widget object.
	 * 		When actually running in browser outside of page editor, it's an Element DOM node.
	 * @returns {string}  String value for the attribute, or unspecified|null if no such widget or attribute
	 */
	retrieve: function(node) {
//console.trace();
		if (!node){
			return;
		}
		
		// FIXME: Maybe this check between page editor and runtime should be factored out
		var states = node.getAttribute(this.ATTRIBUTE);
		return states;
	},

	/**
	 * Removes the states property on the given widget
	 * Called by store().
	 * @param widget  A davinci.ve._Widget in page editor and an Element when running directly in browser
	 */
	clear: function(node) {
//console.trace();
		if (!node || !node.states) return;
		var states = node.states;
		delete node.states;
		this.publish("/davinci/states/cleared", [{node:node, states:states}]);
	},
	
	/**
	 * Parse an element.style string, return a valueArray, which is an array
	 * of objects, where each object holds a single CSS property value
	 * (e.g., [{'display':'none'},{'color':'red'}]
	 * @param text
	 * @returns {Array}  valueArray: [{propname:propvalue}...]
	 */
	_parseStyleValues: function(text) {
		var values = [];
		if(text){
			dojo.forEach(text.split(";"), function(s){
				var i = s.indexOf(":");
				if(i > 0){
					var n = s.substring(0, i).trim();
					var v = s.substring(i + 1).trim();
					var o = {};
					o[n] = v;
					values.push(o);
				}
			});
		}
		return values;
	},

	/**
	 * Store original element.style values into node.states['undefined'].style
	 * Called by _preserveStates
	 * @param node  
	 * @param {String} elemStyle  element.style string
	 */
	transferElementStyle: function(node, elemStyle) {
//console.trace();
		if(node){
			var states = node.states;
			var valueArray = this._parseStyleValues(elemStyle);
			if(!states['undefined']){
				states['undefined'] = {};
			}
			states['undefined'].style = valueArray;
		}
	},
	getDocument: function() {
		return document;
	},
	
	_shouldInitialize: function() {
//console.trace();
		var windowFrameElement = window.frameElement;
		var isDavinciEditor = top.davinci && top.davinci.Runtime && (!windowFrameElement || windowFrameElement.dvContext);
		return !isDavinciEditor;
	},

	publish: function(/*String*/ topic, /*Array*/ args) {
		try {
			return davinci.dojo.publish(topic, args);
		} catch(e) {
			console.error(e);
		}
	},
	
	subscribe: function(/*String*/ topic, /*Object|null*/ context, /*String|Function*/ method){
		return davinci.dojo.subscribe(topic, context, method);
	},
	
	unsubscribe: function(handle){
		return davinci.dojo.unsubscribe(handle);
	}, 

	_getChildrenOfNode: function(node) {
		var children = [];
		for (var i=0; i<node.childNodes.length; i++){
			var n = node.childNodes[i];
			if(n.nodeType === 1){	// Element
				children.push(n);
			}
		}
		return children;
	},
	
	initialize: function() {
//console.trace();
	
		if (!this.subscribed && this._shouldInitialize()) {
		
			this.subscribe("/davinci/states/state/changed", function(e) { 
				if(e.editorClass){
					// Event targets one of Maqetta's editors, not from runtime events
					return;
				}
				var children = davinci.states._getChildrenOfNode(e.node);
				while (children.length) {
					var child = children.shift();
					if (!davinci.states.isContainer(child)) {
						children = children.concat(davinci.states._getChildrenOfNode(child));
					}
					davinci.states._update(child, e.oldState, e.newState);
				}
			});
			
			this.subscribed = true;
		}
	}
};


if (typeof dojo != "undefined") {
	//	dojo.provide("workspace.maqetta.States");
	// only include the regular parser if the mobile parser isn't available
	if (! dojo.getObject("dojox.mobile.parser.parse")) {
		dojo.require("dojo.parser");
	}
//	var zclass = dojo.declare("workspace.maqetta.States", null, davinci.states);	
}
davinci.states = new davinci.States();

(function(){

	if (davinci.states._shouldInitialize()) {
	
		davinci.states.initialize();
		
		// Patch the dojo parse method to preserve states data
		if (typeof require != "undefined") {
			require(["dojo/_base/lang", "dojo/query", "dojo/domReady!"], function(lang, query) {
				var cache = {}; // could be local to hook function?
				var alreadyHooked = false;

				// hook main dojo.parser (or dojox.mobile.parser, which also
				// defines "dojo.parser" object)
				// Note: Uses global 'dojo' reference, which may not work in the future
				var hook = function(parser) {
					if(!alreadyHooked){
						var parse = parser.parse;
						dojo.parser.parse = function() {
							_preserveStates(cache);
							var results = parse.apply(this, arguments);
							_restoreStates(cache);
							return results;
						};
						alreadyHooked = true;
					}
				};
				// only include the regular parser if the mobile parser isn't available
				var parser = lang.getObject("dojox.mobile.parser.parse");
				if (!parser) {
					require(["dojo/parser"], hook);
				} else {
					hook.apply(parser);
				}

				/**
				 * Preserve states specified on widgets.
				 * Invoked from code above that wraps the dojo parser such that
				 * dojo parsing is sandwiched between calls to _preserveStates and _restoreStates.
				 */
				var _preserveStates = function (cache) {
					var count=0;
					var prefix = 'maqTempClass';
//console.trace();
					var doc = davinci.states.getDocument();
	
					// Preserve the body states directly on the dom node
					if(!doc.body._maqAlreadyPreserved){
						var states = davinci.states.retrieve(doc.body);
						if (states) {
							cache.body = states;
						}
						doc.body._maqAlreadyPreserved = true;
					}
	
					// Preserve states of children of body in the cache
					//FIXME: why can't we just query for nodes that have this.ATTRIBUTE?
					query("*", doc).forEach(function(node){
						// Because Dojo parser gets called recursively (multiple times), 
						// but preserveStates/restoreStates go through entire document,
						// make sure the current node hasn't already been preserved
						if(!node._maqAlreadyPreserved){
							node._maqAlreadyPreserved = true;
							var states = davinci.states.retrieve(node);
							if (states) {
								if (node.tagName != "BODY") {
									var tempClass = prefix+count;
									node.className = node.className + ' ' + tempClass;
									count++;
									cache[tempClass] = {};
									cache[tempClass].states = states;
									if(node.style){
										cache[tempClass].style = node.style.cssText;
									}else{
										// Shouldn't be here
										console.error('States.js _preserveStates. No value for node.style.')
									}
								}
							}
						}
					});
				};
	
				/**
				 * Restore widget states from cache
				 * Invoked from code below that wraps the dojo parser such that
				 * dojo parsing is sandwiched between calls to _preserveStates and _restoreStates.
				 */
				var _restoreStates = function (cache) {
//console.trace();
					var doc = davinci.states.getDocument(),
						currentStateCache = [];
					for(var id in cache){
						var node;
						if(id == 'body'){
							node = doc.body;
						}else{
							node = doc.querySelectorAll('.'+id)[0];
							if(node){
								node.className = node.className.replace(' '+id,'');
							}
							
						}
						if (!node) {
							console.error("States: Failed to get node by id: ", id);
						}
						// BODY node has app states directly on node.states. All others have it on node.states.style.
						var states = davinci.states.deserialize(node.tagName == 'BODY' ? cache[id] : cache[id].states);
						delete states.current; // FIXME: Always start in normal state for now, fix in 0.7
						davinci.states.store(node, states);
						if(node.tagName != 'BODY'){
							davinci.states.transferElementStyle(node, cache[id].style);
						}
						delete cache[id];
					}
				};
					
				var _getTemporaryId = function (node) {
					if (!node || node.nodeType != 1) {	// 1== Element
						return undefined;
					}
					var type = (node.getAttribute("dojoType") || node.nodeName.toLowerCase());
					type = type ? type.replace(/\./g, "_") : "";
					return dijit.getUniqueId(type);
				};
			});
		}
	}
})();

/*FIXME: Temporarily comment out overlay widget logic

// Bind to watch for overlay widgets at runtime.  Dijit-specific, at this time
if (!davinci.Workbench && typeof dijit != "undefined"){
	davinci.states.subscribe("/davinci/states/state/changed", function(args) {
		var w;
		if (args.newState && !args.newState.indexOf("_show:")) {
			w = dijit.byId(args.newState.substring(6));
			w && w.show && w.show();
		} else if (args.oldState && !args.oldState.indexOf("_show:")) {
			w = dijit.byId(args.oldState.substring(6));
			w && w.hide && w.hide();
		}
	});
}
*/
