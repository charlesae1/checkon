const { Client, GatewayIntentBits } = require('discord.js');
const puppeteer = require('puppeteer');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const personagens = ['Jojotap', 'Assemblas Rush'];
const statusAnterior = {};

async function verificarStatus(channel) {
  for (const nome of personagens) {
    const url = `https://rubinot.com.br/?subtopic=characters&name=${encodeURIComponent(nome)}`;

    try {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const estaOnline = await page.evaluate(() =>
        document.body.innerHTML.includes('class="green">Online')
      );

      if (estaOnline && !statusAnterior[nome]) {
        channel.send(`${nome} está 🟢 **Online**`);
        statusAnterior[nome] = true;
      }

      if (!estaOnline) {
        statusAnterior[nome] = false;
      }

      await browser.close();
    } catch (err) {
      console.error(`Erro ao verificar ${nome}: ${err.message}`);
    }
  }
}

client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);
  const channel = client.channels.cache.get(CHANNEL_ID);

  if (!channel) {
    console.error('Canal não encontrado. Verifique o ID.');
    return;
  }

  verificarStatus(channel);
  setInterval(() => verificarStatus(channel), 60 * 1000);
});

client.login(TOKEN);