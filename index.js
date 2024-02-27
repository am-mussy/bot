import OpenAI from "openai";
import TelegramBot from "node-telegram-bot-api";

const openai = new OpenAI({
  apiKey: "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",
});
const token = "6317152921:AAET9QNlrdG0yUC33PHUJkC92On5ivCvEls";
// Создание бота
const bot = new TelegramBot(token, { polling: true });

let messagesCache = {};

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  console.log(text)
  if (!messagesCache[chatId]) {
    messagesCache[chatId] = [];
  }
  messagesCache[chatId].push(`Имя: ${msg.from.first_name} Сообщение: ${text}`);
});

async function sendGPTResponse(chatId) {
  console.log(messagesCache[chatId], messagesCache[chatId].length)
  if (messagesCache[chatId] && messagesCache[chatId].length > 5) {
    const conversation = messagesCache[chatId].join("\n");
    console.log(messagesCache)

    try {
      const gptResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {role: "system", content: "Ты находишься в чате друзей. Тебя добавили, чтобы ты иронично, меланхолично давал комментарии на сообщения которые ты видишь. ТЫ НЕ ДОЛЖЕН ПОВТОРЯТЬ КОММЕНТАРИИ ДРУГИХ ЛЮДЕЙ. Пиши свои комментарии, можешь обращаться к членам чата по имени. Ты будешь получать сообщения в формате: Ися: Имя участника Сообщение: Текст сообщения участника"},
          {role: "user", content:conversation}],
        max_tokens: 150
      });

      console.log(gptResponse.choices[0].message.content.trim())
      await bot.sendMessage(chatId, gptResponse.choices[0].message.content.trim());
    } catch (error) {
      console.error("Ошибка при запросе к OpenAI:", error);
    }
    messagesCache[chatId] = []; // Очищаем кэш после ответа
  }
}

setInterval(() => {
  console.log('try', messagesCache)
  for (const chatId in messagesCache) {

    sendGPTResponse(chatId);
  }
}, 10000);