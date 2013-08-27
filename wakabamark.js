var WM = function() {
    this.tags = [];
    
    this.options = {
        makeLinks: true,
        negation: true,
        greenquoting: true
    }
    
    this.clinks = {
        exp: /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(?=\s+|$)/gi,
        rep: "<a href='$1'>$1</a>"
    }
    
    this.escapechars = [
        [/\'/g, '&#039;'],
        [/\"/g, '&quot;'],
        [/</g, '&lt;'], 
        [/\>/g, '&gt;'],
    ];
    
    this.negationtags = [
        /`([\s\S]+?)`/gm,
        /\[code\]([\s\S]+?)\[\/code\]/gm,  
    ];
    
	this.newTag = function(pattern, replace) {
		for (var i = 0; i <= 1; i++) {
			pattern[i] = pattern[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		}
		var exp = new RegExp(pattern[0]+'([\\s\\S]+?)'+pattern[1], "mg");
        return {exp: exp, rep: replace[0]+"$1"+replace[1]};
	};
	
	this.addTag = function (pattern, replace) {
	    this.tags.push(this.newTag(pattern, replace));
	}
	
	this.apply = function(str) {
		var tag = {};
		
		if(this.options.negation) {
		    for (var i = this.negationtags.length - 1; i >= 0; i--) {
                str = str.replace(this.negationtags[i], function(match, p1, offset, s) {
            	    var tagescapechars = [
                        [/\*/mg, '&#42;'],
                        [/_/mg, '&#95;'],
                        [/\[/mg, '&#91;'], [/\]/mg, '&#93;'],
                        [/%/mg, '&#37;'],
                        [/\>/g, '&#62;'],
                    ];
                    for (var j = tagescapechars.length - 1; j >= 0; j--) {
                        p1 = p1.replace(tagescapechars[j][0], tagescapechars[j][1]);
                    }
                    return p1;
                });
    		}
		}
		
		for (i = this.escapechars.length - 1; i >= 0; i--) {
    		str = str.replace(this.escapechars[i][0], this.escapechars[i][1]);
    	}
		
		if(this.options.makeLinks) {
		    str = str.replace(this.clinks.exp, this.clinks.rep);
		}
		
		if(this.options.greenquoting) {
		    str = str.replace(
		        /(?:\&gt;)([^\r\n]+)(?:(?:\r|\n)?)/mg, 
		        "<span class=\"unkfunc\">\&gt;$1</span>"
		    );
		}
		
		for (i = this.tags.length - 1; i >= 0; i--) {
			tag = this.tags[i];
			str = str.replace(tag.exp, tag.rep);
		}
		return str;
	};
	
	this.registerTags = function(tags, destination) {
		tag = [];
		for (var i = tags.length - 1; i >= 0; i--) {
			tag = tags[i];
			this.tags.push(this.newTag(tag[0], tag[1]));
		}
	};
};


var wm_tags = [
	[['**','**'],		['<b>','</b>']],
	[['__','__'],		['<b>','</b>']],
	[['*','*'],		    ['<i>','</i>']],
	[['_','_'],		    ['<i>','</i>']],
];

var ku_tags = [
	[['[b]','[/b]'],	['<b>','</b>']],
	[['[i]','[/i]'],	['<i>','</i>']],
	[['[u]','[/u]'],	['<span style="text-decoration: underline">','</span>']],
	[['[s]','[/s]'],	['<strike>','</strike>']],
	[['%%','%%'],		['<span class="spoiler">','</span>']],
	[['[aa]','[/aa]'],	['<span style="font-family: Mona,\'MS PGothic\' !important;">','</span>']]
];


var wm = new WM();

wm.registerTags(wm_tags);
wm.registerTags(ku_tags);
