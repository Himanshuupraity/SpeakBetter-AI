// Static grammar content for SpeakBetter AI.
// 14 topics, each with explanation, sub-rules, examples, common mistakes and 8 practice questions.

export const GRAMMAR_TOPICS = [
  // ---------------------------------------------------------------- TENSES
  {
    id: "tenses",
    title: "Tenses",
    level: "A2",
    summary: "Talk about the past, present and future correctly.",
    explanation: [
      "A tense shows WHEN something happens: in the past, now, or in the future. English changes the verb (work, worked, will work) or adds a helping verb (is working, has worked) to show time.",
      "You don't need to learn all tenses at once. Six tenses cover most everyday and office conversations: Present Simple, Present Continuous, Past Simple, Present Perfect, Past Continuous and the Future.",
      "Tip: first ask yourself 'Is it finished? Is it happening now? Is it a habit?' The answer usually tells you which tense to use.",
    ],
    sections: [
      {
        title: "Present Simple",
        rule: "Use for habits, routines and facts. Add -s/-es to the verb with he/she/it.",
        examples: ["I work from home on Fridays.", "She works in Pune.", "Water boils at 100°C."],
      },
      {
        title: "Present Continuous",
        rule: "Use for actions happening now or around now. Form: am/is/are + verb-ing.",
        examples: ["I am testing the login page right now.", "They are working on a new project this month."],
      },
      {
        title: "Past Simple",
        rule: "Use for finished actions at a finished time in the past (yesterday, last week, in 2020). Regular verbs add -ed.",
        examples: ["I fixed the bug yesterday.", "We went to Goa last year."],
      },
      {
        title: "Present Perfect",
        rule: "Use for past actions connected to now, or when the time is not important. Form: have/has + past participle.",
        examples: ["I have finished the report.", "She has worked here since 2021.", "Have you ever been to Delhi?"],
      },
      {
        title: "Past Continuous",
        rule: "Use for an action that was in progress at a moment in the past. Form: was/were + verb-ing.",
        examples: ["I was attending a meeting when you called.", "They were deploying the build at 6 pm."],
      },
      {
        title: "Future (will / going to)",
        rule: "Use 'will' for quick decisions, promises and predictions. Use 'going to' for plans you already made.",
        examples: ["I'll send you the file now.", "We are going to release version 2.0 next month."],
      },
    ],
    examples: [
      { sentence: "I check my emails every morning.", note: "Present Simple — daily habit" },
      { sentence: "She is reviewing the test cases now.", note: "Present Continuous — happening now" },
      { sentence: "We completed the sprint last Friday.", note: "Past Simple — finished time" },
      { sentence: "I have already shared the document.", note: "Present Perfect — result matters now" },
      { sentence: "I was driving when the manager called.", note: "Past Continuous — action in progress" },
      { sentence: "I'm going to apply for a new role next year.", note: "Future (going to) — a plan" },
    ],
    commonMistakes: [
      { wrong: "He go to office every day.", right: "He goes to the office every day.", why: "For he/she/it in the present simple, add -s/-es to the verb." },
      { wrong: "I am working here from 2 years.", right: "I have been working here for 2 years.", why: "For a situation that started in the past and continues now, use the present perfect (continuous) with 'for' + a period of time." },
      { wrong: "I have completed it yesterday.", right: "I completed it yesterday.", why: "Don't use the present perfect with a finished time like 'yesterday'. Use the past simple." },
      { wrong: "I am having a doubt.", right: "I have a question.", why: "'Have' meaning 'possess' is a state, so it is not used in the continuous form. Also, 'question' is more natural than 'doubt' here." },
      { wrong: "Did you went to the meeting?", right: "Did you go to the meeting?", why: "After 'did', always use the base form of the verb (go, not went)." },
    ],
    questions: [
      { id: "tenses-1", prompt: "She ___ to work every morning.", options: ["goes", "go", "going", "gone"], answer: 0, explanation: "With she (third person singular) in the present simple, add -es: goes." },
      { id: "tenses-2", prompt: "Please wait, I ___ on a call right now.", options: ["am", "was", "have been", "be"], answer: 0, explanation: "'Right now' shows the present moment, so use 'am'." },
      { id: "tenses-3", prompt: "We ___ the release last Friday.", options: ["have deployed", "deployed", "deploy", "are deploying"], answer: 1, explanation: "'Last Friday' is a finished past time, so use the past simple: deployed." },
      { id: "tenses-4", prompt: "Look! The build ___ again.", options: ["fails", "has fail", "fail", "is failing"], answer: 3, explanation: "'Look!' shows something happening now, so use the present continuous." },
      { id: "tenses-5", prompt: "I ___ in this company since 2019.", options: ["work", "am working", "worked", "have worked"], answer: 3, explanation: "'Since 2019' shows a situation that started in the past and continues now, so use the present perfect." },
      { id: "tenses-6", prompt: "I ___ a test report when the server crashed.", options: ["was writing", "am writing", "write", "have written"], answer: 0, explanation: "An action in progress in the past, interrupted by another action, uses the past continuous." },
      { id: "tenses-7", prompt: "The phone is ringing. — OK, I ___ it.", options: ["am going to answer", "answer", "will answer", "answered"], answer: 2, explanation: "This is a quick decision made at the moment of speaking, so use 'will'." },
      { id: "tenses-8", prompt: "Which sentence is correct?", options: ["I have seen him yesterday.", "I saw him yesterday.", "I am seeing him yesterday.", "I see him yesterday."], answer: 1, explanation: "'Yesterday' is a finished time, so only the past simple 'saw' is correct." },
    ],
  },

  // ---------------------------------------------------------------- ARTICLES
  {
    id: "articles",
    title: "Articles (a, an, the)",
    level: "A1",
    summary: "Know when to use a, an, the — or no article at all.",
    explanation: [
      "Articles are small words that come before nouns: 'a', 'an' and 'the'. They tell the listener if you mean any thing or one specific thing.",
      "Use 'a' or 'an' for one thing that is not specific or is mentioned for the first time. Use 'the' when the listener knows exactly which thing you mean.",
      "Sometimes we use no article at all, for example with plural or uncountable nouns in general (Engineers like coffee) and with most names of people, cities and countries.",
    ],
    sections: [
      {
        title: "a vs an",
        rule: "Use 'a' before a consonant SOUND and 'an' before a vowel SOUND. It's about sound, not spelling.",
        examples: ["a laptop", "an email", "an hour (h is silent)", "a university (sounds like 'you')"],
      },
      {
        title: "the",
        rule: "Use 'the' when the thing is specific, already mentioned, or the only one.",
        examples: ["I bought a phone. The phone is very fast.", "The sun rises in the east.", "Please close the door."],
      },
      {
        title: "No article",
        rule: "Don't use an article with plural or uncountable nouns in general, or with most names.",
        examples: ["Testers find bugs.", "I love music.", "She lives in Bengaluru."],
      },
      {
        title: "Fixed expressions",
        rule: "Some phrases always take (or never take) an article. Learn them as chunks.",
        examples: ["go to the office", "go to work / go home", "once a week", "play the guitar"],
      },
    ],
    examples: [
      { sentence: "I need an umbrella.", note: "'an' before a vowel sound" },
      { sentence: "She is a QA engineer.", note: "Use 'a/an' for jobs" },
      { sentence: "The meeting starts at 10.", note: "Specific meeting that both people know" },
      { sentence: "Information is important.", note: "Uncountable noun in general — no article" },
      { sentence: "He is an honest person.", note: "Silent h — vowel sound, so 'an'" },
    ],
    commonMistakes: [
      { wrong: "I am software engineer.", right: "I am a software engineer.", why: "Use 'a' or 'an' before a singular job title." },
      { wrong: "She has a MBA.", right: "She has an MBA.", why: "'MBA' starts with the sound 'em', a vowel sound, so use 'an'." },
      { wrong: "I will go to office tomorrow.", right: "I will go to the office tomorrow.", why: "Say 'go to the office', but 'go to work' and 'go home' have no article." },
      { wrong: "The life is beautiful.", right: "Life is beautiful.", why: "Don't use 'the' with uncountable nouns used in a general sense." },
    ],
    questions: [
      { id: "articles-1", prompt: "I bought ___ new laptop yesterday.", options: ["a", "an", "the"], answer: 0, explanation: "'New' starts with a consonant sound and the laptop is mentioned for the first time, so use 'a'." },
      { id: "articles-2", prompt: "Please send me ___ email with the details.", options: ["a", "the", "an", "no article"], answer: 2, explanation: "'Email' starts with a vowel sound, so use 'an'." },
      { id: "articles-3", prompt: "She is ___ best tester in our team.", options: ["a", "the", "an"], answer: 1, explanation: "Superlatives (best, biggest) take 'the'." },
      { id: "articles-4", prompt: "The meeting will take ___ hour.", options: ["a", "an", "the", "no article"], answer: 1, explanation: "The 'h' in 'hour' is silent, so it begins with a vowel sound: 'an hour'." },
      { id: "articles-5", prompt: "___ water is essential for life.", options: ["The", "A", "An", "No article"], answer: 3, explanation: "'Water' is uncountable and used in a general sense, so no article is needed." },
      { id: "articles-6", prompt: "He studied at ___ university in Chennai.", options: ["a", "an", "the"], answer: 0, explanation: "'University' starts with a 'you' sound (a consonant sound), so use 'a'." },
      { id: "articles-7", prompt: "I found a bug in the app. ___ bug crashes the login screen.", options: ["A", "An", "The", "No article"], answer: 2, explanation: "The bug was already mentioned, so it is now specific: use 'the'." },
      { id: "articles-8", prompt: "Which sentence is correct?", options: ["She goes to the work by bus.", "She goes to work by bus.", "She goes to work by the bus.", "She goes to a work by bus."], answer: 1, explanation: "'Go to work' and 'by bus' are fixed expressions with no article." },
    ],
  },

  // ---------------------------------------------------------------- PREPOSITIONS
  {
    id: "prepositions",
    title: "Prepositions",
    level: "A2",
    summary: "Use in, on, at, for, since and other small words correctly.",
    explanation: [
      "Prepositions are small words like in, on, at, for, to and with. They show time, place, direction and relationships between words.",
      "Many prepositions follow simple patterns (at + time, on + day, in + month). Others are fixed with certain verbs or adjectives, like 'depend on' or 'good at', so learn them together as one chunk.",
      "Also remember: some verbs need NO preposition at all. For example, we 'discuss something', not 'discuss about something'.",
    ],
    sections: [
      {
        title: "Time: at, on, in",
        rule: "AT for exact times, ON for days and dates, IN for months, years and longer periods.",
        examples: ["at 9 am", "on Monday", "on 15 August", "in March", "in 2024", "in the morning"],
      },
      {
        title: "Place: at, on, in",
        rule: "AT for a point or place, ON for surfaces, IN for inside a space or a city/country.",
        examples: ["at the bus stop", "on the desk", "in the meeting room", "in Hyderabad"],
      },
      {
        title: "for vs since",
        rule: "FOR + a length of time (3 years). SINCE + a starting point (2021, Monday).",
        examples: ["I have lived here for five years.", "I have lived here since 2020."],
      },
      {
        title: "Verb + preposition chunks",
        rule: "Some verbs always use a fixed preposition; some verbs use none.",
        examples: ["depend on", "listen to", "wait for", "discuss the issue (no 'about')", "reply to an email"],
      },
    ],
    examples: [
      { sentence: "The stand-up is at 10:30.", note: "at + exact time" },
      { sentence: "My birthday is on 5 June.", note: "on + date" },
      { sentence: "I joined the company in 2022.", note: "in + year" },
      { sentence: "We discussed the defect in the meeting.", note: "discuss + object, no 'about'" },
      { sentence: "The result depends on the test data.", note: "depend on — fixed pair" },
    ],
    commonMistakes: [
      { wrong: "Let's discuss about the issue.", right: "Let's discuss the issue.", why: "'Discuss' already means 'talk about', so don't add 'about'." },
      { wrong: "I am working here from 2 years.", right: "I have been working here for 2 years.", why: "Use 'for' with a length of time, not 'from'." },
      { wrong: "I will call you in Monday.", right: "I will call you on Monday.", why: "Use 'on' with days of the week." },
      { wrong: "Please revert back to me.", right: "Please reply to me. / Please get back to me.", why: "'Revert' means 'go back to an earlier state', and 'back' is extra. For emails, say 'reply' or 'get back to me'." },
    ],
    questions: [
      { id: "prepositions-1", prompt: "The meeting starts ___ 11 am.", options: ["in", "on", "at", "by"], answer: 2, explanation: "Use 'at' with exact clock times." },
      { id: "prepositions-2", prompt: "I was born ___ 1995.", options: ["in", "on", "at"], answer: 0, explanation: "Use 'in' with years." },
      { id: "prepositions-3", prompt: "The release is planned ___ Friday.", options: ["in", "on", "at", "to"], answer: 1, explanation: "Use 'on' with days of the week." },
      { id: "prepositions-4", prompt: "She has worked here ___ 2018.", options: ["for", "from", "by", "since"], answer: 3, explanation: "2018 is a starting point, so use 'since'." },
      { id: "prepositions-5", prompt: "I have been waiting ___ two hours.", options: ["since", "from", "for", "at"], answer: 2, explanation: "'Two hours' is a length of time, so use 'for'." },
      { id: "prepositions-6", prompt: "The final decision depends ___ the client.", options: ["of", "on", "from", "at"], answer: 1, explanation: "'Depend' is always followed by 'on'." },
      { id: "prepositions-7", prompt: "Which sentence is correct?", options: ["We discussed about the bug.", "We discussed on the bug.", "We discussed the bug.", "We discussed for the bug."], answer: 2, explanation: "'Discuss' takes a direct object with no preposition." },
      { id: "prepositions-8", prompt: "She is very good ___ writing test cases.", options: ["at", "in", "on", "for"], answer: 0, explanation: "We say 'good at' + a skill or activity." },
    ],
  },

  // ---------------------------------------------------------------- PRONOUNS
  {
    id: "pronouns",
    title: "Pronouns",
    level: "A1",
    summary: "Use I/me, he/him, my/mine and myself correctly.",
    explanation: [
      "Pronouns replace nouns so we don't repeat the same name again and again. Instead of 'Ravi said Ravi is busy', we say 'Ravi said he is busy'.",
      "The form of a pronoun depends on its job in the sentence. Use subject pronouns (I, he, she) before the verb, and object pronouns (me, him, her) after the verb or a preposition.",
      "Possessive words (my, your, mine, yours) show ownership, and reflexive pronouns (myself, yourself) are used when the subject and object are the same person.",
    ],
    sections: [
      {
        title: "Subject pronouns",
        rule: "I, you, he, she, it, we, they — the person doing the action, before the verb.",
        examples: ["She leads the QA team.", "They joined last week."],
      },
      {
        title: "Object pronouns",
        rule: "me, you, him, her, it, us, them — after a verb or a preposition.",
        examples: ["The manager called me.", "Please send it to them."],
      },
      {
        title: "Possessives",
        rule: "my/your/his/her/our/their + noun. mine/yours/his/hers/ours/theirs stand alone.",
        examples: ["This is my laptop.", "This laptop is mine."],
      },
      {
        title: "Reflexive pronouns",
        rule: "myself, yourself, himself, herself, ourselves, themselves — when the subject does the action to itself, or for emphasis.",
        examples: ["I taught myself Selenium.", "She fixed the issue herself."],
      },
    ],
    examples: [
      { sentence: "Priya and I will join the call.", note: "Subject position — use 'I'" },
      { sentence: "Please share the report with Priya and me.", note: "After a preposition — use 'me'" },
      { sentence: "Is this pen yours?", note: "Possessive pronoun standing alone" },
      { sentence: "The team did it themselves.", note: "Reflexive for emphasis" },
    ],
    commonMistakes: [
      { wrong: "Me and Rahul completed the task.", right: "Rahul and I completed the task.", why: "In the subject position, use 'I', and it is polite to put the other person first." },
      { wrong: "Please contact myself for details.", right: "Please contact me for details.", why: "Use 'myself' only when 'I' is also the subject. Here, the object is simply 'me'." },
      { wrong: "My manager, he is very supportive.", right: "My manager is very supportive.", why: "Don't repeat the subject with a pronoun. Use either the noun or the pronoun, not both." },
      { wrong: "This book is her's.", right: "This book is hers.", why: "Possessive pronouns (hers, yours, its, ours) never take an apostrophe." },
    ],
    questions: [
      { id: "pronouns-1", prompt: "___ is my team lead.", options: ["She", "Her", "Hers"], answer: 0, explanation: "Before the verb (subject), use the subject pronoun 'she'." },
      { id: "pronouns-2", prompt: "Can you help ___ with this bug?", options: ["I", "me", "my", "mine"], answer: 1, explanation: "After the verb 'help', use the object pronoun 'me'." },
      { id: "pronouns-3", prompt: "This is not my bag. It's ___.", options: ["her", "she", "hers", "her's"], answer: 2, explanation: "A possessive pronoun that stands alone is 'hers' (no apostrophe)." },
      { id: "pronouns-4", prompt: "The team completed the project by ___.", options: ["themselves", "theirselves", "them", "their"], answer: 0, explanation: "'By themselves' means without help. 'Theirselves' is not a correct word." },
      { id: "pronouns-5", prompt: "Which sentence is correct?", options: ["Me and Anil are going.", "Anil and I are going.", "Anil and me are going.", "Myself and Anil are going."], answer: 1, explanation: "In the subject position, use 'I'. 'Anil and I' is correct and polite." },
      { id: "pronouns-6", prompt: "The manager sent the invite to Neha and ___.", options: ["I", "me", "myself", "mine"], answer: 1, explanation: "After the preposition 'to', use the object pronoun 'me'. Check: 'sent the invite to me'." },
      { id: "pronouns-7", prompt: "The company changed ___ logo last year.", options: ["its", "it's", "their's", "it"], answer: 0, explanation: "'Its' is the possessive. 'It's' means 'it is'." },
      { id: "pronouns-8", prompt: "I cut ___ while cooking.", options: ["me", "mine", "I", "myself"], answer: 3, explanation: "The subject and object are the same person, so use the reflexive 'myself'." },
    ],
  },

  // ---------------------------------------------------------------- VERBS
  {
    id: "verbs",
    title: "Verbs & Verb Forms",
    level: "A2",
    summary: "Understand main verbs, helping verbs, irregular verbs, and -ing vs to.",
    explanation: [
      "A verb is an action or state word: work, test, think, be. Every complete sentence needs a verb.",
      "Verbs have different forms: base (go), past (went), past participle (gone) and -ing (going). Regular verbs add -ed in the past, but many common verbs are irregular and must be learned.",
      "Some verbs are followed by 'to + verb' (want to learn) and some by 'verb-ing' (enjoy learning). Learning these patterns makes your English sound natural.",
    ],
    sections: [
      {
        title: "Helping verbs (be, do, have)",
        rule: "Helping verbs help the main verb make tenses, questions and negatives.",
        examples: ["I am learning.", "Do you agree?", "She has finished."],
      },
      {
        title: "Irregular verbs",
        rule: "Common verbs often have irregular forms. Learn the three forms together: base – past – past participle.",
        examples: ["go – went – gone", "write – wrote – written", "send – sent – sent", "take – took – taken"],
      },
      {
        title: "Verb + to-infinitive",
        rule: "Verbs like want, need, decide, plan, hope, agree are followed by 'to + base verb'.",
        examples: ["I want to improve my English.", "We decided to postpone the release."],
      },
      {
        title: "Verb + -ing",
        rule: "Verbs like enjoy, finish, avoid, suggest, mind, keep are followed by the -ing form.",
        examples: ["I enjoy reading.", "She suggested running the tests again."],
      },
      {
        title: "State verbs",
        rule: "Verbs for thoughts, feelings and possession (know, like, want, have = own, understand) are not usually used in continuous forms.",
        examples: ["I know the answer. (not 'I am knowing')", "I understand the requirement."],
      },
    ],
    examples: [
      { sentence: "I have written the test plan.", note: "have + past participle of 'write'" },
      { sentence: "She finished testing at 6.", note: "finish + -ing" },
      { sentence: "We plan to automate this module.", note: "plan + to-infinitive" },
      { sentence: "I know what you mean.", note: "State verb — no -ing" },
    ],
    commonMistakes: [
      { wrong: "I am knowing the answer.", right: "I know the answer.", why: "'Know' is a state verb, so we don't use it in the continuous form." },
      { wrong: "He has went home.", right: "He has gone home.", why: "After 'has/have', use the past participle (gone), not the past simple (went)." },
      { wrong: "I suggest you to check the logs.", right: "I suggest that you check the logs. / I suggest checking the logs.", why: "'Suggest' is not followed by 'someone + to'. Use 'suggest that…' or 'suggest + -ing'." },
      { wrong: "I didn't sent the mail.", right: "I didn't send the mail.", why: "After 'did/didn't', always use the base form of the verb." },
    ],
    questions: [
      { id: "verbs-1", prompt: "I ___ my report yesterday.", options: ["send", "sended", "sent", "sending"], answer: 2, explanation: "'Send' is irregular. Its past form is 'sent'." },
      { id: "verbs-2", prompt: "She has ___ the email already.", options: ["wrote", "written", "write", "writing"], answer: 1, explanation: "After 'has', use the past participle: written." },
      { id: "verbs-3", prompt: "I enjoy ___ with my team.", options: ["to work", "work", "working", "worked"], answer: 2, explanation: "'Enjoy' is followed by the -ing form." },
      { id: "verbs-4", prompt: "We decided ___ the meeting.", options: ["to cancel", "cancelling", "cancel", "cancelled"], answer: 0, explanation: "'Decide' is followed by 'to + base verb'." },
      { id: "verbs-5", prompt: "Which sentence is correct?", options: ["I understand the problem.", "I am understanding the problem.", "I understanding the problem.", "I am understand the problem."], answer: 0, explanation: "'Understand' is a state verb, so use the simple form." },
      { id: "verbs-6", prompt: "Did you ___ the build?", options: ["checked", "checking", "checks", "check"], answer: 3, explanation: "After 'did', use the base form: check." },
      { id: "verbs-7", prompt: "Please avoid ___ changes directly in production.", options: ["to make", "make", "made", "making"], answer: 3, explanation: "'Avoid' is followed by the -ing form." },
      { id: "verbs-8", prompt: "They have ___ to Mumbai for the client visit.", options: ["went", "gone", "go", "going"], answer: 1, explanation: "Present perfect uses have + past participle. The past participle of 'go' is 'gone'." },
    ],
  },

  // ---------------------------------------------------------------- ADJECTIVES
  {
    id: "adjectives",
    title: "Adjectives",
    level: "A2",
    summary: "Describe things well and compare them correctly.",
    explanation: [
      "Adjectives describe nouns: a fast laptop, a helpful colleague, a difficult task. They usually come before the noun or after verbs like be, seem and look.",
      "To compare two things, use the comparative (bigger, more useful + than). To say something is the top of a group, use the superlative (the biggest, the most useful).",
      "Be careful with -ed and -ing adjectives. '-ed' describes how a person feels (bored), and '-ing' describes the thing that causes the feeling (boring).",
    ],
    sections: [
      {
        title: "Position",
        rule: "Adjectives go before the noun or after verbs like be/look/seem. They never take a plural -s.",
        examples: ["a smart engineer", "two smart engineers (not 'smarts')", "The app looks slow."],
      },
      {
        title: "Comparatives",
        rule: "Short adjectives: add -er + than. Long adjectives: more + adjective + than.",
        examples: ["faster than", "easier than", "more reliable than"],
      },
      {
        title: "Superlatives",
        rule: "Short adjectives: the + -est. Long adjectives: the most + adjective.",
        examples: ["the fastest", "the most important"],
      },
      {
        title: "Irregular forms",
        rule: "Some adjectives change completely.",
        examples: ["good – better – the best", "bad – worse – the worst", "far – farther/further – the farthest/furthest"],
      },
      {
        title: "-ed vs -ing",
        rule: "-ed = how someone feels. -ing = what causes the feeling.",
        examples: ["I am bored. The meeting is boring.", "She was interested. The topic was interesting."],
      },
    ],
    examples: [
      { sentence: "This version is faster than the old one.", note: "Short comparative: -er + than" },
      { sentence: "Security is more important than speed here.", note: "Long comparative: more + adjective" },
      { sentence: "She is the best tester in the team.", note: "Irregular superlative" },
      { sentence: "I was confused by the requirement.", note: "-ed: how I felt" },
    ],
    commonMistakes: [
      { wrong: "This is more better.", right: "This is better.", why: "'Better' is already a comparative, so don't add 'more'." },
      { wrong: "I am very boring in long meetings.", right: "I am very bored in long meetings.", why: "Use '-ed' for your feelings. 'I am boring' means you make others feel bored!" },
      { wrong: "She is elder than me.", right: "She is older than me.", why: "Use 'older than' for comparisons. 'Elder' is used before a noun (my elder sister), not with 'than'." },
      { wrong: "They are very talents engineers.", right: "They are very talented engineers.", why: "Adjectives never take a plural -s, and the adjective form is 'talented'." },
    ],
    questions: [
      { id: "adjectives-1", prompt: "This laptop is ___ than my old one.", options: ["fast", "fastest", "faster", "more fast"], answer: 2, explanation: "For a short adjective in a comparison, add -er: faster than." },
      { id: "adjectives-2", prompt: "This is the ___ important release of the year.", options: ["more", "most", "much", "very"], answer: 1, explanation: "Long adjectives form the superlative with 'the most'." },
      { id: "adjectives-3", prompt: "Her English is ___ than mine.", options: ["gooder", "more good", "better", "best"], answer: 2, explanation: "'Good' is irregular: good – better – best." },
      { id: "adjectives-4", prompt: "The training was very ___. Many people fell asleep.", options: ["bored", "boring", "bore", "boredom"], answer: 1, explanation: "The training caused the feeling, so use the -ing adjective: boring." },
      { id: "adjectives-5", prompt: "I was ___ to hear about the promotion.", options: ["exciting", "excited", "excite"], answer: 1, explanation: "This describes how the person felt, so use the -ed adjective." },
      { id: "adjectives-6", prompt: "Which sentence is correct?", options: ["This bug is worse than the last one.", "This bug is more worse than the last one.", "This bug is worst than the last one.", "This bug is badder than the last one."], answer: 0, explanation: "'Bad' is irregular: bad – worse – worst. Don't add 'more'." },
      { id: "adjectives-7", prompt: "We hired three ___ developers.", options: ["experienced", "experienceds", "experiencing", "experience"], answer: 0, explanation: "Adjectives never become plural. 'Experienced' describes the developers." },
      { id: "adjectives-8", prompt: "Of all the tools, this one is the ___ to use.", options: ["easier", "most easy", "easiest", "more easy"], answer: 2, explanation: "Comparing more than two things needs the superlative. Two-syllable adjectives ending in -y take -iest: easiest." },
    ],
  },

  // ---------------------------------------------------------------- ADVERBS
  {
    id: "adverbs",
    title: "Adverbs",
    level: "A2",
    summary: "Describe how, when and how often things happen.",
    explanation: [
      "Adverbs describe verbs, adjectives or other adverbs. They answer questions like how? (quickly), how often? (always), when? (yesterday) and how much? (very).",
      "Many adverbs are made by adding -ly to an adjective: quick → quickly, careful → carefully. But some common ones are irregular, like good → well and fast → fast.",
      "Adverbs of frequency (always, usually, often, sometimes, never) normally go before the main verb but after the verb 'be'.",
    ],
    sections: [
      {
        title: "Adverbs of manner (-ly)",
        rule: "Add -ly to the adjective to say HOW something is done.",
        examples: ["She speaks clearly.", "Please check the data carefully."],
      },
      {
        title: "Irregular adverbs",
        rule: "good → well, fast → fast, hard → hard, late → late.",
        examples: ["He works hard.", "You did well in the interview."],
      },
      {
        title: "Adverbs of frequency",
        rule: "Put them before the main verb, but after am/is/are/was/were.",
        examples: ["I usually start work at 9.", "She is always on time."],
      },
      {
        title: "Tricky pairs",
        rule: "hard = with effort; hardly = almost not. late = not on time; lately = recently.",
        examples: ["I worked hard.", "I hardly slept last night.", "Have you seen him lately?"],
      },
    ],
    examples: [
      { sentence: "The app is running smoothly.", note: "Manner: how it runs" },
      { sentence: "I often work late on release days.", note: "Frequency before the main verb" },
      { sentence: "He is never late.", note: "Frequency after 'is'" },
      { sentence: "She explained it really well.", note: "'well' is the adverb of 'good'" },
    ],
    commonMistakes: [
      { wrong: "She speaks English very good.", right: "She speaks English very well.", why: "'Good' is an adjective. To describe how someone does something, use the adverb 'well'." },
      { wrong: "I go always to the gym.", right: "I always go to the gym.", why: "Frequency adverbs go before the main verb." },
      { wrong: "I hardly worked all day, so I'm tired.", right: "I worked hard all day, so I'm tired.", why: "'Hardly' means 'almost not'. To say 'with a lot of effort', use 'hard'." },
      { wrong: "Drive careful.", right: "Drive carefully.", why: "To describe a verb (drive), use the adverb form with -ly." },
    ],
    questions: [
      { id: "adverbs-1", prompt: "Please speak ___. The line is not clear.", options: ["slowly", "slow", "slowness"], answer: 0, explanation: "We need an adverb to describe how to speak: slowly." },
      { id: "adverbs-2", prompt: "You did the presentation very ___.", options: ["good", "well", "nice", "better"], answer: 1, explanation: "To describe how you did something, use the adverb 'well'." },
      { id: "adverbs-3", prompt: "Choose the correct word order.", options: ["I always check my emails first.", "I check always my emails first.", "Always I check my emails first.", "I check my emails always first."], answer: 0, explanation: "Frequency adverbs go before the main verb: always check." },
      { id: "adverbs-4", prompt: "She is ___ late for meetings. She's very punctual.", options: ["always", "usually", "never", "often"], answer: 2, explanation: "'Punctual' means on time, so she is 'never' late." },
      { id: "adverbs-5", prompt: "The network was so slow that I could ___ open the page.", options: ["hard", "harder", "hardest", "hardly"], answer: 3, explanation: "'Hardly' means 'almost not' — the page almost didn't open." },
      { id: "adverbs-6", prompt: "He runs very ___.", options: ["fastly", "fast", "faster than", "quick"], answer: 1, explanation: "'Fast' is both an adjective and an adverb. 'Fastly' is not a word." },
      { id: "adverbs-7", prompt: "Have you spoken to the client ___?", options: ["late", "lately", "later on than", "latest"], answer: 1, explanation: "'Lately' means 'recently' and is used with the present perfect." },
      { id: "adverbs-8", prompt: "The team worked ___ to meet the deadline.", options: ["hard", "hardly", "hardy", "harden"], answer: 0, explanation: "'Hard' as an adverb means 'with a lot of effort'. 'Hardly' has the opposite meaning." },
    ],
  },

  // ---------------------------------------------------------------- CONJUNCTIONS
  {
    id: "conjunctions",
    title: "Conjunctions",
    level: "B1",
    summary: "Join ideas smoothly with and, but, because, although and more.",
    explanation: [
      "Conjunctions are joining words. They connect words, phrases and sentences so your speech sounds smooth instead of short and choppy.",
      "Simple ones like and, but, or, so and because are used every day. Words like although, while, unless and whereas help you express more complex ideas.",
      "A common mistake is using two conjunctions for one idea, like 'although… but'. One is enough.",
    ],
    sections: [
      {
        title: "and, but, or, so",
        rule: "and = adds; but = contrast; or = choice; so = result.",
        examples: ["I tested it and it passed.", "It passed, but it was slow.", "Tea or coffee?", "It failed, so I raised a bug."],
      },
      {
        title: "because / since / as",
        rule: "Give a reason. 'Because' is the most common.",
        examples: ["I'm late because of traffic. / because the traffic was heavy."],
      },
      {
        title: "although / though / even though",
        rule: "Show contrast. Don't use 'but' in the same sentence.",
        examples: ["Although it was late, we finished the testing."],
      },
      {
        title: "Paired conjunctions",
        rule: "both…and, either…or, neither…nor, not only…but also.",
        examples: ["Both Ravi and Asha are on leave.", "You can either call or email me.", "Neither the app nor the website works."],
      },
      {
        title: "unless / if",
        rule: "'Unless' means 'if not'.",
        examples: ["We can't release unless QA approves. (= if QA doesn't approve)"],
      },
    ],
    examples: [
      { sentence: "I was tired, but I finished the report.", note: "'but' shows contrast" },
      { sentence: "The build failed because a test broke.", note: "'because' gives a reason" },
      { sentence: "Although the deadline was tight, we delivered on time.", note: "'although' without 'but'" },
      { sentence: "Either you or I will present the demo.", note: "Paired conjunction" },
    ],
    commonMistakes: [
      { wrong: "Although it was raining, but we went out.", right: "Although it was raining, we went out.", why: "Use only one contrast word: 'although' OR 'but', not both." },
      { wrong: "Because I was sick. I didn't come.", right: "Because I was sick, I didn't come.", why: "A 'because' clause alone is not a full sentence. Join it to the main clause." },
      { wrong: "Neither he or she knows.", right: "Neither he nor she knows.", why: "'Neither' goes with 'nor'; 'either' goes with 'or'." },
      { wrong: "Unless you don't finish, you can't leave.", right: "Unless you finish, you can't leave.", why: "'Unless' already means 'if not', so don't add another negative." },
    ],
    questions: [
      { id: "conjunctions-1", prompt: "I like tea ___ coffee.", options: ["and", "but", "so", "because"], answer: 0, explanation: "'And' adds two things together." },
      { id: "conjunctions-2", prompt: "The test passed, ___ it was very slow.", options: ["and", "so", "but", "or"], answer: 2, explanation: "The two ideas contrast (good result, bad speed), so use 'but'." },
      { id: "conjunctions-3", prompt: "I missed the call ___ I was in another meeting.", options: ["so", "but", "although", "because"], answer: 3, explanation: "The second part gives the reason, so use 'because'." },
      { id: "conjunctions-4", prompt: "The server was down, ___ we couldn't test.", options: ["so", "because", "although", "or"], answer: 0, explanation: "'So' introduces a result." },
      { id: "conjunctions-5", prompt: "___ he was tired, he stayed late to fix the issue.", options: ["Because", "Although", "So", "Unless"], answer: 1, explanation: "Being tired contrasts with staying late, so use 'although'." },
      { id: "conjunctions-6", prompt: "Which sentence is correct?", options: ["Although it was late, but we continued.", "Although it was late, so we continued.", "Although it was late, we continued.", "But although it was late, we continued."], answer: 2, explanation: "'Although' should not be used together with 'but' or 'so'." },
      { id: "conjunctions-7", prompt: "Neither the manager ___ the client was happy.", options: ["or", "nor", "and", "but"], answer: 1, explanation: "'Neither' is paired with 'nor'." },
      { id: "conjunctions-8", prompt: "We won't release the build ___ all critical bugs are fixed.", options: ["unless", "if", "because", "although"], answer: 0, explanation: "'Unless' means 'if not': we won't release if the bugs are not fixed." },
    ],
  },

  // ---------------------------------------------------------------- MODALS
  {
    id: "modals",
    title: "Modal Verbs",
    level: "B1",
    summary: "Use can, could, should, must, may and might for ability, advice and politeness.",
    explanation: [
      "Modal verbs (can, could, may, might, must, should, will, would) add meaning to the main verb, like ability, possibility, advice, permission or obligation.",
      "Modals are simple in form: they never change with he/she/it (she can, not she cans), and they are always followed by the base verb without 'to' (you should go, not you should to go).",
      "In the workplace, 'could' and 'would' make requests more polite: 'Could you please review this?' sounds softer than 'Review this.'",
    ],
    sections: [
      {
        title: "Ability: can / could",
        rule: "'Can' for present ability, 'could' for past ability.",
        examples: ["I can write SQL queries.", "I could swim when I was five."],
      },
      {
        title: "Polite requests: could / would / can",
        rule: "'Could you…?' and 'Would you…?' are more polite than 'Can you…?'.",
        examples: ["Could you share your screen?", "Would you mind checking this?"],
      },
      {
        title: "Advice: should",
        rule: "Use 'should' to give advice or say what is the right thing to do.",
        examples: ["You should back up your data.", "We should inform the client."],
      },
      {
        title: "Obligation: must / have to",
        rule: "'Must' = strong necessity (often the speaker's view or a rule). 'Mustn't' = not allowed. 'Don't have to' = not necessary.",
        examples: ["You must wear your ID card.", "You mustn't share passwords.", "You don't have to come on Saturday."],
      },
      {
        title: "Possibility: may / might / could",
        rule: "Use these when something is possible but not certain.",
        examples: ["It might rain later.", "The issue may be in the API."],
      },
    ],
    examples: [
      { sentence: "Could you please send me the logs?", note: "Polite request" },
      { sentence: "You should update your resume.", note: "Advice" },
      { sentence: "Employees must complete the security training.", note: "Rule / obligation" },
      { sentence: "The deployment might take an hour.", note: "Possibility" },
    ],
    commonMistakes: [
      { wrong: "She can speaks French.", right: "She can speak French.", why: "After a modal, always use the base verb with no -s." },
      { wrong: "You should to check the logs.", right: "You should check the logs.", why: "Don't use 'to' after modals (except 'ought to' and 'have to')." },
      { wrong: "You mustn't come tomorrow, it's a holiday.", right: "You don't have to come tomorrow, it's a holiday.", why: "'Mustn't' means it's not allowed. 'Don't have to' means it's not necessary." },
      { wrong: "Can I know your name?", right: "May I have your name? / Could you tell me your name?", why: "'Can I know…' sounds unnatural. Use 'May I have…' or 'Could you tell me…'." },
    ],
    questions: [
      { id: "modals-1", prompt: "I ___ speak three languages.", options: ["can", "cans", "can to", "am can"], answer: 0, explanation: "'Can' shows ability and never changes form." },
      { id: "modals-2", prompt: "You look tired. You ___ take a break.", options: ["should", "must to", "can to", "would to"], answer: 0, explanation: "'Should' is used for advice, and no 'to' follows it." },
      { id: "modals-3", prompt: "___ you please share the meeting link?", options: ["Must", "Should", "Could", "Might"], answer: 2, explanation: "'Could you please…?' is a polite request." },
      { id: "modals-4", prompt: "He ___ the report tomorrow.", options: ["will sends", "will to send", "will sending", "will send"], answer: 3, explanation: "After a modal like 'will', use the base verb: send." },
      { id: "modals-5", prompt: "You ___ share your password with anyone. It's against policy.", options: ["don't have to", "mustn't", "needn't", "might not"], answer: 1, explanation: "'Mustn't' means something is not allowed." },
      { id: "modals-6", prompt: "Tomorrow is a holiday, so you ___ come to the office.", options: ["mustn't", "don't have to", "can't", "shouldn't to"], answer: 1, explanation: "'Don't have to' means it is not necessary, which fits a holiday." },
      { id: "modals-7", prompt: "I'm not sure, but the bug ___ be in the payment module.", options: ["might", "must", "should to", "can to"], answer: 0, explanation: "'Might' shows possibility when you are not sure." },
      { id: "modals-8", prompt: "When I was a child, I ___ climb trees easily.", options: ["can", "may", "must", "could"], answer: 3, explanation: "'Could' is the past form of 'can' for ability." },
    ],
  },

  // ---------------------------------------------------------------- SUBJECT-VERB AGREEMENT
  {
    id: "subject-verb-agreement",
    title: "Subject-Verb Agreement",
    level: "B1",
    summary: "Match singular subjects with singular verbs, and plural with plural.",
    explanation: [
      "The verb must 'agree' with its subject. A singular subject takes a singular verb (The tester works), and a plural subject takes a plural verb (The testers work).",
      "It gets tricky when there are extra words between the subject and the verb, or with words like each, everyone, one of, and there is/are. Always find the real subject first.",
      "Tip: ask 'Who or what is doing the action?' Then check if that word is singular or plural.",
    ],
    sections: [
      {
        title: "Basic rule",
        rule: "He/she/it or one thing → verb + s. I/you/we/they or many things → base verb.",
        examples: ["The app crashes.", "The apps crash."],
      },
      {
        title: "Words between subject and verb",
        rule: "Ignore the phrase in between. Match the verb to the main subject.",
        examples: ["The list of bugs is long.", "The quality of the products has improved."],
      },
      {
        title: "Each / every / everyone",
        rule: "Words like each, every, everyone, everybody, nobody take a singular verb.",
        examples: ["Everyone is here.", "Each tester has a laptop."],
      },
      {
        title: "One of the + plural noun",
        rule: "The subject is 'one', so the verb is singular.",
        examples: ["One of my colleagues is from Kerala."],
      },
      {
        title: "There is / There are",
        rule: "Match the verb to the noun that comes after it.",
        examples: ["There is a bug in this module.", "There are three bugs in this module."],
      },
      {
        title: "either…or / neither…nor",
        rule: "The verb agrees with the subject closest to it.",
        examples: ["Either the lead or the testers are responsible.", "Neither the testers nor the lead is available."],
      },
    ],
    examples: [
      { sentence: "My manager works from Delhi.", note: "Singular subject → works" },
      { sentence: "The test results look good.", note: "Plural subject → look" },
      { sentence: "Everybody knows the deadline.", note: "'Everybody' is singular" },
      { sentence: "One of the servers is down.", note: "Subject is 'one'" },
    ],
    commonMistakes: [
      { wrong: "One of my friend are coming.", right: "One of my friends is coming.", why: "After 'one of', use a plural noun, but the verb is singular because the subject is 'one'." },
      { wrong: "Everyone have submitted the timesheet.", right: "Everyone has submitted the timesheet.", why: "'Everyone' is grammatically singular." },
      { wrong: "There is many issues in this build.", right: "There are many issues in this build.", why: "'Issues' is plural, so use 'there are'." },
      { wrong: "The list of items are ready.", right: "The list of items is ready.", why: "The subject is 'list' (singular), not 'items'." },
    ],
    questions: [
      { id: "subject-verb-agreement-1", prompt: "My brother ___ in Bengaluru.", options: ["live", "living", "lives", "are living"], answer: 2, explanation: "'My brother' is singular, so the verb takes -s: lives." },
      { id: "subject-verb-agreement-2", prompt: "The developers ___ fixing the issue.", options: ["is", "are", "was", "has"], answer: 1, explanation: "'Developers' is plural, so use 'are'." },
      { id: "subject-verb-agreement-3", prompt: "Everyone ___ excited about the launch.", options: ["are", "were", "is", "be"], answer: 2, explanation: "'Everyone' takes a singular verb: is." },
      { id: "subject-verb-agreement-4", prompt: "There ___ two meetings today.", options: ["are", "is", "was", "has"], answer: 0, explanation: "The noun after 'there' is 'two meetings' (plural), so use 'are'." },
      { id: "subject-verb-agreement-5", prompt: "One of the test cases ___ failing.", options: ["are", "is", "were", "have"], answer: 1, explanation: "The real subject is 'one', which is singular." },
      { id: "subject-verb-agreement-6", prompt: "The quality of these products ___ improved.", options: ["have", "are", "were", "has"], answer: 3, explanation: "The subject is 'quality' (singular), so use 'has'." },
      { id: "subject-verb-agreement-7", prompt: "Each of the employees ___ a new laptop.", options: ["get", "are getting", "gets", "have got"], answer: 2, explanation: "'Each' is singular, so the verb takes -s: gets." },
      { id: "subject-verb-agreement-8", prompt: "Neither the manager nor the team members ___ available today.", options: ["is", "are", "was", "has been"], answer: 1, explanation: "With 'neither…nor', the verb agrees with the nearest subject, 'team members' (plural)." },
    ],
  },

  // ---------------------------------------------------------------- ACTIVE / PASSIVE
  {
    id: "active-passive",
    title: "Active & Passive Voice",
    level: "B1",
    summary: "Focus on who did the action, or on what happened.",
    explanation: [
      "In the active voice, the subject does the action: 'The tester found a bug.' In the passive voice, the subject receives the action: 'A bug was found (by the tester).'",
      "We use the passive when the action is more important than the person, when we don't know who did it, or when we want to sound more formal — very common in reports and emails.",
      "Form the passive with the verb 'be' in the right tense + past participle: is done, was done, has been done, will be done.",
    ],
    sections: [
      {
        title: "How to form it",
        rule: "Object of the active sentence becomes the subject. Use be + past participle. Add 'by + person' only if needed.",
        examples: ["Active: Ravi wrote the report.", "Passive: The report was written by Ravi."],
      },
      {
        title: "Present simple passive",
        rule: "am/is/are + past participle.",
        examples: ["Emails are checked every hour.", "The build is deployed daily."],
      },
      {
        title: "Past simple passive",
        rule: "was/were + past participle.",
        examples: ["The bug was fixed yesterday.", "The files were deleted."],
      },
      {
        title: "Perfect & future passive",
        rule: "has/have been + past participle; will be + past participle.",
        examples: ["The issue has been resolved.", "The results will be shared tomorrow."],
      },
    ],
    examples: [
      { sentence: "The defect was reported by the client.", note: "Past simple passive with 'by'" },
      { sentence: "Your request has been approved.", note: "Present perfect passive — common in emails" },
      { sentence: "English is spoken in many countries.", note: "Doer not important" },
      { sentence: "The meeting will be rescheduled.", note: "Future passive" },
    ],
    commonMistakes: [
      { wrong: "The bug was fix yesterday.", right: "The bug was fixed yesterday.", why: "The passive needs the past participle (fixed), not the base verb." },
      { wrong: "The mail has been send.", right: "The mail has been sent.", why: "'Send' is irregular. Its past participle is 'sent'." },
      { wrong: "The report written by Anu.", right: "The report was written by Anu.", why: "Don't forget the verb 'be' (was) in the passive." },
      { wrong: "This problem is happened often.", right: "This problem happens often.", why: "'Happen' has no object, so it can't be passive." },
    ],
    questions: [
      { id: "active-passive-1", prompt: "The office ___ cleaned every day.", options: ["is", "are", "were", "has"], answer: 0, explanation: "Present simple passive: is + past participle. 'The office' is singular." },
      { id: "active-passive-2", prompt: "The bug was ___ by the QA team.", options: ["find", "finding", "found", "finds"], answer: 2, explanation: "The passive uses the past participle: found." },
      { id: "active-passive-3", prompt: "Choose the passive form of: 'Priya wrote the test plan.'", options: ["The test plan is written by Priya.", "The test plan was written by Priya.", "The test plan wrote by Priya.", "The test plan has written Priya."], answer: 1, explanation: "The active is past simple, so the passive is 'was + past participle'." },
      { id: "active-passive-4", prompt: "Your leave request ___ approved.", options: ["has been", "has", "have been", "is being been"], answer: 0, explanation: "Present perfect passive: has been + past participle. 'Request' is singular." },
      { id: "active-passive-5", prompt: "The results ___ shared with the client tomorrow.", options: ["will be", "will", "are been", "will being"], answer: 0, explanation: "Future passive: will be + past participle." },
      { id: "active-passive-6", prompt: "Which sentence is in the active voice?", options: ["The app was tested.", "The team tested the app.", "The app is being tested.", "The app has been tested."], answer: 1, explanation: "In 'The team tested the app', the subject (the team) does the action." },
      { id: "active-passive-7", prompt: "The new policy ___ announced last week.", options: ["were", "is", "has", "was"], answer: 3, explanation: "'Last week' is past time and 'policy' is singular: was announced." },
      { id: "active-passive-8", prompt: "Choose the passive form of: 'They are updating the server.'", options: ["The server is updated.", "The server was updating.", "The server is being updated.", "The server has updating."], answer: 2, explanation: "Present continuous passive: am/is/are + being + past participle." },
    ],
  },

  // ---------------------------------------------------------------- DIRECT / INDIRECT
  {
    id: "direct-indirect",
    title: "Direct & Indirect Speech",
    level: "B1",
    summary: "Report what other people said.",
    explanation: [
      "Direct speech repeats the exact words: She said, \"I am busy.\" Indirect (reported) speech tells the idea without quotation marks: She said (that) she was busy.",
      "When the reporting verb is in the past (said, told), we usually move the tense one step back: am → was, will → would, did → had done. Pronouns and time words also change (I → she, tomorrow → the next day).",
      "Use 'say' without a person (He said that…) and 'tell' with a person (He told me that…). For reported questions, use normal sentence word order, not question order.",
    ],
    sections: [
      {
        title: "Tense backshift",
        rule: "present → past, past → past perfect, will → would, can → could.",
        examples: ["\"I work here.\" → He said he worked there.", "\"I will call.\" → She said she would call."],
      },
      {
        title: "say vs tell",
        rule: "say (something) / tell (someone) something.",
        examples: ["He said that he was late.", "He told me that he was late."],
      },
      {
        title: "Time and place words",
        rule: "now → then, today → that day, tomorrow → the next day, yesterday → the day before, here → there.",
        examples: ["\"I'll finish it tomorrow.\" → He said he would finish it the next day."],
      },
      {
        title: "Reported questions",
        rule: "Use if/whether for yes/no questions. Use statement word order and no 'do/does/did'.",
        examples: ["\"Are you free?\" → She asked if I was free.", "\"Where do you live?\" → He asked where I lived."],
      },
      {
        title: "Reported commands",
        rule: "Use tell/ask + person + to + verb (not to + verb for negatives).",
        examples: ["\"Close the door.\" → He told me to close the door.", "\"Don't be late.\" → She asked us not to be late."],
      },
    ],
    examples: [
      { sentence: "The client said that the app was slow.", note: "Present → past" },
      { sentence: "My lead told me to update the test cases.", note: "Reported command" },
      { sentence: "She asked whether the build had passed.", note: "Reported yes/no question" },
      { sentence: "He said he would join the call later.", note: "will → would" },
    ],
    commonMistakes: [
      { wrong: "He said me that he was busy.", right: "He told me that he was busy.", why: "Use 'tell' + person. 'Say' doesn't take a person directly." },
      { wrong: "She asked me where do I work.", right: "She asked me where I worked.", why: "Reported questions use statement word order without 'do'." },
      { wrong: "He told that he will come.", right: "He said that he would come.", why: "'Tell' needs a person; use 'said'. Also backshift 'will' to 'would'." },
      { wrong: "The manager told to finish it.", right: "The manager told us to finish it.", why: "'Tell' must be followed by the person." },
    ],
    questions: [
      { id: "direct-indirect-1", prompt: "He ___ me that he was tired.", options: ["told", "said", "spoke", "talked"], answer: 0, explanation: "'Tell' is followed by a person (me). 'Said' would need no person." },
      { id: "direct-indirect-2", prompt: "\"I am busy.\" → She said that she ___ busy.", options: ["is", "were", "has been", "was"], answer: 3, explanation: "Present 'am' moves back to past 'was' after 'said'." },
      { id: "direct-indirect-3", prompt: "\"I will send the report.\" → He said he ___ send the report.", options: ["will", "would", "should", "can"], answer: 1, explanation: "'Will' changes to 'would' in reported speech." },
      { id: "direct-indirect-4", prompt: "\"Are you coming?\" → She asked ___ I was coming.", options: ["that", "if", "what", "do"], answer: 1, explanation: "Reported yes/no questions use 'if' or 'whether'." },
      { id: "direct-indirect-5", prompt: "\"Where do you work?\" → He asked me ___.", options: ["where do I work", "where did I work", "where I worked", "where I did work"], answer: 2, explanation: "Reported questions use statement word order and no 'do/did'." },
      { id: "direct-indirect-6", prompt: "\"Please check the logs.\" → My lead asked me ___ the logs.", options: ["to check", "check", "checking", "that check"], answer: 0, explanation: "Reported requests use ask/tell + person + to + verb." },
      { id: "direct-indirect-7", prompt: "\"I finished it yesterday.\" → She said she had finished it ___.", options: ["yesterday", "tomorrow", "the next day", "the day before"], answer: 3, explanation: "'Yesterday' usually becomes 'the day before' (or 'the previous day') in reported speech." },
      { id: "direct-indirect-8", prompt: "\"Don't touch the server.\" → He told us ___ the server.", options: ["don't touch", "not to touch", "to not touching", "not touch"], answer: 1, explanation: "Negative commands are reported with 'not to + verb'." },
    ],
  },

  // ---------------------------------------------------------------- CONDITIONALS
  {
    id: "conditionals",
    title: "Conditionals (If sentences)",
    level: "B2",
    summary: "Talk about real, possible and imaginary situations with 'if'.",
    explanation: [
      "Conditional sentences have two parts: the 'if' part (the condition) and the result. For example: If it rains, I will stay home.",
      "There are four main types. Zero and first conditionals are about real or likely situations. Second and third conditionals are about imaginary situations — in the present/future or in the past.",
      "Important: we usually don't use 'will' in the 'if' part. Say 'If you finish early, call me', not 'If you will finish early'.",
    ],
    sections: [
      {
        title: "Zero conditional",
        rule: "If + present, present. For facts and things that are always true.",
        examples: ["If you heat ice, it melts.", "If the server is down, the app shows an error."],
      },
      {
        title: "First conditional",
        rule: "If + present, will + verb. For real and likely future situations.",
        examples: ["If the tests pass, we will release today.", "If you need help, I'll join the call."],
      },
      {
        title: "Second conditional",
        rule: "If + past simple, would + verb. For imaginary or unlikely situations now or in the future.",
        examples: ["If I had more time, I would learn Python.", "If I were you, I would ask the manager."],
      },
      {
        title: "Third conditional",
        rule: "If + had + past participle, would have + past participle. For imaginary past situations (regrets).",
        examples: ["If we had tested it, we would have found the bug.", "If I had left earlier, I wouldn't have missed the train."],
      },
    ],
    examples: [
      { sentence: "If you press this button, the app restarts.", note: "Zero — always true" },
      { sentence: "If the client approves, we'll start on Monday.", note: "First — likely future" },
      { sentence: "If I won the lottery, I would travel the world.", note: "Second — imaginary" },
      { sentence: "If I had known, I would have told you.", note: "Third — past, didn't happen" },
    ],
    commonMistakes: [
      { wrong: "If it will rain, I will stay home.", right: "If it rains, I will stay home.", why: "Don't use 'will' in the 'if' part. Use the present simple." },
      { wrong: "If I would have time, I would help.", right: "If I had time, I would help.", why: "In the second conditional, the 'if' part uses the past simple, not 'would'." },
      { wrong: "If I was knowing, I would have told you.", right: "If I had known, I would have told you.", why: "For the past (third conditional), use 'had + past participle'." },
      { wrong: "If I am you, I will talk to HR.", right: "If I were you, I would talk to HR.", why: "For advice in an imaginary situation, use 'If I were you, I would…'." },
    ],
    questions: [
      { id: "conditionals-1", prompt: "If you heat water to 100°C, it ___.", options: ["boil", "will boiled", "boils", "boiled"], answer: 2, explanation: "Zero conditional for facts: If + present, present. 'It' takes -s." },
      { id: "conditionals-2", prompt: "If the build passes, we ___ it today.", options: ["will release", "release", "would release", "released"], answer: 0, explanation: "First conditional for a likely future: If + present, will + verb." },
      { id: "conditionals-3", prompt: "If it ___ tomorrow, we will cancel the outing.", options: ["will rain", "rained", "would rain", "rains"], answer: 3, explanation: "Don't use 'will' in the 'if' part of a first conditional. Use the present simple." },
      { id: "conditionals-4", prompt: "If I ___ you, I would accept the offer.", options: ["am", "were", "was being", "will be"], answer: 1, explanation: "'If I were you' is the standard phrase for giving advice (second conditional)." },
      { id: "conditionals-5", prompt: "If I had more time, I ___ an automation course.", options: ["will take", "take", "would take", "had taken"], answer: 2, explanation: "Second conditional: If + past simple, would + verb." },
      { id: "conditionals-6", prompt: "If we had tested it properly, we ___ the bug.", options: ["would find", "would have found", "will find", "had found"], answer: 1, explanation: "Third conditional (imaginary past): would have + past participle." },
      { id: "conditionals-7", prompt: "If she ___ the email, she would have replied.", options: ["saw", "had seen", "has seen", "would see"], answer: 1, explanation: "The 'if' part of a third conditional uses had + past participle." },
      { id: "conditionals-8", prompt: "Which sentence is correct?", options: ["If I get the job, I will move to Pune.", "If I will get the job, I will move to Pune.", "If I would get the job, I will move to Pune.", "If I got the job, I will move to Pune."], answer: 0, explanation: "First conditional: If + present simple, will + verb. No 'will' or 'would' in the 'if' part." },
    ],
  },

  // ---------------------------------------------------------------- QUESTION FORMATION
  {
    id: "question-formation",
    title: "Question Formation",
    level: "A2",
    summary: "Ask clear, correct questions in meetings and conversations.",
    explanation: [
      "In English questions, the helping verb usually comes before the subject: 'You are ready' becomes 'Are you ready?'.",
      "If there is no helping verb, add do/does/did: 'She works here' becomes 'Does she work here?'. After do/does/did, use the base verb.",
      "For polite or indirect questions (Could you tell me…, Do you know…), go back to normal sentence order: 'Could you tell me where the meeting room is?'",
    ],
    sections: [
      {
        title: "Yes/No questions",
        rule: "Helping verb + subject + main verb. Use do/does/did if there is no helping verb.",
        examples: ["Is the build ready?", "Do you use Jira?", "Did she join the call?"],
      },
      {
        title: "Wh- questions",
        rule: "Question word + helping verb + subject + main verb.",
        examples: ["Where do you work?", "Why did the test fail?", "What are you working on?"],
      },
      {
        title: "Subject questions",
        rule: "When 'who' or 'what' is the subject, don't use do/does/did.",
        examples: ["Who broke the build? (not 'Who did break')", "What happened?"],
      },
      {
        title: "Indirect (polite) questions",
        rule: "Could you tell me / Do you know + question word + subject + verb.",
        examples: ["Could you tell me when the meeting starts?", "Do you know where Ravi is?"],
      },
      {
        title: "Question tags",
        rule: "Positive sentence → negative tag; negative sentence → positive tag.",
        examples: ["You are free, aren't you?", "She didn't call, did she?"],
      },
    ],
    examples: [
      { sentence: "Does this feature work on mobile?", note: "does + subject + base verb" },
      { sentence: "When did you raise the ticket?", note: "Wh- + did + subject + base verb" },
      { sentence: "Who approved the change?", note: "Subject question — no 'did'" },
      { sentence: "Could you tell me what the issue is?", note: "Indirect question — normal order" },
    ],
    commonMistakes: [
      { wrong: "Why you are late?", right: "Why are you late?", why: "In a question, put the helping verb (are) before the subject (you)." },
      { wrong: "Where you work?", right: "Where do you work?", why: "When there's no helping verb, add 'do/does/did'." },
      { wrong: "Does she works here?", right: "Does she work here?", why: "After 'does', use the base verb without -s." },
      { wrong: "Can you tell me where is the meeting room?", right: "Can you tell me where the meeting room is?", why: "In indirect questions, use normal sentence order: subject + verb." },
      { wrong: "You are coming, no?", right: "You are coming, aren't you?", why: "Use a proper question tag. For a positive 'are' sentence, the tag is 'aren't you?'." },
    ],
    questions: [
      { id: "question-formation-1", prompt: "___ you ready for the demo?", options: ["Do", "Does", "Is", "Are"], answer: 3, explanation: "With 'ready' (an adjective), use the verb 'be': Are you ready?" },
      { id: "question-formation-2", prompt: "___ she work in the testing team?", options: ["Do", "Is", "Does", "Are"], answer: 2, explanation: "For he/she/it with a main verb in the present simple, use 'does'." },
      { id: "question-formation-3", prompt: "Where ___ you go last weekend?", options: ["do", "did", "were", "have"], answer: 1, explanation: "'Last weekend' is past time, so use 'did' + base verb." },
      { id: "question-formation-4", prompt: "Which question is correct?", options: ["Why didn't you attend?", "Why you didn't attend?", "Why you not attended?", "Why did you not attended?"], answer: 0, explanation: "Helping verb (didn't) comes before the subject, followed by the base verb." },
      { id: "question-formation-5", prompt: "Who ___ the production server?", options: ["did restart", "did restarted", "restarting", "restarted"], answer: 3, explanation: "'Who' is the subject here, so we don't use 'did': Who restarted…?" },
      { id: "question-formation-6", prompt: "Could you tell me where ___?", options: ["is the conference room", "does the conference room", "the conference room is", "the conference room does be"], answer: 2, explanation: "Indirect questions use normal sentence order: subject + verb." },
      { id: "question-formation-7", prompt: "You have sent the report, ___?", options: ["haven't you", "didn't you", "have you", "no"], answer: 0, explanation: "A positive sentence with 'have' takes the negative tag 'haven't you?'." },
      { id: "question-formation-8", prompt: "How long ___ you been working here?", options: ["are", "have", "did", "do"], answer: 1, explanation: "'Been working' is present perfect continuous, which uses 'have'." },
    ],
  },
];
