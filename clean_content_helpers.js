/*
constants for visual clarity in part 1, to be removed/replaced in part 2
*/
const footnote_marker = "==FOOTNOTE-HERE=="
const italic_open_marker = "{ITALICS-OPEN}"
const italic_close_marker = "{ITALICS-CLOSE}"
const bold_open_marker = "{BOLD-OPEN}"
const bold_close_marker = "{BOLD-CLOSE}"
const fr_placeholder_sup_no = "n_sup_o_placeholder"
const fr_placeholder_sup_no_cap = "n_cap_sup_o_placeholder"

/*
helper functions to work with tag contents in both part 1 and part 2
*/

// general spacing cleaning function
function format_spacing(html_line) {
	// make space hexcode consistent
	let cleaned = replace_invisible_nbsp(html_line);
	// remove double spaces
	cleaned = rm_multispace(cleaned);
	// remove windows newlines
	cleaned = cleaned.replaceAll("\r\n", "\n");
	// remove tags that only consist of spaces or nbsp
	cleaned = cleaned.replaceAll(/<[^/>]*>(( |\n)*(&nbsp;)*)*<\/[^>]*>/g, "");
	return cleaned;
}

// gets a list of a tag's contents
function get_tag_contents(html_str, tag) {
	const trimmed_tag = tag.trim();
	let tag_regex = new RegExp("<" + trimmed_tag + "(.*?)>((.|\n)*?)</" + trimmed_tag + ">", "g");
	let contents_list = [];
	// loop through instances of tag and return tag with contents
	let contents = tag_regex.exec(html_str);
	while (contents !== null) {
		contents_list.push(contents[0]);
		contents = tag_regex.exec(html_str);
	}
	return contents_list;
}

// removes all instances of a tag's contents
function rm_tag_contents(html_str, tag) {
	const trimmed_tag = tag.trim();
	let tag_regex = new RegExp("<" + trimmed_tag + "(.*?)>((.|\n)*?)</" + trimmed_tag + ">", "g");
	const replacement = "<" + trimmed_tag + "></" + trimmed_tag + ">";
	return html_str.replaceAll(tag_regex, replacement);
}
