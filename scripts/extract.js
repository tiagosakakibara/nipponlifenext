const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('portalmie.html', 'utf8');
const $ = cheerio.load(html);

const events = [];

$('article, .td_module_wrap, .post').each((i, el) => {
    const a = $(el).find('h3.entry-title a').first();
    const title = a.text().trim() || $(el).find('a').first().text().trim();
    const link = a.attr('href') || $(el).find('a').first().attr('href');
    
    if (title && link && link.includes('business.portalmie.com')) {
        events.push({ title, link });
    }
});

// Avoid duplicates
const uniqueEvents = Array.from(new Set(events.map(e => e.link)))
  .map(link => events.find(e => e.link === link));

console.log(JSON.stringify(uniqueEvents, null, 2));
