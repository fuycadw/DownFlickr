const apiUrl = "http://api.flickr.com/services/rest/?method=";
const apiKeyParam = "&api_key=07e391a86e66960a7449ea81d0d9cd48";

const perPage = "&per_page=30";
var page = 1;

/**
 * Get all picture sizes and create thumbnail
 */
function getPicture(id)
{
	$.ajax({
		url: apiUrl + 'flickr.photos.getSizes&photo_id=' + id + apiKeyParam,
		dataType: "xml",

		success: function(xml) {

			var thumbUrl = $(xml).find('size').first().attr('source');
			var bigUrl = $(xml).find('size').last().attr('source');

			if( thumbUrl && bigUrl )
			{

				var img = document.createElement("image");
				img.src = thumbUrl;

				var link = document.createElement("a");
				link.href = bigUrl;
				link.target = "_blank";
				$(link).click(function() {
					// Used to, maybe, replace the URL when clicking with the download URL
					link.href = getPhotoURL( link.href );
				});

				link.appendChild(img);
				$("#imgContainer").append(link);

				$("#imgContainer").show();
				$("#disclaimer").show();

			}

		}

	});
}

/**
 * Get all pictures inside some Photoset
 */
function getPhotoset(id)
{
	$.ajax({
		url: apiUrl + 'flickr.photosets.getPhotos&media=photos&photoset_id=' + id + perPage + "&page=" + page + apiKeyParam,
		dataType: "xml",

		success: function(xml) {

			$(xml).find('photo').each(function(){
				getPicture( $(this).attr('id') );
			});

			page++;
			$("#setOk").html("+30");

		}

	});
}

/**
 * Get the URL to open or download the big photo
 */
function getPhotoURL(url)
{
	if( $("#auto").attr('checked') )
	{
		var urlArr = url.split(".");
		urlArr[urlArr.length - 2] += "_d";
		return urlArr.join(".");
	}

	return url;
}

/**
 * Button handlers
 */
$(document).ready(function()
{
	// Photo "Get" button
	$("#photoOk").click(function()
	{
		if( $("#photoId").attr('value') )
		{
			getPicture( $("#photoId").attr('value') );
		}
	});

	// Set "Get" button
	$("#setOk").click(function()
	{
		if( $("#setId").attr('value') )
		{
			getPhotoset( $("#setId").attr('value') );
		}
	});

	// Reset the page and the Set button
	$("#setId").keydown(function() {
		page = 1;
		$("#setOk").html("Get");
	});

	// Open all photos
	$("#openAll").click(function()
	{
		var imgs = [];

		$("img").each(function() {
			imgs.push( getPhotoURL( $(this).parent().attr("href") ) );
		});

		if( imgs.length > 0 )
		{
			chrome.extension.sendRequest({msg: "openAllPhotos", imgs: imgs});
		}
	});

	// Clear photos
	$("#clear").click(function()
	{
		$("img").each(function() {
			$(this).parent().remove();
		});

		page = 1;
		$("#setOk").html("Get");
	});
});

/**
 * Get the ID from the URL, when possible
 */
chrome.tabs.getSelected(null, function(tab) {

	if( tab.url.indexOf('flickr.com\/photos') > -1 )
	{
		var urlParts = tab.url.split("/");

		// Set
		if( urlParts[5] == "sets")
		{
			$("#setId").attr('value', urlParts[6]);
		}
		// Photo
		else if( urlParts.length >= 6 )
		{
			$("#photoId").attr('value', urlParts[5]);
		}

	}


});