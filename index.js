require('dotenv').config();

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ============================================================
//  CONFIG
// ============================================================
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const EXECUTIVE_NUMBER = process.env.EXECUTIVE_NUMBER || '9178086 01752';
const MEMORY_FILE = 'customer_memory.json';

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
            breed: null, gender: null, budget: null, city: null,
            name: null, email: null, language: null,
            stage: 'new', breedShown: false, notified: false,
            budgetLowCount: 0, realPhone: null,
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
//  CONVERSATION HISTORY
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
    { name: 'Pomeranian',       aliases: ['pomeranian','pom','pomerian','pomranian','pomerania'],                               price_min: 5000,  price_max: 10000 },
    { name: 'Labrador',         aliases: ['labrador','lab','labra','labradog','labrodar'],                                      price_min: 11000, price_max: 25000 },
    { name: 'German Shepherd',  aliases: ['german shepherd','german','gsd','alsatian','jerman','shepherd','g shepherd'],        price_min: 12000, price_max: 45000 },
    { name: 'Husky',            aliases: ['husky','siberian husky','siberan','husk','siberian'],                                price_min: 20000, price_max: 55000 },
    { name: 'Beagle',           aliases: ['beagle','beagel','bagel dog','bigle'],                                               price_min: 15000, price_max: 45000 },
    { name: 'Rottweiler',       aliases: ['rottweiler','rottwailer','rott','rottie','rotweiler'],                               price_min: 11000, price_max: 40000 },
    { name: 'Shih Tzu',         aliases: ['shih tzu','shihtzu','shitzu','shih','shit zu','shitsu'],                            price_min: 14000, price_max: 35000 },
    { name: 'Golden Retriever', aliases: ['golden retriever','golden','retriever','goldie','golden retriver'],                  price_min: 17000, price_max: 55000 },
    { name: 'Doberman',         aliases: ['doberman','dobermann','dober','doberman pinscher','dobermaan'],                      price_min: 12000, price_max: 35000 },
    { name: 'Pug',              aliases: ['pug','pagg','vodafone dog','pugg'],                                                  price_min: 10000, price_max: 25000 },
    { name: 'Poodle',           aliases: ['poodle','poodal','pudel'],                                                           price_min: 30000, price_max: 65000 },
    { name: 'Chow Chow',        aliases: ['chow chow','chow','chowchow'],                                                       price_min: 20000, price_max: 65000 },
    { name: 'American Bully',   aliases: ['american bully','bully','am bully','amrican bully','american bulli'],                price_min: 10000, price_max: 45000 },
    { name: 'Pit Bull',         aliases: ['pit bull','pitbull','pit','pitbul','american pitbull','pitbull terrier'],            price_min: 13000, price_max: 35000 },
    { name: 'Bulldog',          aliases: ['bulldog','bull dog','english bulldog','french bulldog','frenchie','buldug','buldog','french bull'],  price_min: 25000, price_max: 80000 },
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
        'nahi','nhi','hn','hnn','konse','kaun','kaunsa','kaunsi','konsa',
        'bolo','bata','chahte','chahti','milega','available','maine','bola',
        'nhi bola','nahi bola','konsi','kaunsi','apke','aapke','kab','kahan',
        'dena','dilao','chahta','chahti','lena','karo','kri','kr','ho','hoga',
    ];

    const words = text.toLowerCase().split(/\s+/);
    const hinglishCount = words.filter(w => hinglishWords.includes(w)).length;
    if (hinglishCount >= 1) return 'hinglish';
    return 'english';
}

// ============================================================
//  EXTRACTORS
// ============================================================
function findGender(text) {
    const lower = text.toLowerCase();
    if (/\b(male|boy|nara|ladka|m)\b/.test(lower)) return 'male';
    if (/\b(female|girl|fem|madi|ladki|f)\b/.test(lower)) return 'female';
    if (/^m\.?$/.test(lower.trim())) return 'male';
    if (/^f\.?$/.test(lower.trim())) return 'female';
    return null;
}

function findBudget(text) {
    const lower = text.toLowerCase();
    const rangeM = text.match(/(\d[\d,]*)\s*(k)?\s*[-–to]+\s*(\d[\d,]*)\s*(k)?/i);
    if (rangeM) {
        let val = parseInt(rangeM[1].replace(/,/g, ''));
        if (rangeM[2] || (val < 500 && lower.includes('k'))) val *= 1000;
        if (val >= 1000 && val <= 500000) return val;
    }
    const kM = text.match(/\b(\d+)\s*k\b/i);
    if (kM) { const val = parseInt(kM[1]) * 1000; if (val >= 1000 && val <= 500000) return val; }
    const numM = text.match(/(?:rs\.?|inr|₹)?\s*(\d[\d,]{2,})/i);
    if (numM) { const val = parseInt(numM[1].replace(/,/g, '')); if (val >= 1000 && val <= 500000) return val; }
    return null;
}

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
    'malad','goregaon','mulund','dombivali','whitefield','koramangala',
    'indiranagar','jayanagar','hebbal','nagavara',
]);

function findCity(text) {
    const lower = text.toLowerCase().trim();
    for (const city of KNOWN_CITIES) {
        const escaped = city.replace(/\s+/g, '\\s+');
        if (new RegExp(`\\b${escaped}\\b`, 'i').test(lower)) {
            return city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
    }
    const m1 = text.match(/(?:deliver(?:y)?\s+(?:in|to)\s+|city\s*[-:]\s*)([A-Za-z][A-Za-z\s]{2,20})(?:\s*$|,)/i);
    if (m1) return m1[1].trim();
    return null;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// ============================================================
//  MULTILINGUAL HELPER
// ============================================================
function R(lang, hi, en, hing) {
    if (lang === 'hindi') return hi;
    if (lang === 'english') return en;
    return hing || hi;
}

// ============================================================
//  STATIC MESSAGES
// ============================================================
const INCLUDES_MSG = `Har pet ke saath milega:\n✅ Health checkup\n✅ Vaccination/deworming\n✅ Free lifetime consultancy\n✅ Doorstep delivery\n✅ Certificate\n\n⚠️ Payment sirf SKAS Technologies official account pe — delivery boy ko kabhi nahi!`;

function welcomeMsg(lang) {
    return R(lang,
        `AnimalsLover में आपका स्वागत है! 🐾🙏\n\nHum aapko perfect pet dhundhne mein help karenge. Please batao:\n\n• Kaunsi breed chahiye?\n• Budget kya hai?\n• Delivery kahan chahiye?\n\nAnimalsLover Team 🐾`,
        `Welcome to AnimalsLover! 🐾🙏\n\nWe're here to help you find your perfect pet! Please share:\n\n• Which breed are you looking for?\n• Your budget range?\n• Your delivery city?\n\nAnimalsLover Team 🐾`,
        `AnimalsLover mein aapka swagat hai! 🐾🙏\n\nHum aapko perfect pet dhundhne mein help karenge. Please batao:\n\n• Kaunsi breed chahiye?\n• Budget kya hai?\n• Delivery kahan chahiye?\n\nAnimalsLover Team 🐾`
    );
}

// ============================================================
//  FAQ — hardcoded fast replies
//  Sirf clear-cut questions jinka answer fixed hai
// ============================================================
const FAQ = [
    {
        // Breed list request
        pattern: /konse breed|kaun.*breed|breed.*kaun|kya.*breed|breed.*kya|which breed|what breed|breed list|breeds available|available breed|konsa breed|breed hai|breed h|all breed|sab breed|breed dikhao|breed bata|breed btao|kis type.*breed|apke pass kya|aapke pass kya|kya available|show.*breed|types of dog|konse dog|which dog|what dog|dog available|kaunse dog|dog h kya|dog list|sab dog|all dog/i,
        reply: (lang) => {
            const list = BREEDS.map(b => `• ${b.name}: ₹${(b.price_min/1000).toFixed(0)}k–₹${(b.price_max/1000).toFixed(0)}k`).join('\n');
            return R(lang,
                `Ye breeds available hain 🐾\n\n${list}\n\nKaunsi breed chahiye? 😊`,
                `These breeds are available 🐾\n\n${list}\n\nWhich breed interests you? 😊`,
                `Ye breeds available hain 🐾\n\n${list}\n\nKaunsi breed chahiye? 😊`
            );
        }
    },
    {
        // Customer says "I didn't say that" — correction
        pattern: /maine.*nahi|maine.*nhi|nahi bola|nhi bola|ye nahi|yeh nahi|galat|aise nahi|aisa nahi|nahi kaha|nhi kaha|kidhar se liya|kab bola|humne nahi|hamne nahi|wrong breed|wrong|not correct/i,
        reply: (lang) => R(lang,
            `Maafi! 🙏 Galti ho gayi. Kaunsi breed chahiye aapko? 😊`,
            `Sorry about that! 🙏 Which breed are you looking for? 😊`,
            `Sorry bhai! 🙏 Batao kaunsi breed chahiye? 😊`
        )
    },
    {
        pattern: /vaccin|vaccine|tikka|tika|immuniz|deworm|injection/i,
        reply: (lang) => R(lang,
            `Vaccination:\n✅ Puppy milne ke 3 din baad shuru karein\n✅ 9-in-1 vaccine lagwani hogi\n✅ Hum poori guidance denge 🐾`,
            `Vaccination:\n✅ Start 3 days after receiving the puppy\n✅ 9-in-1 vaccine required\n✅ We'll guide you completely 🐾`,
            `Vaccination:\n✅ Puppy milne ke 3 din baad shuru karo\n✅ 9-in-1 vaccine lagwani hogi\n✅ Hum guide karenge 🐾`
        )
    },
    {
        pattern: /cash on delivery|cod|c\.o\.d/i,
        reply: (lang) => R(lang,
            `COD available nahi hai 🙏\nBooking ke liye ₹2000 advance dena hota hai.\nBaaki payment delivery ke time hoti hai 🐾`,
            `COD is not available 🙏\n₹2000 advance booking required.\nBalance payment at delivery 🐾`,
            `COD nahi hai 🙏\n₹2000 booking advance lagta hai.\nBaaki delivery ke time 🐾`
        )
    },
    {
        pattern: /delivery time|deliver kab|kitne din|how many days|kab milega|kab aayega|time lagega|kab tak|dispatch/i,
        reply: (lang) => R(lang,
            `Booking ke baad 2-3 din mein delivery 🚚\nPuppies ~40-45 din ke hote hain.`,
            `Delivery in 2-3 days after booking 🚚\nPuppies are 40-45 days old.`,
            `Booking ke baad 2-3 din mein delivery 🚚`
        )
    },
    {
        pattern: /certificate|cert|document|papers|registration/i,
        reply: (lang) => R(lang,
            `Certificate delivery ke baad milega 🐾\nPet name aur owner naam share karna hoga!`,
            `Certificate provided after delivery 🐾\nShare pet and owner name!`,
            `Certificate delivery ke baad milega 🐾`
        )
    },
    {
        pattern: /food|khana|khaana|diet|feed|feeding|kya khilayein|kya khilao/i,
        reply: (lang) => R(lang,
            `Puppy ke saath dietary chart milega 🐾\nFree lifetime food guidance included!`,
            `Dietary chart provided with puppy 🐾\nFree lifetime food guidance included!`,
            `Puppy ke saath dietary chart milega 🐾`
        )
    },
    {
        pattern: /payment|pay|upi|gpay|google pay|paytm|qr|account|transfer|kitna dena|advance|booking amount/i,
        reply: (lang) => R(lang,
            `Payment ke liye naam aur email share karo — quotation mein saari details hongi 📧\nBooking: ₹2000 advance only 🙏`,
            `Share your name & email — all payment details in the quotation 📧\nBooking: ₹2000 advance only 🙏`,
            `Naam aur email share karo — quotation mein payment details hongi 📧\nBooking: ₹2000 advance 🙏`
        )
    },
    {
        pattern: /visit|centre|center|office|shop|showroom|pickup|self.*pick|come.*see|dekh.*aao|aake.*lu/i,
        reply: (lang) => R(lang,
            `Hum home delivery prefer karte hain 🚚\nLekin aap aana chahte ho toh:\n📍 13th Floor, Startup Hub, Biscomaun Bhawan, Near Gandhi Maidan, Patna, Bihar 800001\n📞 +91-8252167751`,
            `We prefer home delivery 🚚\nBut you're welcome to visit:\n📍 13th Floor, Startup Hub, Biscomaun Bhawan, Near Gandhi Maidan, Patna, Bihar 800001\n📞 +91-8252167751`,
            `Home delivery prefer karte hain 🚚\nVisit karna ho:\n📍 13th Floor, Startup Hub, Biscomaun Bhawan, Patna 800001\n📞 +91-8252167751`
        )
    },
    {
        pattern: /legit|legal|license|registered|fake|fraud|trust|genuine|real|authentic|startup india|gst/i,
        reply: (lang) => R(lang,
            `AnimalsLover Startup India recognized aur GST registered company hai 🏢\nHar pet ke saath proper invoice!\nhttps://www.animalslover.in`,
            `AnimalsLover is Startup India recognized & GST registered 🏢\nProper invoice with every pet!\nhttps://www.animalslover.in`,
            `AnimalsLover Startup India recognized hai, GST registered bhi 🏢\nhttps://www.animalslover.in`
        )
    },
    {
        pattern: /emi|installment|kisto|monthly|split|partial/i,
        reply: (lang) => R(lang,
            `EMI directly available nahi hai 🙏\nCredit card ho to explore kar sakte hain.\nBooking: ₹2000 advance.`,
            `EMI not directly available 🙏\nCredit card option possible.\nBooking: ₹2000 advance.`,
            `EMI nahi hai directly 🙏\nCredit card se explore kar sakte hain.`
        )
    },
    {
        pattern: /review|rating|feedback|google|stars/i,
        reply: () => `Thank you! 🙏 Please share your review:\nhttps://g.page/r/Cf1HZ4qDDoSnEAE/review`
    },
    {
        pattern: /^(hi+|hello|hey|hii+|helo|hlw|hlo|namaste|namaskar|hy|heya)\s*[!?.]*$/i,
        reply: (lang) => R(lang,
            `Hello! 🐾 Koi sawaal poochhiye, hum help karenge 😊`,
            `Hello! 🐾 Feel free to ask anything, we're here to help 😊`,
            `Hello! 🐾 Batao kya help chahiye 😊`
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
//  GROQ AI — main brain
//  Handles everything FAQ does NOT cover
// ============================================================
const SYSTEM_PROMPT = `You are AnimalsLover's WhatsApp sales assistant. You help customers buy pet dogs.

PERSONALITY: Friendly, warm, natural. Like a real WhatsApp sales exec. Short replies. Emojis naturally but not excessive. NEVER robotic. NEVER repeat info already confirmed.

LANGUAGE RULE (STRICT):
- Detect language from customer's first real message.
- Hindi script → reply Hindi. Hinglish → reply Hinglish. English → reply English.
- LOCK this language for the whole conversation. Never switch.

YOUR GOAL — collect these 4 things naturally in conversation:
1. Breed (which dog they want)
2. Gender (male/female)
3. Budget (how much they can spend)
4. City (where to deliver)
→ After all 4 collected: ask Name + Email for quotation.
→ After email received: confirm quotation being prepared.

CONVERSATION STYLE:
- Ask ONE missing thing at a time, naturally in flow.
- If customer gives multiple info in one message (e.g. "husky male 20k delhi") — extract all, acknowledge, ask whatever is still missing.
- Never ask same thing twice.
- When customer gives city for first time: "Yes available! [City] mein hamare bahut happy customers hain 🐾"
- Keep replies 1-3 lines max unless listing breeds or answering FAQ.

AVAILABLE BREEDS & PRICES:
Pomeranian ₹5k–₹10k | Labrador ₹11k–₹25k | German Shepherd ₹12k–₹45k | Husky ₹20k–₹55k | Beagle ₹15k–₹45k | Rottweiler ₹11k–₹40k | Shih Tzu ₹14k–₹35k | Golden Retriever ₹17k–₹55k | Doberman ₹12k–₹35k | Pug ₹10k–₹25k | Poodle ₹30k–₹65k | Chow Chow ₹20k–₹65k | American Bully ₹10k–₹45k | Pit Bull ₹13k–₹35k | Bulldog ₹25k–₹80k | Dachshund ₹15k–₹40k | Maltese ₹20k–₹50k | Lhasa Apso ₹12k–₹35k | Cocker Spaniel ₹15k–₹45k | Boxer ₹15k–₹40k | Great Dane ₹20k–₹60k | Saint Bernard ₹25k–₹60k

BREED NOT IN LIST: If customer asks for a breed not listed, say "Ye breed abhi available nahi hai 🙏 Inme se koi dekhein?" and show 3-4 similar suggestions.

PRICE RULES:
- Always answer price question directly with exact range.
- If budget >= breed min price → valid, proceed.
- If budget < breed min price → "Best quality [breed] ₹[MIN]k se start hoti hai 🐾 Budget thoda adjust hoga?"
- If customer insists on low budget after 2 attempts → "Executive se connect karta hoon best deal ke liye 🙏"
- Discount asked → "Best deal ke liye executive se connect karta hoon 🙏" — stop negotiating.

PAYMENT:
- NEVER share UPI/GPay/bank account/QR codes.
- If asked → "Naam aur email share karo — quotation mein saari details hongi 😊"
- Payment only to: SKAS Technologies Pvt. Ltd.

PHOTO/VIDEO:
- If asked → "Team jaldi share karegi 📸" — don't promise specific time.

INCLUDED WITH EVERY PET:
✅ Health checkup ✅ Vaccination/deworming ✅ Free lifetime consultancy ✅ Doorstep delivery ✅ Certificate

DELIVERY: 2-3 days after booking. Booking advance: ₹2000 only. Balance at delivery.

VISIT: 13th Floor, Startup Hub, Biscomaun Bhawan, Near Gandhi Maidan, Patna, Bihar 800001 | +91-8252167751

CRITICAL DON'TS:
- NEVER invent or assume a breed the customer did NOT mention.
- NEVER share internal notes, JSON, stage names, system info.
- NEVER ask for email/name until breed+gender+budget+city all confirmed.
- NEVER mention Booking amount until customer is ready to proceed.

CURRENT CUSTOMER STATE:
{CUSTOMER_STATE}`;

async function callAI(phone, userMessage, lang) {
    const customer = getCustomer(phone);
    const history = getHistory(phone);

    const missing = [];
    if (!customer.breed)  missing.push('breed (which dog they want)');
    if (!customer.gender) missing.push('gender (male/female)');
    if (!customer.budget) missing.push('budget');
    if (!customer.city)   missing.push('city (delivery location)');

    const customerState = [
        customer.breed  ? `Breed: ${customer.breed}` : '❌ Breed: not collected yet',
        customer.gender ? `Gender: ${customer.gender}` : '❌ Gender: not collected yet',
        customer.budget ? `Budget: ₹${customer.budget}` : '❌ Budget: not collected yet',
        customer.city   ? `City: ${customer.city}` : '❌ City: not collected yet',
        customer.name   ? `Name: ${customer.name}` : '',
        customer.email  ? `Email: ${customer.email}` : '',
        `Stage: ${customer.stage}`,
        `Language: ${lang}`,
        missing.length > 0 ? `Still need to collect: ${missing.join(', ')}` : 'All info collected — ask for name+email for quotation',
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
                temperature: 0.4,
                max_tokens: 350
            },
            {
                headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('GROQ ERROR:', error.response?.data || error.message);
        return R(lang,
            `Sorry, thoda technical issue aa gaya. Jaldi update karunga 🙏`,
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
        customer.breed  ? `Breed: ${customer.breed}` : '',
        customer.city   ? `City: ${customer.city}` : '',
        customer.budget ? `Budget: ₹${customer.budget}` : '',
        customer.name   ? `Name: ${customer.name}` : '',
        customer.email  ? `Email: ${customer.email}` : '',
    ].filter(Boolean).join(' | ');

    const link = `https://wa.me/${customer.realPhone || phone}`;
    const templates = {
        photo:      `📸 *PHOTO/VIDEO REQUEST*\n👤 +${phone}\n💬 "${message}"\n${info}\n🔗 ${link}\n🕐 ${time}`,
        price:      `💰 *PRICE NEGOTIATION*\n👤 +${phone}\n💬 "${message}"\n${info}\n🔗 ${link}\n🕐 ${time}`,
        email:      `📧 *EMAIL RECEIVED — QUOTATION BHEJO*\n👤 +${phone}\n📩 "${message}"\n${info}\n🔗 ${link}\n🕐 ${time}`,
        complaint:  `🚨 *COMPLAINT — URGENT*\n👤 +${phone}\n💬 "${message}"\n${info}\n🔗 ${link}\n🕐 ${time}`,
        low_budget: `⚠️ *LOW BUDGET*\n👤 +${phone}\n💬 "${message}"\n${info}\n🔗 ${link}\n🕐 ${time}`,
        interested: `🔥 *HOT LEAD — ALL INFO COLLECTED*\n👤 +${phone}\n${info}\n🔗 ${link}\n🕐 ${time}`,
    };
    const text = templates[type];
    if (!text) return;
    try {
        await sock.sendMessage(`${EXECUTIVE_NUMBER}@s.whatsapp.net`, { text });
        console.log(`📢 Alert [${type}] → +${EXECUTIVE_NUMBER}`);
    } catch (e) { console.log('Alert failed:', e.message); }
}

// ============================================================
//  SEND BREED MEDIA (photos + includes message)
// ============================================================
async function sendBreedMedia(sock, jid, phone, city, lang) {
    const cityMsg = city
        ? R(lang,
            `Yes available! ${city} mein hamare bahut happy customers hain 🐾`,
            `Yes available! We have many happy customers in ${city} 🐾`,
            `Yes available! ${city} mein bahut happy customers hain 🐾`
          )
        : R(lang, `Yes available! Pan India delivery karte hain 🐾`, `Yes available! We deliver Pan India 🐾`, `Yes available! Pan India delivery 🐾`);

    await sock.sendMessage(jid, { text: cityMsg });
    addToHistory(phone, 'assistant', cityMsg);
    await delay(800);

    for (const fname of ['f1.jpeg', 'f2.jpeg']) {
        const fpath = path.join(__dirname, fname);
        if (fs.existsSync(fpath)) { await sock.sendMessage(jid, { image: { url: fpath } }); await delay(700); }
    }

    const v = path.join(__dirname, 'f3.mp4');
    if (fs.existsSync(v)) {
        await sock.sendMessage(jid, { video: { url: v }, caption: 'Our happy customers love their pets! 😍🐾' });
        await delay(900);
    }

    await sock.sendMessage(jid, { text: INCLUDES_MSG });
    addToHistory(phone, 'assistant', INCLUDES_MSG);
    await delay(500);
}

// ============================================================
//  MAIN MESSAGE HANDLER
// ============================================================
async function handleMessage(sock, phone, jid, text) {
    let customer = getCustomer(phone);

    // ── Language detect (lock once) ──
    const shortGreeting = /^(hi+|hello|hey|hii+|helo|hlw|hlo|ok|okay|hy|heya)\s*[!?.]*$/i;
    if (!customer.language || (customer.language === 'english' && shortGreeting.test(customer.lastText || ''))) {
        const detected = detectLanguage(text);
        if (!customer.language || detected !== 'english') updateCustomer(phone, { language: detected });
        customer = getCustomer(phone);
    }
    updateCustomer(phone, { lastText: text });
    customer = getCustomer(phone);
    const lang = customer.language || 'hinglish';

    // ── Extract info from message ──
    const detectedBreed  = findBreed(text);
    const detectedGender = findGender(text);
    const detectedBudget = findBudget(text);
    const detectedEmail  = text.match(EMAIL_REGEX)?.[0];
    const detectedCity   = findCity(text);

    // Save extracted info
    if (detectedBreed)  { updateCustomer(phone, { breed: detectedBreed.name, breedShown: false }); }
    if (detectedGender && !customer.gender) { updateCustomer(phone, { gender: detectedGender }); }
    if (detectedBudget) {
        const bump = { budget: detectedBudget };
        if (!customer.budget || detectedBudget > customer.budget) bump.budgetLowCount = 0;
        updateCustomer(phone, bump);
    }
    if (detectedCity && !customer.city) { updateCustomer(phone, { city: detectedCity }); }
    if (detectedEmail && !customer.email) {
        updateCustomer(phone, { email: detectedEmail });
        await sendAlert(sock, phone, 'email', text);
    }

    customer = getCustomer(phone); // refresh after all updates

    addToHistory(phone, 'user', text);

    // ── EXECUTIVE ESCALATED — only FAQ replies, else silent ──
    if (customer.stage === 'executive_escalated') {
        const faq = checkFAQ(text, lang);
        if (faq) { await sock.sendMessage(jid, { text: faq }); addToHistory(phone, 'assistant', faq); }
        return;
    }

    // ── NEW CUSTOMER — send welcome ──
    if (customer.stage === 'new') {
        const welcome = welcomeMsg(lang);
        addToHistory(phone, 'assistant', welcome);
        updateCustomer(phone, { stage: 'welcome_sent' });
        await delay(600);
        await sock.sendMessage(jid, { text: welcome });
        return;
    }

    // ── PHOTO/VIDEO REQUEST ──
    const isPhotoReq = /photo|photos|pic\b|pics|picture|video|videos|bhejo|dikhao|show me|footage|clip|send karo/i.test(text);
    if (isPhotoReq) {
        await sendAlert(sock, phone, 'photo', text);
        updateCustomer(phone, { photoRequestedAt: Date.now(), photoReplied: false });
        // Auto followup after 3 min if executive hasn't replied
        setTimeout(async () => {
            if (!getCustomer(phone).photoReplied) {
                const msg = R(lang,
                    `Executive thodi der mein photos share karenge 🙏`,
                    `Our team will share photos shortly 🙏`,
                    `Executive thodi der mein photos share karenge 🙏`
                );
                await sock.sendMessage(jid, { text: msg });
            }
        }, 3 * 60 * 1000);

        const reply = R(lang, `Team jaldi photos/videos bhejegi 📸`, `Our team will send photos/videos shortly 📸`, `Team jaldi photos/videos share karegi 📸`);
        addToHistory(phone, 'assistant', reply);
        await delay(600);
        await sock.sendMessage(jid, { text: reply });
        return;
    }

    // ── DISCOUNT/NEGOTIATION ──
    const isDiscount = /discount|cheap|kam karo|sasta|last price|best price|kam price|thoda kam|negotiate|bargain|de do|dedo|adjust price|price cut/i.test(text);
    if (isDiscount) {
        await sendAlert(sock, phone, 'price', text);
        const reply = R(lang,
            `Best deal ke liye executive se connect karta hoon 🙏 Thoda wait karo!`,
            `Let me connect you with our executive for the best deal 🙏 Please wait!`,
            `Best deal ke liye executive se connect karta hoon 🙏`
        );
        addToHistory(phone, 'assistant', reply);
        await delay(600);
        await sock.sendMessage(jid, { text: reply });
        return;
    }

    // ── COMPLAINT ──
    if (/fraud|cheating|refund|paisa wapas|frustrated|angry|worst|terrible|horrible|complain/i.test(text)) {
        await sendAlert(sock, phone, 'complaint', text);
    }

    // ── FAQ CHECK — fast hardcoded replies ──
    const faqReply = checkFAQ(text, lang);
    if (faqReply) {
        addToHistory(phone, 'assistant', faqReply);
        await delay(600);
        await sock.sendMessage(jid, { text: faqReply });
        return;
    }

    // ── EMAIL RECEIVED — confirm quotation ──
    if (detectedEmail && customer.breed && customer.stage !== 'notified') {
        updateCustomer(phone, { stage: 'notified', notified: true });
        const reply = R(lang,
            `Perfect! 😊 Quotation ready ho raha hai 🐾\nTeam ko inform kar diya.\n\nBooking: ₹2000 advance only 🙏\nFull payment delivery ke baad.`,
            `Perfect! 😊 Your quotation is being prepared 🐾\nOur team has been notified.\n\nBooking: ₹2000 advance only 🙏\nFull payment after delivery.`,
            `Perfect! 😊 Quotation ready ho raha hai 🐾\nTeam inform ho gayi.\n\nBooking: ₹2000 advance only 🙏`
        );
        addToHistory(phone, 'assistant', reply);
        await delay(600);
        await sock.sendMessage(jid, { text: reply });
        return;
    }

    // ── ALL 4 INFO COLLECTED — trigger media + hot lead alert ──
    customer = getCustomer(phone);
    const allCollected = customer.breed && customer.gender && customer.budget && customer.city;

    if (allCollected && !customer.breedShown) {
        // Check budget validity
        const breedData = BREEDS.find(b => b.name.toLowerCase() === customer.breed.toLowerCase());
        if (breedData && customer.budget < breedData.price_min) {
            const lowCount = (customer.budgetLowCount || 0) + 1;
            updateCustomer(phone, { budgetLowCount: lowCount });
            if (lowCount >= 2) {
                await sendAlert(sock, phone, 'low_budget', `${customer.breed} ₹${customer.budget} (min ₹${breedData.price_min})`);
                updateCustomer(phone, { stage: 'executive_escalated' });
                const reply = R(lang,
                    `Aapke liye best deal ke liye executive se connect kar raha hoon 🙏\nTeam jaldi contact karegi!`,
                    `Connecting you with our executive for best possible deal 🙏\nTeam will contact you shortly!`,
                    `Executive se connect kar raha hoon best deal ke liye 🙏\nTeam jaldi aayegi!`
                );
                addToHistory(phone, 'assistant', reply);
                await delay(600);
                await sock.sendMessage(jid, { text: reply });
                return;
            }
            // Let AI handle the gentle budget nudge
        } else {
            // Budget valid — fire media
            updateCustomer(phone, { breedShown: true });
            await sendBreedMedia(sock, jid, phone, customer.city, lang);
            // Send hot lead alert to executive
            await sendAlert(sock, phone, 'interested', '');
        }
    }

    // ── AI HANDLES EVERYTHING ELSE ──
    // This includes: natural conversation, missing info collection,
    // breed suggestions, price questions, general queries, follow-ups
    const aiReply = await callAI(phone, text, lang);
    addToHistory(phone, 'assistant', aiReply);
    await delay(600);
    await sock.sendMessage(jid, { text: aiReply });
}

// ============================================================
//  LID → PHONE MAPPING
// ============================================================
const lidToPhone = new Map();

function extractPhone(msg) {
    const from = msg.key.remoteJid || '';
    if (from.includes('@s.whatsapp.net')) return { phone: from.replace('@s.whatsapp.net', ''), jid: from };
    if (from.endsWith('@lid')) {
        if (lidToPhone.has(from)) {
            const real = lidToPhone.get(from);
            return { phone: real.replace('@s.whatsapp.net', ''), jid: real };
        }
        const p = msg.key?.participant || msg?.participant || '';
        if (p?.includes('@s.whatsapp.net')) { lidToPhone.set(from, p); return { phone: p.replace('@s.whatsapp.net', ''), jid: p }; }
        return { phone: from.replace('@lid', ''), jid: from, isLid: true };
    }
    return { phone: from.replace(/[@\w.]+$/, ''), jid: from };
}

// ============================================================
//  WHATSAPP CONNECT
// ============================================================
async function connectWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) { console.log('\n📱 Scan QR with WhatsApp:\n'); qrcode.generate(qr, { small: true }); }
        if (connection === 'close') {
            const retry = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (retry) { console.log('Reconnecting in 5s...'); setTimeout(connectWhatsApp, 5000); }
            else console.log('Logged out. Delete auth_info and restart.');
        }
        if (connection === 'open') console.log('\n✅ WhatsApp connected! Bot live 🐾\n');
    });

    sock.ev.on('creds.update', saveCreds);

    const mapContacts = (contacts) => {
        for (const c of contacts) {
            if (c.lid && c.id?.includes('@s.whatsapp.net'))
                lidToPhone.set(c.lid.includes('@') ? c.lid : c.lid + '@lid', c.id);
            if (c.id?.endsWith('@lid') && c.pn)
                lidToPhone.set(c.id, c.pn + '@s.whatsapp.net');
        }
    };
    sock.ev.on('contacts.upsert', mapContacts);
    sock.ev.on('contacts.update', mapContacts);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            if (type !== 'notify') return;
            const msg = messages[0];
            if (!msg.message) return;

            // Executive sent a message — handle # toggle
            if (msg.key.fromMe) {
                const fromMeText = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
                const fromJid = msg.key.remoteJid || '';
                if (!fromJid.endsWith('@g.us') && fromMeText.includes('#')) {
                    const cPhone = fromJid.replace('@s.whatsapp.net', '').replace('@lid', '');
                    const cust = getCustomer(cPhone);
                    if (cust.stage === 'executive_escalated') {
                        updateCustomer(cPhone, { stage: 'done', executive_handled: true });
                        console.log(`✅ # toggle — bot ACTIVE for +${cPhone}`);
                    } else {
                        updateCustomer(cPhone, { stage: 'executive_escalated' });
                        console.log(`🔇 # toggle — bot SILENT for +${cPhone}`);
                    }
                }
                return;
            }

            if (processedMessages.has(msg.key.id)) return;
            processedMessages.add(msg.key.id);

            const msgTime = (msg.messageTimestamp || 0) * 1000;
            if (Date.now() - msgTime > 5 * 60 * 1000) return; // ignore old messages

            const from = msg.key.remoteJid || '';
            if (from.endsWith('@g.us')) return; // ignore groups

            const extracted = extractPhone(msg);
            const { jid, phone } = extracted;
            if (!phone) return;

            if (!extracted.isLid && jid.includes('@s.whatsapp.net')) {
                const c = getCustomer(phone);
                if (!c.realPhone) updateCustomer(phone, { realPhone: phone });
            }

            const c = getCustomer(phone);
            const isExec = phone === EXECUTIVE_NUMBER ||
                jid === `${EXECUTIVE_NUMBER}@s.whatsapp.net` ||
                (c?.realPhone === EXECUTIVE_NUMBER);

            if (isExec) {
                const execText = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
                if (execText.toUpperCase().startsWith('DONE ')) {
                    const t = execText.replace(/^DONE\s+/i, '').trim();
                    updateCustomer(t, { stage: 'done', executive_handled: true, photoReplied: true });
                    await sock.sendMessage(`${EXECUTIVE_NUMBER}@s.whatsapp.net`, { text: `✅ +${t} reset — bot active` });
                }
                if (execText.toUpperCase().startsWith('STOP ')) {
                    const t = execText.replace(/^STOP\s+/i, '').trim();
                    updateCustomer(t, { stage: 'executive_escalated', photoReplied: true });
                    await sock.sendMessage(`${EXECUTIVE_NUMBER}@s.whatsapp.net`, { text: `🔇 Bot stopped for +${t}` });
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
            console.log(`✅ Replied to +${phone}\n`);

        } catch (error) {
            console.error('ERROR:', error.response?.data || error.message);
        }
    });
}

console.log('🐾 AnimalsLover Bot starting...');
connectWhatsApp();
