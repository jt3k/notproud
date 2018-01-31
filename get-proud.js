const cheerio = require('cheerio');
const got = require('got');

module.exports = function getProud(slug = 'lust') {
	return got(`http://www.notproud.ru/${slug}/random.html`).then(
		({ body }) => {
			const $ = cheerio.load(body);
			const text = $(
				'body > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td.font2',
			)
				.text()
				.trim();

			console.log(text + '\n');
			return `${text}\n`;
		},
	);
};
