const empty_line_placeholder = "EMPTYLINE123456789PLACEHOLDER"
const unmatchable_string_placeholder = "FILLER123456789PLACEHOLDER";
const math_open_placeholder = "MATHOPENPLACEHOLDER";
const math_close_placeholder = "MATHCLOSEPLACEHOLDER";

const footnote_marker_part2 = "==FOOTNOTE-HERE=="
const italic_open_marker_part2 = "{ITALICS-OPEN}"
const italic_close_marker_part2 = "{ITALICS-CLOSE}"
const bold_open_marker_part2 = "{BOLD-OPEN}"
const bold_close_marker_part2 = "{BOLD-CLOSE}"
const fr_placeholder_sup_no_part2 = "n_sup_o_placeholder"
const fr_placeholder_sup_no_cap_part2 = "n_cap_sup_o_placeholder"

/*
=================================
Part 2 - create french structure
=================================
*/
// Get lists of contents and replace English terms with French terms
function create_fr_html() {
	// file inputs - en content and fr content in that order
	let content_inputs = ["", ""];
	// read in content files as strings
	// english content
	let file_reader_content_en = new FileReader();
	let content_str_en = document.getElementById("content_en").files[0];
	file_reader_content_en.onload = function(event) {
		content_inputs[0] = event.target.result;
	}
	file_reader_content_en.readAsText(content_str_en);
    // french content
	let file_reader_content_fr = new FileReader();
	let content_str_fr = document.getElementById("content_fr").files[0];
	file_reader_content_fr.onload = function(event) {
		content_inputs[1] = event.target.result;
	}
	file_reader_content_fr.readAsText(content_str_fr);

	// compare english and french contents
	let file_reader_en_struct = new FileReader();
	let struct_str_en = document.getElementById("cleaned_en").files[0];
	file_reader_en_struct.onload = function(event) {
		// read in english and french contents, removing markers from part 1
		const en_contents = get_content_array(content_inputs[0]);
		const fr_contents = get_content_array(content_inputs[1]);
		// read in english structure
		let structure = replace_special_chars(event.target.result);
		structure = format_spacing(structure);
		// read in other inputs for matching contents to structure
		const min_cont_len = parseInt(document.getElementById("min_content_len").value);
		// replace english content in structure with french content
		new_structure = replace_en_with_fr(structure, en_contents, fr_contents, min_cont_len, document.getElementById("alpha_list").checked, document.getElementById("math_check").checked, document.getElementById("fix_multispace").checked, document.getElementById("fix_punct").checked);
		// download structure with french content
		download(new_structure, "fr_html.html", "text/html");
	}
	file_reader_en_struct.readAsText(struct_str_en);
}

/* Helper functions */

// convert string of contents into an array, removing markers/empty lines
function get_content_array(html_str) {
	// remove markers
	let html_str_no_markers = html_str.replaceAll(footnote_marker_part2, "").replaceAll(italic_open_marker_part2, "").replaceAll(italic_close_marker_part2, "").replaceAll(bold_open_marker_part2, "").replaceAll(bold_close_marker_part2, "");
	// add n<sup>o</sup> back in
	html_str_no_markers = html_str_no_markers.replaceAll(fr_placeholder_sup_no_part2, "n<sup>o</sup>").replaceAll(fr_placeholder_sup_no_cap_part2, "N<sup>o</sup>");
	// split into array
	let html_arr = html_str_no_markers.split("\n");
	// remove extra characters
	html_arr = trim_arr(html_arr);
	html_arr = html_arr.map(format_spacing);
	// replace empty array elements
	return replace_empty_lines(html_arr, empty_line_placeholder);
}

// extract mi, mo, mn from math
function extract_mi_str(math_html_str) {
	let mi_regex = /<m[ion].*?>(.*?)<\/m[ion]>/g;
	let content_regex_str = "";
	let contents = mi_regex.exec(math_html_str);
	while (contents !== null) {
		content_regex_str = content_regex_str + contents[1];
		contents = mi_regex.exec(math_html_str);
	}
	return content_regex_str;
}

// extract placeholder math tags from html string
function extract_math_tags(html_str) {
	// remove all values that aren't inside math tags
	init_non_math = new RegExp("^.*?" + math_open_placeholder, "g");
	middle_non_math = new RegExp(math_close_placeholder + ".*?" + math_open_placeholder, "g");
	end_non_math =  new RegExp("^(.*" + math_close_placeholder + ").*$", "g");
	return html_str.replaceAll(init_non_math, math_open_placeholder).replaceAll(middle_non_math, math_close_placeholder + math_open_placeholder).replaceAll(end_non_math, "$1");
}

// Get (hard-coded) tier for content lengths
function get_cont_len_tier(x) {
	if (x.length < 10) {
		return x.length;
	}
	if (x.length <= 15) { // 10 to 15
		return 15;
	}
	if (x.length <= 20) { // 16 to 20
		return 20;
	}
	if (x.length <= 30) { // 21 to 30
		return 30;
	}
	if (x.length <= 50) { // 31 to 50
		return 50;
	}
	if (x.length <= 75) { // 51 to 75
		return 75;
	}
	if (x.length <= 120) { // 76 to 120
		return 120;
	}
	if (x.length <= 200) { // 121 to 200
		return 200;
	}
	if (x.length <= 300) { // 201 to 300
		return 300;
	}
	if (x.length <= 500) { // 301 to 500
		return 500;
	}
	if (x.length <= 1000) { // 501 to 1000
		return 1000;
	}
	return 1001;
}

// Compare content lengths
function compare_content_len(a, b) {
	// set all numeric substrings to length 1
	const a_nonum = a.value.replaceAll(/[0-9]+/g, "1");
	const b_nonum = b.value.replaceAll(/[0-9]+/g, "1");
	// sort content indicating an extra tag (or tag start/end position) in the french content to the front
	// 1st index will contain "<" (since it's escaped to \<)
	if (a_nonum[1] === "<" && b_nonum[1] !== "<") {
		return -1;
	}
	if (a_nonum[1] !== "<" && b_nonum[1] === "<") {
		return 1;
	}
	// if both contents indicate an extra tag (or tag start/end position), sort by reverse position (so appending is done in reverse order)
	if (a_nonum[1] === "<" && b_nonum[1] === "<") {
		return b.position - a.position;
	}
	// for regular content, sort by tiers of substring length, then position
	let a_len = get_cont_len_tier(a_nonum);
	let b_len = get_cont_len_tier(b_nonum);
	if (a_len === b_len) {
		return a.position - b.position;
	}
	return b_len - a_len;
}

// Replace English substrings with French substrings
function replace_en_with_fr(en_structure, en_contents, fr_contents, min_cont_len, alpha_list, math_check, fix_multispace, fix_punct) {
	const ncontents = Math.min(en_contents.length, fr_contents.length);
	let unmatched_lines = 0;
	console.log("Unmatched lines (first 100):");
	/*
	============================
	format structure and deal with math
	============================
	*/
	let cleaned_structure = replace_special_chars(en_structure).replaceAll("\r\n", "\n");
	// remove empty math equations
	const empty_math = "<math></math>";
	let no_empty_math_structure = cleaned_structure.replaceAll(empty_math, "");
	// get array of math contents
	let math_contents = get_tag_contents(no_empty_math_structure, "math");
	// remove math contents from structure
	let no_math_structure = rm_tag_contents(no_empty_math_structure, "math");
	// if math isn't checked for, leave math removed for now; otherwise, add math without newlines back in
	if (math_check) {
		for (let i = 0; i < math_contents.length; i++) {
			let curr_math_content = math_contents[i].replaceAll("\n", "");
			no_math_structure = no_math_structure.replace(empty_math, curr_math_content);
		}
	}
	// replace math tags with placeholder strings
	no_math_structure = no_math_structure.replaceAll("<math>", math_open_placeholder);
	no_math_structure = no_math_structure.replaceAll("</math>", math_close_placeholder);
	/*
	============================
	create multiple structures to keep track of cleaned french
	============================
	*/
	// one to return
	let struct_lines = no_math_structure.split("\n");
	// one to keep track of which lines have been edited
	let struct_lines_placeholder = no_math_structure.split("\n");
	// one with math removed
	let math_placeholder_regex = new RegExp(math_open_placeholder + "(.*?)" + math_close_placeholder, "g");
	let struct_lines_no_math = no_math_structure.replaceAll(math_placeholder_regex, "").split("\n");
	// one with math reduced to its values
	let struct_lines_reduced_math = no_math_structure.replaceAll(math_placeholder_regex, function(match, capture) {
		return extract_mi_str(capture);
	}).split("\n");
	// Note that the two math-related structures are not edited alongside the placeholder structure for the sake of simplicity, which could be problematic since we don't keep track of when they're edited, but ideally they're rare enough edge cases that it shouldn't be a big deal
	/*
	============================
	format en contents and convert to regex
	============================
	*/
	// reformat regex chars
	let en_contents_orig = en_contents.map(replace_special_chars);
	let en_contents_regex = en_contents_orig.map(escape_regex_chars);
	// make nbsp optional
	en_contents_regex = en_contents_regex.map(x => x.replaceAll("&nbsp;", "(?:&nbsp;)* *"));
	/*
	============================
	sort content by length
	============================
	*/
	let content_len = [];
	for (let i = 0; i < ncontents; i++) {
		content_len.push({position: i, value: en_contents_regex[i].trim()});
	}
	content_len.sort(compare_content_len);
	// loop through english content and get its index in remaining structure
	for (i = 0; i < ncontents; i++) {
		let posn = content_len[i].position;
		let curr_content = content_len[i].value;
		let curr_content_orig = en_contents_orig[posn].trim();
		/*
		============================
		get equivalent french content
		============================
		*/
		// get equivalent french content
		let equiv_fr_content = fr_contents[posn];
		// if first character in english content is <, indicating extra french tag (or differing tag start/end position), append french content at current index with tags to french content at previous index
		if (curr_content[1] === "<") {
			let extra_tag = curr_content;
			// remove escapes
			extra_tag = extra_tag.replaceAll("\\", "");
			// replace specific shorthands
			extra_tag = extra_tag.replace("<oti", '<span class="osfi-txt--italic"');
			extra_tag = extra_tag.replace("</oti", '</span');
			extra_tag = extra_tag.replace("<otb", '<span class="osfi-txt--bold"');
			extra_tag = extra_tag.replace("</otb", '</span');
			extra_tag = extra_tag.replace("<L<", '</span');
			extra_tag = extra_tag.replace("<L", '<span class="osfi-txt--italic"');
			extra_tag = extra_tag.replace("<><", '</cite');
			extra_tag = extra_tag.replace("<>", '<cite');
			// add > if needed
			if (extra_tag.slice(-1) !== ">") {
				extra_tag = extra_tag + ">";
			}
			// if extra tag indicates a later start tag in french contents, prepend current french content to next french content instead
			if (extra_tag[1] === "!" && extra_tag[2] === "l") {
				fr_contents[posn + 1] = equiv_fr_content + extra_tag + fr_contents[posn + 1];
				continue;
			}
			// otherwise, append current french content to previous french content
			fr_contents[posn - 1] = fr_contents[posn - 1] + extra_tag + equiv_fr_content;
			continue;
		}
		// escape $ from french content
		equiv_fr_content = equiv_fr_content.replaceAll("$", "$$$");
		// add superscripts for lists
		equiv_fr_content = equiv_fr_content.replaceAll(/\b1er\b/g, "1<sup>er</sup>");
		equiv_fr_content = equiv_fr_content.replaceAll(/\b([0-9]+)e\b/g, "$1<sup>e</sup>");
		/*
		============================
		full values
		============================
		*/
		// check for fully matching tag/newline/sentence first
		let newline_match = new RegExp("((^|>) *)" + curr_content + "( *($|<))", "g");
		let content_ind = regex_ind(struct_lines_placeholder, newline_match);
		// if match is found, change structure value and set struct counter
		if (content_ind > -1) {
			struct_lines[content_ind] = struct_lines[content_ind].replace(newline_match, "$1" + equiv_fr_content + "$3");
			struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(newline_match, unmatchable_string_placeholder);
			continue;
		}
		let word_match = new RegExp("(^|[^a-zA-Z0-9])" + curr_content + "($|[^a-zA-Z0-9])", "gi");
		if (curr_content.length >= min_cont_len) {
			// check for partial match where content is found in tag/line, but tag/line doesn't consist entirely of it
			content_ind = regex_ind(struct_lines_placeholder, word_match);
			// if match is found, change structure value and set struct counter
			if (content_ind > -1) {
				struct_lines[content_ind] = struct_lines[content_ind].replace(word_match, "$1" + equiv_fr_content + "$2");
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(word_match, unmatchable_string_placeholder);
				continue;
			}
		}
		/*
		============================
		remove list numberings
		============================
		*/
		// only assume it's a list value if there are letters
		if (/[a-zA-Z]/g.test(curr_content) && (curr_content.length >= min_cont_len)) {
			// check for match after each list numbering formatting is removed
			let content_no_list = curr_content.replace(/^(\\\([0-9IiVv]*\\\) *)*/g, "").replace(/^([0-9IiVv]*\\\.[0-9IiVv]* *)*/g, "").replace(/^([0-9IiVv]*-[0-9IiVv]* *)/g, "");
			let list_match = new RegExp("((^|>) *)(\\(*[0-9IiVv]*[\\.\\)-][0-9IiVv]* *)*" + content_no_list + "( *($|<))", "gi");
			content_ind = regex_ind(struct_lines_placeholder, list_match);
			// if match is found, change structure value and set struct counter
			if (content_ind > -1) {
				struct_lines[content_ind] = struct_lines[content_ind].replace(list_match, "$1" + equiv_fr_content + "$4");
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(list_match, unmatchable_string_placeholder);
				continue;
			}
			// if alpha list option is selected, check for those as well
			if (alpha_list) {
				let content_no_alpha_list = curr_content.replace(/^(\\\([a-z]*\\\) *)*/g, "").replace(/^([a-z]*\\\.[0-9Ii]* *)*/g, "");
				let alpha_list_match = new RegExp("((^|>) *)(\\(*[a-z]*[\\.\\)][a-z]* *)*" + content_no_alpha_list + "( *($|<))", "gi");
				content_ind = regex_ind(struct_lines_placeholder, alpha_list_match);
				// if match is found, change structure value and set struct counter
				if (content_ind > -1) {
					struct_lines[content_ind] = struct_lines[content_ind].replace(alpha_list_match, "$1" + equiv_fr_content + "$4");
					struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(alpha_list_match, unmatchable_string_placeholder);
					continue;
				}
			}
		}
		/*
		============================
		disregard spacing
		============================
		*/
		let space_match = new RegExp("((^|>) *)" + curr_content.replaceAll(" *", " ").replaceAll(" ", " *") + "( *($|<))", "gi");
		if (curr_content.length >= min_cont_len) {
			// check for match after spacing is disregarded
			content_ind = regex_ind(struct_lines_placeholder, space_match);
			// if match is found, change structure value and set struct counter
			if (content_ind > -1) {
				struct_lines[content_ind] = struct_lines[content_ind].replace(space_match, "$1" + equiv_fr_content + "$3");
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(space_match, unmatchable_string_placeholder);
				continue;
			}
		}
		/*
		============================
		remove math
		============================
		*/
		// if option is selected, check for match after math is removed
		if (math_check) {
			content_ind = regex_ind(struct_lines_no_math, newline_match);
			// if match is found, change structure value and set struct counter
			if (content_ind > -1) {
				let curr_line_no_math = struct_lines[content_ind].replaceAll(math_placeholder_regex, "");
				// make sure match is actually because of a math tag
				if (struct_lines[content_ind].includes(math_open_placeholder)) {
					// get math tags and move them to the front
					let math_tags = extract_math_tags(struct_lines[content_ind]);
					struct_lines[content_ind] = math_tags + curr_line_no_math.replace(newline_match, "$1" + equiv_fr_content + "$3");
					struct_lines_placeholder[content_ind] = curr_line_no_math.replace(newline_match, unmatchable_string_placeholder);
					continue;
				}
			}
		}
		/*
		============================
		reduce math to values
		============================
		*/
		// if option is selected, check for match after math is reduced to its values
		if (math_check) {
			content_ind = regex_ind(struct_lines_reduced_math, space_match);
			// if match is found, change structure value and set struct counter
			if (content_ind > -1) {
				let curr_line_reduced_math = struct_lines[content_ind].replaceAll(math_placeholder_regex, function(match, capture) {
					return extract_mi_str(capture);
				})
				// make sure match is actually because of a math tag
				if (struct_lines[content_ind].includes(math_open_placeholder)) {
					// get math tags and move them to the front
					let math_tags = extract_math_tags(struct_lines[content_ind]);
					struct_lines[content_ind] = math_tags + curr_line_reduced_math.replace(space_match, "$1" + equiv_fr_content + "$3");
					struct_lines_placeholder[content_ind] = curr_line_reduced_math.replace(space_match, unmatchable_string_placeholder);
					continue;
				}
			}
		}
		/*
		============================
		placeholders instead of non-alphanumeric characters
		============================
		*/
		if (curr_content.length >= min_cont_len) {
			// check for alphanumeric matches: leading/trailing non-alphanumeric characters are removed
			let special_match_str = curr_content_orig.replace(/^[^0-9a-zA-Z]*(.*)/g, "$1").replace(/(.*?)[^0-9a-zA-Z]*$/g, "$1");
			// internal special characters are replaced with placeholders
			special_match_str = special_match_str.replaceAll(/&[a-zA-Z0-9]+;/g, " ");
			// internal non-alphanumeric characters are replaced with placeholders
			special_match_str = special_match_str.replaceAll(/[^a-zA-Z0-9]/g, " *[^a-zA-Z0-9] *");
			let special_match_str_regex = new RegExp(special_match_str);
			// check this for fully matching tag/newline first
			let newline_special_match = new RegExp("((^|>) *)" + special_match_str + "( *($|<))", "gi");
			content_ind = regex_ind(struct_lines_placeholder, newline_special_match);
			// if match is found, change structure value and set struct counter
			if (content_ind > -1) {
				struct_lines[content_ind] = struct_lines[content_ind].replace(newline_special_match, "$1" + equiv_fr_content + "$3");
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(special_match_str_regex, unmatchable_string_placeholder);
				continue;
			}
			// check for partial match
			let word_special_match = new RegExp("(^|[^a-zA-Z0-9])" + special_match_str + "($|[^a-zA-Z0-9])", "gi");
			content_ind = regex_ind(struct_lines_placeholder, word_special_match);
			// if match is found, change structure value and set struct counter
			if (content_ind > -1) {
				struct_lines[content_ind] = struct_lines[content_ind].replace(word_special_match, "$1" + equiv_fr_content + "$2");
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(special_match_str_regex, unmatchable_string_placeholder);
				continue;
			}
		}
		/*
		============================
		ignore paragraph numbers
		============================
		*/
		// content has to be a minimum length and include the keyword "paragraph"
		if ((curr_content.length >= min_cont_len) && curr_content.includes("aragraph")) {
			// replace numbers with generic regex
			let para_num_match = new RegExp("((^|>) *)" + curr_content.replaceAll(/[0-9]+/g, "[0-9]+") + "( *($|<))", "gi");
			// check for match after spacing is disregarded
			content_ind = regex_ind(struct_lines_placeholder, para_num_match);
			// if match is found, change structure value and set struct counter
			if (content_ind > -1) {
				struct_lines[content_ind] = struct_lines[content_ind].replace(para_num_match, "$1" + equiv_fr_content + "$3");
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(para_num_match, unmatchable_string_placeholder);
				continue;
			}
		}
		/*
		============================
		Debug
		============================
		*/
		// counter for number of unmatched lines
		if (content_ind === -1 && curr_content !== empty_line_placeholder) {
			if (unmatched_lines < 100) {
				console.log(posn);
			}
			unmatched_lines++;
		}
	}
	console.log("Total unmatched lines:");
	console.log(unmatched_lines);
	/*
	============================
	Clean up output
	============================
	*/
	// swap extra french contents resulting from differing tag start/end positions into place, and remove placeholder tags
	struct_lines = replace_arr(struct_lines, /<!r>(.*?)(<.*?>)/g, "$2$1");
	struct_lines = replace_arr(struct_lines, /<!r1>(.*?)(<.*?>)/g, "$2$1");
	struct_lines = replace_arr(struct_lines, /<!r2>(.*?)(<.*?> *<.*?>)/g, "$2$1");
	struct_lines = replace_arr(struct_lines, /<!r3>(.*?)(<.*?> *<.*?> *<.*?>)/g, "$2$1");
	struct_lines = replace_arr(struct_lines, /(<[^<]*?>)([^<]*?)<!l>/g, "$2$1");
	struct_lines = replace_arr(struct_lines, /(<[^<]*?>)([^<]*?)<!l1>/g, "$2$1");
	struct_lines = replace_arr(struct_lines, /(<[^<]*?> *<[^<]*?>)([^<]*?)<!l2>/g, "$2$1");
	struct_lines = replace_arr(struct_lines, /(<[^<]*?> *<[^<]*?> *<[^<]*?>)([^<]*?)<!l3>/g, "$2$1");
	// translate english link formattings and footnotes using basic_format function
	struct_lines = struct_lines.map(translate_to_fr);
	struct_lines = replace_arr(struct_lines, "</a>,</sup><sup", "</a> </sup><sup");
	// fix multispace if selected
	if (fix_multispace) {
		struct_lines = replace_arr(struct_lines, / *&nbsp; */g, "&nbsp;");
	}
	// fix punctuation if selected
	if (fix_punct) {
		struct_lines = replace_arr(struct_lines, ". .", ".");
		struct_lines = replace_arr(struct_lines, " .", ".");
		struct_lines = replace_arr(struct_lines, "..", ".");
		struct_lines = replace_arr(struct_lines, ", ,", ",");
		struct_lines = replace_arr(struct_lines, " ,", ",");
		struct_lines = replace_arr(struct_lines, ",,", ",");
		struct_lines = replace_arr(struct_lines, "; ;", ";");
		struct_lines = replace_arr(struct_lines, " ;", ";");
		struct_lines = replace_arr(struct_lines, ";;", ";");
		struct_lines = replace_arr(struct_lines, ": :", ":");
		struct_lines = replace_arr(struct_lines, "::", ":");
	}
	// add math tags back in
	let struct_str = struct_lines.join('\n');
	struct_str = struct_str.replaceAll(math_open_placeholder, "<math>").replaceAll(math_close_placeholder, "</math>");
	// if option wasn't selected and math was removed, add math back in now
	if (!math_check) {
		for (let i = 0; i < math_contents.length; i++) {
			struct_str = struct_str.replace(empty_math, math_contents[i]);
		}	
	}
	// fix french apostrophes and remove placeholders
	return struct_str.replaceAll("'", "’").replaceAll(empty_line_placeholder, "");
}
