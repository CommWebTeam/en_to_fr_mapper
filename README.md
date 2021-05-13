# English to French mapper
A string mapper that restructures a French html document based on its English counterpart.

[HTML page of tool here.](https://commwebteam.github.io/en_to_fr_mapper/#english-to-french-mapper)

This was originally intended to be used with word documents pasted into Dreamweaver. The Dreamweaver-generated html documents do not usually conform to WCAG/WET standards; we have to manually edit the html document so that it meets these standards before we can upload the document to the web.

*Table of Contents*
- [English to French mapper](#english-to-french-mapper)
- - [Overview](#English-to-French-mapper)
- - - [Inputs](#description-of-inputs)
- - [Part 1](#part-1)
- - - [Aligning values](#english-to-french-mapper)
- - - - [Summary of misalignment cases](#brief-summary-of-misalignment-cases)
- - - - [Extra English tags](#1.-extra-tag-in-the-english-document)
- - - - [Extra French tags](#2.-extra-tag-in-the-french-document)
- - - - [Different positioning of text around tags](#3.-different-positioning-of-text-around-tags)
- - - - [Scanning for differences](#4.-scanning-for-differences)
- - - - - [Markers](#4.1-markers)
- - [Part 2](#part-2)
- - - [Extra translations and cleaning after doing the main mapping](#extra-translations-and-cleaning-after-doing-the-main-mapping)
- - - [List numberings](#list-numberings)
- - - [Math](#math)
- - [Beyond comparing](#English-to-French-mapper)

## Overview

We usually work with both English and French translations of the same document, and ideally, the structures of their word documents should be the same. The intention of this tool is for the user to only have to manually clean the English translation of the document to standards; the tool can then do most of the work for creating a cleaned French translation of the document.

Using this tool is broken into two parts. In short:
1. the first part creates two lists of contents from the old structure, one for the English contents and one for the French contents.
2. The second part searches for each English content in the new (English) structure, and replaces it with the equivalent French content by index.

Input:
- the French html document with the old structure (the word document pasted into Dreamweaver)
- the equivalent English html document with the old structure (the word document pasted into Dreamweaver)
- the above English html document but with the new, manually cleaned structure

Output:
- the French html document with the new structure
- a text file listing the English contents that failed to be found and mapped

This idea could be used in reverse (restructuring an English document based on its French counterpart), but for the time being, the tool has some specific implementations that assume the translation is done from English to French.

### Description of Inputs

#### 1. Part 1 - Dreamweaver pastes of English and French documents

These are the Word documents that have been pasted into Dreamweaver. They should follow Dreamweaver formatting.

For more complicated documents, you may have to follow these steps and format the Word document first to ensure that you have copied everything over correctly:

1. In Word, stop tracking changes and delete comments.
2. If there are any text boxes (that can't be copied), move their text out. [You can use the (second) macro here for this.](https://word.tips.net/T001690_Removing_All_Text_Boxes_In_a_Document.html)
3. Mark any superscripts or subscripts in the Word document - by default, these stylings aren't copied into Dreamweaver. Do so in the same manner as for the [general Dreamweaver formatting tool](https://commwebteam.github.io/gen_dw_format/dreamweaver_paste_formatter/#details-on-changing-strings-indicating-tags-to-actual-tags) (I use the same code for some initial cleanup).

Paste these Word documents as HTML files into the Dreamweaver design view in separate files. You don't have to run the general Dreamweaver formatting tool on them first (though you can), because part 1 of this tool calls the required formatting functions already.

#### 2. Part 1 - inserting markers

This inserts some markers into the content lists for part 1; I find these markers helpful for scanning through the content lists to search for misaligned rows more quickly.

They are automatically removed in part 2, so you don't need to add or remove them yourself.

Details [here](#4.1-markers).

#### 3. Part 1 - removing br tags inside tables

I have noticed that in some cases, a large number of contents fail to be mapped because of &lt;br> tags inside table values. This is because the &lt;br> tag breaks a value into two content rows instead of one, which makes the content more difficult to map. As such, I have included an option that removes all &lt;br> tags between table tags.

For example, <span style="color:red">&lt;table>&lt;td>a &lt;br> b&lt;/td>&lt;/table></span> becomes <span style="color:green">&lt;table>&lt;td>a b&lt;/td>&lt;/table></span>.

#### 4. Part 2 - aligned English and French values

These are the English and French content rows downloaded in part 1 that have been aligned to each other by index, meaning that each row in the English content list maps to the same row in the French content list.

#### 5. Part 2 - cleaned English HTML

This is the cleaned English structure. Each English content row from the previous input will be searched for and replaced by its aligning French content row.

#### 6. Part 2 - minimum string length for partial content matches

When searching for English contents in the cleaned English structure, the preference is to match the content to an entire tag or line in the document. For example, if a content row consists of "<span style="color:red">this is a full value</span>", then it will map a tag in the cleaned structure for <span style="color:red">&lt;b>this is a full value&lt;/b></span>.

The tool also searches for strings that find a partial match, meaning the content row only matches part of a tag, not the entire tag. For example, a content row consisting of "<span style="color:red">this is a</span>" will only map part of the above tag. These searches for partial matches are more likely to find false positives by replacing values in the English structure that they aren't supposed to.

To limit these false positives, English content rows are roughly sorted by length in descending order, meaning longer content rows are usually searched for and replaced first.

To further limit these false positives, searching for partial matches requires the content being searched for to be the given minimum string length. This value is 10 by default, meaning an English content row must consist of at least 10 characters for partial matches to be searched for.

Note that for search types that require a minimum string length, case is also ignored in the search, since the minimum string length is usually enough to make false positives unlikely. Other search types do require case to match.

#### 7. Part 2 - match alpha lists

One of the search types when searching for English content rows in the cleaned English structure is to ignore numeric and roman numeral list numberings in the content row. For example, the content row "<span style="color:red">1. List point</span>" will successfully map to the tag <span style="color:red">&lt;li>List point&lt;/li></span>, even though the tag doesn't have the numeric list numbering "1.".

The content row "<span style="color:red">IV. List point</span>" will also successfully map to the tag <span style="color:red">&lt;li>List point&lt;/li></span>, ignoring the roman list numbering "IV.".

Allowing matching alpha lists means that alphabet characters can also be used for list numberings, so the content row "<span style="color:red">A. List point</span>" will also successfully map to the tag <span style="color:red">&lt;li>List point&lt;/li></span>, ignoring the list numbering "A.". This is optional because it is more likely to result in false positives than numeric or roman list numberings.

See the [list numberings](#list-numberings) section in part 2 for more details.

#### 8. Part 2 - try to do matches in mathml

If checked, the tool tries to handle &lt;math> tags when searching for English content rows. This may require you to manually reposition math tags afterwards. See the [math](#math) section in part 2 for details.

#### 9. Post-mapping cleaning - remove multispaces

If checked, then after the mapping of the content rows is complete, the tool removes any spaces surrounding &amp;nbsp;, which I have found to be a common formatting error introduced by the mapper. For example, "<span style="color:red"> nbsp; </span>" is trimmed to  "<span style="color:red">nbsp;</span>".

#### 10. Post-mapping cleaning - fix punctuation and spacing issues

If checked, then after the mapping of the content rows is complete, the fix_punctuation function from the [general Dreamweaver formatting tool](https://commwebteam.github.io/gen_dw_format/dreamweaver_paste_formatter/) is called. I have found that the mapper often introduces punctuation issues when punctuation is on different sides of tags in the English and French documents (e.g. if a period is bolded in the English document but not the French document). 

#### 11. Post-mapping cleaning - including surrounding lines for unmatched contents

Along with the cleaned HTML structure that is ideally now populated with French values, the tool also provides a text file listing the English content rows that were not successfully matched. This is just to help you find and fix the problematic lines; you are free to ignore it if finding the unmatched lines with Beyond Compare is easier.

If this option not checked, then the lines will be listed on their own using the following formatting:
<div style="color:green"> <br />
===== <span style="color:red">line number of the unmatched line</span> ===== <br />
<span style="color:red">contents of the unmatched line</span> <br />
</div>  <br />

e.g.

===== 5 ===== <br />
Unmatched line here

If the option is checked, then the surrounding lines will also be included before and after the unlisted lines. Each unmatched line in the text file will be formatted as follows:

<div style="color:green">
<span style="color:red">contents of the line preceding unmatched line</span> <br />
>>>>>>>>>>>>>>> <br />
===== <span style="color:red">line number of the unmatched line</span> ===== <br />
<span style="color:red">contents of the unmatched line</span> <br />
<<<<<<<<<<<<<<< <br />
<span style="color:red">contents of the line following unmatched line</span> <br />
</div>  <br />

## Part 1:
Extract lists of the English and French contents from the old structures created by the Dreamweaver pastes (after slightly cleaning up their formatting using some functions from the [general Dreamweaver formatting tool](https://commwebteam.github.io/gen_dw_format/dreamweaver_paste_formatter/)).

This is done by replacing the html tags with newlines so that each content separated by tags is on its own line. All contents are trimmed of whitespace. For example, the string `<p> x<b> y </b> z</p>` creates a list with the following rows:
- x
- y
- z

Part 2 uses the indices of these lists to map values. For example, the 3rd value of the English list will map to the 3rd value of the French list. If the old English document has the html

`<li>The <strong>cat</strong> (Felis catus) is a domestic <a href="https://en.wikipedia.org/wiki/Species">species</a> of small carnivorous mammal.</li>`

Then the English list will look like so:
- <span style="color:red">The</span>
- <span style="color:red">cat</span>
- <span style="color:red">(Felis catus) is a domestic</span>
- <span style="color:red">species</span>
- <span style="color:red">of small carnivorous mammal.</span>

If the old French document has the html

`<li>Le <strong>Chat domestique</strong> (Felis silvestris catus) est la <a href="https://fr.wikipedia.org/wiki/Sous-esp%C3%A8ce">sous-espèce</a> issue de la domestication du Chat sauvage (Felis silvestris), mammifère carnivore.</li>`

Then the French list will look like so:
- <span style="color:green">Le</span>
- <span style="color:green">Chat domestique</span>
- <span style="color:green">(Felis silvestris catus) est la</span>
- <span style="color:green">sous-espèce</span>
- <span style="color:green">issue de la domestication du Chat sauvage (Felis silvestris), mammifère carnivore.</span>

So then
- <span style="color:red">The</span> will be mapped to <span style="color:green">Le</span>;
- <span style="color:red">cat</span> will be mapped to <span style="color:green">Chat domestique</span>;
- <span style="color:red">(Felis catus) is a domestic</span> will be mapped to <span style="color:green">(Felis silvestris catus) est la</span>;
- <span style="color:red">species</span> will be mapped to <span style="color:green">sous-espèce</span>; and
- <span style="color:red">of small carnivorous mammal.</span> will be mapped to <span style="color:green">issue de la domestication du Chat sauvage (Felis silvestris), mammifère carnivore.</span>.

This means that if the new English structure has the following html:

`<p>The <b>cat</b> (Felis catus) is a domestic <a rel="external" href="https://en.wikipedia.org/wiki/Species">species</a> of small carnivorous mammal.</p>`

Then for the French version, the tool will map this to

`<p>Le <b>Chat domestique</b> (Felis silvestris catus) est la <a rel="external" href="https://fr.wikipedia.org/wiki/Sous-esp%C3%A8ce">sous-espèce</a> issue de la domestication du Chat sauvage (Felis silvestris), mammifère carnivore.</p>`

While there may be more elegant ways to map contents, this was the quickest approach I could think of. It also importantly doesn't require any background knowledge beyond a bit of javascript and (regex) string manipulation to maintain.

### Aligning values

Ideally, the old structure documents will have the exact same html structure in both languages. However, this isn't usually realistic, so I have split extracting and aligning the content rows from the rest of the tool's workflow. The user should download the English content list (by default en_values.txt) and French content list (by default fr_values.txt), both newline-delimited, and manually ensure their indices align correctly.

I personally use Beyond Compare to align the values since it nicely lays out the two lists side-by-side. To make this easier, go to Session -> Session Settings -> Alignment and set the files to Unaligned. **Make sure to save and reload after every edit you make to either of the files so that the rows of the two files continue to align** (since each time you add a line to one of the files, they will dealign).

#### Brief summary of misalignment cases

Extra English content:
- If the English document has extra rows of content from having tags that the French document lacks, add blank rows to the French content so that its contents align with the English content before and after the extra rows.
- If the English document has extra rows of content from its content coming before or after a tag differently, add blank rows to the French content until their rows align.

Extra French content:
- If the French document has extra rows of content from having tags that the English document lacks, add lines in the English content beginning with < and followed by the tag that separates this row of French content from the next row, so that the remaining content aligns.
    - If the French document has only one extra row of content instead of two because its extra tag is next to another tag, end the tag on the equivalent line in the English content with >>.
    - If the French document has an extra row of content that should be appended to a brand new line, surround the tag on the equivalent line in the English content with &lt;? and ?>.
- If the French document has extra rows of content from its content coming before or after a tag differently:
    - Add a row with the placeholder tag <!r in the English contents to indicate that the equivalent French row should be pushed one tag behind, <!r2 to push it two tags behind, or <!r3 to push it three tags behind.
    = Add a row with the placeholder tag <!l in the English contents to indicate that the equivalent French row should be pushed one tag in front, <!l2 to push it two tags in front, or <!l3 to push it three tags in front.

Below is a detailed explanation of what to do for each misalignment case.

#### 1. Extra tag in the English document

In the first case, blank rows can be added in the French contents until the values properly align again. This way, the extra tags in the English document will be mapped to blank values.

For example, if the English document has the following html:

`<p>The domestic cat is a member of the <strong>Felidae</strong>, a family that had a common ancestor about 10–15 million years ago.</p>`

It will produce the list
- <span style="color:red">The domestic cat is a member of the</span>
- <span style="color:red">Felidae</span>
- <span style="color:red">, a family that had a common ancestor about 10–15 million years ago.</span>

If the French document has the following html:

`<p>La lignée du genre Felis diverge de celle des genres Otocolobus et Prionailurus il y a environ 6,2 millions d’années.</p>`

It will just produce the list
- <span style="color:green">La lignée du genre Felis diverge de celle des genres Otocolobus et Prionailurus il y a environ 6,2 millions d’années.</span>

Since the English document has an extra bold tag around "y", it has two extra rows in the list. Appending two blank rows to the French list will cause the lists to align by index again. So the French list becomes
- <span style="color:green">La lignée du genre Felis diverge de celle des genres Otocolobus et Prionailurus il y a environ 6,2 millions d’années.</span>
- 
- 

The mapping will result in the following html in the cleaned French structure:

`<p>La lignée du genre Felis diverge de celle des genres Otocolobus et Prionailurus il y a environ 6,2 millions d’années. <strong></strong></p>`

#### 2. Extra tag in the French document

In the reverse case, extra rows will instead have to be added to the English content list to align it with the French content list. This has to be handled differently from the above case because the cleaned English structure won't contain the extra tags in the French document, so the user will have to indicate what the extra French tags consist of.

The user can add a row in the English contents that consists of an extra tag for the French row, using an opening &lt; followed by the name and attributes of the tag (the closing > is optional following the tag - this should work either way). The tag in the English row, and then the contents of the French row that the tag is aligned with, are appended to the previous French row.

For example, if the English document has the following html:

`<p>The domestic cat is a member of the Felidae, a family that had a common ancestor about 10–15 million years ago.</p>`

It will produce the list
- <span style="color:red">The domestic cat is a member of the Felidae, a family that had a common ancestor about 10–15 million years ago.</span>

If the French document has the following html:

`<p>La lignée du genre <em>Felis</em> diverge de celle des genres Otocolobus et Prionailurus il y a environ 6,2 millions d’années.</p>`

It will produce the list
- <span style="color:green">La lignée du genre</span>
- <span style="color:green">Felis</span>
- <span style="color:green">diverge de celle des genres Otocolobus et Prionailurus il y a environ 6,2 millions d’années.</span>

To indicate that the French list has two more rows for its extra span around y, the English list can have two rows appended indicating the opening and closing span tags:
- <span style="color:red">The domestic cat is a member of the Felidae, a family that had a common ancestor about 10–15 million years ago.</span>
- <span style="color:red">&lt;span class="osfi-txt--italic"</span>
- <span style="color:red">&lt;/span</span>

The way I visualize this while aligning in Beyond Compare is that when lining these rows up side by side, with English on the left and French on the right, this would look like
- English: <span style="color:red">The domestic cat is a member of the Felidae, a family that had a common ancestor about 10–15 million years ago.</span>; French: <span style="color:green">La lignée du genre</span>;
- English: <span style="color:red">&lt;span class="osfi-txt--italic"</span>; French: <span style="color:green">Felis</span>;
- English: <span style="color:red">&lt;/span</span>; French: <span style="color:green">diverge de celle des genres Otocolobus et Prionailurus il y a environ 6,2 millions d’années.</span>;

Reading from left to right, we can see that the bottom two rows, where we added tags, do look like the html structure that we will want in the new French document, since &lt;span encloses Felis to produce `<span class="osfi-txt--italic>Felis</span>`:

`<p>La lignée du genre <span class="osfi-txt--italic">Felis</span> diverge de celle des genres Otocolobus et Prionailurus il y a environ 6,2 millions d’années.</p>`

I have also included short forms for the following tags because, in my experience, the majority of misalignments are because one document has an emphasized value where the other does not:
- **<oti** for *<span class="osfi-txt--italic"*
- **</oti** for *</span*
- **<otb** for *<span class="osfi-txt--bold"*
- **</otb** for *</span*

So the English list can also be written as
- <span style="color:red">The domestic cat is a member of the Felidae, a family that had a common ancestor about 10–15 million years ago.</span>
- <span style="color:red">&lt;oti</span>
- <span style="color:red">&lt;/oti</span>

A minor implementation note is that since the "no" shortform for number in English has no superscript, but n<sup>o</sup> in French does, the extra tag would result in the French content list being longer. As such, the tool replaces n<sup>o</sup> in French with a placeholder, "n_cap_sup_o_placeholder", for content alignment; this string is then converted back to n<sup>o</sup> in part 2.

##### 2.1. If the extra French tag is next to another tag

For cases where an extra opening and closing tag in the French document is next to another tag, the French document will only have one extra value. For example, if the English document still has the same html as above:

`<p>The domestic cat is a member of the Felidae, a family that had a common ancestor about 10–15 million years ago.</p>`

It will produce the list
- <span style="color:red">The domestic cat is a member of the Felidae, a family that had a common ancestor about 10–15 million years ago.</span>

 If the French document instead has the following html:

`<p><em>La lignée du genre Felis</em> diverge de celle des genres Otocolobus et Prionailurus il y a environ 6,2 millions d’années.</p>`

It will produce the list
- <span style="color:green">La lignée du genre Felis</span>
- <span style="color:green">diverge de celle des genres Otocolobus et Prionailurus il y a environ 6,2 millions d’années.</span>

In this case, you can add ">>" at the end of the aligning English line for the extra French tag, which indicates that the extra tag should also be closed at the end of the value. So the English list would be
- <span style="color:red">&lt;oti>></span>
- <span style="color:red">The domestic cat is a member of the Felidae, a family that had a common ancestor about 10–15 million years ago.</span>

The tool will add `<span class="osfi-txt--italic>` in front of "The domestic cat", and `</span>` after "million years ago".

##### 2.2. If the extra French tag should be on a separate line

How the tool implements the above cases for extra French tags is as follows:
1. The extra French tag is described in the English list.
2. This tag, along with the corresponding line in the French list, is appended to the previous row in the French list.

However, if the extra French tag should instead be on a separate line from the previous row, then this implementation will not produce the correct result.

To denote the extra French tag being on a newline from the previous row, surround the tag with "&lt;?" and "?>" when describing it in the aligned English row.

For example, if the French document has the following html, corresponding to a paragraph that the English document lacks entirely:

`<p>Article détaillé : Animal domestique en droit français.</p>`

Then the French list will have this row:
- <span style="color:green">Article détaillé : Animal domestique en droit français.</span>

To align with this, the English list should have an extra row indicating the p tag:
- <span style="color:red">&lt;?p?></span>

Since this case is generally for extra paragraphs, lists, and so on in the French document, the extra French tag indicated in the English content row (in this case `<p>`) should always be closed after the French content row. So in the above example, the `</p>` is inserted into the structure after the `<p>Article détaillé : Animal domestique en droit français`.

#### 3. Different positioning of text around tags

Sometimes, the tags may be the same in both documents, but the text is positioned around them differently so that one document has extra tags.

For example, the English document may have the following html:

`<p>The cat (Felis catus) is a domestic species of small carnivorous <a>mammal</a>`

So it would produce the list
- <span style="color:red">The cat (Felis catus) is a domestic species of small carnivorous</span>
- <span style="color:red">mammal</span>

And the French document may have the following html:

`Le Chat domestique (Felis silvestris catus) est la sous-espèce issue de la domestication du Chat sauvage (Felis silvestris), <a>mammifère</a> carnivore`

So it would produce the list
- <span style="color:green">Le Chat domestique (Felis silvestris catus) est la sous-espèce issue de la domestication du Chat sauvage (Felis silvestris),</span>
- <span style="color:green">mammifère</span>
- <span style="color:green">carnivore</span>

In the case where the English content list has extra rows from differently positioned text, you can just add blank rows to the French content list until they align. This is the same as for extra English content rows that arise from extra tags in the English document.

In the above example, however, it is instead the French document that has extra content rows from differently positioned text. The first two content rows align fine, but the third <span style="color:green">carnivore</span> row in the French contents should be after the `</a>`, not before.

For this case, I have included placeholder tags to put into the English content rows indicating that the corresponding French content should be swapped around adjacent tags. These are used similarly to how you would add extra English content rows for extra French tags.
- **&lt;!r** or **&lt;!r1** indicates that the French content should be moved one tag later; this is what should be used in the above example.
- **&lt;!r2** indicates that the French content should be moved two consecutive tags later.
- **&lt;!r3** indicates that the French content should be moved three consecutive tags later.
- **&lt;!l** or **&lt;!l1** indicates that the French content should be moved one tag earlier.
- **&lt;!l2** indicates that the French content should be moved two consecutive tags earlier.
- **&lt;!l3** indicates that the French content should be moved three consecutive tags earlier.

For the sake of simplicity, I have only implemented moving up to three consecutive tags away (rather than a solution that allows any number of consecutive tags), since this is a relatively rare case to begin with.

So for the above example, the English list should be changed to
- <span style="color:red">The cat (Felis catus) is a domestic species of small carnivorous</span>
- <span style="color:red">mammal</span>
- <span style="color:red">&lt;!r</span>

indicating that <span style="color:red">mammal</span> in the English content aligns with <span style="color:green">mammifère</span> in the French content, and <span style="color:green">carnivore</span> in the French content should be pushed back to one tag after <span style="color:green">mammifère</span>, behind the `</span>`.

#### 4. Scanning for differences

In general, the English and French documents should have roughly similar contents in terms of length and location, so visually scanning through for jarring differences between the two content lists may be much faster than comparing line by line.

In my experience, scanning for rows where the content lengths differ a lot between the English and French lists helps to catch the majority of misalignments (though not all). This is because most of the time, extra tags in one language will be from breaking up the content in the other.

For example, in the same paragraph, the French document may italicize a word where the English document does not. The English document may have:

```
<p><b>Triceratops</b> is a genus of herbivorous ceratopsid dinosaur that first appeared during the late Maastrichtian stage of the late Cretaceous period, about 68 million years ago (mya) in what is now North America.</p>
<p>It is one of the last-known non-avian dinosaur genera, and became extinct in the Cretaceous–Paleogene extinction event 66 million years ago.</p>
```

Which produces the list
- <span style="color:red">Triceratops </span>
- <span style="color:red">is a genus of herbivorous ceratopsid dinosaur that first appeared during the late Maastrichtian stage of the late Cretaceous period, about 68 million years ago (mya) in what is now North America.</span>
- <span style="color:red">It is one of the last-known non-avian dinosaur genera, and became extinct in the Cretaceous–Paleogene extinction event 66 million years ago. </span>

While the French document may have:

```
<p><b>Triceratops</b> est un genre éteint célèbre de dinosaures herbivores de la famille des cératopsidés qui a vécu à la fin du Maastrichtien, au <i>Crétacé supérieur</i>, il y a 68 à 66 millions d'années, dans ce qui est maintenant l'Amérique du Nord.</p>
<p>Il a été l'un des derniers dinosaures non-aviens vivant avant leur disparition lors de la grande extinction Crétacé-Paléogène.</p>
```

Which produces the list
- <span style="color:green">Triceratops</span>
- <span style="color:green">est un genre éteint célèbre de dinosaures herbivores de la famille des cératopsidés qui a vécu à la fin du Maastrichtien, au</span>
- <span style="color:green">Crétacé supérieur</span>
- <span style="color:green">il y a 68 à 66 millions d'années, dans ce qui est maintenant l'Amérique du Nord.</span>
- <span style="color:green">Il a été l'un des derniers dinosaures non-aviens vivant avant leur disparition lors de la grande extinction Crétacé-Paléogène.</span>

The French list has two extra rows because the translation of "Cretaceous period" is italicized. If we compare the English and French lists side-by-side, then we can immediately see that the third value of the French list is much shorter than the third value of the English list, meaning there is probably a misalignment in that area.

Outside of comparing content lengths, other quick visual inspections are useful too. For example, if both the English and French lists have alpha list numberings (a. b. c. and so on) for some rows, then those list numberings should probably align.

Again, if you are using Beyond Compare, I recommend reloading after every edit so that the rows are always aligned correctly by index; this makes visual inspections like these much easier to perform.

##### 4.1. Markers

I have included an option that, if selected, adds markers to aid in scanning for where misalignments are occurring:

- The marker <span style="color:red">==FOOTNOTE-HERE==</span> is added in positions where footnotes would be.
- The markers <span style="color:red">{ITALICS-OPEN}</span>, <span style="color:red">{ITALICS-CLOSE}</span>, <span style="color:red">{BOLD-OPEN}</span>, and <span style="color:red">{BOLD-CLOSE}</span> are added for opening / closing italics and bold tags.

These markers are automatically removed in part 2, so the tool ignores them completely. You do not have to remove them yourself. They are NOT a substitute for extra tags (since the tool ignores them).

These markers are purely to help with scanning through the content list. If you find them distracting, feel free to turn them off. 

## Part 2:
Using the manually realigned outputs from part 1 as inputs, the tool maps French contents from the old structure onto the new English structure. As described in [part 1](#part-1), this is done by finding each value in the list of English content in the new English structure, and replacing it with the same indexed value in the list of French content.

The output comes in two files. The first file contains the lines for the English content that failed to be mapped, meaning the content wasn't in the cleaned English structure. The second file contains the actual html document of the cleaned structure that now has its English contents replaced with French.

This part is where the tool attempts to automate the process of translation. The implementation details are as follows:

The tool sorts the English content list into tiers by string length of the content (the highest tier of content, i.e. the longest pieces, appear first on the ordered content list), with content within tiers being sorted by original order. For each value in the list, it searches the new structure for the value using the following rules in order, ignoring leading and trailing whitespace.
1. Full tag/line: the content should consist of either an entire line in the new English structure, or the entire content for a tag.
- for example, "foo bar" will match to `<p>foo bar</p>`.
2. Partial tag/line: the content is only part of a line or tag.
- for example, "bar" will match to `<p>foo bar</p>`
3. Full tag/line match once substrings common to list numberings are removed, including "1.", "(1)", and "1-". Currently checks for numeric and roman list numberings; alphabetical list numberings are optional, since false positives are more likely.
- for example, "1. foo bar" will match to `<p>foo bar</p>`.
4. Spacing differences ignored, including <br> and <br/> breaking up content.
- for example, "foo bar bar" will match to `<p>foo`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`bar <br> bar</p>`.
5. Math tags ignored in the structure.
- for example, "foo bar" will match to `<p>foo <math><mi>x</mi></math> bar</p>`.
6. Math tags reduced to their mi, mo, and mn characters in the structure.
- for example, "foo x bar" will match to `<p>foo <math><mi>x</mi></math> bar</p>`.
7. All differences between non-alphanumeric characters ignored (but the positions of the non-alphanumeric characters have to be the same).
- for example, "foo-bar" will match to `<p>foo bar</p>`.
8. If the line or tag contains the substring "aragraph" (for "paragraph" / "Paragraph"), ignores differences in numbers, so that differing paragraph numbers won't prevent a match.
- for example, "paragraph 234" will match to `<p>paragraph 8</p>`.

Note that rules 3 to 8 are checked one-by-one and mostly independently of each other, meaning a match cannot follow multiple rules (e.g. if a row of content can only be matched if both list numberings are removed and math tags are ignored, then it will not be matched). An exception is that a few of the later checks also ignore spacing differences. The document is searched fully for each of the above rules before moving onto the next rule.

Each row of the English content is only searched for once, with the first instance of the content found being replaced, but duplicate English content rows in the list are searched for independently.

[English content rows indicating extra French tags, as described in part 1](#extra-tag-in-the-French-document), are treated independently of the rest of the content list. The appropriate tags containing the corresponding French contents are appended to the preceding row of the French content list. This is done before any of the regular content has been mapped.

### Extra translations and cleaning after doing the main mapping

The following extra steps are taken after the mapping:
- English links to the OSFI website and English WET footnotes are converted into French.
- All apostrophes ' are replaced with ’.
- French numberings (1er, 2e, 3e, etc.) have their suffixes automatically searched for and converted to superscripts if this is not already the case.
- If the option to fix spacing around punctuation is selected, then the fix_punctuation function from the [general Dreamweaver formatting tool](https://commwebteam.github.io/gen_dw_format/dreamweaver_paste_formatter/) is called.


### List numberings

Rule 3 ignores list numberings in the English content list. List numberings consist of [numeric / roman / alpha] values and at least one period "." or closing bracket ")". Examples of valid roman list numberings are as follows:
- III) List value
- IV.V List value
- I.I.I. List value

However, the following does not count as a list numbering:
- III List value

### Math

In some cases, math in word documents, and the old structures that are pasted from these word documents, is formatted as regular text or images instead of word equations. On the other hand, in a cleaned html structure, math should ideally be written using mathml for accessibility purposes. This is problematic for two reasons:
1. Inline math, where the regular text of the content row, as parsed from the old structure, is broken into mathml tags in the cleaned structure, which means that the content won't be matched.
2. Mathml tags may incorrectly be mapped onto by other content rows and translated instead of a non-mathml tag later in the document, preventing that non-mathml tag from being translated.

For example, the old English structure might have the following paragraph which includes an equation written in regular text:

`<p>Formula 1: x + y = z</p>`

In the new English structure, the equation might be converted to mathml for clarity, especially if mathml is used elsewhere in the document, so it might look like this:

`<p>Formula 1: <math><mi>x</mi><mo>+</mo><mi>y</mi><mo>=</mo><mi>z</mi></math></p>`

If the option is selected, the tool attempts to deal with the first issue using [rules 5 and 6 as described above](#part-2), and deals with the second issue by replacing math tags with placeholder strings during the rest of the script so that their contents won't be matched like regular tags.

Note that since the equivalent French content that was extracted from the old Dreamweaver paste does not have mathml, the tool doesn't know where the math should be positioned after a successful mapping. This check shifts mathml equations to the front of their respective tags, so the user will have to manually search through &lt;math> tags and reposition them afterwards.

## Beyond Comparing

Since there are numerous edge cases where values may be swapped or not correctly mapped, a manual inspection should be done on the French document afterwards. 

One common issue with the mapper is that punctuation differences between English and French contents (e.g. a period is bolded in the English version only) may result in duplicate / missing punctuation or spacing, so if the option isn't selected, it could be worth manually searching for regex strings like *" ."*, *" ,"*, *".."*, and *". ."* to remove first.
