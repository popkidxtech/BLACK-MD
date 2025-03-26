"use strict";

const { makeInMemoryStore, fetchLatestBaileysVersion, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const conf = require("./set");
const session = conf.session.replace(/POPKID-MD;;;=>/g, "");
require("dotenv").config({ path: "./config.env" });

let auto_reply_message = "Hello, Popkid Tech will respond soon.";

async function authentification() {
  try {
    if (!fs.existsSync(__dirname + "/auth/creds.json")) {
      console.log("Connected successfully...");
      await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
    } else if (fs.existsSync(__dirname + "/auth/creds.json") && session !== "zokk") {
      await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
    }
  } catch (e) {
    console.log("Session Invalid " + e);
  }
}
authentification();

const store = makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" })
});

setTimeout(() => {
  async function main() {
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/auth");

    const sockOptions = {
      version,
      logger: pino({ level: "silent" }),
      browser: ['POPKID-MD', "safari", "1.0.0"],
      printQRInTerminal: true,
      fireInitQueries: false,
      shouldSyncHistoryMessage: true,
      downloadHistory: true,
      syncFullHistory: true,
      generateHighQualityLinkPreview: true,
      markOnlineOnConnect: false,
      keepAliveIntervalMs: 30_000,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      getMessage: async (key) => {
        if (store) {
          const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
          return msg.message || undefined;
        }
        return { conversation: 'An Error Occurred, Repeat Command!' };
      }
    };

    const zk = require("@whiskeysockets/baileys")(sockOptions);
    store.bind(zk.ev);
    setInterval(() => {
      store.writeToFile("store.json");
    }, 3000);

    zk.ev.on("call", async (callData) => {
      if (conf.ANTICALL === 'yes') {
        const callId = callData[0].id;
        const callerId = callData[0].from;
        await zk.rejectCall(callId, callerId);
        await zk.sendMessage(callerId, {
          text: "I AM POPKID-MD | I REJECT THIS CALL BECAUSE MY OWNER IS BUSY. KINDLY SEND TEXT INSTEAD."
        });
      }
    });

    zk.ev.on("messages.upsert", async (m) => {
      const { messages } = m;
      const ms = messages[0];
      if (!ms.message) return;

      const messageKey = ms.key;
      const remoteJid = messageKey.remoteJid;

      if (!store.chats[remoteJid]) {
        store.chats[remoteJid] = [];
      }

      store.chats[remoteJid].push(ms);

      if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
        const deletedKey = ms.message.protocolMessage.key;
        const chatMessages = store.chats[remoteJid];
        const deletedMessage = chatMessages.find(msg => msg.key.id === deletedKey.id);

        if (deletedMessage) {
          const deletedBy = deletedMessage.key.participant || deletedMessage.key.remoteJid;
          let notification = `*『👻 ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ᴅᴇᴛᴇᴄᴛᴇᴅ 👻』*\n\n`;
  notification += `*ᴅᴇʟᴇᴛɪᴏɴ ᴛɪᴍᴇ :* ${new Date().toLocaleString()}\n`;
  notification += `*ᴅᴇʟᴇᴛᴇᴅ ʙʏ :* @${deletedBy.split('@')[0]}\n\n> ᴍᴇssᴀɢᴇ ʀᴇᴛʀɪᴇᴠᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ-ᴍᴅ`;
  return notification;
        }
        
          if (deletedMessage.message.conversation) {
            await zk.sendMessage(remoteJid, {
              text: notification + `\n\n*ᴅᴇʟᴇᴛᴇᴅ ᴍᴇssᴀɢᴇ* : ${deletedMessage.message.conversation}`,
              mentions: [deletedMessage.key.participant]
            });
          } else if (deletedMessage.message.imageMessage || deletedMessage.message.videoMessage || deletedMessage.message.documentMessage || deletedMessage.message.audioMessage || deletedMessage.message.stickerMessage || deletedMessage.message.voiceMessage) {
            const mediaBuffer = await downloadMedia(deletedMessage.message);
            if (mediaBuffer) {
              const mediaType = deletedMessage.message.imageMessage ? 'image' : deletedMessage.message.videoMessage ? 'video' : deletedMessage.message.documentMessage ? 'document' : deletedMessage.message.audioMessage ? 'audio' : deletedMessage.message.stickerMessage ? 'sticker' : 'audio';
              await zk.sendMessage(remoteJid, {
                [mediaType]: mediaBuffer,
                caption: notification,
                mentions: [deletedMessage.key.participant]
              });
            }
          }
        }
      }
    });

    let repliedContacts = new Set();
    zk.ev.on("messages.upsert", async (m) => {
      const { messages } = m;
      const ms = messages[0];
      if (!ms.message) return;
      const messageText = ms.message.conversation || ms.message.extendedTextMessage?.text || "";
      const remoteJid = ms.key.remoteJid;

      if (messageText.match(/^[^\w\s]/) && ms.key.fromMe) {
        const prefix = messageText[0];
        const command = messageText.slice(1).split(" ")[0];
        const newMessage = messageText.slice(prefix.length + command.length).trim();

        if (command === "setautoreply" && newMessage) {
          auto_reply_message = newMessage;
          await zk.sendMessage(remoteJid, {
            text: `Auto-reply message has been updated to:\n"${auto_reply_message}"`
          });
          return;
        }
      }

      if (conf.AUTO_REPLY === "yes" && !repliedContacts.has(remoteJid) && !ms.key.fromMe && !remoteJid.includes("@g.us")) {
        await zk.sendMessage(remoteJid, {
          text: auto_reply_message,
          mentions: [ms.key.remoteJid]
        });

        repliedContacts.add(remoteJid);
      }
    });

  if (conf.AUTO_LIKE_STATUS === "yes") {
    console.log("AUTO_LIKE_STATUS is enabled. Listening for status updates...");

    let lastReactionTime = 0;

    zk.ev.on("messages.upsert", async (m) => {
      const { messages } = m;

      for (const message of messages) {
        // Check if the message is a status update
        if (message.key && message.key.remoteJid === "status@broadcast") {
          console.log("Detected status update from:", message.key.remoteJid);

          // Ensure throttling by checking the last reaction time
          const now = Date.now();
          if (now - lastReactionTime < 5000) {  // 5-second interval
            console.log("Throttling reactions to prevent overflow.");
            continue;
          }

          // Check if bot user ID is available
          const keith = zk.user && zk.user.id ? zk.user.id.split(":")[0] + "@s.whatsapp.net" : null;
          if (!keith) {
            console.log("Bot's user ID not available. Skipping reaction.");
            continue;
          }

          // Fetch emojis from conf.EMOJIS
          const emojis = conf.EMOJIS.split(',');

          // Select a random love emoji
          const randomLoveEmoji = emojis[Math.floor(Math.random() * emojis.length)];

          // React to the status with the selected love emoji
          await zk.sendMessage(message.key.remoteJid, {
            react: {
              key: message.key,
              text: "🩷", // Reaction emoji
            },
          });

          // Log successful reaction and update the last reaction time
          lastReactionTime = Date.now();
          console.log(`Successfully reacted to status update by ${message.key.remoteJid} with ${randomLoveEmoji}`);

          // Delay to avoid rapid reactions
          await delay(2000); // 2-second delay between reactions
        }
      }
    });
}

    //AUTO REACT TO MESSEGES
 if (conf.AUTO_REACT === "yes") {
    let lastReactionTime = 0;
    const reactionInterval = 5000; // 5-second interval

    zk.ev.on("messages.upsert", async m => {
      const { messages } = m;

      // Fetch emojis from conf.EMOJIS
      const emojis = conf.EMOJIS.split(',');

      // Process each message
      for (const message of messages) {
        // Ensure throttling by checking the last reaction time
        const now = Date.now();
        if (now - lastReactionTime < reactionInterval) {
          console.log("Throttling reactions to prevent overreaction.");
          continue;
        }

        if (!message.key.fromMe) {
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          
          // React to the message with a random emoji
          await zk.sendMessage(message.key.remoteJid, {
            react: {
              text: randomEmoji,
              key: message.key
            }
          });

          // Log successful reaction and update the last reaction time
          lastReactionTime = now;
          console.log(`Successfully reacted to message from ${message.key.remoteJid} with ${randomEmoji}`);

          // Delay to avoid rapid reactions
          await delay(reactionInterval); // Delay between reactions
        }
      }
    });
    }

  main();
}, 0);
