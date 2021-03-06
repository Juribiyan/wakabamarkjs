var WM = function() {
	this.tags = [];
	this.bypasstags = [];
	this.lists = [];
	
	this.options = {
		makeLinks: false,
		bypass: true,
		greenquoting: true,
		makeEmbeds: true,
		makeLists: true,
		reduceNewlines: true
	};
	
	this.clinks = {
		exp: /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(?=\s+|<|$)/gi,
		rep: "<a href='$1'>$1</a>"
	};
	
	this.escapechars = [
		[/\'/g, '&#039;'],
		[/\"/g, '&quot;'],
		[/</g, '&lt;'], 
		[/\>/g, '&gt;'],
		[/&/g, '&amp;'],
	];
	
	this.escRX = function(exp) {
		return exp.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	};
	
	// var picl = [];
	
	this.escHTML = function(string) {
		for (var i = this.escapechars.length - 1; i >= 0; i--) {
			string = string.replace(this.escapechars[i][0], this.escapechars[i][1]);
		}
		return string;
	};

	this.newTag = function(pattern, replace, inline) {
		if(typeof inline === "undefined") inline = false;
		for (var i = 0; i <= 1; i++) {
			pattern[i] = this.escRX(this.escHTML(pattern[i]));
		}
		var capture = inline ? '((?:(?!<br(?: \/)?>).)*)' : '([\\s\\S]+?)';
		var exp = new RegExp(pattern[0]+capture+pattern[1], "mg");
		return {exp: exp, rep: replace[0]+"$1"+replace[1]};
	};
	
	this.apply = function(str) {
		var tag = {};
		
		//html escape
		str = this.escHTML(str);
		
		//Bypass 
		if(this.options.bypass) {
			for (var i = this.bypasstags.length - 1; i >= 0; i--) {
				tag = this.bypasstags[i];
					str = str.replace(tag.exp, function(match, p1, offset, s) {
						var tagescapechars = [
							[/\*/mg, '&#42;'], 
							[/_/mg, '&#95;'],
							[/\[/mg, '&#91;'], [/\]/mg, '&#93;'],
							[/%/mg, '&#37;'],
							[/\&gt;/g, '&#62;'],
							[/~/g, '&#126;'], 
							[/\//mg, '&#47;'], [/:/mg, '&#58;'], [/\./mg, '&#46;'],
							[/\#/mg, '&#35;' /*MUST BE LAST*/],
						];
						var after;
						for (var j = tagescapechars.length - 1; j >= 0; j--) {
							after = p1.replace(tagescapechars[j][0], tagescapechars[j][1]);
							// console.log('before: '+p1+', after: '+after)
							p1 = after;
						}
						return tag.rep.split('$1')[0]+p1+tag.rep.split('$1')[1];
					});
			}
		}
		
		//>implying
		if(this.options.greenquoting) {
			//var result = "";
			str = str.replace(
				/^(?:\&gt;)([^\r\n]+)/mg, 
				'<span class="unkfunc">\&gt;$1</span>'
			);
		}

		//lists
		if(this.options.makeLists) {
			for (i = this.lists.length - 1; i >= 0; i--) {
			tag = this.lists[i];
			var xp = new RegExp('((?:(?:(?:^'+tag.exp+')(?:[^\\r\\n]+))(?:\\r|\\n?))+)', "mg");
			var ixp = new RegExp('(?:'+tag.exp+')([^\\r\\n]+)', "mg");
			str = str.replace(xp, function(match, p1, offset, s) {
				var p = p1;
				var list = p.split('\n'), result=tag.rep[0];
				arr_iterate(list, function(elem) {
				result += elem.replace(ixp, "<li>$1</li>");
				});
				result += tag.rep[1];
				return(result);
			});
			}
		}
		
		str = str.replace(/(\r\n|\n\r|\r|\n)/mg,"<br />");
			
			if(this.options.reduceNewlines) {
				str = str.replace(/(<br \/>){2,}/mg,"<br /><br />");
			}
			
		//apply formatting
		for (i = this.tags.length - 1; i >= 0; i--) {
			tag = this.tags[i];
			str = str.replace(tag.exp, tag.rep);
		}
		
		//rghost
		if(this.options.makeEmbeds) {
			str = str.replace(/(?:\[\:)([0-9]+)(?:\:\])/mg, 
		'<a class="rgh-link" data-nextpic="http://rghost.ru/$1/image.png" href="http://rghost.ru/$1.view"><img src="http://rghost.ru/$1/thumb.png"></img></a>');
		}

		//make links clickable
		if(this.options.makeLinks) {
			str = str.replace(this.clinks.exp, this.clinks.rep);
		}
		//try linkify
		str = linkify(str);
		
		return str;
	};
	
	this.registerTags = function(tags, destination, inline) {
	var tag = [];   var result, i;
	if(typeof inline === "undefined") inline = false;
	if(destination === 'lists') {
		for (i = tags.length - 1; i >= 0; i--) {
			tag = tags[i];
			result = this.escRX(this.escHTML(tag[0]));
			this.lists.push({exp: result, rep: tag[1]});
		}
	}
	else for (i = tags.length - 1; i >= 0; i--) {
		tag = tags[i];
		result = this.newTag(tag[0], tag[1], inline);
		if(destination === 'bypass') {
			this.bypasstags.push(result);
		}
		else this.tags.push(result);
	}
	};
};
function arr_iterate(array, callback) {
	var i=0, len = array.length;
	for ( ; i < len ; i++ ){
		callback(array[i]);
	}
}

var headers = [
	[['######','######'], ['<h6>','</h6>']],
	[['#####','#####'],	  ['<h5>','</h5>']],
	[['####','####'],	  ['<h4>','</h4>']],
	[['###','###'],		  ['<h3>','</h3>']],
	[['##','##'],		  ['<h2>','</h2>']],
];

var wm_tags = [
	[['**','**'],		['<b>','</b>']],
	// [['__','__'],		['<b>','</b>']],
	[['*','*'],		    ['<i>','</i>']],
	// [['_','_'],		    ['<i>','</i>']],
];

var inlineQ = [[['>','<'],		 ['<span class="unkfunc inline-unkfunc">&gt;','</span>']]];

var quote_tags = [
	[['[q]','[/q]'], ['<blockquote>','</blockquote>']],
	[['[quote]','[/quote]'], ['<blockquote>','</blockquote>']],
];

var ku_tags = [
	[['[b]','[/b]'],	['<b>','</b>']],
	[['[i]','[/i]'],	['<i>','</i>']],
	[['[u]','[/u]'],	['<span style="text-decoration: underline">','</span>']],
	[['[s]','[/s]'],	['<strike>','</strike>']],
	[['~~','~~'],	['<strike>','</strike>']],
	[['%%','%%'],		['<span class="spoiler">','</span>']],
	[['[spoiler]','[/spoiler]'],		['<span class="spoiler">','</span>']],
	[['[aa]','[/aa]'],	['<span style="font-family: Mona,\'MS PGothic\' !important;">','</span>']]
];

var my_ul_tags = [
	[['__','__'],	['<span style="text-decoration: underline">','</span>']],
];

var bypass_tags = [
	[['[code]','[/code]'],	['<pre class="code">','</pre>']],
	[['`','`'],	            ['<pre class="inline code">','</pre>']]
];

var lists = [
	["* ", ["<ul>","</ul>"]],
	["# ", ["<ol>","</ol>"]]
];

var wm = new WM();

wm.registerTags(inlineQ, 'tag', 'inline');
wm.registerTags(wm_tags);
wm.registerTags(ku_tags);
wm.registerTags(my_ul_tags);
wm.registerTags(headers);
wm.registerTags(quote_tags); 
wm.registerTags(bypass_tags, 'bypass');
wm.registerTags(lists, 'lists');
