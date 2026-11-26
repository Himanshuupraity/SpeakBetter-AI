// Static content for the Learn Hindi section.
// `roman` is a simple, learner-friendly romanisation (no diacritics): aa = long a, ee = long i, oo = long u.

/** Devanagari vowels (स्वर) with their matra (the sign used after a consonant). */
export const VOWELS = [
  { id: 'v-a', letter: 'अ', roman: 'a', matra: '', sound: 'short “a”, like the “u” in “but”', example: { hi: 'अनार', roman: 'anaar', en: 'pomegranate' } },
  { id: 'v-aa', letter: 'आ', roman: 'aa', matra: 'ा', sound: 'long “aa”, like “father”', example: { hi: 'आम', roman: 'aam', en: 'mango' } },
  { id: 'v-i', letter: 'इ', roman: 'i', matra: 'ि', sound: 'short “i”, like “sit”', example: { hi: 'इमली', roman: 'imli', en: 'tamarind' } },
  { id: 'v-ee', letter: 'ई', roman: 'ee', matra: 'ी', sound: 'long “ee”, like “see”', example: { hi: 'ईख', roman: 'eekh', en: 'sugarcane' } },
  { id: 'v-u', letter: 'उ', roman: 'u', matra: 'ु', sound: 'short “u”, like “put”', example: { hi: 'उल्लू', roman: 'ulloo', en: 'owl' } },
  { id: 'v-oo', letter: 'ऊ', roman: 'oo', matra: 'ू', sound: 'long “oo”, like “moon”', example: { hi: 'ऊन', roman: 'oon', en: 'wool' } },
  { id: 'v-ri', letter: 'ऋ', roman: 'ri', matra: 'ृ', sound: '“ri”, like “rich”', example: { hi: 'ऋषि', roman: 'rishi', en: 'sage' } },
  { id: 'v-e', letter: 'ए', roman: 'e', matra: 'े', sound: '“e”, like “they”', example: { hi: 'एड़ी', roman: 'edi', en: 'heel' } },
  { id: 'v-ai', letter: 'ऐ', roman: 'ai', matra: 'ै', sound: '“ai”, like “bat” (open)', example: { hi: 'ऐनक', roman: 'ainak', en: 'spectacles' } },
  { id: 'v-o', letter: 'ओ', roman: 'o', matra: 'ो', sound: '“o”, like “go”', example: { hi: 'ओखली', roman: 'okhli', en: 'mortar (for grinding)' } },
  { id: 'v-au', letter: 'औ', roman: 'au', matra: 'ौ', sound: '“au”, like “saw”', example: { hi: 'औरत', roman: 'aurat', en: 'woman' } },
  { id: 'v-an', letter: 'अं', roman: 'an', matra: 'ं', sound: 'nasal “n/m” sound (anusvara)', example: { hi: 'अंगूर', roman: 'angoor', en: 'grapes' } },
  { id: 'v-ah', letter: 'अः', roman: 'ah', matra: 'ः', sound: 'a soft breath “h” at the end (visarga)', example: { hi: 'प्रातः', roman: 'praatah', en: 'early morning' } },
];

/** Devanagari consonants (व्यंजन), grouped as they are taught in Indian schools. */
export const CONSONANT_GROUPS = [
  {
    id: 'ka', label: 'क-वर्ग · throat sounds',
    letters: [
      { id: 'c-ka', letter: 'क', roman: 'ka', example: { hi: 'कमल', roman: 'kamal', en: 'lotus' } },
      { id: 'c-kha', letter: 'ख', roman: 'kha', example: { hi: 'खरगोश', roman: 'khargosh', en: 'rabbit' } },
      { id: 'c-ga', letter: 'ग', roman: 'ga', example: { hi: 'गमला', roman: 'gamla', en: 'flower pot' } },
      { id: 'c-gha', letter: 'घ', roman: 'gha', example: { hi: 'घर', roman: 'ghar', en: 'house' } },
      { id: 'c-nga', letter: 'ङ', roman: 'nga', example: null },
    ],
  },
  {
    id: 'cha', label: 'च-वर्ग · palate sounds',
    letters: [
      { id: 'c-cha', letter: 'च', roman: 'cha', example: { hi: 'चम्मच', roman: 'chammach', en: 'spoon' } },
      { id: 'c-chha', letter: 'छ', roman: 'chha', example: { hi: 'छतरी', roman: 'chhatri', en: 'umbrella' } },
      { id: 'c-ja', letter: 'ज', roman: 'ja', example: { hi: 'जहाज़', roman: 'jahaaz', en: 'ship' } },
      { id: 'c-jha', letter: 'झ', roman: 'jha', example: { hi: 'झंडा', roman: 'jhanda', en: 'flag' } },
      { id: 'c-nya', letter: 'ञ', roman: 'nya', example: null },
    ],
  },
  {
    id: 'tta', label: 'ट-वर्ग · tongue curled back',
    letters: [
      { id: 'c-tta', letter: 'ट', roman: 'ṭa', example: { hi: 'टमाटर', roman: 'tamaatar', en: 'tomato' } },
      { id: 'c-ttha', letter: 'ठ', roman: 'ṭha', example: { hi: 'ठंडा', roman: 'thanda', en: 'cold' } },
      { id: 'c-dda', letter: 'ड', roman: 'ḍa', example: { hi: 'डमरू', roman: 'damroo', en: 'small hand drum' } },
      { id: 'c-ddha', letter: 'ढ', roman: 'ḍha', example: { hi: 'ढोल', roman: 'dhol', en: 'drum' } },
      { id: 'c-nna', letter: 'ण', roman: 'ṇa', example: { hi: 'बाण', roman: 'baan', en: 'arrow' } },
    ],
  },
  {
    id: 'ta', label: 'त-वर्ग · tongue on the teeth',
    letters: [
      { id: 'c-ta', letter: 'त', roman: 'ta', example: { hi: 'तरबूज़', roman: 'tarbooz', en: 'watermelon' } },
      { id: 'c-tha', letter: 'थ', roman: 'tha', example: { hi: 'थाली', roman: 'thaali', en: 'plate' } },
      { id: 'c-da', letter: 'द', roman: 'da', example: { hi: 'दवाई', roman: 'davaai', en: 'medicine' } },
      { id: 'c-dha', letter: 'ध', roman: 'dha', example: { hi: 'धनुष', roman: 'dhanush', en: 'bow' } },
      { id: 'c-na', letter: 'न', roman: 'na', example: { hi: 'नल', roman: 'nal', en: 'tap' } },
    ],
  },
  {
    id: 'pa', label: 'प-वर्ग · lip sounds',
    letters: [
      { id: 'c-pa', letter: 'प', roman: 'pa', example: { hi: 'पतंग', roman: 'patang', en: 'kite' } },
      { id: 'c-pha', letter: 'फ', roman: 'pha', example: { hi: 'फल', roman: 'phal', en: 'fruit' } },
      { id: 'c-ba', letter: 'ब', roman: 'ba', example: { hi: 'बतख', roman: 'batakh', en: 'duck' } },
      { id: 'c-bha', letter: 'भ', roman: 'bha', example: { hi: 'भालू', roman: 'bhaaloo', en: 'bear' } },
      { id: 'c-ma', letter: 'म', roman: 'ma', example: { hi: 'मछली', roman: 'machhli', en: 'fish' } },
    ],
  },
  {
    id: 'other', label: 'Other consonants',
    letters: [
      { id: 'c-ya', letter: 'य', roman: 'ya', example: { hi: 'यात्री', roman: 'yaatri', en: 'traveller' } },
      { id: 'c-ra', letter: 'र', roman: 'ra', example: { hi: 'रथ', roman: 'rath', en: 'chariot' } },
      { id: 'c-la', letter: 'ल', roman: 'la', example: { hi: 'लड्डू', roman: 'laddoo', en: 'laddoo (a sweet)' } },
      { id: 'c-va', letter: 'व', roman: 'va', example: { hi: 'वन', roman: 'van', en: 'forest' } },
      { id: 'c-sha', letter: 'श', roman: 'sha', example: { hi: 'शेर', roman: 'sher', en: 'lion' } },
      { id: 'c-ssa', letter: 'ष', roman: 'sha', example: { hi: 'षट्कोण', roman: 'shatkon', en: 'hexagon' } },
      { id: 'c-sa', letter: 'स', roman: 'sa', example: { hi: 'सेब', roman: 'seb', en: 'apple' } },
      { id: 'c-ha', letter: 'ह', roman: 'ha', example: { hi: 'हाथी', roman: 'haathi', en: 'elephant' } },
    ],
  },
  {
    id: 'joint', label: 'Joint letters (संयुक्त व्यंजन)',
    letters: [
      { id: 'c-ksha', letter: 'क्ष', roman: 'ksha', example: { hi: 'क्षमा', roman: 'kshama', en: 'forgiveness' } },
      { id: 'c-tra', letter: 'त्र', roman: 'tra', example: { hi: 'त्रिशूल', roman: 'trishool', en: 'trident' } },
      { id: 'c-gya', letter: 'ज्ञ', roman: 'gya', example: { hi: 'ज्ञान', roman: 'gyaan', en: 'knowledge' } },
    ],
  },
];

export const HINDI_WORD_CATEGORIES = [
  { id: 'numbers', label: 'Numbers' },
  { id: 'family', label: 'Family' },
  { id: 'food', label: 'Food & drink' },
  { id: 'colours', label: 'Colours' },
  { id: 'daily', label: 'Daily life' },
  { id: 'verbs', label: 'Action words' },
  { id: 'time', label: 'Time' },
  { id: 'describe', label: 'Describing words' },
];

const w = (id, category, hi, roman, en, ex, exRoman, exEn) => ({ id: `hi-${id}`, category, hi, roman, en, example: { hi: ex, roman: exRoman, en: exEn } });

export const HINDI_WORDS = [
  // Numbers
  w('ek', 'numbers', 'एक', 'ek', 'one', 'मेरे पास एक किताब है।', 'mere paas ek kitaab hai.', 'I have one book.'),
  w('do', 'numbers', 'दो', 'do', 'two', 'दो कप चाय दीजिए।', 'do kap chaay deejiye.', 'Two cups of tea, please.'),
  w('teen', 'numbers', 'तीन', 'teen', 'three', 'हम तीन दोस्त हैं।', 'ham teen dost hain.', 'We are three friends.'),
  w('chaar', 'numbers', 'चार', 'chaar', 'four', 'मेरे घर में चार कमरे हैं।', 'mere ghar mein chaar kamre hain.', 'My house has four rooms.'),
  w('paanch', 'numbers', 'पाँच', 'paanch', 'five', 'पाँच मिनट रुकिए।', 'paanch minat rukiye.', 'Please wait five minutes.'),
  w('chhah', 'numbers', 'छह', 'chhah', 'six', 'मैं छह बजे उठता हूँ।', 'main chhah baje uthta hoon.', 'I wake up at six o’clock.'),
  w('saat', 'numbers', 'सात', 'saat', 'seven', 'हफ़्ते में सात दिन होते हैं।', 'hafte mein saat din hote hain.', 'A week has seven days.'),
  w('aath', 'numbers', 'आठ', 'aath', 'eight', 'दफ़्तर आठ बजे खुलता है।', 'daftar aath baje khulta hai.', 'The office opens at eight.'),
  w('nau', 'numbers', 'नौ', 'nau', 'nine', 'मीटिंग नौ बजे है।', 'meeting nau baje hai.', 'The meeting is at nine.'),
  w('das', 'numbers', 'दस', 'das', 'ten', 'इसके दस रुपये हुए।', 'iske das rupaye hue.', 'That comes to ten rupees.'),

  // Family
  w('maa', 'family', 'माँ', 'maa', 'mother', 'मेरी माँ बहुत अच्छा खाना बनाती हैं।', 'meri maa bahut achchha khaana banaati hain.', 'My mother cooks very well.'),
  w('pita', 'family', 'पिता', 'pita', 'father', 'मेरे पिता बैंक में काम करते हैं।', 'mere pita bank mein kaam karte hain.', 'My father works in a bank.'),
  w('bhai', 'family', 'भाई', 'bhai', 'brother', 'मेरा भाई दिल्ली में रहता है।', 'mera bhai dilli mein rehta hai.', 'My brother lives in Delhi.'),
  w('behen', 'family', 'बहन', 'behen', 'sister', 'मेरी बहन डॉक्टर है।', 'meri behen doctor hai.', 'My sister is a doctor.'),
  w('beta', 'family', 'बेटा', 'beta', 'son', 'उनका बेटा स्कूल जाता है।', 'unka beta school jaata hai.', 'Their son goes to school.'),
  w('beti', 'family', 'बेटी', 'beti', 'daughter', 'उनकी बेटी गाना गाती है।', 'unki beti gaana gaati hai.', 'Their daughter sings.'),
  w('dada', 'family', 'दादा', 'daada', 'grandfather (father’s father)', 'दादा जी सुबह टहलते हैं।', 'daada ji subah tahalte hain.', 'Grandfather goes for a walk in the morning.'),
  w('dadi', 'family', 'दादी', 'daadi', 'grandmother (father’s mother)', 'दादी कहानियाँ सुनाती हैं।', 'daadi kahaaniyaan sunaati hain.', 'Grandmother tells stories.'),
  w('pati', 'family', 'पति', 'pati', 'husband', 'उसके पति इंजीनियर हैं।', 'uske pati engineer hain.', 'Her husband is an engineer.'),
  w('patni', 'family', 'पत्नी', 'patni', 'wife', 'उसकी पत्नी बहुत अच्छा खाना बनाती है।', 'uski patni bahut achchha khaana banaati hai.', 'His wife cooks very well.'),
  w('dost', 'family', 'दोस्त', 'dost', 'friend', 'वह मेरा सबसे अच्छा दोस्त है।', 'vah mera sabse achchha dost hai.', 'He is my best friend.'),

  // Food & drink
  w('paani', 'food', 'पानी', 'paani', 'water', 'मुझे एक गिलास पानी चाहिए।', 'mujhe ek gilaas paani chaahiye.', 'I need a glass of water.'),
  w('chaay', 'food', 'चाय', 'chaay', 'tea', 'क्या आप चाय पिएँगे?', 'kya aap chaay piyenge?', 'Will you have some tea?'),
  w('khaana', 'food', 'खाना', 'khaana', 'food, meal', 'खाना तैयार है।', 'khaana taiyaar hai.', 'The food is ready.'),
  w('roti', 'food', 'रोटी', 'roti', 'flatbread', 'मुझे दो रोटी और दीजिए।', 'mujhe do roti aur deejiye.', 'Please give me two more rotis.'),
  w('chaawal', 'food', 'चावल', 'chaawal', 'rice', 'आज दाल चावल बने हैं।', 'aaj daal chaawal bane hain.', 'Dal and rice have been made today.'),
  w('daal', 'food', 'दाल', 'daal', 'lentils', 'यह दाल बहुत स्वादिष्ट है।', 'yah daal bahut svaadisht hai.', 'This dal is very tasty.'),
  w('doodh', 'food', 'दूध', 'doodh', 'milk', 'बच्चे रोज़ दूध पीते हैं।', 'bachche roz doodh peete hain.', 'Children drink milk every day.'),
  w('phal', 'food', 'फल', 'phal', 'fruit', 'मुझे फल खाना पसंद है।', 'mujhe phal khaana pasand hai.', 'I like eating fruit.'),
  w('sabzi', 'food', 'सब्ज़ी', 'sabzi', 'vegetable, vegetable dish', 'माँ बाज़ार से सब्ज़ी लाईं।', 'maa baazaar se sabzi laayin.', 'Mother brought vegetables from the market.'),
  w('namak', 'food', 'नमक', 'namak', 'salt', 'इसमें नमक थोड़ा कम है।', 'ismein namak thoda kam hai.', 'This needs a little more salt.'),
  w('cheeni', 'food', 'चीनी', 'cheeni', 'sugar', 'चाय में चीनी मत डालिए।', 'chaay mein cheeni mat daaliye.', 'Please don’t put sugar in the tea.'),

  // Colours
  w('laal', 'colours', 'लाल', 'laal', 'red', 'उसकी गाड़ी लाल है।', 'uski gaadi laal hai.', 'His car is red.'),
  w('neela', 'colours', 'नीला', 'neela', 'blue', 'आसमान नीला है।', 'aasmaan neela hai.', 'The sky is blue.'),
  w('hara', 'colours', 'हरा', 'hara', 'green', 'पेड़ के पत्ते हरे हैं।', 'ped ke patte hare hain.', 'The leaves of the tree are green.'),
  w('peela', 'colours', 'पीला', 'peela', 'yellow', 'केला पीला होता है।', 'kela peela hota hai.', 'A banana is yellow.'),
  w('kaala', 'colours', 'काला', 'kaala', 'black', 'मेरा बैग काला है।', 'mera bag kaala hai.', 'My bag is black.'),
  w('safed', 'colours', 'सफ़ेद', 'safed', 'white', 'उसने सफ़ेद कमीज़ पहनी है।', 'usne safed kameez pehni hai.', 'He is wearing a white shirt.'),

  // Daily life
  w('ghar', 'daily', 'घर', 'ghar', 'house, home', 'मैं शाम को घर जाऊँगा।', 'main shaam ko ghar jaaoonga.', 'I will go home in the evening.'),
  w('baazaar', 'daily', 'बाज़ार', 'baazaar', 'market', 'बाज़ार यहाँ से पास है।', 'baazaar yahaan se paas hai.', 'The market is close to here.'),
  w('dukaan', 'daily', 'दुकान', 'dukaan', 'shop', 'दुकान दस बजे खुलती है।', 'dukaan das baje khulti hai.', 'The shop opens at ten.'),
  w('kitaab', 'daily', 'किताब', 'kitaab', 'book', 'यह किताब बहुत अच्छी है।', 'yah kitaab bahut achchhi hai.', 'This book is very good.'),
  w('paisa', 'daily', 'पैसा', 'paisa', 'money', 'मेरे पास पैसे नहीं हैं।', 'mere paas paise nahin hain.', 'I don’t have any money.'),
  w('kaam', 'daily', 'काम', 'kaam', 'work', 'आज बहुत काम है।', 'aaj bahut kaam hai.', 'There is a lot of work today.'),
  w('raasta', 'daily', 'रास्ता', 'raasta', 'way, road', 'स्टेशन का रास्ता बताइए।', 'station ka raasta bataaiye.', 'Please tell me the way to the station.'),
  w('gaadi', 'daily', 'गाड़ी', 'gaadi', 'car, vehicle', 'गाड़ी बाहर खड़ी है।', 'gaadi baahar khadi hai.', 'The car is parked outside.'),
  w('kamra', 'daily', 'कमरा', 'kamra', 'room', 'यह कमरा बहुत बड़ा है।', 'yah kamra bahut bada hai.', 'This room is very big.'),
  w('darvaaza', 'daily', 'दरवाज़ा', 'darvaaza', 'door', 'कृपया दरवाज़ा बंद कीजिए।', 'kripya darvaaza band keejiye.', 'Please close the door.'),

  // Verbs
  w('jaana', 'verbs', 'जाना', 'jaana', 'to go', 'मुझे बाज़ार जाना है।', 'mujhe baazaar jaana hai.', 'I have to go to the market.'),
  w('aana', 'verbs', 'आना', 'aana', 'to come', 'कल मेरे घर आइए।', 'kal mere ghar aaiye.', 'Please come to my house tomorrow.'),
  w('khaana-v', 'verbs', 'खाना', 'khaana', 'to eat', 'मैं रोज़ फल खाता हूँ।', 'main roz phal khaata hoon.', 'I eat fruit every day.'),
  w('peena', 'verbs', 'पीना', 'peena', 'to drink', 'ज़्यादा पानी पीना अच्छा है।', 'zyaada paani peena achchha hai.', 'Drinking more water is good.'),
  w('bolna', 'verbs', 'बोलना', 'bolna', 'to speak', 'मैं थोड़ी हिंदी बोलता हूँ।', 'main thodi hindi bolta hoon.', 'I speak a little Hindi.'),
  w('sunna', 'verbs', 'सुनना', 'sunna', 'to listen, to hear', 'मुझे गाने सुनना पसंद है।', 'mujhe gaane sunna pasand hai.', 'I like listening to songs.'),
  w('dekhna', 'verbs', 'देखना', 'dekhna', 'to see, to watch', 'चलो फ़िल्म देखते हैं।', 'chalo film dekhte hain.', 'Let’s watch a film.'),
  w('padhna', 'verbs', 'पढ़ना', 'padhna', 'to read, to study', 'वह रोज़ अख़बार पढ़ती है।', 'vah roz akhbaar padhti hai.', 'She reads the newspaper every day.'),
  w('likhna', 'verbs', 'लिखना', 'likhna', 'to write', 'अपना नाम यहाँ लिखिए।', 'apna naam yahaan likhiye.', 'Please write your name here.'),
  w('sona', 'verbs', 'सोना', 'sona', 'to sleep', 'मैं रात को दस बजे सोता हूँ।', 'main raat ko das baje sota hoon.', 'I sleep at ten at night.'),
  w('karna', 'verbs', 'करना', 'karna', 'to do', 'आप क्या काम करते हैं?', 'aap kya kaam karte hain?', 'What work do you do?'),
  w('samajhna', 'verbs', 'समझना', 'samajhna', 'to understand', 'मैं आपकी बात समझ गया।', 'main aapki baat samajh gaya.', 'I understood what you said.'),

  // Time
  w('aaj', 'time', 'आज', 'aaj', 'today', 'आज मौसम अच्छा है।', 'aaj mausam achchha hai.', 'The weather is nice today.'),
  w('kal', 'time', 'कल', 'kal', 'yesterday / tomorrow', 'कल छुट्टी है।', 'kal chhutti hai.', 'Tomorrow is a holiday. (The verb tense tells you if “kal” means yesterday or tomorrow.)'),
  w('abhi', 'time', 'अभी', 'abhi', 'right now', 'मैं अभी आता हूँ।', 'main abhi aata hoon.', 'I’ll be right there.'),
  w('subah', 'time', 'सुबह', 'subah', 'morning', 'सुबह की चाय सबसे अच्छी लगती है।', 'subah ki chaay sabse achchhi lagti hai.', 'Morning tea feels the best.'),
  w('shaam', 'time', 'शाम', 'shaam', 'evening', 'शाम को पार्क चलें?', 'shaam ko park chalein?', 'Shall we go to the park in the evening?'),
  w('raat', 'time', 'रात', 'raat', 'night', 'शुभ रात्रि, कल मिलते हैं।', 'shubh raatri, kal milte hain.', 'Good night, see you tomorrow.'),
  w('din', 'time', 'दिन', 'din', 'day', 'आपका दिन कैसा रहा?', 'aapka din kaisa raha?', 'How was your day?'),
  w('hafta', 'time', 'हफ़्ता', 'hafta', 'week', 'अगले हफ़्ते मेरी परीक्षा है।', 'agle hafte meri pareeksha hai.', 'My exam is next week.'),
  w('samay', 'time', 'समय', 'samay', 'time', 'अभी क्या समय हुआ है?', 'abhi kya samay hua hai?', 'What time is it now?'),

  // Describing words
  w('achchha', 'describe', 'अच्छा', 'achchha', 'good', 'यह बहुत अच्छा विचार है।', 'yah bahut achchha vichaar hai.', 'This is a very good idea.'),
  w('bura', 'describe', 'बुरा', 'bura', 'bad', 'आज का दिन बुरा नहीं था।', 'aaj ka din bura nahin tha.', 'Today wasn’t a bad day.'),
  w('bada', 'describe', 'बड़ा', 'bada', 'big', 'उनका घर बहुत बड़ा है।', 'unka ghar bahut bada hai.', 'Their house is very big.'),
  w('chhota', 'describe', 'छोटा', 'chhota', 'small', 'मेरा छोटा भाई दस साल का है।', 'mera chhota bhai das saal ka hai.', 'My younger brother is ten years old.'),
  w('khush', 'describe', 'ख़ुश', 'khush', 'happy', 'मैं आज बहुत ख़ुश हूँ।', 'main aaj bahut khush hoon.', 'I am very happy today.'),
  w('thaka', 'describe', 'थका', 'thaka', 'tired', 'मैं बहुत थका हुआ हूँ।', 'main bahut thaka hua hoon.', 'I am very tired.'),
  w('bhookha', 'describe', 'भूखा', 'bhookha', 'hungry', 'बच्चा भूखा है।', 'bachcha bhookha hai.', 'The child is hungry.'),
  w('garam', 'describe', 'गरम', 'garam', 'hot', 'चाय बहुत गरम है।', 'chaay bahut garam hai.', 'The tea is very hot.'),
  w('thanda', 'describe', 'ठंडा', 'thanda', 'cold', 'मुझे ठंडा पानी चाहिए।', 'mujhe thanda paani chaahiye.', 'I want cold water.'),
  w('naya', 'describe', 'नया', 'naya', 'new', 'यह मेरा नया फ़ोन है।', 'yah mera naya phone hai.', 'This is my new phone.'),
];

export const PHRASE_GROUPS = [
  { id: 'greetings', label: 'Greetings' },
  { id: 'polite', label: 'Polite basics' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'food', label: 'At a restaurant' },
  { id: 'travel', label: 'Travel & directions' },
  { id: 'work', label: 'At work' },
  { id: 'help', label: 'Help & health' },
];

const p = (id, group, hi, roman, en, note) => ({ id: `hp-${id}`, group, hi, roman, en, ...(note ? { note } : {}) });

export const HINDI_PHRASES = [
  p('namaste', 'greetings', 'नमस्ते', 'namaste', 'Hello', 'Works any time of day, with anyone. Join your palms for a respectful greeting.'),
  p('kaise', 'greetings', 'आप कैसे हैं?', 'aap kaise hain?', 'How are you?', 'Say “kaisi” instead of “kaise” when asking a woman: आप कैसी हैं?'),
  p('theek', 'greetings', 'मैं ठीक हूँ, धन्यवाद।', 'main theek hoon, dhanyavaad.', 'I’m fine, thank you.'),
  p('naam', 'greetings', 'आपका नाम क्या है?', 'aapka naam kya hai?', 'What is your name?'),
  p('meranaam', 'greetings', 'मेरा नाम रवि है।', 'mera naam Ravi hai.', 'My name is Ravi.', 'Swap “Ravi” for your own name.'),
  p('milkar', 'greetings', 'आपसे मिलकर ख़ुशी हुई।', 'aapse milkar khushi hui.', 'Nice to meet you.'),
  p('phir', 'greetings', 'फिर मिलेंगे।', 'phir milenge.', 'See you again.'),
  p('shubhratri', 'greetings', 'शुभ रात्रि', 'shubh raatri', 'Good night'),

  p('kripya', 'polite', 'कृपया', 'kripya', 'Please'),
  p('dhanyavaad', 'polite', 'बहुत-बहुत धन्यवाद।', 'bahut-bahut dhanyavaad.', 'Thank you very much.', '“Shukriya” (शुक्रिया) also means thank you and is very common in conversation.'),
  p('maaf', 'polite', 'माफ़ कीजिए।', 'maaf keejiye.', 'Sorry / Excuse me.'),
  p('koibaat', 'polite', 'कोई बात नहीं।', 'koi baat nahin.', 'No problem. / It’s okay.'),
  p('samajh', 'polite', 'मुझे समझ नहीं आया।', 'mujhe samajh nahin aaya.', 'I didn’t understand.'),
  p('dheere', 'polite', 'कृपया धीरे बोलिए।', 'kripya dheere boliye.', 'Please speak slowly.'),
  p('angrezi', 'polite', 'क्या आप अंग्रेज़ी बोलते हैं?', 'kya aap angrezi bolte hain?', 'Do you speak English?'),
  p('thodi', 'polite', 'मैं थोड़ी हिंदी बोलता हूँ।', 'main thodi hindi bolta hoon.', 'I speak a little Hindi.', 'A woman says “bolti hoon”: मैं थोड़ी हिंदी बोलती हूँ।'),

  p('kitne', 'shopping', 'यह कितने का है?', 'yah kitne ka hai?', 'How much is this?'),
  p('mehenga', 'shopping', 'यह बहुत महँगा है।', 'yah bahut mahanga hai.', 'This is very expensive.'),
  p('kam', 'shopping', 'थोड़ा कम कीजिए।', 'thoda kam keejiye.', 'Please lower the price a little.'),
  p('chahiye', 'shopping', 'मुझे यह चाहिए।', 'mujhe yah chaahiye.', 'I want this.'),
  p('card', 'shopping', 'क्या आप कार्ड लेते हैं?', 'kya aap card lete hain?', 'Do you accept cards?'),

  p('menu', 'food', 'मेन्यू दिखाइए।', 'menu dikhaaiye.', 'Please show me the menu.'),
  p('paani', 'food', 'मुझे पानी चाहिए।', 'mujhe paani chaahiye.', 'I need some water.'),
  p('teekha', 'food', 'कम तीखा बनाइए।', 'kam teekha banaaiye.', 'Please make it less spicy.'),
  p('svaad', 'food', 'खाना बहुत स्वादिष्ट है।', 'khaana bahut svaadisht hai.', 'The food is very tasty.'),
  p('bill', 'food', 'बिल ले आइए।', 'bill le aaiye.', 'Please bring the bill.'),

  p('kahaan', 'travel', 'स्टेशन कहाँ है?', 'station kahaan hai?', 'Where is the station?'),
  p('seedhe', 'travel', 'सीधे जाइए।', 'seedhe jaaiye.', 'Go straight.'),
  p('mudiye', 'travel', 'बाएँ मुड़िए।', 'baayen mudiye.', 'Turn left.', 'Turn right is “daayen mudiye” (दाएँ मुड़िए).'),
  p('door', 'travel', 'यहाँ से कितनी दूर है?', 'yahaan se kitni door hai?', 'How far is it from here?'),
  p('airport', 'travel', 'मुझे हवाई अड्डे जाना है।', 'mujhe havaai adde jaana hai.', 'I need to go to the airport.', 'Most people also just say “airport”.'),
  p('ticket', 'travel', 'एक टिकट कितने का है?', 'ek ticket kitne ka hai?', 'How much is one ticket?'),

  p('meeting', 'work', 'मीटिंग कब है?', 'meeting kab hai?', 'When is the meeting?'),
  p('samay', 'work', 'मुझे थोड़ा समय चाहिए।', 'mujhe thoda samay chaahiye.', 'I need a little time.'),
  p('hogaya', 'work', 'काम हो गया है।', 'kaam ho gaya hai.', 'The work is done.'),
  p('madad', 'work', 'क्या आप मेरी मदद कर सकते हैं?', 'kya aap meri madad kar sakte hain?', 'Can you help me?'),
  p('ghar', 'work', 'आज मैं घर से काम करूँगा।', 'aaj main ghar se kaam karoonga.', 'I’ll work from home today.', 'A woman says “karoongi”: आज मैं घर से काम करूँगी।'),

  p('tabiyat', 'help', 'मेरी तबीयत ठीक नहीं है।', 'meri tabiyat theek nahin hai.', 'I’m not feeling well.'),
  p('doctor', 'help', 'डॉक्टर को बुलाइए।', 'doctor ko bulaaiye.', 'Please call a doctor.'),
  p('bachao', 'help', 'मदद कीजिए!', 'madad keejiye!', 'Help!'),
  p('kho', 'help', 'मेरा फ़ोन खो गया है।', 'mera phone kho gaya hai.', 'I have lost my phone.'),
];

const ex = (hi, roman, en) => ({ hi, roman, en });
const q = (id, prompt, options, answer, explanation) => ({ id, prompt, options, answer, explanation, type: 'mcq' });

export const HINDI_LESSONS = [
  {
    id: 'to-be',
    title: '“To be” — हूँ, है, हैं, हो',
    level: 'Beginner',
    summary: 'The verb “hona” (to be) changes with the person you’re talking about. It always comes at the end of the sentence.',
    rules: [
      { text: 'मैं … हूँ (main … hoon) — I am', examples: [ex('मैं ठीक हूँ।', 'main theek hoon.', 'I am fine.')] },
      { text: 'तुम … हो (tum … ho) — you are (friendly)', examples: [ex('तुम कहाँ हो?', 'tum kahaan ho?', 'Where are you?')] },
      { text: 'आप … हैं (aap … hain) — you are (respectful)', examples: [ex('आप बहुत अच्छे हैं।', 'aap bahut achchhe hain.', 'You are very kind.')] },
      { text: 'वह / यह … है (vah / yah … hai) — he, she, it is', examples: [ex('वह मेरा भाई है।', 'vah mera bhai hai.', 'He is my brother.')] },
      { text: 'हम / वे … हैं (ham / ve … hain) — we / they are', examples: [ex('हम दोस्त हैं।', 'ham dost hain.', 'We are friends.')] },
    ],
    quiz: [
      q('tb1', 'मैं ठीक ___।  (I am fine.)', ['हूँ', 'है', 'हैं', 'हो'], 0, 'With मैं (I) always use हूँ.'),
      q('tb2', 'आप कहाँ ___?  (Where are you?)', ['हो', 'हैं', 'है', 'हूँ'], 1, 'आप is the respectful “you” and takes हैं.'),
      q('tb3', 'वह मेरी बहन ___।  (She is my sister.)', ['हैं', 'हूँ', 'है', 'हो'], 2, 'वह (he/she) takes है.'),
      q('tb4', 'तुम कैसे ___?  (How are you? — to a friend)', ['हो', 'है', 'हूँ', 'हैं'], 0, 'तुम takes हो.'),
      q('tb5', 'हम भारतीय ___।  (We are Indian.)', ['है', 'हो', 'हूँ', 'हैं'], 3, 'हम (we) takes हैं.'),
    ],
  },
  {
    id: 'you',
    title: 'आप, तुम, तू — three kinds of “you”',
    level: 'Beginner',
    summary: 'Hindi has three words for “you”, depending on how respectful or close you are. When in doubt, use आप.',
    rules: [
      { text: 'आप (aap) — respectful: elders, strangers, your manager, customers', examples: [ex('आप क्या लेंगे?', 'aap kya lenge?', 'What will you have?')] },
      { text: 'तुम (tum) — friendly: friends, colleagues of your age, younger people', examples: [ex('तुम कब आओगे?', 'tum kab aaoge?', 'When will you come?')] },
      { text: 'तू (too) — very close: best friends, small children, or God in prayer. It can sound rude to others.', examples: [ex('तू पागल है!', 'too paagal hai!', 'You’re crazy! (joking with a best friend)')] },
      { text: 'Verbs change too: आप जाइए · तुम जाओ · तू जा (all mean “go”)', examples: [ex('आप बैठिए।', 'aap baithiye.', 'Please sit down.')] },
    ],
    quiz: [
      q('yo1', 'Which “you” do you use with your manager?', ['तू', 'तुम', 'आप'], 2, 'आप shows respect. Use it at work, with elders and with people you don’t know.'),
      q('yo2', 'Which “you” is normal with a friend of your age?', ['तुम', 'आप', 'तू'], 0, 'तुम is friendly and informal. आप is also fine, just more formal.'),
      q('yo3', 'Which is the most respectful way to say “Please sit”?', ['तू बैठ।', 'तुम बैठो।', 'आप बैठिए।'], 2, 'आप + बैठिए is the polite form.'),
      q('yo4', 'You are speaking to a shopkeeper you don’t know. You say:', ['तू यह दे।', 'आप यह दीजिए।', 'तुम यह दो।'], 1, 'With strangers, always use आप and the polite verb ending -इए.'),
    ],
  },
  {
    id: 'gender',
    title: 'Masculine and feminine',
    level: 'Beginner',
    summary: 'Every Hindi noun is masculine or feminine. Adjectives, “my” and many verbs change to match: -आ for masculine, -ई for feminine, -ए for plural or respect.',
    rules: [
      { text: 'Adjectives ending in -आ change: अच्छा (m) · अच्छी (f) · अच्छे (plural)', examples: [ex('अच्छा लड़का · अच्छी लड़की', 'achchha ladka · achchhi ladki', 'good boy · good girl')] },
      { text: '“My” follows the thing owned, not the owner: मेरा भाई · मेरी बहन · मेरे दोस्त', examples: [ex('मेरी किताब कहाँ है?', 'meri kitaab kahaan hai?', 'Where is my book? (किताब is feminine)')] },
      { text: 'Present-tense verbs follow the subject: वह जाता है (he goes) · वह जाती है (she goes)', examples: [ex('सीता स्कूल जाती है।', 'Seeta school jaati hai.', 'Seeta goes to school.')] },
      { text: 'Tip: many words ending in -ई are feminine (रोटी, कुर्सी, गाड़ी), and many ending in -आ are masculine (कमरा, लड़का). There are exceptions, so learn each word with its gender.', examples: [] },
    ],
    quiz: [
      q('ge1', '___ लड़की  (a good girl)', ['अच्छा', 'अच्छी', 'अच्छे'], 1, 'लड़की is feminine, so the adjective ends in -ई: अच्छी.'),
      q('ge2', '___ बहन डॉक्टर है।  (My sister is a doctor.)', ['मेरा', 'मेरे', 'मेरी'], 2, 'बहन is feminine, so “my” is मेरी.'),
      q('ge3', 'सीता रोज़ दफ़्तर ___ है।  (Seeta goes to the office every day.)', ['जाता', 'जाती', 'जाते'], 1, 'The subject सीता is a woman, so the verb is जाती.'),
      q('ge4', 'यह मेरा ___ है।  (This is my ___.) Which word fits “मेरा”?', ['कमरा', 'किताब', 'गाड़ी'], 0, 'मेरा goes with masculine nouns. कमरा (room) is masculine; किताब and गाड़ी are feminine.'),
      q('ge5', '___ दोस्त आ रहे हैं।  (My friends are coming.)', ['मेरा', 'मेरी', 'मेरे'], 2, 'Plural (or respect) takes the -ए form: मेरे.'),
    ],
  },
  {
    id: 'postpositions',
    title: 'में, पर, से, को, का — little position words',
    level: 'Beginner',
    summary: 'Where English uses prepositions before a noun (“in the room”), Hindi puts postpositions after it (“कमरे में” — room in).',
    rules: [
      { text: 'में (mein) — in', examples: [ex('पानी गिलास में है।', 'paani gilaas mein hai.', 'The water is in the glass.')] },
      { text: 'पर (par) — on, at', examples: [ex('किताब मेज़ पर है।', 'kitaab mez par hai.', 'The book is on the table.')] },
      { text: 'से (se) — from, with, since', examples: [ex('मैं मुंबई से हूँ।', 'main Mumbai se hoon.', 'I am from Mumbai.')] },
      { text: 'को (ko) — to, for (a person or a time)', examples: [ex('राम को बताइए।', 'Ram ko bataaiye.', 'Please tell Ram.')] },
      { text: 'का / की / के (ka / ki / ke) — of, ’s. It matches the thing owned, like मेरा / मेरी / मेरे', examples: [ex('राम की किताब · राम का घर', 'Ram ki kitaab · Ram ka ghar', 'Ram’s book · Ram’s house')] },
    ],
    quiz: [
      q('pp1', 'किताब मेज़ ___ है।  (The book is on the table.)', ['में', 'पर', 'से'], 1, 'पर means “on”.'),
      q('pp2', 'मैं दिल्ली ___ हूँ।  (I am from Delhi.)', ['को', 'से', 'पर'], 1, 'से means “from”.'),
      q('pp3', 'पानी बोतल ___ है।  (The water is in the bottle.)', ['में', 'का', 'को'], 0, 'में means “in”.'),
      q('pp4', 'यह राम ___ किताब है।  (This is Ram’s book.)', ['का', 'के', 'की'], 2, 'किताब is feminine, so “of” is की.'),
      q('pp5', 'माँ ___ फ़ोन कीजिए।  (Please call Mother.)', ['को', 'में', 'पर'], 0, 'को marks the person something is done to or for.'),
    ],
  },
  {
    id: 'word-order',
    title: 'Word order and questions',
    level: 'Beginner',
    summary: 'Hindi sentences usually go Subject → Object → Verb. The verb comes last. Question words go just before the verb.',
    rules: [
      { text: 'English: I eat an apple. Hindi: I apple eat.', examples: [ex('मैं सेब खाता हूँ।', 'main seb khaata hoon.', 'I eat an apple.')] },
      { text: 'Yes/no questions: put क्या (kya) at the start, or just raise your voice at the end.', examples: [ex('क्या आप चाय पिएँगे?', 'kya aap chaay piyenge?', 'Will you have tea?')] },
      { text: 'Question words: क्या what · कौन who · कहाँ where · कब when · क्यों why · कैसे how · कितना how much', examples: [ex('आप कहाँ रहते हैं?', 'aap kahaan rehte hain?', 'Where do you live?')] },
      { text: 'Make a sentence negative with नहीं (nahin) before the verb.', examples: [ex('मैं मांस नहीं खाता।', 'main maans nahin khaata.', 'I don’t eat meat.')] },
    ],
    quiz: [
      q('wo1', 'Which is correct Hindi for “I drink tea”?', ['मैं पीता हूँ चाय।', 'मैं चाय पीता हूँ।', 'चाय हूँ मैं पीता।'], 1, 'Subject (मैं) → object (चाय) → verb (पीता हूँ).'),
      q('wo2', 'Which word means “where”?', ['कब', 'कहाँ', 'क्यों', 'कौन'], 1, 'कहाँ = where. कब = when, क्यों = why, कौन = who.'),
      q('wo3', 'आप ___ आएँगे?  (When will you come?)', ['कब', 'कैसे', 'क्या', 'कौन'], 0, 'कब means “when”.'),
      q('wo4', 'How do you say “I don’t know”?', ['मैं नहीं जानता हूँ नहीं।', 'नहीं मैं जानता।', 'मैं नहीं जानता।'], 2, 'नहीं goes just before the verb. In negative sentences हूँ is usually dropped.'),
      q('wo5', 'Which word means “why”?', ['कैसे', 'कितना', 'क्यों', 'कहाँ'], 2, 'क्यों = why.'),
    ],
  },
  {
    id: 'present',
    title: 'Present tense — things you do every day',
    level: 'Elementary',
    summary: 'For habits and facts, take the verb stem and add -ता / -ती / -ते, then हूँ / है / हैं. बोलना → बोल + ता → बोलता हूँ.',
    rules: [
      { text: 'Masculine singular: -ता', examples: [ex('मैं हिंदी बोलता हूँ।', 'main hindi bolta hoon.', 'I speak Hindi. (man speaking)')] },
      { text: 'Feminine: -ती', examples: [ex('मैं हिंदी बोलती हूँ।', 'main hindi bolti hoon.', 'I speak Hindi. (woman speaking)')] },
      { text: 'Plural or respectful (masculine): -ते', examples: [ex('हम हिंदी बोलते हैं।', 'ham hindi bolte hain.', 'We speak Hindi.')] },
      { text: 'The ending of “to be” still follows the subject: मैं → हूँ, वह → है, हम / आप → हैं', examples: [ex('वह रोज़ दौड़ता है।', 'vah roz daudta hai.', 'He runs every day.')] },
    ],
    quiz: [
      q('pr1', 'हम हिंदी ___ हैं।  (We speak Hindi.)', ['बोलता', 'बोलती', 'बोलते'], 2, 'हम is plural, so the verb ends in -ते.'),
      q('pr2', 'प्रिया रोज़ किताब पढ़ती ___।  (Priya reads a book every day.)', ['हूँ', 'है', 'हैं'], 1, 'प्रिया is one person (वह), so use है.'),
      q('pr3', 'A woman says “I work in an office”:', ['मैं दफ़्तर में काम करता हूँ।', 'मैं दफ़्तर में काम करती हूँ।', 'मैं दफ़्तर में काम करते हैं।'], 1, 'A woman uses -ती: करती हूँ.'),
      q('pr4', 'आप क्या काम ___ हैं?  (What work do you do?)', ['करते', 'करता', 'करती'], 0, 'आप (respectful you) takes the -ते form.'),
      q('pr5', 'Make “to eat” (खाना) present tense for “he”: वह ___ है।', ['खाती', 'खाता', 'खाते'], 1, 'He (masculine singular) → खाता है.'),
    ],
  },
];
