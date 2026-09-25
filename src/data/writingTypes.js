/** Writing practice types. `checks` enable structure tips in the analyser. */
export const WRITING_TYPES = [
  { id: 'journal', label: 'Daily Journal', professional: false, prompt: 'Write about your day. What did you do, and how did you feel?', placeholder: 'Today I…', checks: [] },
  { id: 'email', label: 'Email Writing', professional: false, prompt: 'Write an email to a friend inviting them for dinner this weekend.', placeholder: 'Hi Aman,\n\n…', checks: ['greeting', 'signoff'] },
  { id: 'pro-email', label: 'Professional Email', professional: true, prompt: 'Email your manager to share a status update on your current task.', placeholder: 'Hi Priya,\n\nI wanted to share a quick update on…\n\nBest regards,\n…', checks: ['greeting', 'signoff'] },
  { id: 'chat', label: 'Chat Message', professional: false, prompt: 'Send a Slack/Teams message asking a colleague for help with an issue.', placeholder: 'Hi Rahul, do you have a minute? …', checks: [] },
  { id: 'linkedin', label: 'LinkedIn Post', professional: true, prompt: 'Write a short LinkedIn post about something you learned or achieved recently.', placeholder: 'I’m excited to share that…', checks: [] },
  { id: 'story', label: 'Story Writing', professional: false, prompt: 'Write a short story about a surprising day. Use the past tense.', placeholder: 'It was a normal Monday until…', checks: [] },
  { id: 'essay', label: 'Essay', professional: false, prompt: 'Is working from home better than working in an office? Give your opinion with reasons.', placeholder: 'In my opinion…', checks: [] },
  { id: 'job-application', label: 'Job Application', professional: true, prompt: 'Write a short cover message applying for a QA Engineer role.', placeholder: 'Dear Hiring Manager,\n\n…', checks: ['greeting', 'signoff'] },
  { id: 'meeting', label: 'Meeting Message', professional: true, prompt: 'Write a message inviting your team to a meeting, including the purpose and time.', placeholder: 'Hi team,\n\n…', checks: ['greeting'] },
  { id: 'leave', label: 'Leave Request', professional: true, prompt: 'Ask your manager for two days of leave next week.', placeholder: 'Hi Priya,\n\nI would like to request leave from…', checks: ['greeting', 'signoff', 'dates'] },
  { id: 'bug-report', label: 'Bug Report', professional: true, prompt: 'Write a bug report for a login button that does nothing on mobile.', placeholder: 'Title: …\n\nSteps to reproduce:\n1. …\n\nExpected result: …\nActual result: …', checks: ['steps', 'expected'] },
  { id: 'workplace', label: 'Workplace Communication', professional: true, prompt: 'Politely tell a colleague that you cannot finish their request today and suggest a new time.', placeholder: 'Hi Neha, thanks for…', checks: [] },
];
