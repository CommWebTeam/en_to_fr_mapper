# English to French mapper
A string mapper that restructures a French html document based on its English counterpart.

[HTML page of tool here.](entofr.html)

This was originally intended to be used with word documents pasted into Dreamweaver. The Dreamweaver-generated html documents do not usually conform to WCAG/WET standards; we have to manually edit the html document so that it meets these standards before we can upload the document to the web.

*Table of Contents*
- [English to French mapper](#English-to-French-mapper)
- - [Overview](#English-to-French-mapper)
- - [Part 1](#part-1)
- - - [Aligning values](#English-to-French-mapper)
- - - - [Extra English tags](#extra-tag-in-the-English-document)
- - - - [Extra French tags](#extra-tag-in-the-French-document)
- - - - [Different positioning of text around tags](#different-positioning-of-text-around-tags)
- - - - [Scanning for differences](#scanning-for-differences)
- - - - [Markers](#markers)
- - [Part 2](#part-2)
- - - [Extra translations and cleaning after doing the main mapping](#extra-translations-and-cleaning-after-doing-the-main-mapping)
- - - [Math](#math)
- - [Beyond comparing](#English-to-French-mapper)

## Overview

We usually work with both English and French translations of the same document, and ideally, the structures of their word documents should be the same. The intention of this tool is for the user to only have to manually clean the English translation of the document to standards; the tool can then do most of the work for creating a cleaned French translation of the document.

Input:
- the French html document with the old structure (the word document pasted into Dreamweaver)
- the equivalent English html document with the old structure
- the same English html document with the new, manually cleaned structure

Output:
- the French html document with the new structure

Using this tool is broken into two parts. In short:
1. the first part creates two lists of contents from the old structure, one for the English contents and one for the French contents.
2. The second part searches for each English content in the new (English) structure, and replaces it with the equivalent French content by index.

This idea could be used in reverse (restructuring an English document based on its French counterpart), but for the time being, the tool has some specific implementations that assume the translation is done from English to French.

## Part 1:
Extract lists of the English and French contents from the old structures created by the Dreamweaver pastes (after slightly cleaning up their formatting using some functions from the [general Dreamweaver formatting tool](https://commwebteam.github.io/gen_dw_format/dreamweaver_paste_formatter/)).

This is done by replacing the html tags with newlines so that each content separated by tags is on its own line. All contents are trimmed of whitespace. For example, the string "&lt;p>x&lt;b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;y&lt;/b>z&lt;/p>" creates a list with the following rows:
- x
- y
- z

Part 2 uses the indices of these lists to map values. For example, the 3rd value of the English list will map to the 3rd value of the French list. If the old English document has the html

&lt;p>x&lt;b>y&lt;/b>z&lt;/p>

And the old French document has the html

&lt;p>a&lt;b>b&lt;/b>c&lt;/p>

Then the English list will look like so:
- x
- y
- z

And the French list will look like so:
- a
- b
- c

So "x" will be mapped to "a", "y" will be mapped to "b", and "z" wil be mapped to "c". This means that if the new English structure has the html

&lt;li>y&lt;/li>
&lt;li>x&lt;/li>
&lt;li>z&lt;/li>

Then for the French version, the tool will map this to

&lt;li>b&lt;/li>
&lt;li>a&lt;/li>
&lt;li>c&lt;/li>

While there may be more elegant ways to map contents, I feel that this is a quick and intuitive approach. It also importantly doesn't require any background knowledge beyond (regex) string manipulation to maintain.

### Aligning values

Ideally, the old structure documents will have the exact same html structure in both languages. However, this isn't usually realistic, so I have split extracting the content from the rest of the tool's workflow. The user should download the English content list (by default en_values.txt) and French content list (by default fr_values.txt), both newline-delimited, and manually ensure their indices align correctly.

I personally use Beyond Compare to align the values since it nicely lays out the two lists side-by-side. To make this easier, go to Session -> Session Settings -> Alignment and set the files to Unaligned. Make sure to save and reload after every edit you make to either of the files so that the rows of the two files continue to align (since each time you add a line to one of the files, they will dealign).

There are two cases for when there are differing numbers of tags in the similar structures of the English and French documents (resulting in values not aligning correctly): the English document having an extra tag, or the French document having an extra tag. (If the two documents have different tags in the same location, this can be treated as the English document having an extra tag followed by the French document having an extra tag.)

#### Extra tag in the English document

In the first case, blank rows can be added in the French contents until the values properly align again. This way, the extra tags in the English document will be mapped to blank values.

For example, if the English document has the following html:

&lt;p>x&lt;b>y&lt;/b>z&lt;/p>

It will produce the list
- x
- y
- z

If the French document has the following html:

&lt;p>xyz&lt;/p>

It will produce the list
- xyz

Since the English document has an extra bold tag around "y", it has two extra rows in the list. Appending two blank rows to the French list will cause the lists to align by index again. So the French list becomes
- xyz
- 
- 

#### Extra tag in the French document

In the reverse case, extra rows will instead have to be added to the English content list to align it with the French content list. The cleaned English structure won't contain the extra tags in the French document, so the user will have to indicate what the extra French tags consist of. The user can denote in the English contents that the row consists of an extra tag for the French content using an opening &lt;, followed by the name and attributes of the tag (the closing > is optional following the tag - this should work either way).

For example, if the English document has the following html:

&lt;p>xyz&lt;/p>

It will produce the list
- xyz

If the French document has the following html:

&lt;p>x&lt;span class="osfi-txt--italic">y&lt;/span>z&lt;/p>

It will produce the list
- x
- y
- z

To indicate that the French list has two more rows for its extra span around y, the English list can have two rows appended indicating the opening and closing span tags:
- xyz
- &lt;span class="osfi-txt--italic"
- &lt;/span

The way I visualize this while aligning in Beyond Compare is that when lining these rows up side by side, with English on the left and French on the right, this would look like
- English: xyz; French: x;
- English: &lt;span class="osfi-txt--italic"; French: y;
- English: &lt;/span; French: z;

Reading from left to right, we can see that the bottom two rows, where we added tags, do look like the html structure that we will want in the new French document - that is, &lt;span class="osfi-txt--italic">y&lt;/span>.

I have also included short forms for the following tags because, in my experience, the majority of misalignments are because one document has an emphasized value where the other does not:
- **<oti** for *<span class="osfi-txt--italic"*
- **</oti** for *</span*
- **<otb** for *<span class="osfi-txt--bold"*
- **</otb** for *</span*

So the English list can also be written as
- xyz
- &lt;oti
- &lt;/oti

A minor implementation note is that since the "no" shortform for number in English has no superscript, but n<sup>o</sup> in French does, the extra tag would result in the French content list being longer. As such, the tool replaces n<sup>o</sup> in French with a placeholder, "n_cap_sup_o_placeholder", for content alignment; this string is then converted back to n<sup>o</sup> in part 2.

##### If the extra French tag is next to another tag

For cases where an extra opening and closing tag in the French document is next to another tag, the French document will only have one extra value. For example, if the English document still has the same html as above but the French document has the following html:

&lt;p>&lt;span class="osfi-txt--italic">xy&lt;/span>z&lt;/p>

It will produce the list
- xy
- z

In this case, you can add ">>" at the end of the aligning English line for the extra French tag, which indicates that the extra tag should also be closed at the end of the value.

So the English list would be
- &lt;oti>>
- xyz

#### Different positioning of text around tags

Sometimes, the tags may be the same in both documents, but the text is positioned around them differently so that one document has extra text.

For example, the English document may have the following html:

&lt;p>&lt;em>xyz (1)&lt;/em>&lt;/p>

So it would produce the list
- xyz (1)

And the French document may have the following html:

&lt;p>&lt;em>xyz&lt;/em> (1)&lt;/p>

So it would produce the list
- xyz
- (1)

In the case where the English content list has extra rows from differently positioned text, you can just add blank rows to the French content list until they align, as you would for extra English content from extra tags.

In the above example, it is instead the French document that has extra content rows from differently positioned text. For this case, I have included placeholder tags to put into the English content rows, to be used in the same way as you would for extra French content from extra tags, indicating that the corresponding French content should be swapped around adjacent tags:
- &lt;!r or &lt;!r1 indicates that the French content should be moved one tag later; this is what should be used in the above example.
- &lt;!r2 indicates that the French content should be moved two consecutive tags later.
- &lt;!r3 indicates that the French content should be moved three consecutive tags later.
- &lt;!l or &lt;!l1 indicates that the French content should be moved one tag earlier.
- &lt;!l2 indicates that the French content should be moved two consecutive tags earlier.
- &lt;!l3 indicates that the French content should be moved three consecutive tags earlier.

For the sake of simplicity, I have only implemented moving up to three consecutive tags away (rather than a solution that allows any number of consecutive tags), since this is a relatively rare case to begin with.

So for the above example, the English list should be changed to
- xyz (1)
- &lt;!r

indicating that "xyz (1)" in the English content aligns with "xyz" in the French content, and "(1)" in the French content should be pushed back to one tag after "xyz", in this case to behind the "&lt;/em>".

#### Scanning for differences

In general, the English and French documents should have roughly similar contents in terms of length and location, so visually scanning through for jarring differences between the two content lists may be much faster than comparing line by line.

In my experience, scanning for rows where the content lengths differ a lot between the English and French lists helps to catch the majority of misalignments (though not all). This is because most of the time, extra tags in one language will be from breaking up the content in the other.

For example, in the same paragraph, the French document may italicize a word where the English document does not. The English document may have:

&lt;p>&lt;b>Triceratops&lt;/b> is a genus of herbivorous ceratopsid dinosaur that first appeared during the late Maastrichtian stage of the late Cretaceous period, about 68 million years ago (mya) in what is now North America.&lt;/p>

&lt;p>It is one of the last-known non-avian dinosaur genera, and became extinct in the Cretaceous–Paleogene extinction event 66 million years ago.&lt;/p>

Which produces the list
- Triceratops 
- is a genus of herbivorous ceratopsid dinosaur that first appeared during the late Maastrichtian stage of the late Cretaceous period, about 68 million years ago (mya) in what is now North America.
- It is one of the last-known non-avian dinosaur genera, and became extinct in the Cretaceous–Paleogene extinction event 66 million years ago. 

While the French document may have:

&lt;p>&lt;b>Triceratops&lt;/b> est un genre éteint célèbre de dinosaures herbivores de la famille des cératopsidés qui a vécu à la fin du Maastrichtien, au &lt;i>Crétacé supérieur&lt;/i>, il y a 68 à 66 millions d'années, dans ce qui est maintenant l'Amérique du Nord.&lt;/p>

&lt;p>Il a été l'un des derniers dinosaures non-aviens vivant avant leur disparition lors de la grande extinction Crétacé-Paléogène.&lt;/p>

Which produces the list
- Triceratops
- est un genre éteint célèbre de dinosaures herbivores de la famille des cératopsidés qui a vécu à la fin du Maastrichtien, au
- Crétacé supérieur
- il y a 68 à 66 millions d'années, dans ce qui est maintenant l'Amérique du Nord.
- Il a été l'un des derniers dinosaures non-aviens vivant avant leur disparition lors de la grande extinction Crétacé-Paléogène.

The French list has two extra rows because the translation of "Cretaceous period" is italicized. If we compare the English and French lists side-by-side, then we can immediately see that the third value of the French list is much shorter than the third value of the English list, meaning there is probably a misalignment in that area.

Outside of comparing content lengths, other quick visual inspections are useful too. For example, if both the English and French lists have alpha list numberings (a. b. c. and so on) for some rows, then those list numberings should probably align.

Again, if you are using Beyond Compare, I recommend reloading after every edit so that the rows are always aligned correctly by index; this makes visual inspections like these much easier to perform.

#### Markers

I have included an option that, if selected, adds markers to aid in scanning for where misalignments are occurring:

- The marker ==FOOTNOTE-HERE== is added in positions where footnotes would be.
- The markers {ITALICS-OPEN}, {ITALICS-CLOSE}, {BOLD-OPEN}, and {BOLD-CLOSE} are added for opening / closing italics and bold tags.

These markers are automatically removed in part 2.

## Part 2:
Using the manually realigned outputs from part 1 as inputs, the tool maps French contents from the old structure onto the new English structure. As described in [part 1](#part-1), this is done by finding each value in the list of English content in the new English structure, and replacing it with the same indexed value in the list of French content.

The output comes in two files. The first file contains the lines for the English content that failed to be mapped, meaning the content wasn't in the cleaned English structure. The second file contains the actual html document of the cleaned structure that now has its English contents replaced with French.

This part is where the tool attempts to automate the process of translation. The implementation details are as follows:

The tool sorts the English content list into tiers by string length of the content (the highest tier of content, i.e. the longest pieces, appear first on the ordered content list), with content within tiers being sorted by original order. For each value in the list, it searches the new structure for the value using the following rules in order, ignoring leading and trailing whitespace.
1. Full tag/line: the content should consist of either an entire line in the new English structure, or the entire content for a tag.
- for example, "foo bar" will match to "&lt;p>foo bar&lt;/p>"
2. Partial tag/line: the content is only part of a line or tag.
- for example, "bar" will match to "&lt;p>foo bar&lt;/p>"
3. Full tag/line match once substrings common to list numberings are removed, including "1.", "(1)", and "1-". Currently checks for numeric and roman list numberings; alphabetical list numberings are optional, since false positives are more likely.
- for example, "1. foo bar" will match to "&lt;p>foo bar&lt;/p>".
4. Spacing differences ignored, including &lt;br> and &lt;br/> breaking up content.
- for example, "foo bar bar" will match to "&lt;p>foo&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;bar &lt;br> bar&lt;/p>".
5. Math tags ignored in the structure.
- for example, "foo bar" will match to "&lt;p>foo &lt;math>&lt;mi>x&lt;/mi>&lt;/math> bar&lt;/p>".
6. Math tags reduced to their mi, mo, and mn characters in the structure.
- for example, "foo x bar" will match to "&lt;p>foo &lt;math>&lt;mi>x&lt;/mi>&lt;/math> bar&lt;/p>".
7. All differences between non-alphanumeric characters ignored (but the positions of the non-alphanumeric characters have to be the same).
- for example, "foo-bar" will match to "&lt;p>foo bar&lt;/p>".
8. If the line or tag contains the substring "aragraph" (for "paragraph" / "Paragraph"), ignores differences in numbers, so that differing paragraph numbers won't prevent a match.
- for example, "paragraph 234" will match to "&lt;p>paragraph 8&lt;/p>".

Note that rules 3 to 8 are checked one-by-one and mostly independently of each other, meaning a match cannot follow multiple rules (e.g. if a row of content can only be matched if both list numberings are removed and math tags are ignored, then it will not be matched). An exception is that a few of the later checks also ignore spacing differences. The document is searched fully for each of the above rules before moving onto the next rule.

Each row of the English content is only searched for once, with the first instance of the content found being replaced, but duplicate English content rows in the list are searched for independently.

To prevent false positives, some of these rules require the content being searched for to be a minimum string length (as the user inputs). For the rules that require a minimum string length, case is also ignored in the search.

[English content rows indicating extra French tags, as described in part 1](#extra-tag-in-the-French-document), are treated independently of the rest of the content list. The appropriate tags containing the corresponding French contents are appended to the preceding row of the French content list. This is done before any of the regular content has been mapped.

### Extra translations and cleaning after doing the main mapping

English links to the OSFI website and English WET footnotes are converted into French. All apostrophes ' are replaced with ’.

French numberings (1er, 2e, 3e, etc.) have their suffixes automatically searched for and converted to superscripts if this is not already the case.

If the option to fix spacing around punctuation is selected, then the fix_punctuation function from the [general Dreamweaver formatting tool](https://commwebteam.github.io/gen_dw_format/dreamweaver_paste_formatter/) is called.

### Math

In some cases, math in word documents, and the old structures that are pasted from these word documents, is formatted as regular text or images instead of word equations. On the other hand, in a cleaned html structure, math should ideally be written using mathml for accessibility purposes. This is problematic for two reasons:
1. Inline math, where the regular text of the content row, as parsed from the old structure, is broken into mathml tags in the cleaned structure, which means that the content won't be matched.
2. Mathml tags may incorrectly be mapped onto by other content rows and translated instead of a non-mathml tag later in the document, preventing that non-mathml tag from being translated.

For example, the old English structure might have the following paragraph which includes an equation written in regular text:

&lt;p>Formula 1: x + y = z&lt;/p>

In the new English structure, the equation might be converted to mathml for clarity, especially if mathml is used elsewhere in the document, so it might look like this:

&lt;p>Formula 1: &lt;math>&lt;mi>x&lt;/mi>&lt;mo>+&lt;/mo>&lt;mi>y&lt;/mi>&lt;mo>=&lt;/mo>&lt;mi>z&lt;/mi>&lt;/math>&lt;/p>

If the option is selected, the tool attempts to deal with the first issue using rules 5 and 6 [as described above](#part-2), and deals with the second issue by replacing math tags with placeholder strings during the rest of the script so that their contents won't be matched like regular tags.

Note that since the equivalent French content that was extracted from the old Dreamweaver paste does not have mathml, the tool doesn't know where the math should be positioned after a successful mapping. This check shifts mathml equations to the front of their respective tags, so the user will have to manually search through &lt;math> tags and reposition them afterwards.

## Beyond Comparing

Since there are numerous edge cases where values may be swapped or not correctly mapped, a manual inspection should be done on the French document afterwards. 

One common issue with the mapper is that punctuation differences between English and French contents (e.g. a period is bolded in the English version only) may result in duplicate / missing punctuation or spacing, so if the option isn't selected, it could be worth manually searching for regex strings like *" ."*, *" ,"*, *".."*, and *". ."* to remove first.