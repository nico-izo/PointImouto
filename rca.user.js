// ==UserScript==
// @name RCA Point Extension
// @namespace RCAPointExtension
// @description Simple yandex rich content AJAX getter
// @include http*://*point.im*
// @exclude http*://*point.im/statistics
// @run-at document-end
// @version 1.1.6.0
// @grant none
// ==/UserScript==

/**
 * @Project: ReferrerKiller.
 * @Licence: The MIT License.
 * @Author: Juan Pablo Guereca.
 * @Source: http://referrer-killer.googlecode.com/git/example.html
 */

var ReferrerKiller = (function () {
	var URL_REDIRECTION = "https://www.google.com/url?q=", // You can use another service if you use https protocol no referrer will be sent.
		PUB = {},
		IE_GT_8 = (function () {
				/*- Detecting if it's IE greater than 8 -*/
				var trident,
					match = navigator.userAgent.match(/Trident\/(\d)+/);
				if (null === match) {
					return false;
				}
				trident = parseInt(match[1], 10);
				if (isNaN(trident)) {
					return false;
				}
				return trident > 4;
		})();

	function escapeDoubleQuotes(str) {
		return str.split('"').join('\\"');
	}

	function htmlToNode(html) {
		var container = document.createElement('div');
		container.innerHTML = html;
		return container.firstChild;
	}

	function objectToHtmlAttributes(obj) {
		var attributes = [],
			value;
		for (var name in obj) {
			value = obj[name];
			attributes.push(name + '="' + escapeDoubleQuotes(value) + '"');
		}
		return attributes.join(' ');
	}

	function htmlString(html, iframeAttributes) {
		var iframeAttributes  = iframeAttributes || {},
			defaultStyles = 'border:none; overflow:hidden; ',
			id;
		/*-- Setting default styles and letting the option to add more or overwrite them --*/
		if ('style' in iframeAttributes) {
			iframeAttributes.style =  defaultStyles + iframeAttributes.style;
		} else {
			iframeAttributes.style = defaultStyles;
		}
		id = '__referrer_killer_' + (new Date).getTime() + Math.floor(Math.random()*9999);
		/*-- Returning html with the hack wrapper --*/
		return '<iframe \
				width="100%" height="100%" \
				style="border: 0px solid #ff0000;" \
				scrolling="no" \
				frameborder="no" \
				allowtransparency="true" ' +
			/*-- Adding style attribute --*/
			objectToHtmlAttributes( iframeAttributes ) +
			'id="' + id + '" ' +
			'	src="javascript:\'\
			<!doctype html>\
			<html>\
			<head>\
			<meta charset=\\\'utf-8\\\'>\
			<style>*{margin:0;padding:0;border:0; max-width: 100%;}</style>\
			</head>' +
			/*-- Function to adapt iframe's size to content's size --*/
			'<script>\
				 function resizeWindow() {\
					var elems  = document.getElementsByTagName(\\\'*\\\'),\
						width  = 0,\
						height = 0,\
						first  = document.body.firstChild,\
						elem;\
					if (first.offsetHeight && first.offsetWidth) {\
						width = first.offsetWidth;\
						height = first.offsetHeight;\
					} else {\
						for (var i in elems) {\
											elem = elems[i];\
											if (!elem.offsetWidth) {\
												continue;\
											}\
											width  = Math.max(elem.offsetWidth, width);\
											height = Math.max(elem.offsetHeight, height);\
						}\
					}\
					var ifr = parent.document.getElementById(\\\'' + id + '\\\');\
					ifr.height = height;\
					ifr.width2  = width;\
					ifr.style.maxWidth = \\\'100%\\\';\
				}\
			</script>' +
			'<body onload=\\\'resizeWindow()\\\'>\' + decodeURIComponent(\'' +
			/*-- Content --*/
			encodeURIComponent(html) +
		'\') +\'</body></html>\'"></iframe>';
	}

	/*-- Public interface --*/
	function linkHtml(url, innerHTML, anchorParams, iframeAttributes) {
		var html,
			urlRedirection = '';
		innerHTML = innerHTML || false;
		/*-- If there is no innerHTML use the url as innerHTML --*/
		if (!innerHTML) {
			innerHTML = url;
		}
		anchorParams = anchorParams || {};
		/*-- Making sure there is a target attribute and the value isn't '_self' --*/
		if (!('target' in anchorParams) || '_self' === anchorParams.target) {
			/*-- Converting _self to _top else it would open in the iframe container --*/
			anchorParams.target = '_top';
		}
		if (IE_GT_8) {
			urlRedirection = URL_REDIRECTION;
		}
		html = '<a rel="noreferrer" href="' + urlRedirection + escapeDoubleQuotes(url) + '" ' + objectToHtmlAttributes(anchorParams) + '>' + innerHTML + '</a>';
		return htmlString(html, iframeAttributes);
	}
	PUB.linkHtml = linkHtml;

	function linkNode(url, innerHTML, anchorParams, iframeAttributes) {
		return htmlToNode(linkHtml(url, innerHTML, anchorParams, iframeAttributes));
	}
	PUB.linkNode = linkNode;

	function imageHtml(url, imgAttributesParam) {
		var imgAttributes = imgAttributesParam || {},
		/*-- Making sure this styles are applyed in the image but let the possibility to overwrite them --*/
			defaultStyles = 'border:none; margin: 0; padding: 0';
		if ('style' in imgAttributes) {
			imgAttributes.style = defaultStyles + imgAttributes.style;
		} else {
			imgAttributes.style = defaultStyles;
		}
		return htmlString('<img src="' + escapeDoubleQuotes(url) + '" ' + objectToHtmlAttributes(imgAttributes) + '/>');
	}
	PUB.imageHtml = imageHtml;

	function imageNode(url, imgParams) {
		return htmlToNode(imageHtml(url, imgParams));
	}
	PUB.imageNode = imageNode;

	/*-- Exposing the module interface --*/
	return PUB;
})();

/* ReferrerKilled end */

/* Wrap begin */
(function($) {

var yandexRichContentTemplate = "<div class=\"yandex-rca\" style=\"overflow: hidden;\" > \
								 <div class=\"yandex-rca-image\" data-src=\"%IMAGE%\" style=\"max-width: 100%; float: left; width: 100%;\"></div> \
								 <b class=\"yandex-rca-title\">%TITLE%</b> \
								 <br/> \
								 <span class=\"yandex-rca-content\">%CONTENT%</span> \
								 <br/> \
								 <br/> \
								 </div>";
var blacklist = ["gelbooru.com", "www.zerochan.net", "zerochan.net"];
var fullblacklist = ["coub.com", "www.coub.com"];

/**
 * So, on one day Yandex changed algorythm and now it show no image for gelbooru.
 * But we have a fix! (kostyl')
 */
var yandexApocalypse = ["gelbooru.com"];

insertPreview = function(data, fail) {
	if($.inArray($(this)[0].hostname, fullblacklist) !== -1)
		return;

	// Fix for yandex madness

	if(fail) {
		var self = this;
		removeMe = true;

		var preview = data.getElementsByTagName("post")[0].attributes["file_url"].value;

		data = {};
		data.img = []
		data.img.push(preview);
	}


	var t = yandexRichContentTemplate;

	if(!fail) {
		try {
			data = JSON.parse(data);
		} catch(e) {}
	}

	t = t.replace("%IMAGE%", (typeof data.img !== "undefined")? data.img[0] : ""); // yep, I know
	t = t.replace("%TITLE%", (typeof data.title !== "undefined") ? data.title : "");
	t = t.replace("%CONTENT%", (typeof data.content !== "undefined") ? data.content : "");

	var obj = $(t);

	if(typeof data.img === "undefined")
		obj.find(".yandex-rca-image").hide();
	if($.inArray($(this)[0].hostname, blacklist) !== -1)
		obj.find(".yandex-rca-content, .yandex-rca-title").hide();
	if(typeof data.img !== "undefined") {
		var node = ReferrerKiller.imageNode(data.img[0]);
		obj.find(".yandex-rca-image").append(node);
	}
	obj.insertAfter(this);

};

var stupidSelector = "";

[
":not([href*='point'])",
":not([href^='#'])",
":not(.postimg)"
].forEach(function(value) {
	stupidSelector += value;
});

$(".post-content a" + stupidSelector).each(function() {
	var t = "//rca.yandex.com/?key=%KEY%&url=%targetURL%";

	t = t.replace("%KEY%", "rca.1.1.20141219T163423Z.e22cc9e6c9d87dfc.430106d5c2b36d39a416cd7680d809a3133da40a");
	t = t.replace("%targetURL%", encodeURIComponent($(this).attr("href")));
	var self = this;

	var fail = false;
	// Fix for yandex madness
	if($.inArray(this.hostname, yandexApocalypse) !== -1) {
		fail = true;
		var urlarr = this.href.match(new RegExp('^https?\\://(www\\.)?gelbooru\\.com\\/index\\.php\\?page\\=post&s\\=view&id=([0-9]+)', 'i'))

		if(!urlarr)
			fail = false;
		else
			t = "//acao-0x588.herokuapp.com/acao/gelbooru.com/index.php?page=dapi&s=post&q=index&id=" + urlarr[2];
	}

	$.get(t, function(data) {
		insertPreview.call(self, data, fail);
	});
});

})(window.$); /* Wrap end */
