const unmatchable_string_emptyline = "EMPTYLINEFILLER123456789"
const unmatchable_string_placeholder = "FILLER123456789PLACEHOLDER"
const script_notify = "SUPERSCRIPTORSUBSCRIPT"

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
		// read in english and french contents
		const en_contents = content_inputs[0].split("\n");
		const fr_contents = content_inputs[1].split("\n");
		// read in english structure
		let structure = replace_special_chars(event.target.result);
		structure = rm_extra_space(structure);
		// read in other inputs for matching contents to structure
		const min_cont_len = parseInt(document.getElementById("min_content_len").value);
		// replace english content in structure with french content
		new_structure = replace_en_with_fr(structure, en_contents, fr_contents, min_cont_len);
		// download structure with french content
		download(new_structure, "fr_html.html", "text/html");
	}
	file_reader_en_struct.readAsText(struct_str_en);
}

/* Helper functions */

// Compare content lengths
function compare_content_len(a, b) {
	// set all numeric substrings to length 1
	const a_nonum = a.value.replaceAll(/[0-9]+/g, "1");
	const b_nonum = b.value.replaceAll(/[0-9]+/g, "1");
	// sort by substring length, then position
	if (a_nonum.length === b_nonum.length) {
		return b.position - a.position;
	}
	return b_nonum.length - a_nonum.length;
}

// Replace English substrings with French substrings
function replace_en_with_fr(en_structure, en_contents, fr_contents, min_cont_len) {
	const ncontents = Math.min(en_contents.length, fr_contents.length);
	let unmatched_lines = 0;
	let unmatched_excluding_placeholder = 0;
	console.log("Unmatched lines (first 100):");
	// get non-empty contents of math and remove from structure
	const empty_math = "<math></math>";
	let no_empty_math_structure = replace_special_chars(en_structure).replaceAll("\r\n", "\n").replaceAll(empty_math, "");
	let math_contents = get_tag_contents(no_empty_math_structure, "math");
	let no_math_structure = rm_tag_contents(no_empty_math_structure, "math");
	// lines of structure - one to return
	let struct_lines = no_math_structure.split("\n");
	// one to keep track of which lines have been edited
	let struct_lines_placeholder = no_math_structure.split("\n");
	// one with superscripts and subscripts that have no internal tags removed
	let struct_lines_no_script = no_math_structure.replaceAll(/<su[bp]>([^<]*?)<\/su[bp]>/g, "$1").split("\n");
	/*
	============================
	format en contents and convert to regex
	============================
	*/
	// replace inconsistent chars
	let en_contents_orig = en_contents.map(replace_special_chars);
	en_contents_orig = en_contents_orig.map(rm_extra_space);
	en_contents_orig = en_contents_orig.map(x => x.replaceAll(/^ *(&nbsp;)* *$/g, ""));
	// replace blank lines with some unmatchable string to exclude from regex
	en_contents_orig = replace_empty_lines(en_contents_orig, unmatchable_string_emptyline);
	// reformat regex chars
	let en_contents_regex = en_contents_orig.map(replace_regex_chars);
	// make nbsp optional
	en_contents_regex = en_contents_regex.map(x => x.replaceAll("&nbsp;", "(?:&nbsp;)* *"));
	/*
	============================
	sort content by length
	============================
	*/
	let content_len = [];
	for (let i = 0; i < ncontents; i++) {
		content_len.push({position: i, value: en_contents_regex[i]});
	}
	content_len.sort(compare_content_len);
	// loop through english content and get its index in remaining structure
	for (i = 0; i < ncontents; i++) {
		let posn = content_len[i].position;
		let curr_content = content_len[i].value.trim();
		let curr_content_regex = new RegExp(curr_content, "g");
		let curr_content_orig = en_contents_orig[posn].trim();
		// get equivalent french content, replacing periods and commas with english formatting
		let equiv_fr_content = fr_contents[posn].replaceAll("$", "$$$");
		// placeholder to check if content has been found yet (ignore later checks if so)
		let content_found = false;
		/*
		============================
		actual values
		============================
		*/
		// check for fully matching tag/newline/sentence first
		let newline_match = new RegExp("((^|>) *)" + curr_content + "( *($|<))", "g");
		let content_ind = regex_ind(struct_lines_placeholder, newline_match, -1);
		// if match is found, change structure value and set struct counter
		if (content_ind > -1) {
			content_found = true;
			struct_lines[content_ind] = struct_lines[content_ind].replace(newline_match, "$1" + equiv_fr_content + "$3");
			struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(curr_content_regex, unmatchable_string_placeholder);
		}
		let word_match = new RegExp("(^|[^a-zA-Z0-9])" + curr_content + "($|[^a-zA-Z0-9])", "gi");
		if (curr_content.length >= min_cont_len) {
			// check for partial match where content is found in tag/line, but tag/line doesn't consist entirely of it
			content_ind = regex_ind(struct_lines_placeholder, word_match, content_ind);
			// if match is found, change structure value and set struct counter
			if ((content_ind > -1) && (!content_found)) {
				content_found = true;
				struct_lines[content_ind] = struct_lines[content_ind].replace(word_match, "$1" + equiv_fr_content + "$2");
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(curr_content_regex, unmatchable_string_placeholder);
			}
		}
		/*
		============================
		remove list numberings
		============================
		*/
		// only assume it's a list value if there are letters
		if (/[a-zA-Z]/g.test(curr_content) && (curr_content.length >= min_cont_len)) {
			// check for match after list numbering is removed
			let content_no_list = curr_content.replace(/^(\\\([0-9Ii]*\\\) *)*/g, "").replace(/^([0-9Ii]*\\\.[0-9Ii]* *)*/g, "").replace(/^([0-9Ii]*-[0-9Ii]* *)/g, "");
			let list_match = new RegExp("((^|>) *)(\\(*[0-9Ii]*[\\.\\)-][0-9Ii]* *)*" + content_no_list + "( *($|<))", "gi");
			content_ind = regex_ind(struct_lines_placeholder, list_match, content_ind);
			// if match is found, change structure value and set struct counter
			if ((content_ind > -1) && (!content_found)) {
				content_found = true;
				struct_lines[content_ind] = struct_lines[content_ind].replace(list_match, "$1" + equiv_fr_content + "$4");
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(curr_content_regex, unmatchable_string_placeholder);
			}
		}
		/*
		============================
		remove superscripts and subscripts
		============================
		*/
		// check for match after sup and sub tags are removed
		content_ind = regex_ind(struct_lines_no_script, newline_match, content_ind);
		// if match is found, change structure value and set struct counter
		if ((content_ind > -1) && (!content_found)) {
			// make sure match is actually because of a sub or sup tag
			if (/su[bp]>/g.test(struct_lines[content_ind])) {
				content_found = true;
				struct_lines[content_ind] = script_notify + struct_lines_no_script[content_ind].replace(newline_match, "$1" + equiv_fr_content + "$3");
				struct_lines_placeholder[content_ind] = struct_lines_no_script[content_ind].replace(curr_content_regex, unmatchable_string_placeholder);
			}
		}
		// also check for partial matches
		if (curr_content.length >= min_cont_len) {
			content_ind = regex_ind(struct_lines_no_script, word_match, content_ind);
			// if match is found, change structure value and set struct counter
			if ((content_ind > -1) && (!content_found)) {
				// make sure match is actually because of a sub or sup tag
				if (/su[bp]>/g.test(struct_lines[content_ind])) {
					content_found = true;
					struct_lines[content_ind] = script_notify + struct_lines_no_script[content_ind].replace(word_match, "$1" + equiv_fr_content + "$2");
					struct_lines_placeholder[content_ind] = struct_lines_no_script[content_ind].replace(curr_content_regex, unmatchable_string_placeholder);
				}
			}
		}
		/*
		============================
		disregard spacing
		============================
		*/
		if (curr_content.length >= min_cont_len) {
			// check for match after spacing is disregarded
			let space_match = new RegExp("((^|>) *)" + curr_content.replaceAll(" *", " ").replaceAll(" ", " *") + "( *($|<))", "gi");
			content_ind = regex_ind(struct_lines_placeholder, space_match, content_ind);
			// if match is found, change structure value and set struct counter
			if ((content_ind > -1) && (!content_found)) {
				content_found = true;
				struct_lines[content_ind] = struct_lines[content_ind].replace(space_match, "$1" + equiv_fr_content + "$3");
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(curr_content_regex, unmatchable_string_placeholder);
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
			content_ind = regex_ind(struct_lines_placeholder, newline_special_match, content_ind);
			// if match is found, change structure value and set struct counter
			if ((content_ind > -1) && (!content_found)) {
				content_found = true;
				struct_lines[content_ind] = struct_lines[content_ind].replace(newline_special_match, "$1" + equiv_fr_content + "$3");
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(special_match_str_regex, unmatchable_string_placeholder);
			}
			// check for partial match
			let word_special_match = new RegExp("(^|[^a-zA-Z0-9])" + special_match_str + "($|[^a-zA-Z0-9])", "gi");
			content_ind = regex_ind(struct_lines_placeholder, word_special_match, content_ind);
			// if match is found, change structure value and set struct counter
			if ((content_ind > -1) && (!content_found)) {
				content_found = true;
				struct_lines[content_ind] = struct_lines[content_ind].replace(word_special_match, "$1" + equiv_fr_content + "$2");
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(special_match_str_regex, unmatchable_string_placeholder);
			}
		}
		// if match is found, change structure value and set struct counter
		if (content_ind === -1) {
			if (unmatched_lines < 100) {
				console.log(posn + 1);
			}
			unmatched_lines++;
			if (curr_content !== unmatchable_string_emptyline) {
				unmatched_excluding_placeholder++;
			}
		}
	}
	console.log("Total unmatched lines:");
	console.log(unmatched_lines);
	console.log("Unmatched lines excluding placeholders:");
	console.log(unmatched_excluding_placeholder);
	// replace link formattings and footnotes
	struct_lines = replace_arr(struct_lines, "/eng/", "/fra/");
	struct_lines = replace_arr(struct_lines, "/Eng/", "/Fra/");
	struct_lines = replace_arr(struct_lines, "Return to footnote", "Retour à la référence de la note de bas de page");
	struct_lines = replace_arr(struct_lines, "Footnotes", "Notes de bas de page");
	struct_lines = replace_arr(struct_lines, "Footnote", "Note de bas de page");
	struct_lines = replace_arr(struct_lines, "</a>,</sup><sup", "</a> </sup><sup");
	// add math back in
	let struct_str = struct_lines.join('\n');
	for (let i = 0; i < math_contents.length; i++) {
		struct_str = struct_str.replace(empty_math, math_contents[i]);
	}
	// fix french apostrophes
	return struct_str.replaceAll("'", "’");
}
