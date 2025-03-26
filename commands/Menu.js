const axios = require("axios");
const { keith } = require(__dirname + "/../keizzah/keith");
const { format } = require(__dirname + "/../keizzah/mesfonctions");
const os = require('os');
const moment = require("moment-timezone");
const settings = require(__dirname + "/../set");

const readMore = String.fromCharCode(8206).repeat(4001);

// Function to convert text to fancy uppercase font
const toFancyUppercaseFont = (text) => {
    const fonts = {
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌',
        'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙'
    };
    return text.split('').map(char => fonts[char] || char).join('');
};

// Function to convert text to fancy lowercase font
const toFancyLowercaseFont = (text) => {
    const fonts = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ',
        'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': '𝚜', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.split('').map(char => fonts[char] || char).join('');
};

const formatUptime = (seconds) => {
    seconds = Number(seconds);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return [
        days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : '',
        hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : '',
        minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : '',
        remainingSeconds > 0 ? `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}` : ''
    ].filter(Boolean).join(', ');
};

const fetchGitHubStats = async () => {
    try {
        const response = await axios.get("https://api.github.com/repos/Beltah254/X-BOT");
        const forksCount = response.data.forks_count;
        const starsCount = response.data.stargazers_count;
        const totalUsers = forksCount * 2 + starsCount * 2;
        return { forks: forksCount, stars: starsCount, totalUsers };
    } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        return { forks: 0, stars: 0, totalUsers: 0 };
    }
};

// Random quotes array
const quotes = [
    "Dream big, work hard.",
    "Stay humble, hustle hard.",
    "Believe in yourself.",
    "Success is earned, not given.",
    "Actions speak louder than words.",
    "The best is yet to come.",
    "Keep pushing forward.",
    "Do more than just exist.",
    "Progress, not perfection.",
    "Stay positive, work hard.",
    "Be the change you seek.",
    "Never stop learning.",
    "Chase your dreams.",
    "Be your own hero.",
    "Life is what you make of it.",
    "Do it with passion or not at all.",
    "You are stronger than you think.",
    "Create your own path.",
    "Make today count.",
    "Embrace the journey.",
    "The best way out is always through.",
    "Strive for progress, not perfection.",
    "Don't wish for it, work for it.",
    "Live, laugh, love.",
    "Keep going, you're getting there.",
    "Don’t stop until you’re proud.",
    "Success is a journey, not a destination.",
    "Take the risk or lose the chance.",
    "It’s never too late.",
    "Believe you can and you're halfway there.",
    "Small steps lead to big changes.",
    "Happiness depends on ourselves.",
    "Take chances, make mistakes.",
    "Be a voice, not an echo.",
    "The sky is the limit.",
    "You miss 100% of the shots you don’t take.",
    "Start where you are, use what you have.",
    "The future belongs to those who believe.",
    "Don’t count the days, make the days count.",
    "Success is not the key to happiness. Happiness is the key to success."
];

// Function to get a random quote
const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
};

keith({ nomCom: "menu", aliases: ["liste", "helplist", "commandlist"], categorie: "SYSTEM" }, async (message, client, config) => {
    const { ms, respond, prefix, nomAuteurMessage } = config;
    const commands = require(__dirname + "/../keizzah/keith").cm;
    const categorizedCommands = {};
    const mode = settings.MODE.toLowerCase() !== "public" ? "Private" : "Public";

    // Organize commands into categories
    commands.forEach(command => {
        const category = command.categorie.toUpperCase();
        if (!categorizedCommands[category]) {
            categorizedCommands[category] = [];
        }
        categorizedCommands[category].push(command.nomCom);
    });

    moment.tz.setDefault("Africa/Nairobi");
    const currentTime = moment();
    const formattedTime = currentTime.format("HH:mm:ss");
    const formattedDate = currentTime.format("DD/MM/YYYY");
    const currentHour = currentTime.hour();

    const greetings = ["Good Morning 🌄", "Good Afternoon 🌃", "Good Evening ⛅", "Good Night 🌙"];
    const greeting = currentHour < 12 ? greetings[0] : currentHour < 17 ? greetings[1] : currentHour < 21 ? greetings[2] : greetings[3];

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    const randomQuote = getRandomQuote();

    let responseMessage = `
 ${greeting}, *${nomAuteurMessage || "User"}*
 
╭━━━━☠︎︎  ${settings.BOT}  ☠︎︎━━━━╮ 
┃✞︎╭──────────────
┃✞︎│ *ʙᴏᴛ ᴏᴡɴᴇʀ:* ${settings.OWNER_NAME}
┃✞︎│ *ᴘʀᴇғɪx:* *[ ${settings.PREFIXE} ]*
┃✞︎│ *ᴛɪᴍᴇ:* ${formattedTime}
┃✞︎│ *ᴄᴏᴍᴍᴀɴᴅꜱ:* ${commands.length} 
┃✞︎│ *ᴅᴀᴛᴇ:* ${formattedDate}
┃✞︎│ *ᴍᴏᴅᴇ:* ${mode}
┃✞︎│ *ʀᴀᴍ:* ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
┃✞︎│ *ᴜᴘᴛɪᴍᴇ:* ${formatUptime(process.uptime())}
┃✞︎╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

> *${randomQuote}*\n`;

    let commandsList = "";
    const sortedCategories = Object.keys(categorizedCommands).sort();
    let commandIndex = 1;

    for (const category of sortedCategories) {
        commandsList += `\n*╭━☠︎︎ ${toFancyUppercaseFont(category)} ☠︎︎━╮*`;
        const sortedCommands = categorizedCommands[category].sort();
        for (const command of sortedCommands) {
            commandsList += `\n┃➪ ${toFancyLowercaseFont(command)}`;
        }
        commandsList += "\n╰━━━━━━━━━━━━━━━┈⊷";
    }

    commandsList += readMore + "\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ xᴛᴇᴄʜ\n";

    try {
        const senderName = message.sender || message.from;
        await client.sendMessage(message, {
            text: responseMessage + commandsList,
            contextInfo: {
                mentionedJid: [senderName],
                externalAdReply: {
                    title: "𝗣𝗢𝗣𝗞𝗜𝗗 𝗫𝗧𝗘𝗖𝗛 𝗕𝗢𝗧" ,
                    body: "𝗧𝗵𝗮𝗻𝗸 𝘆𝗼𝘂 𝗳𝗼𝗿 𝗰𝗵𝗼𝗼𝘀𝗶𝗻𝗴 𝗣𝗼𝗽𝗸𝗶𝗱 𝗕𝗼𝘁" ,
                    thumbnailUrl: "https://files.catbox.moe/nk71o3.jpg" ,
                    sourceUrl:'https://whatsapp.com/channel/0029VadQrNI8KMqo79BiHr3l' ,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
    } catch (error) {
        console.error("Menu error: ", error);
        respond("🥵🥵 Menu error: " + error);
    }
});

keith({ nomCom: "list", aliases: ["liste", "helplist", "commandlist"], categorie: "SYSTEM" }, async (message, client, config) => {
    const { ms, respond, prefix, nomAuteurMessage } = config;
    const commands = require(__dirname + "/../keizzah/keith").cm;
    const categorizedCommands = {};
    const mode = settings.MODE.toLowerCase() !== "public" ? "Private" : "Public";

    // Organize commands into categories
    commands.forEach(command => {
        const category = command.categorie.toUpperCase();
        if (!categorizedCommands[category]) {
            categorizedCommands[category] = [];
        }
        categorizedCommands[category].push(command.nomCom);
    });

    moment.tz.setDefault("Africa/Nairobi");
    const currentTime = moment();
    const formattedTime = currentTime.format("HH:mm:ss");
    const formattedDate = currentTime.format("DD/MM/YYYY");
    const currentHour = currentTime.hour();

    const greetings = ["Good Morning 🌄", "Good Afternoon 🌃", "Good Evening ⛅", "Good Night 🌙"];
    const greeting = currentHour < 12 ? greetings[0] : currentHour < 17 ? greetings[1] : currentHour < 21 ? greetings[2] : greetings[3];

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    const randomQuote = getRandomQuote();

    let responseMessage = `
 ${greeting}, *${nomAuteurMessage || "User"}*
 
╭━━━ 〔 ${settings.BOT} 〕━━━┈⊷
┃╭──────────────
┃│▸ *ʙᴏᴛ ᴏᴡɴᴇʀ:* ${settings.OWNER_NAME}
┃│▸ *ᴘʀᴇғɪx:* *[ ${settings.PREFIXE} ]*
┃│▸ *ᴛɪᴍᴇ:* ${formattedTime}
┃│▸ *ᴄᴏᴍᴍᴀɴᴅꜱ:* ${commands.length} 
┃│▸ *ᴅᴀᴛᴇ:* ${formattedDate}
┃│▸ *ᴍᴏᴅᴇ:* ${mode}
┃│▸ *ᴛɪᴍᴇ ᴢᴏɴᴇ:* Africa/Nairobi
┃│▸ *ᴛᴏᴛᴀʟ ᴜsᴇʀs:* ${formattedTotalUsers} users
┃│▸ *ʀᴀᴍ:* ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
┃│▸ *ᴜᴘᴛɪᴍᴇ:* ${formatUptime(process.uptime())}
┃╰──────────────
╰━━━━━━━━━━━━━━━┈⊷
> *${randomQuote}*

`;

    let commandsList = "*𝗣𝗢𝗣𝗞𝗜𝗗 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦*\n";
    const sortedCategories = Object.keys(categorizedCommands).sort();
    let commandIndex = 1;

    for (const category of sortedCategories) {
        commandsList += `\n*╭─────「 ${toFancyUppercaseFont(category)} 」──┈⊷*\n│◦│╭───────────────`;
        const sortedCommands = categorizedCommands[category].sort();
        for (const command of sortedCommands) {
            commandsList += `\n│◦│ ${commandIndex++}. ${toFancyLowercaseFont(command)}`;
        }
        commandsList += "\n│◦╰─────────────\n╰──────────────┈⊷\n";
    }

    commandsList += readMore + "\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ\n";

    try {
        const senderName = message.sender || message.from;
        await client.sendMessage(message, {
            text: responseMessage + commandsList,
            contextInfo: {
                mentionedJid: [senderName],
                externalAdReply: {
                    title: "𝐏𝐎𝐏𝐊𝐈𝐃 𝐌𝐃" ,
                    body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ" ,
                    thumbnailUrl: "https://files.catbox.moe/nk71o3.jpg" ,
                    sourceUrl:'https://whatsapp.com/channel/0029VadQrNI8KMqo79BiHr3l' ,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
    } catch (error) {
        console.error("Menu error: ", error);
        respond("🥵🥵 Menu error: " + error);
    }
});

keith({ nomCom: "allcmd", aliases: ["liste", "helplist", "commandlist"], categorie: "SYSTEM" }, async (message, client, config) => {
    const { ms, respond, prefix, nomAuteurMessage } = config;
    const commands = require(__dirname + "/../keizzah/keith").cm;
    const categorizedCommands = {};
    const mode = settings.MODE.toLowerCase() !== "public" ? "Private" : "Public";

    // Organize commands into categories
    commands.forEach(command => {
        const category = command.categorie.toUpperCase();
        if (!categorizedCommands[category]) {
            categorizedCommands[category] = [];
        }
        categorizedCommands[category].push(command.nomCom);
    });

    moment.tz.setDefault("Africa/Nairobi");
    const currentTime = moment();
    const formattedTime = currentTime.format("HH:mm:ss");
    const formattedDate = currentTime.format("DD/MM/YYYY");
    const currentHour = currentTime.hour();

    const greetings = ["Good Morning 🌄", "Good Afternoon 🌃", "Good Evening ⛅", "Good Night 🌙"];
    const greeting = currentHour < 12 ? greetings[0] : currentHour < 17 ? greetings[1] : currentHour < 21 ? greetings[2] : greetings[3];

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    const randomQuote = getRandomQuote();

    let responseMessage = `
 ${greeting}, *${nomAuteurMessage || "User"}*
 
╭━━━ 〔 ${settings.BOT} 〕━━━┈⊷
┃╭──────────────
┃│▸ *ʙᴏᴛ ᴏᴡɴᴇʀ:* ${settings.OWNER_NAME}
┃│▸ *ᴘʀᴇғɪx:* *[ ${settings.PREFIXE} ]*
┃│▸ *ᴛɪᴍᴇ:* ${formattedTime}
┃│▸ *ᴄᴏᴍᴍᴀɴᴅꜱ:* ${commands.length} 
┃│▸ *ᴅᴀᴛᴇ:* ${formattedDate}
┃│▸ *ᴍᴏᴅᴇ:* ${mode}
┃│▸ *ᴛɪᴍᴇ ᴢᴏɴᴇ:* Africa/Nairobi
┃│▸ *ᴛᴏᴛᴀʟ ᴜsᴇʀs:* ${formattedTotalUsers} users
┃│▸ *ʀᴀᴍ:* ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
┃│▸ *ᴜᴘᴛɪᴍᴇ:* ${formatUptime(process.uptime())}
┃╰──────────────
╰━━━━━━━━━━━━━━━┈⊷
> *${randomQuote}*

`;

    let commandsList = "*𝐁𝐄𝐋𝐓𝐀𝐇 𝐌𝐃 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒*\n";
    const sortedCategories = Object.keys(categorizedCommands).sort();
    let commandIndex = 1;

    for (const category of sortedCategories) {
        commandsList += `\n*╭─────「 ${toFancyUppercaseFont(category)} 」──┈⊷*\n│◦│╭───────────────`;
        const sortedCommands = categorizedCommands[category].sort();
        for (const command of sortedCommands) {
            commandsList += `\n│◦│ ${commandIndex++}. ${toFancyLowercaseFont(command)}`;
        }
        commandsList += "\n│◦╰─────────────\n╰──────────────┈⊷\n";
    }

    commandsList += readMore + "\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ʜᴀᴄᴋɪɴɢ ᴛᴇᴀᴍ\n";

    try {
        const senderName = message.sender || message.from;
        await client.sendMessage(message, {
            text: responseMessage + commandsList,
            contextInfo: {
                mentionedJid: [senderName],
                externalAdReply: {
                    title: "𝐁𝐄𝐋𝐓𝐀𝐇 𝐌𝐃" ,
                    body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ʜᴀᴄᴋɪɴɢ ᴛᴇᴀᴍ" ,
                    thumbnailUrl: "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg" ,
                    sourceUrl:'https://whatsapp.com/channel/0029VaRHDBKKmCPKp9B2uH2F' ,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
    } catch (error) {
        console.error("Menu error: ", error);
        respond("🥵🥵 Menu error: " + error);
    }
});

keith({ nomCom: "help", aliases: ["liste", "helplist", "commandlist"], categorie: "SYSTEM" }, async (message, client, config) => {
    const { ms, respond, prefix, nomAuteurMessage } = config;
    const commands = require(__dirname + "/../keizzah/keith").cm;
    const categorizedCommands = {};
    const mode = settings.MODE.toLowerCase() !== "public" ? "Private" : "Public";

    // Organize commands into categories
    commands.forEach(command => {
        const category = command.categorie.toUpperCase();
        if (!categorizedCommands[category]) {
            categorizedCommands[category] = [];
        }
        categorizedCommands[category].push(command.nomCom);
    });

    moment.tz.setDefault("Africa/Nairobi");
    const currentTime = moment();
    const formattedTime = currentTime.format("HH:mm:ss");
    const formattedDate = currentTime.format("DD/MM/YYYY");
    const currentHour = currentTime.hour();

    const greetings = ["Good Morning 🌄", "Good Afternoon 🌃", "Good Evening ⛅", "Good Night 🌙"];
    const greeting = currentHour < 12 ? greetings[0] : currentHour < 17 ? greetings[1] : currentHour < 21 ? greetings[2] : greetings[3];

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    const randomQuote = getRandomQuote();

    let responseMessage = `
 ${greeting}, *${nomAuteurMessage || "User"}*
 
╭━━━ 〔 ${settings.BOT} 〕━━━┈⊷
┃╭──────────────
┃│▸ *ʙᴏᴛ ᴏᴡɴᴇʀ:* ${settings.OWNER_NAME}
┃│▸ *ᴘʀᴇғɪx:* *[ ${settings.PREFIXE} ]*
┃│▸ *ᴛɪᴍᴇ:* ${formattedTime}
┃│▸ *ᴄᴏᴍᴍᴀɴᴅꜱ:* ${commands.length} 
┃│▸ *ᴅᴀᴛᴇ:* ${formattedDate}
┃│▸ *ᴍᴏᴅᴇ:* ${mode}
┃│▸ *ᴛɪᴍᴇ ᴢᴏɴᴇ:* Africa/Nairobi
┃│▸ *ᴛᴏᴛᴀʟ ᴜsᴇʀs:* ${formattedTotalUsers} users
┃│▸ *ʀᴀᴍ:* ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
┃│▸ *ᴜᴘᴛɪᴍᴇ:* ${formatUptime(process.uptime())}
┃╰──────────────
╰━━━━━━━━━━━━━━━┈⊷
*${randomQuote}*

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ʜᴀᴄᴋɪɴɢ ᴛᴇᴀᴍ

`;

    let commandsList = "*𝐁𝐄𝐋𝐓𝐀𝐇 𝐌𝐃 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒*\n";
    const sortedCategories = Object.keys(categorizedCommands).sort();
    let commandIndex = 1;

    for (const category of sortedCategories) {
        commandsList += `\n*╭─────「 ${toFancyUppercaseFont(category)} 」──┈⊷*\n│◦│╭───────────────`;
        const sortedCommands = categorizedCommands[category].sort();
        for (const command of sortedCommands) {
            commandsList += `\n│◦│ ${commandIndex++}. ${toFancyLowercaseFont(command)}`;
        }
        commandsList += "\n│◦╰─────────────\n╰──────────────┈⊷\n";
    }

    commandsList += readMore + "\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ʜᴀᴄᴋɪɴɢ ᴛᴇᴀᴍ\n";

    try {
        const senderName = message.sender || message.from;
        await client.sendMessage(message, {
            text: responseMessage + commandsList,
            contextInfo: {
                mentionedJid: [senderName],
                externalAdReply: {
                    title: "𝐁𝐄𝐋𝐓𝐀𝐇 𝐌𝐃" ,
                    body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ʜᴀᴄᴋɪɴɢ ᴛᴇᴀᴍ" ,
                    thumbnailUrl: "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg" ,
                    sourceUrl:'https://whatsapp.com/channel/0029VaRHDBKKmCPKp9B2uH2F' ,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });
    } catch (error) {
        console.error("Menu error: ", error);
        respond("🥵🥵 Menu error: " + error);
    }
});
