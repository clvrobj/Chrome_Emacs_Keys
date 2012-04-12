//TODO: add multiple character control (e.g. "C-xx");
//TODO: reformat into a single object container
//TODO: move events inside this
//TODO: pop up bar for finding links
//TODO: toggle bindings on/off by page
//TODO: options page - all chrome bindings, set bindings, colors, excluded pages,
//TODO: Search - regex & string
//TODO: switch scrolling functions to jQuery
function Emacs_Controls(){
    var that = this;
    var links_class = "Emacs_Keys_Links",
    bar_id = "Emacs_Keys_Input",
    search_class = "Emacs_Keys_Search"

    this.cur = {};

    this.actions = {
	"scroll-to-bottom": function(){
	    window.scrollTo( window.scrollX, document.body.scrollHeight );
	},
	"scroll-to-top": function(){
	    window.scrollTo( window.scrollX, 0 );
	},
	"scroll-to-far-right": function(){
	    window.scrollTo( document.body.scrollWidth, window.scrollY );
	},
	"scroll-to-far-left": function(){
	    window.scrollTo( 0, window.scrollY );
	},
	"scroll-left": function(){
	    window.scrollBy( -15, 0 );
	},
	"scroll-right": function(){
	    window.scrollBy( 15, 0 );
	},
	"previous-line": function(){
	    window.scrollBy( 0, -15 );
	},
	"next-line": function(){
	    window.scrollBy( 0, 15 );	
	},
	"scroll-down": function(){
	    window.scrollBy( 0, parseInt((window.innerHeight * .75), 10 ) );
	},
	"scroll-up": function(){
	    window.scrollBy( 0, parseInt((window.innerHeight * -.75), 10 ) );
	},
	"find-links-this-tab": function(){
	    //find/num links
	    findLinks();
	    document.addEventListener( "keypress", linkEvents, true );
	},
	"find-links-new-tab": function(){
	    //find/num links
	    findLinks();
	    document.addEventListener( "keypress", linkEvents, true );
	},
	"search-page": function(){
	    //search page
	    toggleBar( "visible" );
	    bindBar( "search" );
	},
	"search-regex": function( re ){
	    //search page with regex
	    toggleBar( "visible" );
	    bindBar( "search" );
	},
	"execute-command": function(){
	    //execute one of these commands by hand
	    toggleBar( "visible" );
	    bindBar( "execute" );
	},
	"escape": function(){
	    //esc/C-g - to exit out of any of these
	    clearLinks();
	    toggleBar( "hidden" );
	    $(document).unbind("keypress");
	    that.cur = {};
	},
	"forward-history": function(){
	    window.history.go(1);
	},
	"back-history": function(){
	    window.history.go(-1);
	},
	"remove-tab": false,
	"next-tab": false,
	"refresh-tab": false,
	"previous-tab":false,
	"go-to-tab": false,
	"new-tab": false,
	"bookmark-page": false,
	"search-bookmarks": null
    };

    this.controls = {
	"<C-d>": "find-links-this-tab",
	"<C-D>": "find-links-new-tab",
	"<C-b>": "back-history",
	"<C-f>": "forward-history",
	"<C-p>": "previous-line",
	"<C-n>": "next-line",
	"<C-v>": "scroll-down",
	"<M-v>": "scroll-up",
	"<C-s>": "search-page",
	"<M-s>": "search-regex",
	"<M->>": "scroll-to-bottom",
	"<M-<>": "scroll-to-top",
	"<M-x>": "execute-command",
	"<C-g>": "escape",
	"<C-x>": "remove-tab",
	"<C-c>": "new-tab",
	"<M-n>": "next-tab",
	"<M-b>": "previous-tab",
	"<C-M-b>": "bookmark-page",
    };

    this.bar = {
	"search": function( ev ){
	    
	},
	"execute": function( ev ){

	}
    }

    function linkEvents( ev ){
	//get keycode value
	if( ev.ctrlKey || ev.altKey || ev.metaKey ){
	    return;
	} /*else if( ev.keyCode === 13 ){
	  //trigger first match on current input
	  //TODO: only matches numbers
	  var href;
	  if( that.cur.links[links_class + "_" + that.cur.str] ){
	  href = that.cur.links[links_class + "_" + that.cur.str].
	  el.attr( "href" );
	  } 
	  }*/
	var key = String.fromCharCode( ev.charCode );
	that.cur.str = (that.cur.str === undefined) ? key : that.cur.str + key;

	var arr = [];
	$.each( that.cur.links, function( key, val ){
	    if( key.search( new RegExp( links_class + "_" + that.cur.str + ".*" ) ) === -1 &&
		val.txt.search( that.cur.str ) === -1 ){
		$("#" + key ).remove();
		delete that.cur.links[key];
	    } else {
		arr.push( val );
	    }
	});

	//this needs to go back for new-tab/this-tab
	if( arr.length === 1 ){
	    window.location = arr[0].el.attr( "href" );
	}

    }

    function findLinks(){
	clearLinks();
	var y = window.scrollY, sc = $(window).height();
	$("a[href]:visible").filter(function(){
	    var el = $(this), pos = el.offset();
	    //on screen
	    if( pos.top < y || pos.top > (y + sc) ){
		return false;
	    }
	    //if it's not hidden
	    return el.css( "visibility" ) !== "hidden" && 
		el.css( "opacity" ) !== 0;
	}).each(function( i, el ){
	    el = $(el);
	    var pos = el.offset(),
	    div = $("<div/>",{
		"class": links_class,
		"value": el.text(),
		"id": links_class + "_" + i
	    });
	    that.cur.links[links_class + "_" + i] = {"el":el, "txt": el.text()};
	    div.css({
		"left": pos.left-5,
		"top": pos.top-5
	    }).text( i );
	    
	    $("body").prepend( div );
	});

    }

    function searchPage( opts ){
	var found = window.find( opts.str,(opts.sens||false),(opts.back||false), 
				 (opts.wrap||true),(opts.whole||false),
				 (opts.frames||true),(opts.dialog||true) );
	if( found ){
	    //do something
	}
    }

    function clearLinks(){
	that.cur.links = {};
	that.cur.str = "";
	$("." + links_class ).remove();
    }

    function toggleBar( which ){
	which = which || "";
	var el = $( "#" + bar_id );
	if( el.length > 0 ){
	    if( which === "visible" ){
		return true;
	    } else if( which === "hidden" ){
		el.remove();
	    }
	} else {
	    var div = $("<input/>", {
		"type": "text"
	    }).attr( "id", bar_id );
	    $("body").append( div );
	    div.focus();
	}
    }

    function bindBar( which ){
	if( bar.hasOwnProperty( which ) ){
	    $("#" + bar_id ).bind( "keydown", bar[which] );
	}
    }

}

Emacs_Controls.prototype = {
    //keys don't work correctly on windows/linux?
    "correctKeys": {
	"U+00C0": ["U+0060", "U+007E"], // `~
	"U+00BD": ["U+002D", "U+005F"], // -_
	"U+00BB": ["U+003D", "U+002B"], // =+
	"U+00DB": ["U+005B", "U+007B"], // [{
	"U+00DD": ["U+005D", "U+007D"], // ]}
	"U+00DC": ["U+005C", "U+007C"], // \|
	"U+00BA": ["U+003B", "U+003A"], // ;:
	"U+00DE": ["U+0027", "U+0022"], // '"
	"U+00BC": ["U+002C", "U+003C"], // ,<
	"U+00BE": ["U+002E", "U+003E"], // .>
	"U+00BF": ["U+002F", "U+003F"] // /?
    }
};

var emacs = new Emacs_Controls();

function registerEvent( ev ){
    var actions = emacs.actions,
    controls = emacs.controls,
    correctKeys = emacs.correctKeys;


    var keys = ev.ctrlKey ? "<C-" : "<";
    if( ev.altKey || ev.metaKey ){
	keys += "M-";
    }

    var key = ev.keyIdentifier;
    if( key.slice( 0, 2 ) !== "U+" ){
	return key;
    } else if( correctKeys.hasOwnProperty( key ) ){
	key = ev.shiftKey ? correctKeys[key][1] : correctKeys[key][0];
    }

    key = "0x" + key.slice( 2 );
    key = String.fromCharCode( parseInt( key, 16 ) );
    key = ev.shiftKey ? key : key.toLowerCase();
    keys += key + ">";

    if( controls.hasOwnProperty( keys ) ){
	var cmd = controls[keys];
	if( actions.hasOwnProperty( cmd ) ){
	    ev.preventDefault();
	    ev.stopPropagation();
	    if( actions[cmd] !== false ){
		actions[cmd]();
	    }  else {
		chrome.extension.sendRequest({"name": cmd},
					     function( resp ){
						 console.log( resp );
					     });
	    }
	}
    }	
}

document.addEventListener( "keydown", registerEvent, true );

