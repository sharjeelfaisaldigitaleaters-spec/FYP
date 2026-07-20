// ─── Central Mock Data Store ───────────────────────────────────────────────
// All mock data lives here. Mutations update this store so changes persist
// for the entire session (resets on hard refresh — fine until backend is ready).

export interface Memory {
  id: string;
  userId: string;
  title: string;
  type: "audio" | "image" | "text";
  size: string;
  content?: string;
  createdAt: string;
  status: "processed" | "processing" | "draft";
}

export interface Story {
  id: string;
  userId: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  duration: string;
  hasAudio: boolean;
  isFavorite: boolean;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string; // owner
  name: string;
  email: string;
  avatar: string;
  role: "owner" | "editor" | "viewer";
  status: "active" | "pending";
  joinedAt?: string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  type: "upload" | "conversation" | "family" | "story";
  title: string;
  description: string;
  time: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  personaId: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

export interface Persona {
  id: string;
  userId: string;
  name: string;
  relation: string;
  description: string;
  memoriesCount: number;
  voice_id?: string | null;
}

export interface ScheduledMessage {
  id: string;
  userId: string;
  title: string;
  content: string;
  deliverOn: string;
  occasion: string;
  recipient: string;
  status: "scheduled" | "delivered";
}

// ─── Seeded Data ─────────────────────────────────────────────────────────────

const _memories: Memory[] = [
  { id: "m1", userId: "user-1", title: "Summer vacation 2019", type: "audio", size: "12.4 MB", createdAt: "2024-03-10", status: "processed" },
  { id: "m2", userId: "user-1", title: "Grandma's recipes", type: "text", size: "3 KB", content: "The secret to grandma's apple pie...", createdAt: "2024-03-12", status: "processed" },
  { id: "m3", userId: "user-1", title: "Wedding day photos", type: "image", size: "45.2 MB", createdAt: "2024-03-15", status: "processed" },
  { id: "m4", userId: "user-1", title: "Birthday voice message", type: "audio", size: "8.1 MB", createdAt: "2024-03-20", status: "processing" },
  { id: "m5", userId: "user-2", title: "Family reunion 2023", type: "image", size: "22.0 MB", createdAt: "2024-02-28", status: "processed" },
  { id: "m6", userId: "user-3", title: "Dad's war stories", type: "audio", size: "31.7 MB", createdAt: "2024-04-10", status: "processed" },
];

const _stories: Story[] = [
  { id: "s1", userId: "user-1", title: "The Wedding Day", excerpt: "It was a beautiful spring morning when your grandfather picked me up in his father's old Chevrolet...", category: "Love Stories", date: "1962", duration: "8 min", hasAudio: true, isFavorite: true, createdAt: "2024-03-10" },
  { id: "s2", userId: "user-1", title: "First Day of School", excerpt: "I remember being so nervous, but your great-grandmother held my hand and told me everything would be wonderful...", category: "Childhood", date: "1945", duration: "5 min", hasAudio: true, isFavorite: false, createdAt: "2024-03-12" },
  { id: "s3", userId: "user-1", title: "Grandma's Secret Recipes", excerpt: "The key to a good pie is patience. Let me tell you about the recipes passed down from my mother...", category: "Family Traditions", date: "Various", duration: "12 min", hasAudio: true, isFavorite: true, createdAt: "2024-03-14" },
  { id: "s4", userId: "user-1", title: "The Move to California", excerpt: "In 1970, we packed everything we owned into a station wagon and headed west with nothing but hope...", category: "Life Changes", date: "1970", duration: "15 min", hasAudio: false, isFavorite: false, createdAt: "2024-03-16" },
  { id: "s5", userId: "user-1", title: "Lessons My Father Taught Me", excerpt: "Hard work, honesty, and always treating people with respect. These were the pillars of his life...", category: "Wisdom", date: "Throughout", duration: "10 min", hasAudio: true, isFavorite: true, createdAt: "2024-03-18" },
  { id: "s6", userId: "user-1", title: "Summer at the Lake House", excerpt: "Every July, the whole family would gather at the lake. Those weeks were the happiest of my life...", category: "Family Traditions", date: "1975-1995", duration: "7 min", hasAudio: true, isFavorite: false, createdAt: "2024-03-20" },
];

const _familyMembers: FamilyMember[] = [
  { id: "f1", userId: "user-1", name: "You", email: "john@example.com", avatar: "", role: "owner", status: "active", joinedAt: "January 2024" },
  { id: "f2", userId: "user-1", name: "Sarah Johnson", email: "sarah@example.com", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face", role: "editor", status: "active", joinedAt: "February 2024" },
  { id: "f3", userId: "user-1", name: "Michael Chen", email: "michael@example.com", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", role: "viewer", status: "active", joinedAt: "March 2024" },
  { id: "f4", userId: "user-1", name: "Emily Watson", email: "emily@example.com", avatar: "", role: "viewer", status: "pending" },
];

const _activity: ActivityItem[] = [
  { id: "a1", userId: "user-1", type: "upload", title: "Voice recording added", description: "Summer vacation memories - 2019", time: "2 hours ago", createdAt: Date.now() - 7200000 },
  { id: "a2", userId: "user-1", type: "conversation", title: "New conversation", description: "Asked about childhood stories", time: "5 hours ago", createdAt: Date.now() - 18000000 },
  { id: "a3", userId: "user-1", type: "family", title: "Family member joined", description: "Sarah accepted your invitation", time: "1 day ago", createdAt: Date.now() - 86400000 },
  { id: "a4", userId: "user-1", type: "story", title: "Story transcribed", description: "The wedding day story", time: "2 days ago", createdAt: Date.now() - 172800000 },
];

const _personas: Persona[] = [
  { id: "p1", userId: "user-1", name: "Grandma Rose", relation: "Grandmother", description: "Warm, storytelling voice full of wisdom", memoriesCount: 12 },
  { id: "p2", userId: "user-1", name: "Grandpa Walter", relation: "Grandfather", description: "Gentle and thoughtful with many life lessons", memoriesCount: 8 },
  { id: "p3", userId: "user-1", name: "Dad — Robert", relation: "Father", description: "Encouraging and full of practical advice", memoriesCount: 5 },
];

const _chatMessages: ChatMessage[] = [
  { id: "c1", personaId: "p1", type: "ai", content: "Hello, dear. It's so wonderful to hear from you. What would you like to talk about today?", timestamp: new Date(Date.now() - 300000) },
  { id: "c2", personaId: "p1", type: "user", content: "I've been thinking about that summer we spent at the lake house.", timestamp: new Date(Date.now() - 240000) },
  { id: "c3", personaId: "p1", type: "ai", content: "Oh, the lake house! Those were such precious times. I remember how you used to wake up before everyone else to watch the sunrise over the water. You always loved those quiet morning moments.", timestamp: new Date(Date.now() - 180000), isVoice: true },
  { id: "c4", personaId: "p1", type: "user", content: "Yes! And you would make those amazing blueberry pancakes.", timestamp: new Date(Date.now() - 120000) },
  { id: "c5", personaId: "p1", type: "ai", content: "My secret was adding a little bit of vanilla extract and a pinch of cinnamon. I always made extra batter because your father would sneak back for seconds. Would you like me to share the full recipe?", timestamp: new Date(Date.now() - 60000), isVoice: true },
];

// ─── AI Response Pool (per persona) ──────────────────────────────────────────
const AI_RESPONSES: Record<string, string[]> = {
  p1: [
    "That's a lovely memory to share. It reminds me of the times we used to sit on the porch and just watch the world go by.",
    "You know, life has a way of bringing the most important things back to you when you need them most.",
    "I remember that so clearly. The smell of fresh bread in the morning and the sound of birds outside the window.",
    "Family is everything, dear. Whatever happens, hold onto each other.",
    "Those little moments — they're the ones that matter most in the end.",
    "I always knew you'd grow up to be someone wonderful. I'm so proud of you.",
  ],
  p2: [
    "Ah, those were good times. Hard work never hurt anyone, and we had plenty of it.",
    "You know what I always say — measure twice, cut once. Works for wood and for life.",
    "The greatest investment you can make is in the people around you.",
    "Never be afraid to admit when you're wrong. It takes more courage than stubbornness ever does.",
  ],
  p3: [
    "Keep pushing forward. Every day you get a little better, and that's all that matters.",
    "I believe in you more than you know. Always have.",
    "Remember what I told you — the right path isn't always the easy one.",
    "You've got more strength in you than you realize. Trust yourself.",
  ],
};

export const getAIResponse = (personaId: string): string => {
  const pool = AI_RESPONSES[personaId] || AI_RESPONSES["p1"];
  return pool[Math.floor(Math.random() * pool.length)];
};

// ─── Store API ────────────────────────────────────────────────────────────────

// Memories
export const getMemories = (userId: string) => _memories.filter((m) => m.userId === userId);
export const getAllMemories = () => [..._memories];
export const addMemory = (memory: Memory) => { _memories.unshift(memory); };
export const deleteMemory = (id: string) => {
  const idx = _memories.findIndex((m) => m.id === id);
  if (idx !== -1) _memories.splice(idx, 1);
};

// Stories
export const getStories = (userId: string) => _stories.filter((s) => s.userId === userId);
export const getAllStories = () => [..._stories];
export const toggleStoryFavorite = (id: string) => {
  const story = _stories.find((s) => s.id === id);
  if (story) story.isFavorite = !story.isFavorite;
};
export const deleteStory = (id: string) => {
  const idx = _stories.findIndex((s) => s.id === id);
  if (idx !== -1) _stories.splice(idx, 1);
};

// Family
export const getFamilyMembers = (userId: string) => _familyMembers.filter((m) => m.userId === userId);
export const getAllFamilyMembers = () => [..._familyMembers];
export const addFamilyMember = (member: FamilyMember) => { _familyMembers.push(member); };
export const removeFamilyMember = (id: string) => {
  const idx = _familyMembers.findIndex((m) => m.id === id);
  if (idx !== -1) _familyMembers.splice(idx, 1);
};
export const updateFamilyMemberRole = (id: string, role: FamilyMember["role"]) => {
  const m = _familyMembers.find((m) => m.id === id);
  if (m) m.role = role;
};

// Activity
export const getActivity = (userId: string) => _activity.filter((a) => a.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
export const addActivity = (item: ActivityItem) => { _activity.unshift(item); };

// Stats
export const getStats = (userId: string) => ({
  memoriesUploaded: getMemories(userId).length,
  storiesSaved: getStories(userId).length,
  conversations: 47,
  familyMembers: getFamilyMembers(userId).filter((m) => m.status === "active").length,
});

export const getAdminStats = () => ({
  totalUsers: 4,
  totalMemories: getAllMemories().length,
  totalConversations: 284,
  totalStoriesGenerated: getAllStories().length,
  storageUsedGB: 12.4,
  activeToday: 3,
});

// Personas
export const getPersonas = (userId: string) => {
  const p = _personas.filter((p) => p.userId === userId);
  return p.length > 0 ? p : [_personas[0]];
};

// Chat Messages
export const getChatMessages = (personaId: string) => _chatMessages.filter((m) => m.personaId === personaId);
export const addChatMessage = (msg: ChatMessage) => { _chatMessages.push(msg); };

// Mock Users for Admin view
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  joinedAt: string;
}

const _mockUsers: MockUser[] = [
  { id: "user-1", name: "John Doe", email: "john@example.com", role: "user", joinedAt: "2024-01-15" },
  { id: "user-2", name: "Jane Smith", email: "jane@example.com", role: "user", joinedAt: "2024-02-10" },
  { id: "user-3", name: "Robert Downey", email: "robert@example.com", role: "user", joinedAt: "2024-03-01" },
  { id: "admin-1", name: "System Admin", email: "admin@memorykeeper.com", role: "admin", joinedAt: "2024-01-01" },
];

export const getMockUsers = () => [..._mockUsers];

