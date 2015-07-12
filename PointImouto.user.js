// ==UserScript==
// @name PointImouto
// @namespace PointImouto
// @description Lightweight script for improving point.im interface
// @include http*://*point.im*
// @run-at document-end
// @version 0.1.1
// @grant none
// ==/UserScript==

(function($) {
	var metaStyle = "\
@import url(//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css);\
\
[class*='fa-']::before {\
	font-family: 'FontAwesome', sans-serif;\
}\
\
#left-menu [class*='fa-']::before { \
	position: relative;\
	font-size: 38px;\
	text-align: center;\
	line-height: 64px;\
	left: 12px;\
	opacity: 0.5;\
}\
\
#left-menu [class*='fa-']:hover::before { opacity: 0.6; }\
";

	// this is only for debug purposes only
	//$("head").append('<link rel="stylesheet" href="http://wtf.nico-izo.moe/pointimouto/PointImouto.css" type="text/css" />');


	var avatarUrl = "//point.im/avatar/%nickname%/40";

	var me = $("div#name h1").html();
	var avatar = avatarUrl.replace("%nickname%", me);

	metaStyle += "body #main-wrap #main #left-menu #menu-blog { background: url(" + avatar + ") no-repeat scroll 11px center; }";

	$("head").append("<style>" + metaStyle + "</style>");

	var menuLogout = $("#menu-logout");
	var menuProfile = $("#menu-profile");
	var menuSearch = $('<a class="fa-search" id="menu-search" href="/search"></a>');

	var menuAddPost = $('<a class="fa-plus-circle" id="add-message" href="#addPost"></a>');

	menuProfile.addClass("fa-wrench");
	menuLogout.addClass("fa-sign-out")

	var menu = $("#left-menu");
	var menuLast = $("#left-menu #menu-bookmarks");

	menuAddPost.click(function() {
		$("#new-post-label").click();
	});

	menuLast.after(menuLogout);
	menuLast.after(menuProfile);
	menuLast.after(menuSearch);
	menuLast.after(menuAddPost);

	$("#left-menu #menu-recent").addClass("fa-globe");
	$("#left-menu #menu-comments").addClass("fa-comment");
	$("#left-menu #menu-messages").addClass("fa-envelope");
	$("#left-menu #menu-bookmarks").addClass("fa-star-o");
	$("#left-menu #top-link").addClass("fa-arrow-circle-o-up");


	var imageTemplate = "<img class='realgif' src='%IMAGE%' style='max-width: 100%;' />";

	var toggleGif = function() {
		var previewImage = $(this).children().first();
		
		if($(this).hasClass("gif")) {
			previewImage.hide();
			if(!$(this).attr("data-inserted")) {
				$(imageTemplate.replace("%IMAGE%", $(this).attr("href"))).insertAfter(previewImage);
				
				$(this).attr("data-inserted", "true");
			} else {
				$(this).children(".realgif").show();
			}
			$(this).removeClass("gif");
		} else {
			$(this).children(".realgif").hide();
			previewImage.show();
			$(this).addClass("gif");
		}

		return false;
	};

	$(".postimg.gif").click(toggleGif);

})(window.$);
