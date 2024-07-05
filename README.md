This project is a part of the course Advanced Data Structures and Algorithms. 

Topic: Keyword Extraction

A binomial heap is used for Automatic Keyword Extraction of frequent itemsets. The heap property is minimum frequency of the word/phrase, with the tiebreaker being the location of the word/phrase.
The directory 'paras' contain the actual paragraphs and the 'reduced' directory contains the reduced paragraphs.
A paragraph is read, converted to all lowercase characters, punctation and trivial English words such as {such,as,in,for,of,is,a,an,the,some} etc are removed. The words obtained after are read and used to make the heap.
Keywords are generated and the paragraph ID is mapped to this keyword.
After processing all paragraphs we have a map of keyword phrases and paraIds.
When a user enters the keyword phrase, paragraphs containing it are loaded.
