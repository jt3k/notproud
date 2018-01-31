const { Composer, Markup, log } = require('micro-bot');
const fs = require('fs');

const data = require('./noproud.json');
const getProud = require('./get-proud.js');

let startText = fs.readFileSync('./start-text.txt', 'utf-8');
let keyboard = [];
const preparedData = data.map(({ emoji, description, shortname, category }) => {
  startText += `${emoji} – ${description}\n`;
  keyboard.push(`${emoji} ${shortname}`);

  const requestRegx = new RegExp(
    `(${emoji}|${shortname}|${emoji} ${shortname})`,
    'im',
  );
  return { emoji, description, shortname, category, requestRegx };
});

keyboard = splitBy(keyboard, 3);
const keyboardMarkup = Markup.keyboard(keyboard)
  .resize(true)
  .extra();

/////////////
const timeout = 4000;
const cache = {};
////////////
const bot = new Composer();
bot.use(log());

preparedData.forEach(item => {
  bot.hears(item.requestRegx, async ({ reply, from }) => {
    const { id } = from;
    if (cache[id]) {
      const remaining = timeout + cache[id] - Date.now();
      return reply(
        `[Bot message: попробуй ещё раз через ${remaining} миллисекунд.]`,
        keyboardMarkup,
      );
    }

    const message = await getProud(item.category);
    cache[id] = Date.now();
    setTimeout(() => {
      delete cache[id];
    }, timeout);
    return reply(message, keyboardMarkup);
  });
});

bot.command('start', ({ reply }) => reply(startText, keyboardMarkup));

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

module.exports = bot;
