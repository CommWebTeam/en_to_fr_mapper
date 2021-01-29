const marker_placeholder = "HEADERMARKERPLACEHOLDER"
const footnote_marker = "==FOOTNOTE-HERE=="
const italic_open_marker = "{ITALICS-OPEN}"
const italic_close_marker = "{ITALICS-CLOSE}"
const bold_open_marker = "{BOLD-OPEN}"
const bold_close_marker = "{BOLD-CLOSE}"

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
		console.log("English - ");
		let values_en = strip_html(event.target.result, document.getElementById("insert_markers").checked);
		// download file
		download(values_en, "en_values.txt", "text/plain");
	}
	file_reader_en.readAsText(dirty_file_en);
	
	// French
	let file_reader_fr = new FileReader();
	let dirty_fr_file = document.getElementById("dirty_fr").files[0];
	file_reader_fr.onload = function(event) {
		console.log("French - ");
		let values_fr = strip_html(event.target.result, document.getElementById("insert_markers").checked);
		download(values_fr, "fr_values.txt", "text/plain");
	}
	file_reader_fr.readAsText(dirty_fr_file);
}

/* Helper functions */

// formats html file and strips all of its tags to create a list of content values
function strip_html(html_str, insert_markers) {
	// if option is selected, insert markers in front of headers
	let header_html_str = html_str.replaceAll("\r\n", "\n");
	if (insert_markers) {
		const header_regex = /(<h[0-9]+)/g;
		let num_headers = count_regex(html_str, header_regex);
		console.log("Number of headers: " + num_headers);
		// newline followed by space indicates untouched header
		header_html_str = header_html_str.replaceAll(header_regex, "\n $1");
		// add markers in front of untouched headers one at a time
		for (let i = 0; i < num_headers; i++) {
			header_html_str = header_html_str.replace(/(\n )+(<h[0-9]+)/g, "\n" + i + marker_placeholder + i + "$2");
		}
	}
	let html_arr = header_html_str.split('\n');
	// remove first few lines of html file
	html_arr = html_arr.slice(6, html_arr.length);
	// remove logiterms, ref links, toc links
	html_arr = html_arr.map(x => x.replaceAll(/<a name="lt_[a-zA-z0-9]+">(.*?)<\/a>/g, "$1"));
	html_arr = html_arr.map(x => x.replaceAll(/<a name="_Ref[a-zA-z0-9]+">(.*?)<\/a>/g, "$1"));
	html_arr = html_arr.map(x => x.replaceAll(/<a name="_Toc[a-zA-z0-9]+">(.*?)<\/a>/g, "$1"));
	// join consecutive bold and italics
	html_arr = html_arr.map(x => x.replaceAll(/<\/em>( *)<em>/g, "$1"));
	html_arr = html_arr.map(x => x.replaceAll(/<\/strong>( *)<strong>/g, "$1"));
	// add placeholders for footnotes, italics, and bold
	if (insert_markers) {
		html_arr = html_arr.map(x => x.replaceAll(/<a href="#_ftn[0-9]+" name="_ftnref[0-9]+" title="">(.*?)<\/a>/g, "\n" + footnote_marker));
		html_arr = html_arr.map(x => x.replaceAll(/<em>/g, "\n" + italic_open_marker));
		html_arr = html_arr.map(x => x.replaceAll(/<\/em>/g, "\n" + italic_close_marker));
		html_arr = html_arr.map(x => x.replaceAll(/<strong>/g, "\n" + bold_open_marker));
		html_arr = html_arr.map(x => x.replaceAll(/<\/strong>/g, "\n" + bold_close_marker));
	}
	// replace special characters
	html_arr = html_arr.map(replace_special_chars);
	// make spacings consistent
	html_arr = html_arr.map(rm_extra_space);
	// get rid of tags
	html_arr = rm_tags(html_arr);
	// print number of elements in array
	console.log("Number of elements: " + html_arr.length);
	return html_arr.join('\n');
}
