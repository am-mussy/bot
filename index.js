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
  messagesCache[chatId].push(`Имя: ${msg.from.first_name} Сообщение: ${text}`);
});

async function sendGPTResponse(chatId) {
  console.log(messagesCache[chatId], messagesCache[chatId].length)
  if (messagesCache[chatId] && messagesCache[chatId].length > 10) {
    const conversation = messagesCache[chatId].join("\n");
    console.log(messagesCache)

    try {
      const gptResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {role: "system", content: "Абстрактно Иронизируй над сообщениями. НИКОГДА НЕ ОБРАЩАЙСЯ НИ К КОМУ. ПИШИ СООБЩЕНИЯ, БУДТО БЫ ЭТО МЫСЛИ В СЛУХ. Сообщения будут в формате: Имя пользователя, и его сообщение"},
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
}, 5000);