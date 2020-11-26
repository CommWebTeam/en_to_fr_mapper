// formats html file and strips all of its tags to create a list of content values
function strip_html(html_str) {
	html_arr = html_str.split('\n')
	// remove first few lines of html file
	html_arr = html_arr.slice(6, html_arr.length)
	// remove logiterms
	html_arr = html_arr.map(x => x.replaceAll(/<a name="lt_[a-zA-z0-9]+">([^<]*)<\/a>/g, "$1"))
	// replace special characters
	html_arr = html_arr.map(replace_special_chars)
	// make spacings consistent
	html_arr = html_arr.map(rm_extra_space)
	// get rid of tags
	html_arr = html_arr.map(rm_tags_all)
	// remove indents, list numberings, and empty lines
	html_arr = trim_arr(html_arr)
	html_arr = html_arr.map(rm_list)
	html_arr = rm_empty_lines(html_arr)
	html_arr = trim_arr(html_arr)
	// join array back into string and split it again to get actual list
	html_str_cleaned = html_arr.join('\n')
	html_arr = html_str_cleaned.split('\n')
	// remove empty lines and lines that only consist of non-alphanumeric characters
	html_arr = rm_substr(html_arr, /^[^a-zA-z0-9]+$/g)
	html_arr = rm_empty_lines(html_arr)
	html_arr = trim_arr(html_arr)
	console.log(html_arr.length)
	return html_arr.join('\n')
}