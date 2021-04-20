const footnote_marker = "==FOOTNOTE-HERE=="
const italic_open_marker = "{ITALICS-OPEN}"
const italic_close_marker = "{ITALICS-CLOSE}"
const bold_open_marker = "{BOLD-OPEN}"
const bold_close_marker = "{BOLD-CLOSE}"
const fr_placeholder_sup_no = "n_sup_o_placeholder"
const fr_placeholder_sup_no_cap = "n_cap_sup_o_placeholder"

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
		let values_en = strip_html(event.target.result, document.getElementById("insert_markers").checked, document.getElementById("remove_br").checked);
		// download file
		download(values_en, "en_values.txt", "text/plain");
	}
	file_reader_en.readAsText(dirty_file_en);
	
	// French
	let file_reader_fr = new FileReader();
	let dirty_fr_file = document.getElementById("dirty_fr").files[0];
	file_reader_fr.onload = function(event) {
		console.log("French - ");
		let values_fr = strip_html(event.target.result, document.getElementById("insert_markers").checked, document.getElementById("remove_br").checked);
		download(values_fr, "fr_values.txt", "text/plain");
	}
	file_reader_fr.readAsText(dirty_fr_file);
}

/* Helper functions */

// formats html file and strips all of its tags to create a list of content values
function strip_html(html_str, insert_markers, remove_br) {
	/*
	============================
	clean dreamweaver document
	============================
	*/
	// make spacings consistent
	let clean_html_str = replace_invisible_nbsp(html_str);
	clean_html_str = rm_multispace(clean_html_str);
	// remove br from tables if option is selected
	if (remove_br) {
		// remove empty tables
		clean_html_str = clean_html_str.replaceAll(/<table(.*?)>( |\n)*<\/table>/g, "");
		// get array of table contents
		let table_contents = get_tag_contents(clean_html_str, "table");
		// remove table contents from html
		clean_html_str = rm_tag_contents(clean_html_str, "table");
		// add table contents back in with <br> removed
		for (let i = 0; i < table_contents.length; i++) {
			let new_table_content = table_contents[i].replaceAll(/( |\n)*<br>( |\n)*/g, " ");
			clean_html_str = clean_html_str.replace("<table></table>", new_table_content);
		}
	}
	// replace n<sup>o</sup> with a placeholder (since it won't be mapped)
	clean_html_str = clean_html_str.replaceAll("n&lt;sup&gt;o&lt;/sup&gt;", fr_placeholder_sup_no);
	clean_html_str = clean_html_str.replaceAll("N&lt;sup&gt;o&lt;/sup&gt;", fr_placeholder_sup_no_cap);
	// use functions from basic_format to perform basic cleaning on Dreamweaver paste
	clean_html_str = rm_ref_links(clean_html_str);
	clean_html_str = rm_toc_links(clean_html_str);
	clean_html_str = rm_bookmark_links(clean_html_str);
	clean_html_str = rm_logiterms(clean_html_str);
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
	// check spacing consistency again
	html_arr = html_arr.map(format_spacing);
	/*
	============================
	create content list
	============================
	*/
	// get rid of tags
	content_arr = html_arr.map(x => x.replaceAll(/<.*?>/g, "\n"));
	// remove indents, list numberings, and empty lines
	content_arr = trim_arr(content_arr);
	content_arr = content_arr.map(rm_list);
	content_arr = rm_empty_lines(content_arr);
	content_arr = trim_arr(content_arr);
	// join array back into string and split it again to get actual list
	content_arr_str = content_arr.join('\n');
	content_arr = content_arr_str.split('\n');
	// remove empty lines
	content_arr = trim_arr(content_arr);
	content_arr = rm_empty_lines(content_arr);
	// get rid of contents that only consist of placeholders
	if (insert_markers) {
		for (let i = 0; i < content_arr.length; i++) {
			if (content_arr[i] === italic_open_marker || content_arr[i] === italic_close_marker ||
				content_arr[i] === bold_open_marker || content_arr[i] === bold_close_marker) {
				content_arr[i] = "";
			}
		}
		content_arr = rm_empty_lines(content_arr);
	}
	// print number of elements in array
	console.log("Number of elements: " + content_arr.length);
	return content_arr.join('\n');
}
