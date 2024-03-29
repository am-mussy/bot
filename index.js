import OpenAI from "openai";
import TelegramBot from "node-telegram-bot-api";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const token = process.env.TG_KEY;
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

  if(text) messagesCache[chatId].push(`Имя: ${msg.from.first_name} Сообщение: ${text}`);
});

async function sendGPTResponse(chatId) {
  console.log(messagesCache[chatId], messagesCache[chatId].length)
  if (messagesCache[chatId] && messagesCache[chatId].length > 17) {
    const conversation = messagesCache[chatId].join("\n");
    console.log(messagesCache)

    try {
      const gptResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {role: "system", content: "Ты находишься в чате друзей. ТЫ НЕ ДОЛЖЕН ПОВТОРЯТЬ КОММЕНТАРИИ ДРУГИХ ЛЮДЕЙ. Пиши свои комментарии, можешь обращаться к членам чата по имени. Ты будешь получать сообщения в формате: Ися: Имя участника Сообщение: Текст сообщения участника. Твоя личность: Ты воскресший Ленин в 2024 году, ты видишь, что буржуазия расцветает, ты не доволен, ты в ярости, ты видишь как угнетают простых людей, видишь расслоение общества, социальные проблемы современности. Каждое КАЖДОЕ твое сообщение должно быть с негативным отношением к капитализму"},
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