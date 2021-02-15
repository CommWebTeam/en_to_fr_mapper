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
	// remove windows newlines
	let clean_html_str = html_str.replaceAll("\r\n", "\n");
	// use functions from basic_format to perform basic cleaning on Dreamweaver paste
	clean_html_str = remove_ref_links(clean_html_str);
	clean_html_str = remove_toc_links(clean_html_str);
	clean_html_str = remove_logiterms(clean_html_str);
	clean_html_str = join_em_strong(clean_html_str);
	clean_html_str = fix_fake_scripts(clean_html_str);
	clean_html_str = fix_fake_math(clean_html_str);
	// remove first few lines of html file
	let html_arr = clean_html_str.split('\n');
	html_arr = html_arr.slice(6, html_arr.length);
	// add placeholders for footnotes, italics, and bold if option is selected
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
	html_arr = html_arr.map(format_spacing);
	// get rid of tags
	html_arr = rm_tags(html_arr);
	// print number of elements in array
	console.log("Number of elements: " + html_arr.length);
	return html_arr.join('\n');
}
