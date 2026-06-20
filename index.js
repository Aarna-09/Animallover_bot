require('dotenv').config();

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcodeTerminal = require('qrcode-terminal');
const qrcodeImage = require('qrcode');
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ============================================================
//  WEB SERVER — QR code browser pe dekhne ke liye
// ============================================================
const app = express();
let currentQR = null;

app.get('/qr', async (req, res) => {
    if (!currentQR) {
        return res.send('<h2 style="font-family:sans-serif">No QR right now. Bot is connected or starting up — refresh in a few seconds.</h2>');
    }
    try {
        const qrImageDataUrl = await qrcodeImage.toDataURL(currentQR, { width: 400 });
        res.send(`
            <html>
            <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:sans-serif;background:#111;flex-direction:column;">
                <h2 style="color:white;">Scan with WhatsApp</h2>
                <img src="${qrImageDataUrl}" style="width:350px;height:350px;" />
                <p style="color:#888;">Page auto-refreshes every 10 seconds</p>
                <script>setTimeout(()=>location.reload(), 10000)</script>
            </body>
            </html>
        `);
    } catch (e) {
        res.send('Error generating QR image: ' + e.message);
    }
});

app.get('/', (req, res) => res.send('AnimalsLover Bot is running. Go to /qr to scan.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🌐 Web server on port ${PORT} — visit /qr to scan`));

// ============================================================
//  CONFIG — .env se aayega
// ============================================================
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const EXECUTIVE_NUMBER = process.env.EXECUTIVE_NUMBER || '918809506230';
const MEMORY_FILE = 'customer_memory.json';

// ============================================================
//  UTILITY
// ============================================================
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================================
//  PERSISTENT MEMORY
// ============================================================
function loadMemory() {
    try {
        if (fs.existsSync(MEMORY_FILE)) return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
    } catch (e) {}
    return { customers: {} };
}

function saveMemory(mem) {
    try { fs.writeFileSync(MEMORY_FILE, JSON.stringify(mem, null, 2)); } catch (e) {}
}

const memory = loadMemory();

function getCustomer(phone) {
    if (!memory.customers[phone]) {
        memory.customers[phone] = {
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            msgCount: 0,
            breed: null,
            gender: null,
            budget: null,
            city: null,
            name: null,
            email: null,
            language: null,
            stage: 'new',
            breedShown: false,
            notified: false,
            budgetLowCount: 0,   // FIX: track how many times budget was too low
        };
    }
    return memory.customers[phone];
}

function updateCustomer(phone, updates) {
    const c = getCustomer(phone);
    Object.assign(c, updates);
    c.lastSeen = new Date().toISOString();
    c.msgCount = (c.msgCount || 0) + 1;
    saveMemory(memory);
    return memory.customers[phone];
}

// ============================================================
//  CONVERSATION HISTORY — last 20 messages
// ============================================================
const conversationHistory = new Map();
const processedMessages = new Set();

function getHistory(phone) {
    if (!conversationHistory.has(phone)) conversationHistory.set(phone, []);
    return conversationHistory.get(phone);
}

function addToHistory(phone, role, content) {
    const h = getHistory(phone);
    h.push({ role, content });
    if (h.length > 20) h.splice(0, h.length - 20);
}

// ============================================================
//  BREED DATABASE
// ============================================================
const BREEDS = [
    { name: 'Pomeranian', aliases: ['pomeranian', 'pom', 'pomerian', 'pomranian'], price_min: 5000, price_max: 10000 },
    { name: 'Labrador', aliases: ['labrador', 'lab', 'labra', 'labradog'], price_min: 11000, price_max: 25000 },
    { name: 'German Shepherd', aliases: ['german shepherd', 'german', 'gsd', 'alsatian', 'jerman', 'shepherd'], price_min: 12000, price_max: 45000 },
    { name: 'Husky', aliases: ['husky', 'siberian husky', 'siberan', 'husk'], price_min: 20000, price_max: 55000 },
    { name: 'Beagle', aliases: ['beagle', 'beagel', 'bagel dog'], price_min: 15000, price_max: 45000 },
    { name: 'Rottweiler', aliases: ['rottweiler', 'rottwailer', 'rott', 'rottie'], price_min: 11000, price_max: 40000 },
    { name: 'Shih Tzu', aliases: ['shih tzu', 'shihtzu', 'shitzu', 'shih', 'shit zu'], price_min: 14000, price_max: 35000 },
    { name: 'Golden Retriever', aliases: ['golden retriever', 'golden', 'retriever', 'goldie'], price_min: 17000, price_max: 55000 },
    { name: 'Doberman', aliases: ['doberman', 'dobermann', 'dober', 'doberman pinscher'], price_min: 12000, price_max: 35000 },
    { name: 'Pug', aliases: ['pug', 'pagg', 'vodafone dog'], price_min: 10000, price_max: 25000 },
    { name: 'Poodle', aliases: ['poodle', 'poodal'], price_min: 30000, price_max: 65000 },
    { name: 'Chow Chow', aliases: ['chow chow', 'chow', 'chowchow'], price_min: 20000, price_max: 65000 },
    { name: 'American Bully', aliases: ['american bully', 'bully', 'am bully', 'amrican bully'], price_min: 10000, price_max: 45000 },
    { name: 'Pit Bull', aliases: ['pit bull', 'pitbull', 'pit', 'pitbul', 'american pitbull'], price_min: 13000, price_max: 35000 },
];

function findBreed(message) {
    const lower = message.toLowerCase();
    return BREEDS.find(breed => breed.aliases.some(alias => lower.includes(alias)));
}

// ============================================================
//  LANGUAGE DETECTION
// ============================================================
function detectLanguage(text) {
    const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
    if (hindiChars > 2) return 'hindi';

    const hinglishWords = [
        'mujhe','chahiye','chahiy','hai','hain','kya','nahi','nhi','aur','bhi',
        'ka','ki','ke','ko','se','me','mein','pe','par','karo','karna','dena',
        'bhejo','batao','btao','lena','milega','haan','han','thik','theek',
        'accha','achha','bhai','yaar','kitna','kitne','kab','kaise','kyun',
        'lekin','toh','abhi','jaldi','bahut','thoda','zyada','kam','bilkul',
        'sirf','wala','wali','wale','apna','mera','tera','uska','humara',
        'nahi','nhi','hn','hnn'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const hinglishCount = words.filter(w => hinglishWords.includes(w)).length;
    if (hinglishCount >= 1) return 'hinglish';

    return 'english';
}

// ============================================================
//  GENDER DETECTION
// ============================================================
function findGender(text) {
    const lower = text.toLowerCase();
    if (/\b(male|boy|nara|ladka)\b/.test(lower)) return 'male';
    if (/\b(female|girl|fem|madi|ladki)\b/.test(lower)) return 'female';
    if (/^m\.?$/.test(lower.trim())) return 'male';
    if (/^f\.?$/.test(lower.trim())) return 'female';
    return null;
}

// ============================================================
//  BUDGET DETECTION
// ============================================================
function findBudget(text) {
    const lower = text.toLowerCase();

    // Range: "15-20k" → lower bound
    const rangeM = text.match(/(\d[\d,]*)\s*(k)?\s*[-–to]+\s*(\d[\d,]*)\s*(k)?/i);
    if (rangeM) {
        let val = parseInt(rangeM[1].replace(/,/g, ''));
        if (rangeM[2] || (val < 500 && lower.includes('k'))) val *= 1000;
        if (val >= 1000 && val <= 500000) return val;
    }

    // "18k"
    const kM = text.match(/\b(\d+)\s*k\b/i);
    if (kM) {
        const val = parseInt(kM[1]) * 1000;
        if (val >= 1000 && val <= 500000) return val;
    }

    // "18000", "₹18,000"
    const numM = text.match(/(?:rs\.?|inr|₹)?\s*(\d[\d,]{2,})/i);
    if (numM) {
        const val = parseInt(numM[1].replace(/,/g, ''));
        if (val >= 1000 && val <= 500000) return val;
    }

    return null;
}

// ============================================================
//  CITY DETECTION
// ============================================================
const KNOWN_CITIES = new Set([
    'mumbai','delhi','bangalore','bengaluru','hyderabad','ahmedabad','chennai',
    'kolkata','pune','surat','jaipur','lucknow','kanpur','nagpur','indore',
    'thane','bhopal','visakhapatnam','ludhiana','agra','nashik','faridabad',
    'meerut','rajkot','kalyan','vasai','varanasi','prayagraj','allahabad',
    'howrah','coimbatore','jabalpur','gwalior','vijayawada','jodhpur','madurai',
    'raipur','kota','guwahati','chandigarh','solapur','bareilly','moradabad',
    'mysore','mysuru','gurgaon','gurugram','noida','amritsar','ranchi',
    'patna','muzaffarpur','gaya','bhagalpur','darbhanga','bettiah','motihari',
    'hajipur','nalanda','araria','kishanganj','purnia','katihar','saharsa',
    'sitamarhi','madhepura','begusarai','munger','chapra','siwan','supaul',
    'gorakhpur','aligarh','saharanpur','firozabad','muzaffarnagar','mathura',
    'etawah','bulandshahr','hardoi','lakhimpur','mirzapur','jaunpur','azamgarh',
    'ballia','ghazipur','sultanpur','rae bareli','banda','hamirpur','ayodhya',
    'faizabad','mau','basti','deoria','sitapur',
    'ajmer','bikaner','udaipur','alwar','bhilwara','sikar',
    'bokaro','dhanbad','jamshedpur','hazaribagh','giridih','deoghar',
    'nanded','latur','kolhapur','sangli','wardha','amravati','akola','navi mumbai',
    'mangalore','udupi','belgaum','bellary','shimoga','tumkur','bijapur',
    'whitefield','koramangala','indiranagar','jayanagar','hebbal','nagavara',
    'warangal','karimnagar','nizamabad','guntur','nellore','tirupati','kurnool',
    'trichy','tiruchirappalli','salem','tirunelveli','vellore',
    'thiruvananthapuram','trivandrum','kochi','kozhikode','thrissur','kollam',
    'vadodara','baroda','jamnagar','bhavnagar','gandhinagar',
    'ujjain','sagar','satna','rewa','dewas',
    'bhubaneswar','cuttack','rourkela','sambalpur','berhampur',
    'siliguri','asansol','durgapur','bardhaman','kharagpur','haldia','kalyani',
    'jalandhar','patiala','bathinda','ambala','rohtak','hisar','panipat','karnal',
    'shimla','dharamsala','mandi','solan','dehradun','haridwar','roorkee','nainital',
    'agartala','shillong','imphal','gangtok',
    'panaji','margao','vasco','mapusa',
    'jammu','srinagar','leh',
    'kandivali','andheri','bandra','dadar','kurla','borivali','virar','mira road',
    'malad','goregaon','mulund','dombivali',
]);

function findCity(text) {
    const lower = text.toLowerCase().trim();

    for (const city of KNOWN_CITIES) {
        const escaped = city.replace(/\s+/g, '\\s+');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(lower)) {
            return city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
    }

    const m1 = text.match(/(?:deliver(?:y)?\s+(?:in|to)\s+|city\s*[-:]\s*)([A-Za-z][A-Za-z\s]{2,20})(?:\s*$|,)/i);
    if (m1) return m1[1].trim();

    return null;
}

// ============================================================
//  EMAIL DETECTION
// ============================================================
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// ============================================================
//  MULTILINGUAL HELPER
// ============================================================
function R(lang, hi, en, hinglish) {
    if (lang === 'hindi') return hi;
    if (lang === 'english') return en;
    return hinglish || hi;
}

// ============================================================
//  STATIC MESSAGES
// ============================================================
function welcomeMsg(lang) {
    return R(lang,
        `AnimalsLover में आपका स्वागत है! 🐾🙏\n\nहम आपको perfect pet ढूंढने में help करेंगे। Please बताएं:\n\n• कौन सी breed चाहिए?\n• Budget क्या है?\n• Delivery कहाँ चाहिए?\n\nAnimalsLover Team 🐾`,
        `Welcome to AnimalsLover! 🐾🙏\n\nWe're excited to help you find your perfect pet! Please share:\n\n• Which breed are you looking for?\n• Your budget range?\n• Your delivery city?\n\nAnimalsLover Team 🐾`,
        `AnimalsLover mein aapka swagat hai! 🐾🙏\n\nHum aapko perfect pet dhundhne mein help karenge. Please batao:\n\n• Kaunsi breed chahiye?\n• Budget kya hai?\n• Delivery kahan chahiye?\n\nAnimalsLover Team 🐾`
    );
}

const INCLUDES_MSG = `Har pet ke saath milega:\n✅ Health checkup\n✅ Vaccination/deworming\n✅ Free lifetime consultancy\n✅ Doorstep delivery\n✅ Certificate\n\n⚠️ Payment sirf SKAS Technologies official account pe — delivery boy ko kabhi nahi!`;

function genderQ(lang) {
    return R(lang, `Male chahiye ya female? 😊`, `Do you want a male or female? 😊`, `Male chahiye ya female? 😊`);
}
function budgetQ(lang) {
    return R(lang, `Aapka budget kitna hai? 💰`, `What is your budget? 💰`, `Aapka budget kitna hai? 💰`);
}
function cityQ(lang) {
    return R(lang, `Delivery kahan chahiye? City batao 📍`, `Which city for delivery? 📍`, `Delivery kahan chahiye? City batao 📍`);
}
function emailNameReq(lang) {
    return R(lang,
        `Email ID aur naam share karo — official quotation bhejenge 📧`,
        `Please share your email ID and name — we'll send the official quotation 📧`,
        `Email ID aur naam share karo — quotation bhejenge 📧`
    );
}

// ============================================================
//  FAQ PATTERNS — fast hardcoded replies
// ============================================================
const FAQ = [
    {
        pattern: /vaccin|vaccine|tikka|tika|immuniz|deworm|injection/i,
        reply: (lang) => R(lang,
            `Vaccination:\n✅ Puppy milne ke 3 din baad shuru karein\n✅ 9-in-1 vaccine lagwani hogi\n✅ Hum poori guidance denge 🐾`,
            `Vaccination:\n✅ Start 3 days after receiving the puppy\n✅ 9-in-1 vaccine required\n✅ We'll guide you completely 🐾`,
            `Vaccination:\n✅ Puppy milne ke 3 din baad shuru karo\n✅ 9-in-1 vaccine lagwani hogi\n✅ Hum guide karenge 🐾`
        )
    },
    {
        pattern: /delivery|deliver|kitne din|how many days|kab milega|kab aayega|time lagega|kab tak|dispatch/i,
        reply: (lang) => R(lang,
            `Booking ke baad 2-3 din mein delivery 🚚\nPuppies ~40-45 din ke hote hain.`,
            `Delivery in 2-3 days after booking 🚚\nPuppies are 40-45 days old.`,
            `Booking ke baad 2-3 din mein delivery 🚚`
        )
    },
    {
        pattern: /certificate|cert|document|papers|registration/i,
        reply: (lang) => R(lang,
            `Certificate delivery ke baad milega 🐾\nPet naam aur owner naam share karna hoga!`,
            `Certificate provided after delivery 🐾\nShare pet and owner name!`,
            `Certificate delivery ke baad milega 🐾`
        )
    },
    {
        pattern: /food|khana|khaana|diet|feed|feeding|kya khilayein|kya khilao/i,
        reply: (lang) => R(lang,
            `Puppy ke saath dietary chart milega 🐾\nFree lifetime food guidance included hai!`,
            `Dietary chart comes with the puppy 🐾\nFree lifetime food guidance included!`,
            `Puppy ke saath dietary chart milega 🐾`
        )
    },
    {
        pattern: /payment|pay|upi|gpay|google pay|paytm|qr|account|transfer|kitna dena|advance|booking amount/i,
        reply: (lang) => R(lang,
            `Payment ke liye pehle naam aur email share karo — quotation mein saari details hongi 📧\nBooking: Rs.2000 advance only 🙏`,
            `Share your name and email first — all payment details will be in the quotation 📧\nBooking: Rs.2000 advance only 🙏`,
            `Pehle naam aur email share karo — quotation mein payment details hongi 📧\nBooking: Rs.2000 advance only 🙏`
        )
    },
    {
        pattern: /visit|centre|center|office|shop|showroom|pickup|self.*pick|come.*see|dekh.*aao|aake.*lu/i,
        reply: (lang) => R(lang,
            `Hum home delivery prefer karte hain 🚚\nLekin aap aana chahte ho toh:\n📍 13th Floor, Startup Hub, Biscomaun Bhawan, Near Gandhi Maidan, Patna, Bihar 800001\n📞 +91-8252167751`,
            `We prefer home delivery 🚚\nBut you can visit us:\n📍 13th Floor, Startup Hub, Biscomaun Bhawan, Near Gandhi Maidan, Patna, Bihar 800001\n📞 +91-8252167751`,
            `Home delivery prefer karte hain 🚚\nVisit karna ho to:\n📍 13th Floor, Startup Hub, Biscomaun Bhawan, Patna, Bihar 800001\n📞 +91-8252167751`
        )
    },
    {
        pattern: /legit|legal|license|registered|fake|fraud|trust|genuine|real|authentic|startup india|gst/i,
        reply: (lang) => R(lang,
            `AnimalsLover Startup India recognized aur GST registered company hai 🏢\nHar pet ke saath proper invoice milti hai!\nhttps://www.animalslover.in`,
            `AnimalsLover is recognized by Startup India & GST registered 🏢\nYou get proper invoice with every pet!\nhttps://www.animalslover.in`,
            `AnimalsLover Startup India recognized hai, GST registered bhi hai 🏢\nhttps://www.animalslover.in`
        )
    },
    {
        pattern: /emi|installment|kisto|monthly|split|partial/i,
        reply: (lang) => R(lang,
            `EMI directly available nahi hai 🙏\nCredit card hai to explore kar sakte hain.\nBooking: Rs.2000 advance.`,
            `EMI not directly available 🙏\nCredit card option can be explored.\nBooking: Rs.2000 advance.`,
            `EMI directly available nahi hai 🙏\nCredit card ho to explore kar sakte hain.`
        )
    },
    {
        pattern: /review|rating|feedback|google|stars/i,
        reply: () => `Thank you! 🙏 Please share your review:\nhttps://g.page/r/Cf1HZ4qDDoSnEAE/review`
    },
    {
        pattern: /^(hi|hello|hey|hii|helo|hlw|hlo|namaste|namaskar|hy|hiii|heya)\s*[!?.]*$/i,
        reply: (lang) => R(lang,
            `Hello! 🐾 Koi bhi sawaal poochhiye, hum help karenge 😊`,
            `Hello! 🐾 Feel free to ask anything, we're here to help 😊`,
            `Hello! 🐾 Koi sawaal ho toh batao, help karenge 😊`
        )
    },
    {
        pattern: /^(ok|okay|achaa|accha|theek|thik|alright|fine|hmm|haan|han|hnn|hn|tq|thanks|thank you)\s*[!?.]*$/i,
        reply: (lang) => R(lang,
            `Koi aur sawaal ho toh zaroor poochhein 🙏`,
            `Feel free to ask if you have more questions 🙏`,
            `Koi aur sawaal ho toh poochho 🙏`
        )
    },
];

function checkFAQ(message, lang) {
    for (const item of FAQ) {
        if (item.pattern.test(message)) {
            return typeof item.reply === 'function' ? item.reply(lang) : item.reply;
        }
    }
    return null;
}

// ============================================================
//  AI CALL — Groq
// ============================================================
const SYSTEM_PROMPT = `You are AnimalsLover WhatsApp sales assistant for a pet company.

IMPORTANT RULES:
- Do NOT repeat already confirmed details.
- Keep replies natural, short, conversational like a real WhatsApp sales executive.
- Whenever customer mentions their city for first time, respond warmly like: "Yes available! We already have many happy customers in your city 🐾"
- Always use previous conversation context. Never ask for same info twice.
- Keep replies short, human-like, WhatsApp friendly.
- Use emojis naturally but not excessively.
- NEVER display internal notes, JSON, variables, alerts, system tags.
- Behave exactly like a real WhatsApp sales executive.

LANGUAGE LOCK (VERY IMPORTANT):
- Customer ki first message ki language = permanent language for whole conversation.
- Started English → STAY ENGLISH. Started Hindi → STAY HINDI. Hinglish allowed if customer started in Hinglish.

DELIVERY: 2-3 days after booking confirmation.

CONVERSATION FLOW:
Step 1: Greet. Ask breed, budget, city.
Step 2: If budget valid → ask male/female. If budget low → gently tell min price.
Step 3: Ask male/female (if not given).
Step 4: If photo/video asked → "Team will share shortly 😊"
Step 5: After breed+city+budget+gender collected → ask full name and email for quotation.
Step 6: After name+email → confirm quotation being prepared. Booking: Rs.2000 advance.

AVAILABLE BREEDS & PRICES:
- Pomeranian: ₹5,000–₹10,000
- Labrador: ₹11,000–₹25,000
- German Shepherd: ₹12,000–₹45,000
- Husky: ₹20,000–₹55,000
- Beagle: ₹15,000–₹45,000
- Rottweiler: ₹11,000–₹40,000
- Shih Tzu: ₹14,000–₹35,000
- Golden Retriever: ₹17,000–₹55,000
- Doberman: ₹12,000–₹35,000
- Pug: ₹10,000–₹25,000
- Poodle: ₹30,000–₹65,000
- Chow Chow: ₹20,000–₹65,000
- American Bully: ₹10,000–₹45,000
- Pit Bull: ₹13,000–₹35,000

PRICE ENQUIRY RULE:
If customer asks price of any breed, ALWAYS answer exact price range first.
After answering price, ask Male/Female preference.
Never ask gender before answering price.

PRICE & NEGOTIATION:
- If budget >= min price → VALID. Never negotiate unnecessarily.
- If budget < min price → "Best quality ₹[MIN] se start hoti hai 🐾 Team se best deal check karta hoon"
- If customer asks discount → "Best deal ke liye executive se connect karta hoon 🙏" then STOP negotiating.

PAYMENT:
- NEVER share UPI, GPay, bank account, QR.
- If asked → "Naam aur email share karo — quotation mein saari details hongi 😊"
- Payment only to: SKAS Technologies Pvt. Ltd.

INCLUDED WITH EVERY PET:
✅ Health checkup ✅ Vaccination ✅ Free lifetime consultancy ✅ Doorstep delivery ✅ Certificate

CENTRE VISIT: "We prefer home delivery 🐾 But you can visit: 📍 13th Floor, Startup Hub, Biscomaun Bhawan, Near Gandhi Maidan Rd, Patna, Bihar 800001"

CUSTOMER PROFILE:
{CUSTOMER_STATE}`;

async function callAI(phone, userMessage, lang) {
    const customer = getCustomer(phone);
    const history = getHistory(phone);

    const customerState = [
        customer.breed ? `Interested breed: ${customer.breed}` : '',
        customer.city ? `City: ${customer.city}` : '',
        customer.budget ? `Budget: Rs.${customer.budget}` : '',
        customer.gender ? `Gender preference: ${customer.gender}` : '',
        customer.name ? `Name: ${customer.name}` : '',
        customer.email ? `Email: ${customer.email}` : '',
        `Stage: ${customer.stage}`,
        `Language: ${lang}`
    ].filter(Boolean).join('\n');

    const systemPrompt = SYSTEM_PROMPT.replace('{CUSTOMER_STATE}', customerState);

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...history,
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.45,
                max_tokens: 300
            },
            {
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('GROQ ERROR:', error.response?.data || error.message);
        return R(lang,
            `Sorry, thoda technical issue aa gaya. Main jaldi update karunga 🙏`,
            `Sorry, facing a technical issue. Will update you shortly 🙏`,
            `Sorry, thoda technical issue aa gaya 🙏`
        );
    }
}

// ============================================================
//  EXECUTIVE ALERT
// ============================================================
async function sendAlert(sock, phone, type, message) {
    if (!EXECUTIVE_NUMBER) return;
    const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const customer = getCustomer(phone);
    const info = [
        customer.breed ? `Breed: ${customer.breed}` : '',
        customer.city ? `City: ${customer.city}` : '',
        customer.budget ? `Budget: Rs.${customer.budget}` : '',
        customer.name ? `Name: ${customer.name}` : '',
        customer.email ? `Email: ${customer.email}` : '',
    ].filter(Boolean).join(' | ');

    // Use realPhone if available, else raw phone
    // realPhone is saved when first @s.whatsapp.net message arrives
    const realPhone = customer.realPhone || phone;
    // WhatsApp link — always use realPhone
    const link = `https://wa.me/${realPhone}`;
    let text = '';

    if (type === 'photo') {
        text = `📸 *PHOTO/VIDEO REQUEST*\n👤 Customer: +${phone}\n💬 "${message}"\n${info}\n🔗 ${link}\n🕐 ${time}`;
    } else if (type === 'price') {
        text = `💰 *PRICE NEGOTIATION*\n👤 Customer: +${phone}\n💬 "${message}"\n${info}\n🔗 ${link}\n🕐 ${time}`;
    } else if (type === 'email') {
        text = `📧 *EMAIL RECEIVED — QUOTATION BHEJO*\n👤 Customer: +${phone}\n📩 "${message}"\n${info}\n🔗 ${link}\n🕐 ${time}`;
    } else if (type === 'complaint') {
        text = `🚨 *COMPLAINT — URGENT*\n👤 Customer: +${phone}\n💬 "${message}"\n${info}\n🔗 ${link}\n🕐 ${time}`;
    } else if (type === 'low_budget') {
        text = `⚠️ *LOW BUDGET — NEEDS ATTENTION*\n👤 Customer: +${phone}\n💬 "${message}"\n${info}\n🔗 ${link}\n🕐 ${time}`;
    }

    try {
        await sock.sendMessage(`${EXECUTIVE_NUMBER}@s.whatsapp.net`, { text });
        console.log(`📢 Alert [${type}] → +${EXECUTIVE_NUMBER}`);
    } catch (e) {
        console.log('Alert failed:', e.message);
    }
}

// ============================================================
//  SEND BREED AVAILABLE — photos + includes message
// ============================================================
async function sendBreedAvailable(sock, jid, phone, breed, city, lang) {
    const cityMsg = city
        ? R(lang,
            `Yes available! ${city} mein hamare bahut happy customers hain 🐾`,
            `Yes available! We have many happy customers in ${city} 🐾`,
            `Yes available! ${city} mein bahut happy customers hain 🐾`
          )
        : R(lang,
            `Yes available! Pan India delivery karte hain 🐾`,
            `Yes available! We deliver Pan India 🐾`,
            `Yes available! Pan India delivery karte hain 🐾`
          );

    await sock.sendMessage(jid, { text: cityMsg });
    addToHistory(phone, 'assistant', cityMsg);

    await delay(1000);

    // Photo 1
    const f1 = path.join(__dirname, 'f1.jpeg');
    if (fs.existsSync(f1)) {
        await sock.sendMessage(jid, { image: { url: f1 } });
        await delay(800);
    }

    // Photo 2
    const f2 = path.join(__dirname, 'f2.jpeg');
    if (fs.existsSync(f2)) {
        await sock.sendMessage(jid, { image: { url: f2 } });
        await delay(800);
    }

    // Video
    const f3 = path.join(__dirname, 'f3.mp4');
    if (fs.existsSync(f3)) {
        await sock.sendMessage(jid, {
            video: { url: f3 },
            caption: 'Our happy customers love their pets! 😍🐾'
        });
        await delay(1000);
    }

    await sock.sendMessage(jid, { text: INCLUDES_MSG });
    addToHistory(phone, 'assistant', INCLUDES_MSG);
    await delay(600);
}

// ============================================================
//  MAIN MESSAGE HANDLER
// ============================================================
async function handleMessage(sock, phone, jid, text) {
    let customer = getCustomer(phone);

    // Language detect — lock on first meaningful detection
    // If previously set to 'english' from a short greeting (hi/hello/ok),
    // re-check on next message so hinglish/hindi is not missed
    const shortGreeting = /^(hi+|hello|hey|hii|helo|hlw|hlo|ok|okay|hy|heya)\s*[!?.]*$/i;
    if (!customer.language || (customer.language === 'english' && shortGreeting.test(customer.lastText || ''))) {
        const detectedLang = detectLanguage(text);
        // Upgrade: english → hinglish/hindi if detected; never downgrade hinglish/hindi
        if (!customer.language || detectedLang !== 'english') {
            updateCustomer(phone, { language: detectedLang });
        }
        customer = getCustomer(phone);
    }
    // Always store last text for above check
    updateCustomer(phone, { lastText: text });
    customer = getCustomer(phone);
    const lang = customer.language || 'hinglish';

    // Info extract
    const detectedBreed = findBreed(text);
    const detectedGender = findGender(text);
    const detectedBudget = findBudget(text);
    const detectedEmail = text.match(EMAIL_REGEX)?.[0];

    // City detect — sirf tab jab city question puchi ho ya keyword ho
    const cityAsked = getHistory(phone).some(h =>
        h.role === 'assistant' && (
            h.content.includes('City batao') ||
            h.content.includes('city for delivery') ||
            h.content.includes('Which city')
        )
    );
    const hasCityKeyword = /\b(in|at|from|city|deliver)\b/i.test(text);
    const detectedCity = (cityAsked || hasCityKeyword) ? findCity(text) : null;

    // -------------------------------------------------------
    // FIX 1: Always update budget (allows customer to revise)
    // -------------------------------------------------------
    if (detectedBudget) {
        const budgetUpdates = { budget: detectedBudget };
        // FIX 2: Reset low-budget counter if customer raises their budget
        if (!customer.budget || detectedBudget > customer.budget) {
            budgetUpdates.budgetLowCount = 0;
        }
        updateCustomer(phone, budgetUpdates);
        customer = getCustomer(phone);
    }

    // Update breed — allow switching breed
    if (detectedBreed) {
        updateCustomer(phone, { breed: detectedBreed.name, breedShown: false });
        customer = getCustomer(phone);
    }

    if (detectedGender && !customer.gender) {
        updateCustomer(phone, { gender: detectedGender });
        customer = getCustomer(phone);
    }

    if (detectedCity && !customer.city) {
        updateCustomer(phone, { city: detectedCity });
        customer = getCustomer(phone);
    }

    if (detectedEmail && !customer.email) {
        updateCustomer(phone, { email: detectedEmail });
        await sendAlert(sock, phone, 'email', text);
        customer = getCustomer(phone);
    }

    addToHistory(phone, 'user', text);

    // ===  ALERT CHECKS ===

    // Photo/video request
    const photoKeywords = ['photo','photos','pic','pics','picture','pictures','video','videos','bhejo','send karo','dikhao','show','footage','clip'];
    const isPhotoReq = photoKeywords.some(k => text.toLowerCase().includes(k));
    if (isPhotoReq) {
        await sendAlert(sock, phone, 'photo', text);
        // Schedule followup if executive doesnt reply in 3 mins
        updateCustomer(phone, { photoRequestedAt: Date.now(), photoReplied: false });
        setTimeout(async () => {
            const c2 = getCustomer(phone);
            if (!c2.photoReplied) {
                const followup = R(c2.language || 'hinglish',
                    `Hamare executive abhi busy hain, thodi der mein photos share karenge 🙏 Koi aur sawaal ho toh zaroor poochho 😊`,
                    `Our executive is a bit busy right now, photos will be shared very shortly 🙏 Feel free to ask anything else! 😊`,
                    `Executive thodi der mein photos share karenge 🙏 Koi aur sawaal ho toh poochho 😊`
                );
                await sock.sendMessage(jid, { text: followup });
            }
        }, 3 * 60 * 1000); // 3 minutes

        const reply = R(lang,
            `Team jaldi photos/videos bhejegi 📸 Thoda wait karo!`,
            `Our team will send photos/videos shortly 📸 Please wait!`,
            `Team jaldi photos/videos share karegi 📸 Wait karo!`
        );
        addToHistory(phone, 'assistant', reply);
        await delay(800);
        await sock.sendMessage(jid, { text: reply });
        return;
    }

    // Discount/negotiation
    const discountKeywords = ['discount','cheap','kam karo','sasta','last price','best price','kam price','thoda kam','negotiate','bargain','de do','dedo','me de','mein de','adjust','25 hazar','20 hazar','15 hazar','10 hazar','30 hazar','hazar me','k me','k mein','budget me','budget mein'];
    const isDiscount = discountKeywords.some(k => text.toLowerCase().includes(k));
    if (isDiscount) {
        // Agar executive already escalate ho chuka hai — bot bilkul chup rahe
        if (customer.stage === 'executive_escalated') {
            return;
        }
        await sendAlert(sock, phone, 'price', text);
        const reply = R(lang,
            `Best deal ke liye executive se connect karta hoon 🙏 Thoda wait karo!`,
            `Let me connect you with our executive for the best deal 🙏 Please wait!`,
            `Best deal ke liye executive se connect karta hoon 🙏 Wait karo!`
        );
        addToHistory(phone, 'assistant', reply);
        await delay(800);
        await sock.sendMessage(jid, { text: reply });
        return;
    }

    // Complaint
    const complaintKeywords = ['fraud','fake','cheating','refund','paisa wapas','frustrated','angry','worst','terrible','horrible','complain'];
    const isComplaint = complaintKeywords.some(k => text.toLowerCase().includes(k));
    if (isComplaint) {
        await sendAlert(sock, phone, 'complaint', text);
    }

    // === EXECUTIVE ESCALATED — bot mostly chup rahe ===
    // Sirf critical FAQ (delivery, vaccination, payment) ka reply kare
    // Negotiation, breed, price — sab ignore
    if (customer.stage === 'executive_escalated') {
        const faqReplyEsc = checkFAQ(text, lang);
        if (faqReplyEsc) {
            addToHistory(phone, 'assistant', faqReplyEsc);
            await delay(800);
            await sock.sendMessage(jid, { text: faqReplyEsc });
        }
        // Everything else — silent. Executive is handling.
        return;
    }

    // === NEW CUSTOMER — welcome message ===
    if (customer.stage === 'new') {
        const welcome = welcomeMsg(lang);
        addToHistory(phone, 'assistant', welcome);
        updateCustomer(phone, { stage: 'welcome_sent' });
        await delay(800);
        await sock.sendMessage(jid, { text: welcome });
        return;
    }

    // === FAQ CHECK ===
    const faqReply = checkFAQ(text, lang);
    if (faqReply) {
        addToHistory(phone, 'assistant', faqReply);
        await delay(800);
        await sock.sendMessage(jid, { text: faqReply });
        return;
    }

    // === PRICE ENQUIRY — always answer price first ===
    const askingPrice = /price|cost|rate|kitne ka|kitna ka|price range|costing/i.test(text);

    if (askingPrice) {
        // Use detectedBreed first, fall back to customer's saved breed
        const breedForPrice = detectedBreed ||
            (customer.breed ? BREEDS.find(b => b.name === customer.breed) : null);

        if (breedForPrice) {
            const reply = R(lang,
                `${breedForPrice.name} ki price range ₹${breedForPrice.price_min.toLocaleString()} - ₹${breedForPrice.price_max.toLocaleString()} hai 🐾\n\nMale chahiye ya female? 😊`,
                `${breedForPrice.name} price range is ₹${breedForPrice.price_min.toLocaleString()} - ₹${breedForPrice.price_max.toLocaleString()} 🐾\n\nDo you want a male or female? 😊`,
                `${breedForPrice.name} ki price range ₹${breedForPrice.price_min.toLocaleString()} - ₹${breedForPrice.price_max.toLocaleString()} hai 🐾\n\nMale chahiye ya female? 😊`
            );
            addToHistory(phone, 'assistant', reply);
            await delay(800);
            await sock.sendMessage(jid, { text: reply });
            return;
        }
    }

    // === PRICE NEGOTIATION DETECT — breed + budget below min → alert ===
    if (detectedBreed && detectedBudget) {
        const breedData = BREEDS.find(b => b.name === detectedBreed.name);
        if (breedData && detectedBudget < breedData.price_min && customer.stage !== 'executive_escalated') {
            await sendAlert(sock, phone, 'price',
                `${detectedBreed.name} maang raha hai ₹${detectedBudget} mein (min ₹${breedData.price_min})`
            );
        }
    }

    // === BUDGET WITHOUT BREED — show filtered breed list ===
    if (detectedBudget && !customer.breed) {
        const budget = detectedBudget;
        const affordable = BREEDS.filter(b => b.price_min <= budget);
        if (affordable.length > 0) {
            const breedList = affordable.map(b => `• ${b.name}: ₹${(b.price_min/1000).toFixed(0)}k–₹${(b.price_max/1000).toFixed(0)}k`).join('\n');
            const reply = R(lang,
                `₹${(budget/1000).toFixed(0)}k budget mein ye breeds available hain 🐾\n\n${breedList}\n\nKaunsi breed chahiye? 😊`,
                `With ₹${(budget/1000).toFixed(0)}k budget, these breeds are available 🐾\n\n${breedList}\n\nWhich breed would you like? 😊`,
                `₹${(budget/1000).toFixed(0)}k budget mein ye breeds available hain 🐾\n\n${breedList}\n\nKaunsi breed chahiye? 😊`
            );
            addToHistory(phone, 'assistant', reply);
            await delay(800);
            await sock.sendMessage(jid, { text: reply });
            return;
        } else {
            const reply = R(lang,
                `Aapke budget mein abhi koi breed available nahi hai 🐾\nHamari starting price ₹5,000 se hai — budget thoda adjust hoga? 😊`,
                `No breeds currently available in your budget 🐾\nOur starting price is ₹5,000 — can you adjust your budget? 😊`,
                `Is budget mein breed available nahi hai 🐾\nStarting price ₹5,000 se hai — budget adjust ho sakta hai? 😊`
            );
            addToHistory(phone, 'assistant', reply);
            await delay(800);
            await sock.sendMessage(jid, { text: reply });
            return;
        }
    }

    // === BREED DETECTED — save breed, then collect missing info first ===
    if (detectedBreed) {
        // Just acknowledge breed, then collect gender → budget → city in order
        // Do NOT fire sendBreedAvailable until city is known

        // If this is the first time we're seeing the breed (not shown yet),
        // send a short "noted" reply and ask for next missing info
        if (!customer.breedShown) {
            // Breed noted — now collect missing info in order below
            // (fall through to COLLECT MISSING INFO section)
        }
    }

    // === COLLECT MISSING INFO ===

    // Gender missing
    if (customer.breed && !customer.gender) {
        const reply = genderQ(lang);
        addToHistory(phone, 'assistant', reply);
        await delay(800);
        await sock.sendMessage(jid, { text: reply });
        return;
    }

    // Budget missing
    if (customer.breed && customer.gender && !customer.budget) {
        const reply = budgetQ(lang);
        addToHistory(phone, 'assistant', reply);
        await delay(800);
        await sock.sendMessage(jid, { text: reply });
        return;
    }

    // City missing
    if (customer.breed && customer.gender && customer.budget && !customer.city) {
        const reply = cityQ(lang);
        addToHistory(phone, 'assistant', reply);
        await delay(800);
        await sock.sendMessage(jid, { text: reply });
        return;
    }

    // === ALL INFO COLLECTED — breed MUST be set before media fires ===
    if (customer.gender && customer.budget && customer.city && !customer.breed) {
        const reply = R(lang,
            `Kaunsi breed chahiye? 🐾`,
            `Which breed are you interested in? 🐾`,
            `Kaunsi breed chahiye? 🐾`
        );
        addToHistory(phone, 'assistant', reply);
        await delay(800);
        await sock.sendMessage(jid, { text: reply });
        return;
    }

    if (customer.breed && customer.gender && customer.budget && customer.city && !customer.email && customer.stage !== 'email_requested') {
        const breed = BREEDS.find(b => b.name.toLowerCase() === customer.breed.toLowerCase());

        // Budget too low — handle BEFORE showing media
        if (breed && customer.budget < breed.price_min) {
            const lowCount = (customer.budgetLowCount || 0) + 1;
            updateCustomer(phone, { budgetLowCount: lowCount });
            customer = getCustomer(phone);

            if (lowCount >= 2) {
                // Escalate to executive — stop the loop
                await sendAlert(sock, phone, 'low_budget',
                    `Budget ₹${customer.budget} for ${customer.breed} (min ₹${breed.price_min}). Customer insisting on low budget.`
                );
                const reply = R(lang,
                    `Aapke liye best possible deal ke liye executive se connect kar raha hoon 🙏\nTeam aapko jaldi contact karegi — thoda wait karo! 😊`,
                    `Let me connect you with our executive for the best possible deal 🙏\nOur team will contact you shortly! 😊`,
                    `Aapke liye best deal ke liye executive se connect kar raha hoon 🙏\nTeam jaldi contact karegi! 😊`
                );
                updateCustomer(phone, { stage: 'executive_escalated' });
                addToHistory(phone, 'assistant', reply);
                await delay(800);
                await sock.sendMessage(jid, { text: reply });
                return;
            }

            // First time — gently inform about min price
            const reply = R(lang,
                `${customer.breed} ki starting price ₹${(breed.price_min/1000).toFixed(0)}k hai 🐾\nBudget thoda adjust ho sakta hai? Ya koi aur breed dekhein? 😊`,
                `${customer.breed} starts from ₹${(breed.price_min/1000).toFixed(0)}k 🐾\nCan you adjust the budget a bit? Or shall we suggest another breed? 😊`,
                `${customer.breed} ki starting price ₹${(breed.price_min/1000).toFixed(0)}k hai 🐾\nBudget adjust ho sakta hai? 😊`
            );
            addToHistory(phone, 'assistant', reply);
            await delay(800);
            await sock.sendMessage(jid, { text: reply });
            return;
        }

        // Budget is valid — fire media sequence first if not shown yet
        if (!customer.breedShown) {
            updateCustomer(phone, { breedShown: true });
            customer = getCustomer(phone);
            await sendBreedAvailable(sock, jid, phone, customer.breed, customer.city, lang);
            await delay(800);
        }

        // Warm bridge before asking email — not robotic
        const bridgeMsg = R(lang,
            `Kaafi accha choice hai 🐾 Koi aur sawaal ho toh zaroor poochho, warna quotation ke liye naam aur email share kar do 😊`,
            `Great choice! 🐾 Any other questions before we proceed? Or share your name and email and we'll send the official quotation 😊`,
            `Bahut accha choice hai 🐾 Koi sawaal ho toh poochho, warna naam aur email share karo — quotation bhejte hain 😊`
        );
        updateCustomer(phone, { stage: 'email_requested' });
        addToHistory(phone, 'assistant', bridgeMsg);
        await delay(800);
        await sock.sendMessage(jid, { text: bridgeMsg });
        return;
    }

    // === EMAIL RECEIVED — confirm quotation ===
    if (detectedEmail && customer.breed && customer.stage !== 'notified') {
        updateCustomer(phone, { stage: 'notified', notified: true });
        const reply = R(lang,
            `Perfect! 😊 Quotation ready ho raha hai 🐾\nTeam ko inform kar diya hai.\n\nBooking: Rs.2000 advance only 🙏\nFull payment delivery ke baad.`,
            `Perfect! 😊 Your quotation is being prepared 🐾\nOur team has been informed.\n\nBooking: Rs.2000 advance only 🙏\nFull payment after delivery.`,
            `Perfect! 😊 Quotation ready ho raha hai 🐾\nTeam ko inform kar diya.\n\nBooking: Rs.2000 advance only 🙏`
        );
        addToHistory(phone, 'assistant', reply);
        await delay(800);
        await sock.sendMessage(jid, { text: reply });
        return;
    }

    // === FALLBACK — AI ===
    const aiReply = await callAI(phone, text, lang);
    addToHistory(phone, 'assistant', aiReply);
    await delay(800);
    await sock.sendMessage(jid, { text: aiReply });
}

// ============================================================
//  LID → PHONE MAPPING
// ============================================================
const lidToPhone = new Map();

function extractPhone(msg) {
    const from = msg.key.remoteJid || '';

    // Normal number
    if (from.includes('@s.whatsapp.net')) {
        return { phone: from.replace('@s.whatsapp.net', ''), jid: from };
    }

    // LID format — try multiple sources to get real phone
    if (from.endsWith('@lid')) {
        // 1. Already mapped
        if (lidToPhone.has(from)) {
            const realJid = lidToPhone.get(from);
            return { phone: realJid.replace('@s.whatsapp.net', ''), jid: realJid };
        }
        // 2. participant field
        const p = msg.key?.participant || msg?.participant || '';
        if (p?.includes('@s.whatsapp.net')) {
            lidToPhone.set(from, p);
            return { phone: p.replace('@s.whatsapp.net', ''), jid: p };
        }
        // 3. verifiedBizName / notify (sometimes has phone)
        const notify = msg.pushName || '';
        // 4. Store LID as key, flag as unresolved — real number will arrive via contacts.upsert
        // Return LID-based placeholder but mark jid as lid so we can skip alert link
        return { phone: from.replace('@lid', ''), jid: from, isLid: true };
    }

    return { phone: from.replace(/[@\w.]+$/, ''), jid: from };
}

// ============================================================
//  WHATSAPP CONNECT
// ============================================================
let connectAttempts = 0;

async function connectWhatsApp() {
    connectAttempts++;

    // Agar 3 se zyada baar fail ho chuka hai, fresh auth se start karo
    if (connectAttempts > 3) {
        console.log('⚠️ Multiple failures — clearing auth_info for fresh QR...');
        try {
            fs.rmSync('auth_info', { recursive: true, force: true });
        } catch (e) {}
        connectAttempts = 0;
    }

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            currentQR = qr;
            connectAttempts = 0; // QR mil gaya, reset counter
            console.log('\n📱 QR ready! Open your Railway public URL + /qr in browser to scan.\n');
            qrcodeTerminal.generate(qr, { small: true });
        }
        if (connection === 'open') {
            currentQR = null;
            connectAttempts = 0;
        }
        if (connection === 'close') {
            const retry = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (retry) {
                console.log(`Reconnecting in 5 seconds... (attempt ${connectAttempts})`);
                setTimeout(() => connectWhatsApp(), 5000);
            } else {
                console.log('Logged out — clearing auth_info and restarting for fresh QR...');
                try {
                    fs.rmSync('auth_info', { recursive: true, force: true });
                } catch (e) {}
                connectAttempts = 0;
                setTimeout(() => connectWhatsApp(), 2000);
            }
        }
        if (connection === 'open') console.log('\n✅ WhatsApp connected! Bot is live 🐾\n');
    });

    sock.ev.on('creds.update', saveCreds);

    const mapContacts = (contacts) => {
        for (const c of contacts) {
            if (c.lid && c.id?.includes('@s.whatsapp.net')) {
                lidToPhone.set(c.lid.includes('@') ? c.lid : c.lid + '@lid', c.id);
            }
            if (c.id?.endsWith('@lid') && c.pn) {
                lidToPhone.set(c.id, c.pn + '@s.whatsapp.net');
            }
        }
    };
    sock.ev.on('contacts.upsert', mapContacts);
    sock.ev.on('contacts.update', mapContacts);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            if (type !== 'notify') return;
            const msg = messages[0];
            if (!msg.message) return;

            // fromMe = executive ne bheja — check for # toggle
            if (msg.key.fromMe) {
                const fromMeText = (
                    msg.message?.conversation ||
                    msg.message?.extendedTextMessage?.text || ''
                ).trim();
                const fromJid = msg.key.remoteJid || '';
                // Only handle 1-1 chats, not groups
                if (!fromJid.endsWith('@g.us') && fromMeText.includes('#')) {
                    const customerPhone = fromJid.replace('@s.whatsapp.net','').replace('@lid','');
                    const cust = getCustomer(customerPhone);
                    if (cust.stage === 'executive_escalated') {
                        // Second # — bot wapas active
                        updateCustomer(customerPhone, { stage: 'done', executive_handled: true });
                        console.log(`✅ # detected — bot ACTIVE for +${customerPhone}`);
                    } else {
                        // First # — bot chup
                        updateCustomer(customerPhone, { stage: 'executive_escalated' });
                        console.log(`🔇 # detected — bot SILENT for +${customerPhone}`);
                    }
                }
                return;
            }

            if (processedMessages.has(msg.key.id)) return;
            processedMessages.add(msg.key.id);

            const msgTime = (msg.messageTimestamp || 0) * 1000;
            if (Date.now() - msgTime > 5 * 60 * 1000) return;

            const from = msg.key.remoteJid || '';
            if (from.endsWith('@g.us')) return;

            const extracted = extractPhone(msg);
            const { jid } = extracted;
            const { phone } = extracted;
            if (!phone) return;

            // Save real phone to memory (helps fix LID alert links)
            if (!extracted.isLid && jid.includes('@s.whatsapp.net')) {
                const c2 = getCustomer(phone);
                if (!c2.realPhone) updateCustomer(phone, { realPhone: phone });
            }

            // Executive commands — check both phone and jid (LID issue)
            const custCheck = getCustomer(phone);
            const isExec = phone === EXECUTIVE_NUMBER ||
                jid === `${EXECUTIVE_NUMBER}@s.whatsapp.net` ||
                jid.replace('@s.whatsapp.net','') === EXECUTIVE_NUMBER ||
                (custCheck && custCheck.realPhone === EXECUTIVE_NUMBER);
            if (isExec) {
                const execText = (
                    msg.message?.conversation ||
                    msg.message?.extendedTextMessage?.text || ''
                ).trim();

                // DONE 919876543210 — bot wapas active ho jaata hai us customer ke liye
                if (execText.toUpperCase().startsWith('DONE ')) {
                    const targetPhone = execText.replace(/^DONE\s+/i, '').trim();
                    updateCustomer(targetPhone, { stage: 'done', executive_handled: true, photoReplied: true });
                    await sock.sendMessage(`${EXECUTIVE_NUMBER}@s.whatsapp.net`, {
                        text: `✅ Done! +${targetPhone} ka stage reset ho gaya — bot ab handle karega.`
                    });
                    console.log(`✅ DONE command: +${targetPhone} stage reset`);
                }

                // STOP 919876543210 — bot permanently chup us customer ke liye
                if (execText.toUpperCase().startsWith('STOP ')) {
                    const targetPhone = execText.replace(/^STOP\s+/i, '').trim();
                    updateCustomer(targetPhone, { stage: 'executive_escalated', photoReplied: true });
                    await sock.sendMessage(`${EXECUTIVE_NUMBER}@s.whatsapp.net`, {
                        text: `🔇 Bot stopped for +${targetPhone} — executive mode on.`
                    });
                    console.log(`🔇 STOP command: +${targetPhone}`);
                }

                return;
            }

            const text =
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.message?.imageMessage?.caption ||
                msg.message?.videoMessage?.caption || '';

            if (!text.trim()) return;

            console.log(`\n📨 [+${phone}]: ${text}`);
            await handleMessage(sock, phone, jid, text.trim());
            console.log(`✅ Reply sent to +${phone}\n`);

        } catch (error) {
            console.error('MESSAGE ERROR:', error.response?.data || error.message);
        }
    });
}

console.log('🐾 AnimalsLover Bot starting...');
connectWhatsApp();
