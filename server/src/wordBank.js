// Curated Taboo word bank. Each entry: the target word, 5 forbidden ("taboo")
// words that cannot be used while explaining it, a category tag, and a
// difficulty tier used for controller filtering.

export const WORD_BANK = [
  // ---------- EASY ----------
  { word: "Birthday", taboo: ["Cake", "Party", "Candle", "Gift", "Age"], category: "Everyday", difficulty: "easy" },
  { word: "Umbrella", taboo: ["Rain", "Water", "Handle", "Wet", "Open"], category: "Objects", difficulty: "easy" },
  { word: "Elephant", taboo: ["Trunk", "Big", "Africa", "Gray", "Animal"], category: "Animals", difficulty: "easy" },
  { word: "Pizza", taboo: ["Cheese", "Italian", "Slice", "Dough", "Topping"], category: "Food", difficulty: "easy" },
  { word: "Doctor", taboo: ["Hospital", "Sick", "Nurse", "Medicine", "Patient"], category: "Jobs", difficulty: "easy" },
  { word: "Soccer", taboo: ["Ball", "Goal", "Kick", "Field", "Team"], category: "Sports", difficulty: "easy" },
  { word: "Refrigerator", taboo: ["Cold", "Kitchen", "Food", "Fridge", "Door"], category: "Objects", difficulty: "easy" },
  { word: "Rainbow", taboo: ["Colors", "Sky", "Rain", "Arc", "Sun"], category: "Nature", difficulty: "easy" },
  { word: "Guitar", taboo: ["String", "Music", "Play", "Instrument", "Band"], category: "Music", difficulty: "easy" },
  { word: "Toothbrush", taboo: ["Teeth", "Brush", "Paste", "Clean", "Mouth"], category: "Objects", difficulty: "easy" },
  { word: "Snowman", taboo: ["Snow", "Carrot", "Winter", "Cold", "Build"], category: "Everyday", difficulty: "easy" },
  { word: "Airplane", taboo: ["Fly", "Sky", "Pilot", "Wing", "Airport"], category: "Transport", difficulty: "easy" },
  { word: "Bicycle", taboo: ["Wheel", "Pedal", "Ride", "Two", "Bike"], category: "Transport", difficulty: "easy" },
  { word: "Library", taboo: ["Book", "Read", "Quiet", "Shelf", "Borrow"], category: "Places", difficulty: "easy" },
  { word: "Sandwich", taboo: ["Bread", "Slice", "Lunch", "Filling", "Cheese"], category: "Food", difficulty: "easy" },
  { word: "Alarm Clock", taboo: ["Wake", "Time", "Morning", "Ring", "Sleep"], category: "Objects", difficulty: "easy" },
  { word: "Firefighter", taboo: ["Fire", "Truck", "Hose", "Rescue", "Hot"], category: "Jobs", difficulty: "easy" },
  { word: "Beach", taboo: ["Sand", "Ocean", "Sun", "Wave", "Swim"], category: "Places", difficulty: "easy" },
  { word: "Chocolate", taboo: ["Sweet", "Brown", "Candy", "Cocoa", "Bar"], category: "Food", difficulty: "easy" },
  { word: "Basketball", taboo: ["Hoop", "Bounce", "Court", "Ball", "Net"], category: "Sports", difficulty: "easy" },

  // ---------- MEDIUM ----------
  { word: "Gravity", taboo: ["Fall", "Earth", "Weight", "Pull", "Newton"], category: "Science", difficulty: "medium" },
  { word: "Passport", taboo: ["Travel", "Country", "Border", "Document", "Stamp"], category: "Travel", difficulty: "medium" },
  { word: "Marriage", taboo: ["Wedding", "Ring", "Spouse", "Vows", "Couple"], category: "Life", difficulty: "medium" },
  { word: "Recipe", taboo: ["Cook", "Ingredients", "Instructions", "Kitchen", "Dish"], category: "Food", difficulty: "medium" },
  { word: "Democracy", taboo: ["Vote", "Government", "Election", "People", "Rights"], category: "Society", difficulty: "medium" },
  { word: "Photosynthesis", taboo: ["Plant", "Sunlight", "Leaf", "Oxygen", "Green"], category: "Science", difficulty: "medium" },
  { word: "Interview", taboo: ["Job", "Question", "Answer", "Employer", "Resume"], category: "Work", difficulty: "medium" },
  { word: "Volcano", taboo: ["Lava", "Erupt", "Mountain", "Ash", "Hot"], category: "Nature", difficulty: "medium" },
  { word: "Subscription", taboo: ["Monthly", "Pay", "Service", "Renew", "Netflix"], category: "Modern Life", difficulty: "medium" },
  { word: "Negotiation", taboo: ["Deal", "Agreement", "Discuss", "Price", "Compromise"], category: "Business", difficulty: "medium" },
  { word: "Constellation", taboo: ["Stars", "Sky", "Night", "Pattern", "Shape"], category: "Science", difficulty: "medium" },
  { word: "Quarantine", taboo: ["Isolate", "Sick", "Virus", "Home", "Contagious"], category: "Health", difficulty: "medium" },
  { word: "Metaphor", taboo: ["Compare", "Language", "Meaning", "Literal", "Poem"], category: "Language", difficulty: "medium" },
  { word: "Immigration", taboo: ["Country", "Move", "Border", "Visa", "Foreign"], category: "Society", difficulty: "medium" },
  { word: "Currency", taboo: ["Money", "Coin", "Exchange", "Dollar", "Value"], category: "Economy", difficulty: "medium" },
  { word: "Deadline", taboo: ["Time", "Due", "Finish", "Work", "Late"], category: "Work", difficulty: "medium" },
  { word: "Ecosystem", taboo: ["Nature", "Animals", "Balance", "Habitat", "Environment"], category: "Science", difficulty: "medium" },
  { word: "Streaming", taboo: ["Video", "Online", "Watch", "Internet", "Netflix"], category: "Modern Life", difficulty: "medium" },
  { word: "Antique", taboo: ["Old", "Vintage", "Valuable", "Furniture", "History"], category: "Objects", difficulty: "medium" },
  { word: "Insomnia", taboo: ["Sleep", "Night", "Awake", "Tired", "Bed"], category: "Health", difficulty: "medium" },

  // ---------- HARD ----------
  { word: "Nostalgia", taboo: ["Memory", "Past", "Longing", "Remember", "Old"], category: "Emotion", difficulty: "hard" },
  { word: "Bureaucracy", taboo: ["Government", "Rules", "Paperwork", "Office", "Process"], category: "Society", difficulty: "hard" },
  { word: "Serendipity", taboo: ["Luck", "Accident", "Chance", "Discover", "Unexpected"], category: "Abstract", difficulty: "hard" },
  { word: "Inflation", taboo: ["Price", "Economy", "Money", "Rise", "Currency"], category: "Economy", difficulty: "hard" },
  { word: "Existential Crisis", taboo: ["Meaning", "Life", "Purpose", "Question", "Doubt"], category: "Abstract", difficulty: "hard" },
  { word: "Algorithm", taboo: ["Computer", "Steps", "Code", "Instructions", "Program"], category: "Technology", difficulty: "hard" },
  { word: "Procrastination", taboo: ["Delay", "Later", "Avoid", "Task", "Lazy"], category: "Behavior", difficulty: "hard" },
  { word: "Renaissance", taboo: ["Art", "Europe", "History", "Rebirth", "Painting"], category: "History", difficulty: "hard" },
  { word: "Cryptocurrency", taboo: ["Bitcoin", "Digital", "Blockchain", "Money", "Coin"], category: "Technology", difficulty: "hard" },
  { word: "Empathy", taboo: ["Feel", "Understand", "Others", "Compassion", "Emotion"], category: "Emotion", difficulty: "hard" },
  { word: "Globalization", taboo: ["World", "Trade", "Countries", "Connect", "Economy"], category: "Society", difficulty: "hard" },
  { word: "Sarcasm", taboo: ["Joke", "Mean", "Tone", "Irony", "Opposite"], category: "Language", difficulty: "hard" },
  { word: "Monopoly", taboo: ["Game", "Control", "Market", "Company", "Only"], category: "Economy", difficulty: "hard" },
  { word: "Paradox", taboo: ["Contradiction", "Logic", "Confusing", "Statement", "True"], category: "Abstract", difficulty: "hard" },
  { word: "Deja Vu", taboo: ["Feeling", "Before", "Memory", "Familiar", "Already"], category: "Abstract", difficulty: "hard" },
  { word: "Censorship", taboo: ["Ban", "Government", "Speech", "Control", "Media"], category: "Society", difficulty: "hard" },
  { word: "Artificial Intelligence", taboo: ["Robot", "Computer", "Smart", "Machine", "Learn"], category: "Technology", difficulty: "hard" },
  { word: "Introvert", taboo: ["Shy", "Alone", "Quiet", "Social", "Personality"], category: "Personality", difficulty: "hard" },
  { word: "Climate Change", taboo: ["Warming", "Earth", "Weather", "Carbon", "Temperature"], category: "Environment", difficulty: "hard" },
  { word: "Diplomacy", taboo: ["Countries", "Talk", "Peace", "Negotiate", "Politics"], category: "Society", difficulty: "hard" },
];

export function getRandomWord(difficulty = "mixed", excludeWords = []) {
  const pool =
    difficulty === "mixed"
      ? WORD_BANK
      : WORD_BANK.filter((entry) => entry.difficulty === difficulty);

  const fresh = pool.filter((entry) => !excludeWords.includes(entry.word));
  const finalPool = fresh.length > 0 ? fresh : pool;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}
