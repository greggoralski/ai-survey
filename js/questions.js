/* ---------------------------------------------------------------
   The survey questions, and MIT's answers to the same questions.

   Every question below is taken from the two surveys summarised in
   Appendix C of MIT's "Report of the Ad Hoc Committee on AI Use"
   (August 2026). "MIT" has been replaced by "Humber" in the wording.

   MIT percentages were read off the report's charts. Rows may not
   add to exactly 100 because of rounding in the original.
   --------------------------------------------------------------- */

const SCALES = {
  freq4:     ["Never", "Occasionally", "Often", "Very often"],
  agree5:    ["Strongly disagree", "Somewhat disagree", "Neither", "Somewhat agree", "Strongly agree"],
  accept4:   ["Never acceptable", "Sometimes acceptable", "Unsure", "Always acceptable"],
  consider3: ["Not a consideration", "Minor consideration", "Major consideration"],
  scale5:    ["1", "2", "3", "4", "5"]
};

/* Which colour ramp each scale uses (see css/style.css) */
const SCALE_STYLE = {
  freq4: "ord4", agree5: "div5", accept4: "div4", consider3: "ord3", scale5: "div5"
};

const MIT_ALL = "MIT (all respondents, n = 1,632)";
const MIT_UG  = "MIT undergrads (n ≈ 1,360)";

const QUESTIONS = [
  /* ---------- Part 1: MIT's spring 2026 AI Usage & Attitudes survey ---------- */
  {
    id: "tools",
    part: 1,
    type: "grid",
    scale: "freq4",
    title: "How often do you use the following AI services in your academic activities?",
    mitLabel: MIT_ALL,
    rows: [
      { id: "chatgpt",    label: "ChatGPT",            mit: [21, 35, 25, 19] },
      { id: "claude",     label: "Claude",             mit: [45, 25, 16, 14] },
      { id: "gemini",     label: "Gemini",             mit: [44, 31, 15, 10] },
      { id: "copilot",    label: "Copilot",            mit: [77, 16,  5,  2] },
      { id: "selfhosted", label: "Self-hosted models", hint: "a model running on your own computer", mit: [90, 8, 1, 1] },
      { id: "other",      label: "Other AI services",  mit: [84,  7,  6,  3] }
    ]
  },
  {
    id: "tasks",
    part: 1,
    type: "multi",
    title: "Do you use AI tools or technologies for any of the following tasks?",
    hint: "Tick all that apply.",
    mitLabel: MIT_ALL,
    rows: [
      { id: "coding",    label: "Coding and programming assistance",                       mit: 48 },
      { id: "search",    label: "Searching for information",                               mit: 45 },
      { id: "revise",    label: "Revising your own writing",                               mit: 42 },
      { id: "summarize", label: "Summarizing information (readings, notes, lectures…)",     mit: 40 },
      { id: "translate", label: "Translating text or language support",                    mit: 20 },
      { id: "organize",  label: "Routine organizational tasks (e.g. scheduling)",           mit: 15 },
      { id: "media",     label: "Generating image, video, or audio content",               mit: 13 },
      { id: "generate",  label: "Generating text from scratch",                            mit: 13 }
    ]
  },
  {
    id: "attitudes",
    part: 1,
    type: "grid",
    scale: "agree5",
    title: "How much do you agree or disagree with each of the following statements?",
    mitLabel: MIT_ALL,
    rows: [
      { id: "skills",     label: "It is necessary to learn AI skills for my future career.",             mit: [ 5,  7, 11, 32, 45] },
      { id: "morework",   label: "Using AI allows me to get more work done.",                            mit: [ 8,  3, 14, 34, 41] },
      { id: "dependent",  label: "I worry about becoming dependent on AI for my course work.",           mit: [ 7, 11, 14, 32, 36] },
      { id: "confident",  label: "I am confident in my ability to use AI tools proficiently.",           mit: [ 3, 13, 18, 52, 14] },
      { id: "learning",   label: "Using AI tools helps my learning.",                                    mit: [14, 10, 16, 37, 24] },
      { id: "behind",     label: "I worry about falling behind classmates that use AI in their course work.", mit: [13, 17, 21, 27, 22] },
      { id: "choose",     label: "If given the choice, I would choose to use AI tools in my course work.", mit: [17, 13, 17, 34, 18] },
      { id: "writing",    label: "I prefer using AI writing tools over traditional writing methods.",    mit: [33, 27, 16, 18,  6] }
    ]
  },
  {
    id: "research",
    part: 1,
    type: "grid",
    scale: "accept4",
    title: "Which of the following do you believe are acceptable uses of AI in scientific or academic research?",
    mitLabel: MIT_ALL,
    rows: [
      { id: "grammar",   label: "Assisting with spelling, grammar, or language when writing a manuscript", mit: [ 2,  2, 28, 68] },
      { id: "litsearch", label: "Searching for relevant literature",                                       mit: [ 3,  4, 35, 58] },
      { id: "code",      label: "Generating code",                                                         mit: [ 5,  3, 54, 38] },
      { id: "brainstorm",label: "Brainstorming research questions",                                        mit: [ 4, 11, 42, 43] },
      { id: "synth",     label: "Curating, summarizing, or synthesizing scientific literature",            mit: [ 4, 11, 51, 34] },
      { id: "analyze",   label: "Analyzing data and/or modeling",                                          mit: [ 5, 11, 56, 28] },
      { id: "editimg",   label: "Editing images or figures",                                               mit: [ 6, 20, 54, 19] },
      { id: "genimg",    label: "Generating images or figures",                                            mit: [ 5, 24, 54, 17] },
      { id: "hypoth",    label: "Writing hypotheses",                                                      mit: [ 9, 36, 44, 12] },
      { id: "draft",     label: "Drafting entire paragraphs of a manuscript based on key sentences, bulleted lists, or notes", mit: [ 5, 45, 40, 11] },
      { id: "peerrev",   label: "Peer-reviewing anonymous manuscripts",                                    mit: [ 8, 58, 28,  6] }
    ]
  },
  {
    id: "concerns",
    part: 1,
    type: "grid",
    scale: "consider3",
    title: "To what extent are each of the following considerations in your decision to use AI or not?",
    mitLabel: MIT_ALL,
    rows: [
      { id: "halluc",  label: "Inaccuracy / hallucinations", mit: [ 4, 23, 74] },
      { id: "society", label: "Societal impact",             mit: [21, 39, 40] },
      { id: "ethics",  label: "Ethics of training models",   mit: [23, 43, 34] },
      { id: "enviro",  label: "Environmental impact",        mit: [27, 41, 32] }
    ]
  },
  {
    id: "concern_other",
    part: 1,
    type: "text",
    title: "Is there any other consideration in your decision to use AI or not?",
    hint: "Optional. One sentence is plenty.",
    mitNote: "About 10% of MIT respondents wrote something here. By far the most common worry was the effect of AI on learning itself: critical thinking, writing ability, creativity, and long-term skills."
  },

  /* ---------- Part 2: MIT's spring 2026 Quality of Life survey ---------- */
  {
    id: "qol_freq",
    part: 2,
    type: "single",
    scale: "freq4",
    title: "How often do you currently use generative AI tools (e.g., ChatGPT, Copilot, Claude, Gemini) in your coursework at Humber?",
    mitLabel: MIT_UG,
    mit: [13, 41, 31, 15],
    mitTotal: { label: "all MIT respondents, n = 8,431", values: [21, 39, 22, 19] }
  },
  {
    id: "dims",
    part: 2,
    type: "poles",
    scale: "scale5",
    title: "How do you feel, generally, about generative AI along these dimensions?",
    hint: "1 means the statement on the left, 5 means the statement on the right.",
    mitLabel: MIT_UG,
    rows: [
      { id: "optimism",   left: "Makes me pessimistic about the future",           right: "Makes me optimistic about the future",         mit: [22, 27, 30, 16,  5] },
      { id: "capable",    left: "Makes me feel replaceable",                        right: "Makes me feel more capable",                   mit: [17, 23, 27, 26,  8] },
      { id: "quality",    left: "Makes the quality of my work worse",               right: "Makes the quality of my work better",          mit: [13, 18, 31, 30,  9] },
      { id: "efficiency", left: "Makes my work less efficient",                     right: "Makes my work more efficient",                 mit: [ 5,  6, 18, 49, 22] },
      { id: "reliable",   left: "Current systems are unpredictable and unreliable", right: "Current systems are trustworthy and reliable", mit: [12, 25, 33, 27,  3] }
    ]
  },
  {
    id: "guidance",
    part: 2,
    type: "single",
    scale: "agree5",
    title: "Humber has provided me adequate guidance on how and when to use generative AI in my coursework at Humber.",
    mitLabel: MIT_UG,
    mit: [4, 11, 13, 47, 25],
    mitTotal: { label: "all MIT respondents, n = 8,399", values: [13, 18, 24, 30, 14] }
  }
];
