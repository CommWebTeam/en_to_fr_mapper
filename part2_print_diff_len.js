// Print content index
function print_contents(i, en, fr) {
	console.log(i + 1)
	//console.log("English regex:")
	console.log(en)
	//console.log("French content at index:")
	console.log(fr)
}

// Print first content index that differs in length
function print_diff_len(en_contents, fr_contents, len_diff, diff_skip) {
	ncontents = Math.min(en_contents.length, fr_contents.length)
	to_skip = diff_skip
	console.log("Content lengths:")
	console.log(en_contents.length)
	console.log(fr_contents.length)
	console.log("First line (after skips) with major length difference:")
	for (i = 0; i < ncontents; i++) {
		if (en_contents[i].length > (fr_contents[i].length * len_diff)) {
			if (to_skip == 0) {
				print_contents(i, en_contents[i], fr_contents[i])
				return i
			}
			else  {
				to_skip--
			}
		}
		else if (fr_contents[i].length > (en_contents[i].length * len_diff)) {
			if (to_skip == 0) {
				print_contents(i, en_contents[i], fr_contents[i])
				return i
			}
			else  {
				to_skip--
			}
		}
	}
}