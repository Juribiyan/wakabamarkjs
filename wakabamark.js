// WAKABAMARK.JS

var WM = function() {
    this.tags = [];
	this.newTag = function(pattern, replace) {
		for (var i = 0; i <= 1; i++) {
			pattern[i] = pattern[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		};
		var exp = new RegExp(pattern[0]+'([\\s\\S]+?)'+pattern[1], "mg");
		this.tags.push({exp: exp, rep: replace[0]+"$1"+replace[1]});
	}
	this.apply = function(str) {
		var tag = {};
		for (var i = this.tags.length - 1; i >= 0; i--) {
			tag = this.tags[i];
			str = str.replace(tag.exp, tag.rep);
		};
		return str;
	}
}

var wm_tags = [
	[['**','**'],		['<b>','</b>']],
	[['*','*'],		['<i>','</i>']],
	[['[b]','[/b]'],	['<b>','</b>']],
	[['[i]','[/i]'],	['<i>','</i>']],
	[['[u]','[/u]'],	['<span style="text-decoration: underline">','</span>']],
	[['[s]','[/s]'],	['<strike>','</strike>']],
	[['%%','%%'],		['<span class="spoiler">','</span>']],
	[['[aa]','[/aa]'],	['<span style="font-family: Mona,\'MS PGothic\' !important;">','</span>']],
	[['**','**'],		['<b>','</b>']],
];

var wm = new WM();

var tag = [];
for (var i = wm_tags.length - 1; i >= 0; i--) {
	tag = wm_tags[i];
	wm.newTag(tag[0], tag[1]);
};
