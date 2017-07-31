const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
const Telegraf = require('telegraf');

const { Markup } = Telegraf;
const data = require('./noproud.json');

let startText = fs.readFileSync('./start-text.txt', 'utf-8');

const { BOT_TOKEN } = process.env;

function getText(slug = 'lust') {
	return got(
		`http://www.notproud.ru/${slug}/random.html`
	).then(({ body }) => {
		const $ = cheerio.load(body);
		const text = $(
			'body > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td.font2'
		)
			.text()
			.trim();

		const date = $(
			'body > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td'
		)
			.text()
			.trim();
		console.log(`${date}\n${text}`);
		return `${text}\n${date}`;
	});
}

const client = new Telegraf(BOT_TOKEN);
client.use(Telegraf.log());

let keyboard = [];

data.forEach(item => {
	startText += `${item.emoji} – ${item.description}\n`;
	keyboard.push(`${item.emoji} ${item.shortname}`);

	client.hears(item.emoji, ctx => getText(item.category).then(ctx.reply));
	client.hears(item.shortname, ctx => getText(item.category).then(ctx.reply));
	client.hears(`${item.emoji} ${item.shortname}`, ctx =>
		getText(item.category).then(ctx.reply)
	);
});

keyboard = splitBy(keyboard, 3);

client.command('start', ({ reply }) =>
	reply(startText, Markup.keyboard(keyboard).extra())
);

client.startPolling();

// ------------------
// utils
//
function splitBy(arr, size) {
	// clone
	arr = arr.slice(0);
	const out = [];
	while (arr.length > 0) {
		out.push(arr.splice(0, size));
	}

	return out;
}
