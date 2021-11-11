# xlsx-from-rss-generator

## Install :hatching_chick:

Script for xlsx file generating from rss feed<br />
Output sheet structure designed for import validity (p - settings - import)<br />
Sheet cell's date: today + 1, one post per day<br />
Amplifr RSS feed URI: https://amplifr.com/blog/feed<br />

## Usage :hatched_chick:

```sh
node src/index.js -f <rssFeedUri | required> -a <postsAmount | 5 by default> -n <output xlsx file name>
```
