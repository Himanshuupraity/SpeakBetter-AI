/** Content for the Speaking Speed section. */

/** Read-aloud passages. The known word count makes speed measurement reliable. */
export const SPEED_PASSAGES = [
  {
    id: 'self-intro',
    title: 'Introduce Yourself',
    context: 'interview',
    level: 'A2',
    text: 'Hello, my name is Rahul, and I work as a QA engineer at a software company in Pune. I have three years of experience in manual and automation testing. In my current role, I test web and mobile applications, write test cases, and report bugs to the development team. I enjoy finding problems before our customers do. In my free time, I like reading and playing cricket with my friends.',
  },
  {
    id: 'status-update',
    title: 'Daily Stand-up Update',
    context: 'conversation',
    level: 'B1',
    text: 'Good morning, everyone. Yesterday, I finished testing the new login feature and found two small bugs, which I have already reported. Today, I am going to test the payment page and update our regression test cases. I do not have any blockers right now, but I may need some help from the backend team tomorrow to set up the test data. That is all from my side. Thank you.',
  },
  {
    id: 'weekend',
    title: 'My Weekend',
    context: 'conversation',
    level: 'A2',
    text: 'Last weekend was really relaxing. On Saturday morning, I went for a long walk in the park near my house. In the afternoon, I cooked lunch for my family and we watched a funny movie together. On Sunday, I met two old friends at a small cafe. We talked for hours about our college days and our plans for the future. It was the perfect way to recharge before a busy week.',
  },
  {
    id: 'strength',
    title: 'My Greatest Strength',
    context: 'interview',
    level: 'B1',
    text: 'I would say my greatest strength is attention to detail. As a tester, I carefully check every requirement and think about how real users might use the product. For example, in my last project, I noticed that the checkout page failed when users entered a very long address. It was a small detail, but fixing it before the release saved the company from many customer complaints.',
  },
  {
    id: 'presentation-intro',
    title: 'Presentation Opening',
    context: 'presentation',
    level: 'B2',
    text: 'Good afternoon, everyone, and thank you for joining. Today, I would like to talk about how we can improve the quality of our releases. First, I will share what went wrong in the last two sprints. Then, I will explain three simple changes to our testing process. Finally, I will show you the results we expect. Please feel free to ask questions at the end.',
  },
  {
    id: 'remote-work',
    title: 'Working From Home',
    context: 'presentation',
    level: 'B2',
    text: 'Working from home has changed the way many teams communicate. On one hand, people save time on travel and can focus better without office noise. On the other hand, it is easier to feel isolated, and small problems can take longer to solve without quick face-to-face conversations. In my opinion, a hybrid model offers the best balance between flexibility and teamwork.',
  },
];

/** Prompts for free speaking (natural pace). */
export const SPEED_PROMPTS = [
  'Describe your typical workday from morning to evening.',
  'Tell me about the last movie or series you watched. Did you like it?',
  'What are your plans for the next weekend?',
  'Describe a difficult bug or problem you solved at work.',
  'Why do you want to improve your English?',
  'Tell me about your hometown. What is special about it?',
  'What is your favourite food, and how is it made?',
  'Describe a person who inspires you and explain why.',
  'Talk about a skill you would like to learn this year.',
  'What would you do if you had a free day tomorrow?',
];
