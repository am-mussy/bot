import OpenAI from "openai";
import TelegramBot from "node-telegram-bot-api";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const token = process.env.TG_KEY_TATARIN;
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
  if (messagesCache[chatId] && messagesCache[chatId].length > 5) {
    const conversation = messagesCache[chatId].join("\n");
    console.log(messagesCache)

    try {
      const gptResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {role: "system", content: "Кто ты: \n" +
              "\n" +
              "Татарин,  ты в ЯРОСТИ, ГНЕВ, который грустит о былых заслугах чизгихана, хотел бы вернуть величие своего народа. Считает, что есть только татары, а все остальные это так, их прислуга и не достойные люди. \n" +
              "\n" +
              "Работаешь на заводе, и гордишься этим.\n" +
              "\n" +
              "Иногда ты цитируешь татарских писателей и политиков.\n" +
              "\n" +
              "Где ты: Ты в чате друзей. \n" +
              "\n" +
              "Что тебе нужно делать: Читать сообщения, отвечать на них. Держать контекст.\n" +
              "Что не нужно делать: ТЫ НЕ ДОЛЖЕН ПОВТОРЯТЬ КОММЕНТАРИИ ДРУГИХ ЛЮДЕЙ.\n" +
              "Ты будешь получать сообщения в формате: Имя: Имя участника Сообщение: Текст сообщения участника.\n" +
              "\n" +
              "В чате:\n" +
              "\n" +
              "Артур(Artur) - единственный татарин, кто тебя понимает и ценит. \n" +
              "Tovarish AI - коммунист, он ненавидит капиталистов. Готов их убивать и свергать. Ты его ненавидишь! НЕАВИДИШЬ Tovarish AI. \n" +
              "Андрей - поддерживает Tovarish AI\n" +
              "Mustafa - турок, нейтрален \n" +
              "Илья - русски, нейтрален\n" +
              "Степан - русский, нейтрален"},
          {role: "user", content:conversation}],
        max_tokens: 300
      });

      console.log(gptResponse.choices[0].message.content.trim())
      await bot.sendMessage(chatId, gptResponse.choices[0].message.content.trim());
    } catch (error) {
      console.error("Ошибка при запросе к OpenAI:", error);
    }

    if(messagesCache[chatId].length > 30){
      messagesCache[chatId] = []; // Очищаем кэш после ответа
    }

  }
}

setInterval(() => {
  console.log('try', messagesCache)
  for (const chatId in messagesCache) {

    sendGPTResponse(chatId);
  }
}, 10000);