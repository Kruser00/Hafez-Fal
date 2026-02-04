import { Poem, ContextOption } from './types';

// A small subset of Hafez poems for the demo
export const HAFEZ_POEMS: Poem[] = [
  {
    id: 1,
    theme: "Love & Divine Intoxication",
    persian: [
      "الا یا ایها الساقی ادر کأسا و ناولها",
      "که عشق آسان نمود اول ولی افتاد مشکل‌ها",
      "به بوی نافه‌ای کاخر صبا زان طره بگشاید",
      "ز تاب جعد مشکینش چه خون افتاد در دل‌ها",
      "مرا در منزل جانان چه امن عیش چون هر دم",
      "جرس فریاد می‌دارد که بربندید محمل‌ها"
    ],
    english: [
      "O Cupbearer, circulate the wine and offer it to me,",
      "For love seemed easy at first, but difficulties arose.",
      "In hope of the musk-scent the breeze reveals from those tresses,",
      "How much blood gathered in our hearts from those twisting dark curls!",
      "What security of life have I in the Beloved's dwelling,",
      "When every moment the bell cries out: 'Bind on your burdens!'"
    ]
  },
  {
    id: 2,
    theme: "Lost Joseph & Hope",
    persian: [
      "یوسف گم گشته بازآید به کنعان غم مخور",
      "کلبه احزان شود روزی گلستان غم مخور",
      "ای دل غمدیده حالت به شود دل بد مکن",
      "وین سر شوریده بازآید به سامان غم مخور",
      "گر بهار عمر باشد باز بر تخت چمن",
      "چتر گل در سر کشی ای مرغ خوشخوان غم مخور"
    ],
    english: [
      "Lost Joseph shall return to Canaan; do not grieve.",
      "The house of sorrows will one day become a rose garden; do not grieve.",
      "O sad heart, your condition will improve; do not despair.",
      "And this confused head will find order again; do not grieve.",
      "If the spring of life remains, you will once again",
      "Raise the umbrella of flowers over the meadow, O sweet-singing bird; do not grieve."
    ]
  },
  {
    id: 3,
    theme: "The Mystery of Existence",
    persian: [
      "سال‌ها دل طلب جام جم از ما می‌کرد",
      "وان چه خود داشت ز بیگانه تمنا می‌کرد",
      "گوهری کز صدف کون و مکان بیرون است",
      "طلب از گمشدگان لب دریا می‌کرد",
      "گفتم این جام جهان بین به تو کی داد حکیم",
      "گفت آن روز که این گنبد مینا می‌کرد"
    ],
    english: [
      "For years, my heart sought the Cup of Jamshid from me,",
      "Yearning from a stranger for what it possessed itself.",
      "The pearl that is outside the shell of space and time,",
      "It sought from those lost on the seashore.",
      "I asked: 'When did the Wise One give you this world-viewing cup?'",
      "He said: 'On that day He created this blue dome.'"
    ]
  }
];

export const CONTEXT_OPTIONS: ContextOption[] = [
  'عشق و عاطفه', 
  'کار و پیشه', 
  'غم و دلتنگی', 
  'طلب راهنمایی', 
  'معنویت', 
  'دو راهی و تردید'
];

export const SUFI_SYSTEM_PROMPT = `
You are a wise, empathetic 14th-century Sufi mystic and interpreter of the Divan of Hafez.
Your task is to interpret the provided Ghazal (Poem) for a modern seeker in PERSIAN (Farsi).

The seeker has focused their heart on a specific context.

Guidelines:
1.  **Language:** PERSIAN (Farsi) ONLY.
2.  **Tone:** Mystical, poetic, comforting, and profound. Use metaphors of 'May' (Wine/Truth), 'Yar' (Beloved), and the spiritual path.
3.  **Bridge:** Connect the poem's ancient wisdom to the user's specific context (e.g., Love, Work).
4.  **Format:** Return a JSON object with two fields:
    - "interpretation": A paragraph (approx 60-80 words) in beautiful, modern-but-poetic Persian interpreting the fal.
    - "reflection": A single powerful sentence or short advice in Persian for the user to meditate on.

Seeker's Context: `;