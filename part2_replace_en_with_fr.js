// Compare content lengths
function compare_content_len(a, b) {
	return a.len - b.len
}

// Replace English substrings with French substrings
function replace_en_with_fr(en_structure, en_contents, fr_contents, min_cont_len) {
	ncontents = Math.min(en_contents.length, fr_contents.length)
	unmatched_lines = 0
	unmatched_excluding_placeholder = 0
	console.log("Unmatched lines (first 100):")
	// lines of structure - one to return
	struct_lines = en_structure.split("\n")
	// one to keep track of which lines have been edited
	struct_lines_placeholder = en_structure.split("\n")
	// one with superscripts and subscripts removed
	struct_lines_no_script = en_structure.replaceAll(/<\/*su[bp]>/g, "").split("\n")
	/*
	============================
	format en contents and convert to regex
	============================
	*/
	// replace inconsistent chars
	en_contents_orig = en_contents.map(replace_special_chars)
	en_contents_orig = en_contents_orig.map(rm_extra_space)
	en_contents_orig = en_contents_orig.map(x => x.replaceAll(/^ *(&nbsp;)* *$/g, ""))
	// replace blank lines with some unmatchable string to exclude from regex
	en_contents_orig = replace_empty_lines(en_contents_orig, unmatchable_string_emptyline)
	// reformat regex chars
	en_contents_regex = en_contents_orig.map(replace_regex_chars)
	// make nbsp optional
	en_contents_regex = en_contents_regex.map(x => x.replaceAll("&nbsp;", "(?:&nbsp;)* *"))
	/*
	============================
	sort content by length
	============================
	*/
	content_len = []
	for (i = 0; i < ncontents; i++) {
		content_len.push({position: i, len: en_contents_regex[i].length})
	}
	content_len.sort(compare_content_len).reverse()
	// loop through english content and get its index in remaining structure
	for (i = 0; i < ncontents; i++) {
		posn = content_len[i].position
		curr_content = en_contents_regex[posn].trim()
		curr_content_orig = en_contents_orig[posn].trim()
		equiv_fr_content = fr_contents[posn]
		curr_content_regex = new RegExp(curr_content, "g")
		content_found = false
		/*
		============================
		actual values
		============================
		*/
		// check for fully matching tag/newline/sentence first
		newline_match = new RegExp("((^|>) *)" + curr_content + "( *($|<))", "g")
		content_ind = regex_ind(struct_lines_placeholder, newline_match, -1)
		// if match is found, change structure value and set struct counter
		if (content_ind > -1) {
			content_found = true
			struct_lines[content_ind] = struct_lines[content_ind].replace(newline_match, "$1" + equiv_fr_content + "$3")
			struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(curr_content_regex, unmatchable_string_placeholder)
		}
		if (curr_content.length >= min_cont_len) {
			// check for partial match where content is found in tag/line, but tag/line doesn't consist entirely of it
			word_match = new RegExp("(^|[^a-zA-Z0-9])" + curr_content + "($|[^a-zA-Z0-9])", "g")
			content_ind = regex_ind(struct_lines_placeholder, word_match, content_ind)
			// if match is found, change structure value and set struct counter
			if ((content_ind > -1) && (!content_found)) {
				content_found = true
				struct_lines[content_ind] = struct_lines[content_ind].replace(word_match, "$1" + equiv_fr_content + "$2")
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(curr_content_regex, unmatchable_string_placeholder)
			}
		}
		/*
		============================
		remove list numberings
		============================
		*/
		// only assume it's a list value if there are letters
		if (/[a-zA-Z]/g.test(curr_content)) {
			// check for match after list numbering is removed
			list_match = new RegExp("((^|>) *)([0-9Ii]*[\.-][0-9Ii]* *)*" + curr_content + "( *($|<))", "g")
			content_ind = regex_ind(struct_lines_placeholder, list_match, content_ind)
			// if match is found, change structure value and set struct counter
			if ((content_ind > -1) && (!content_found)) {
				content_found = true
				struct_lines[content_ind] = struct_lines[content_ind].replace(list_match, "$1" + equiv_fr_content + "$4")
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(curr_content_regex, unmatchable_string_placeholder)
			}
		}
		/*
		============================
		remove superscripts and subscripts
		============================
		*/
		// check for match after sup and sub tags are removed
		content_ind = regex_ind(struct_lines_no_script, newline_match, content_ind)
		// if match is found, change structure value and set struct counter
		if ((content_ind > -1) && (!content_found)) {
			content_found = true
			struct_lines[content_ind] = script_notify + struct_lines_no_script[content_ind].replace(newline_match, "$1" + equiv_fr_content + "$3")
			struct_lines_placeholder[content_ind] = struct_lines_no_script[content_ind].replace(curr_content_regex, unmatchable_string_placeholder)
		}
		/*
		============================
		disregard spacing
		============================
		*/
		if (curr_content.length >= min_cont_len) {
			// check for match after spacing is disregarded
			space_match = new RegExp("((^|>) *)" + curr_content.replaceAll(" *", " ").replaceAll(" ", " *") + "( *($|<))", "g")
			content_ind = regex_ind(struct_lines_placeholder, space_match, content_ind)
			// if match is found, change structure value and set struct counter
			if ((content_ind > -1) && (!content_found)) {
				content_found = true
				struct_lines[content_ind] = struct_lines[content_ind].replace(space_match, "$1" + equiv_fr_content + "$3")
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(curr_content_regex, unmatchable_string_placeholder)
			}
		}
		/*
		============================
		placeholders instead of non-alphanumeric characters
		============================
		*/
		if (curr_content.length >= min_cont_len) {
			// check for alphanumeric matches: leading/trailing non-alphanumeric characters are removed
			special_match_str = curr_content_orig.replace(/^[^0-9a-zA-Z]*(.*)/g, "$1").replace(/(.*)[^0-9a-zA-Z]*$/g, "$1")
			// internal special characters are replaced with placeholders
			special_match_str = special_match_str.replaceAll(/&[a-zA-Z0-9]+;/g, " ")
			// internal non-alphanumeric characters are replaced with placeholders
			special_match_str = special_match_str.replaceAll(/[^a-zA-Z0-9]/g, " *[^a-zA-Z0-9] *")
			special_match_str_regex = new RegExp(special_match_str)
			// check this for fully matching tag/newline first
			newline_special_match = new RegExp("((^|>) *)" + special_match_str + "( *($|<))", "g")
			content_ind = regex_ind(struct_lines_placeholder, newline_special_match, content_ind)
			// if match is found, change structure value and set struct counter
			if ((content_ind > -1) && (!content_found)) {
				content_found = true
				struct_lines[content_ind] = struct_lines[content_ind].replace(newline_special_match, "$1" + equiv_fr_content + "$3")
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(special_match_str_regex, unmatchable_string_placeholder)
			}
			// check for partial match
			word_special_match = new RegExp("(^|[^a-zA-Z0-9])" + special_match_str + "($|[^a-zA-Z0-9])", "g")
			content_ind = regex_ind(struct_lines_placeholder, word_special_match, content_ind)
			// if match is found, change structure value and set struct counter
			if ((content_ind > -1) && (!content_found)) {
				content_found = true
				struct_lines[content_ind] = struct_lines[content_ind].replace(word_special_match, "$1" + equiv_fr_content + "$2")
				struct_lines_placeholder[content_ind] = struct_lines[content_ind].replace(special_match_str_regex, unmatchable_string_placeholder)
			}
		}
		
		// if match is found, change structure value and set struct counter
		if (content_ind == -1) {
			if (unmatched_lines < 100) {
				console.log(posn + 1)
			}
			unmatched_lines++
			if (curr_content != unmatchable_string_emptyline) {
				unmatched_excluding_placeholder++
			}
		}
	}
	console.log("Total unmatched lines:")
	console.log(unmatched_lines)
	console.log("Unmatched lines excluding placeholders:")
	console.log(unmatched_excluding_placeholder)
	// replace link formattings and footnotes
	struct_lines = replace_arr(struct_lines, "/eng/", "/fra/")
	struct_lines = replace_arr(struct_lines, "/Eng/", "/Fra/")
	struct_lines = replace_arr(struct_lines, "Return to footnote", "Retour à la référence de la note de bas de page")
	struct_lines = replace_arr(struct_lines, "Footnotes", "Notes de bas de page")
	struct_lines = replace_arr(struct_lines, "Footnote", "Note de bas de page")
	return struct_lines.join('\n')
}
