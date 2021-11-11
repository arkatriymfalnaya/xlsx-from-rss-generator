# xlsx-from-rss-generator

## Install :hatching_chick:

Script for xlsx file generating from rss feed<br />
Output sheet structure designed for import validity (p - settings - import)<br />
Sheet cell's date: today + 1, one post per day<br />
Amplifr RSS feed URI: https://amplifr.com/blog/feed<br />

## Usage :hatched_chick:

```sh
node src/index.js -f <rssFeedUri | required> -a <postsAmount | 5 by default> -n <output xlsx file name> -o <additional cell options | noImage/noOGCard>
```

## Examples :hatched_chick:

```sh
// generate sheet with 191 cells | file name vk-tg.xlsx
node src/index.js -f https://amplifr.com/blog/feed -a 191 -n vk-tg

// generate sheet with 128 cells | file name insta.xlsx | empty url cell
node src/index.js -f https://amplifr.com/blog/feed -a 128 -o noOGCard -n insta

// generate sheet with 56 cells | file name fb.xlsx | empty images cell
node src/index.js -f https://amplifr.com/blog/feed -a 56 -o noImage -n fb

// generate sheet with 14 cells | file name result.xlsx | empty images cell | empty url cell
node src/index.js -f https://amplifr.com/blog/feed -a 14 -o noImage -o noOGCard
```
