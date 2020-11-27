# English to French mapper
A string mapper that restructures a french html document based on its english counterpart.

[HTML document here.](entofr.html)

This was originally intended to be used with word documents pasted into Dreamweaver. The Dreamweaver-generated html documents do not usually conform to WCAG/WET standards; we have to manually edit the html document so that it meets these standards before we can upload the document to the web.

We usually work with both english and french translations of the same document, and ideally, the structures of their word documents should be the same. The intention of this tool is for the user to only have to manually clean the english translation of the document to standards; the tool can then do most of the work for creating a cleaned french translation of the document.

Input:
- the french html document with the old structure
- the equivalent english html document with the old structure
- the same english html document with the new structure

Output:
- the french html document with the new structure

Using this tool is broken into two parts.

## Part 1:
Extract lists of the english and french contents from the old structures. This is mainly done by replacing the html tags with newlines so that each content separated by tags is on its own line.

Part 2 uses the indices of these lists to map values. For example, the 5th value of the english list will map to the 5th value of the french list. While there may be more elegant ways to map contents, I feel that this is a quick and intuitive approach. It also importantly doesn't require any background knowledge beyond (regex) string manipulation to maintain.

Ideally, the old structure documents will have the exact same html structure in both languages. However, this isn't usually realistic, so I have split extracting the content from the rest of the tool's workflow. The user should download the english content list (by default en_values.txt) and french content list (by default fr_values.txt), both newline-delimited, and manually ensure their indices align correctly.

## Part 2:
Using the manually realigned outputs from part 1 as inputs, map french contents from the old structure onto the new english structure. This is done by finding each value in the list of english content in the new english structure, and replacing it with the equivalent value in the list of french content.

The tool goes down the english content list in order of the string length of the content (the longest pieces of content appear first on the ordered content list). For each value in the list, it searches the new structure for the value using the following rules in order:
- full tag/line (the content should consist of either an entire line in the new english structure, or the entire content for a tag)
- partial tag/line (the content is only part of a line or tag)
- full tag/line match once substrings common to list numberings are removed (for example, ignore any substring [0-9]+\. that the content begins with)
- superscript and subscript tags ignored in the new english structure
- spacing differences ignored
- all differences between non-alphanumeric characters ignored (but the positions of the non-alphanumeric characters have to be the same)

### Potential extra step: manually adding in superscripts and subscripts
Since Dreamweaver pastes do not distinguish superscripts and subscripts from the original word document, they will not be distinguished in the content lists generated in part 1, either; the user will have to manually add them in when cleaning the document to conform it to WCAG/WET standards.

One of the rules used in part 2 for finding english contents is to match while ignoring superscripts and subscripts. To mark the tags where this rule is used (rather than one of the earlier rules), the string SUPERSCRIPTORSUBSCRIPT is included in front of the tag. The user should manually search for this keyword and add in superscripts/subscripts at those lines.
