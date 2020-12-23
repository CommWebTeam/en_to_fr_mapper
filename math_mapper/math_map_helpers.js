/*
=================================
Part 1 - get content
=================================
*/

// Get uploaded files and download their lists of contents
function create_content_lists() {
	// English
	// read in uploaded file as string
	let file_reader_en = new FileReader();
	let dirty_file_en = document.getElementById("dirty_en").files[0];
	file_reader_en.onload = function(event) {
		// clean string
		console.log("number of en values:");
		let values_en = strip_html(event.target.result);
		// download file
		download(values_en, "en_values.txt", "text/plain");
	}
	file_reader_en.readAsText(dirty_file_en);
	
	// French
	let file_reader_fr = new FileReader();
	let dirty_fr_file = document.getElementById("dirty_fr").files[0];
	file_reader_fr.onload = function(event) {
		console.log("number of fr values:");
		let values_fr = strip_html(event.target.result);
		download(values_fr, "fr_values.txt", "text/plain");
	}
	file_reader_fr.readAsText(dirty_fr_file);
}

/* Helper functions */

// formats html file and strips all of its tags to create a list of content values
function strip_html(html_str) {
	let html_arr = html_str.split('\n');
	// remove first few lines of html file
	html_arr = html_arr.slice(6, html_arr.length);
	// remove logiterms, ref links, toc links
	html_arr = html_arr.map(x => x.replaceAll(/<a name="lt_[a-zA-z0-9]+">(.*?)<\/a>/g, "$1"));
	html_arr = html_arr.map(x => x.replaceAll(/<a name="_Ref[a-zA-z0-9]+">(.*?)<\/a>/g, "$1"));
	html_arr = html_arr.map(x => x.replaceAll(/<a name="_Toc[a-zA-z0-9]+">(.*?)<\/a>/g, "$1"));
	// join consecutive bold and italics
	html_arr = html_arr.map(x => x.replaceAll(/<\/em>( *)<em>/g, "$1"));
	html_arr = html_arr.map(x => x.replaceAll(/<\/strong>( *)<strong>/g, "$1"));
	// replace special characters
	html_arr = html_arr.map(replace_special_chars);
	// make spacings consistent
	html_arr = html_arr.map(rm_extra_space);
	// get rid of tags
	html_arr = html_arr.map(rm_tags_all);
	// remove indents, list numberings, and empty lines
	html_arr = trim_arr(html_arr);
	html_arr = html_arr.map(rm_list);
	html_arr = rm_empty_lines(html_arr);
	html_arr = trim_arr(html_arr);
	// join array back into string and split it again to get actual list
	html_str_cleaned = html_arr.join('\n');
	html_arr = html_str_cleaned.split('\n');
	// remove empty lines
	html_arr = trim_arr(html_arr);
	html_arr = rm_empty_lines(html_arr);
  	// print number of elements in array
	console.log(html_arr.length);
	return html_arr.join('\n');
}