import { 
  users, type User, type InsertUser,
  healthProfiles, type HealthProfile, type InsertHealthProfile,
  lifestyleHabits, type LifestyleHabits, type InsertLifestyleHabits,
  environmentalSensitivities, type EnvironmentalSensitivities, type InsertEnvironmentalSensitivities,
  interests, type Interests, type InsertInterests,
  surveys, type Survey, type InsertSurvey,
  polls, type Poll, type InsertPoll,
  pollVotes, type PollVote, type InsertPollVote,
  chatHistory, type ChatHistory, type InsertChatHistory
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Health profile methods
  getHealthProfile(userId: number): Promise<HealthProfile | undefined>;
  createHealthProfile(healthProfile: InsertHealthProfile): Promise<HealthProfile>;
  updateHealthProfile(userId: number, healthProfile: Partial<HealthProfile>): Promise<HealthProfile>;
  
  // Lifestyle habits methods
  getLifestyleHabits(userId: number): Promise<LifestyleHabits | undefined>;
  createLifestyleHabits(lifestyleHabits: InsertLifestyleHabits): Promise<LifestyleHabits>;
  updateLifestyleHabits(userId: number, lifestyleHabits: Partial<LifestyleHabits>): Promise<LifestyleHabits>;
  
  // Environmental sensitivities methods
  getEnvironmentalSensitivities(userId: number): Promise<EnvironmentalSensitivities | undefined>;
  createEnvironmentalSensitivities(sensitivities: InsertEnvironmentalSensitivities): Promise<EnvironmentalSensitivities>;
  updateEnvironmentalSensitivities(userId: number, sensitivities: Partial<EnvironmentalSensitivities>): Promise<EnvironmentalSensitivities>;
  
  // Interests methods
  getInterests(userId: number): Promise<Interests | undefined>;
  createInterests(interests: InsertInterests): Promise<Interests>;
  updateInterests(userId: number, interests: Partial<Interests>): Promise<Interests>;
  
  // Survey methods
  getSurvey(userId: number): Promise<Survey | undefined>;
  createSurvey(userId: number, survey: Partial<InsertSurvey>): Promise<Survey>;
  updateSurvey(userId: number, survey: Partial<Survey>): Promise<Survey>;
  
  // Poll methods
  getPolls(): Promise<Poll[]>;
  getPoll(id: number): Promise<Poll | undefined>;
  createPoll(poll: Partial<InsertPoll>): Promise<Poll>;
  updatePoll(id: number, poll: Poll): Promise<Poll>;
  deletePoll(id: number): Promise<void>;
  
  // Poll vote methods
  getPollVotes(pollId: number): Promise<PollVote[]>;
  getUserPollVote(pollId: number, userId: number): Promise<PollVote | undefined>;
  createPollVote(vote: InsertPollVote): Promise<PollVote>;
  
  // Chat history methods
  getChatHistory(userId: number): Promise<ChatHistory | undefined>;
  createChatHistory(chatHistory: InsertChatHistory): Promise<ChatHistory>;
  updateChatHistory(userId: number, chatHistory: Partial<ChatHistory>): Promise<ChatHistory>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  // Using composite keys with format "userId:recordId" to ensure data isolation
  private healthProfiles: Map<string, HealthProfile>;
  private lifestyleHabits: Map<string, LifestyleHabits>;
  private environmentalSensitivities: Map<string, EnvironmentalSensitivities>;
  private interestsMap: Map<string, Interests>;
  private surveysMap: Map<string, Survey>;
  private pollsMap: Map<number, Poll>;
  private pollVotesMap: Map<string, PollVote>; // key format: "pollId:userId"
  private chatHistoryMap: Map<string, ChatHistory>; // key format: "userId:recordId"
  
  private deviceSessionMap: Map<string, number>; // Maps deviceId to userId
  
  private currentId: {
    users: number;
    healthProfiles: number;
    lifestyleHabits: number;
    environmentalSensitivities: number;
    interests: number;
    surveys: number;
    polls: number;
    pollVotes: number;
    chatHistory: number;
  };

  constructor() {
    this.users = new Map();
    this.healthProfiles = new Map();
    this.lifestyleHabits = new Map();
    this.environmentalSensitivities = new Map();
    this.interestsMap = new Map();
    this.surveysMap = new Map();
    this.pollsMap = new Map();
    this.pollVotesMap = new Map();
    this.chatHistoryMap = new Map();
    
    // Add a deviceId to track which device the data belongs to
    this.deviceSessionMap = new Map();
    
    this.currentId = {
      users: 1,
      healthProfiles: 1,
      lifestyleHabits: 1,
      environmentalSensitivities: 1,
      interests: 1,
      surveys: 1,
      polls: 1,
      pollVotes: 1,
      chatHistory: 1
    };
    
    // Initialize with demo user and sample data
    this.initializeDemoData();
  }
  
  // Methods for device session management
  async registerDeviceSession(deviceId: string, userId: number): Promise<void> {
    this.deviceSessionMap.set(deviceId, userId);
  }
  
  async getUserIdFromDeviceSession(deviceId: string): Promise<number | undefined> {
    return this.deviceSessionMap.get(deviceId);
  }
  
  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: 0,
      username: "demo_user",
      password: "password" // In a real app, this would be hashed
    };
    this.users.set(demoUser.id, demoUser);
    
    // Create sample polls
    const poll1: Poll = {
      id: 1,
      question: "Which sustainable transportation method should Hanoi prioritize?",
      options: [
        { text: "Expand the metro system", votes: 42 },
        { text: "More electric buses", votes: 28 },
        { text: "Bike-sharing programs", votes: 18 },
        { text: "Electric car infrastructure", votes: 12 }
      ],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    
    const poll2: Poll = {
      id: 2,
      question: "What's your biggest challenge in adopting sustainable practices in Hanoi?",
      options: [
        { text: "Higher cost of eco-friendly products", votes: 35 },
        { text: "Limited availability of sustainable options", votes: 28 },
        { text: "Lack of knowledge about what actually helps", votes: 22 },
        { text: "Inconvenience in daily routines", votes: 15 }
      ],
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    
    this.pollsMap.set(poll1.id, poll1);
    this.pollsMap.set(poll2.id, poll2);
    this.currentId.polls = 3;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Health profile methods
  async getHealthProfile(userId: number): Promise<HealthProfile | undefined> {
    // Find the profile directly by iterating through entries and checking keys that start with userId:
    for (const [key, profile] of this.healthProfiles.entries()) {
      // Ensure key is a string before calling startsWith
      if (typeof key === 'string' && key.startsWith(`${userId}:`)) {
        return profile;
      }
    }
    return undefined;
  }
  
  async createHealthProfile(healthProfile: InsertHealthProfile): Promise<HealthProfile> {
    const id = this.currentId.healthProfiles++;
    const profile: HealthProfile = { ...healthProfile, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    // Use composite key with userId to ensure data isolation
    this.healthProfiles.set(`${healthProfile.userId}:${id}`, profile);
    return profile;
  }
  
  async updateHealthProfile(userId: number, updatedProfile: Partial<HealthProfile>): Promise<HealthProfile> {
    let profile = await this.getHealthProfile(userId);
    
    if (profile) {
      // Update existing profile
      profile = { ...profile, ...updatedProfile, updatedAt: new Date().toISOString() };
      // Use composite key with userId to ensure data isolation
      this.healthProfiles.set(`${userId}:${profile.id}`, profile);
    } else {
      // Create new profile
      profile = await this.createHealthProfile({ 
        userId, 
        hasRespiratoryConditions: updatedProfile.hasRespiratoryConditions || false,
        respiratoryConditions: updatedProfile.respiratoryConditions || [],
        hasAllergies: updatedProfile.hasAllergies || false,
        allergies: updatedProfile.allergies || [],
        cardiovascularConcerns: updatedProfile.cardiovascularConcerns || false,
        skinConditions: updatedProfile.skinConditions || false,
        fitnessLevel: updatedProfile.fitnessLevel || ''
      });
    }
    
    return profile;
  }
  
  // Lifestyle habits methods
  async getLifestyleHabits(userId: number): Promise<LifestyleHabits | undefined> {
    // Find the habits directly by iterating through entries and checking keys that start with userId:
    for (const [key, habits] of this.lifestyleHabits.entries()) {
      // Ensure key is a string before calling startsWith
      if (typeof key === 'string' && key.startsWith(`${userId}:`)) {
        return habits;
      }
    }
    return undefined;
  }
  
  async createLifestyleHabits(lifestyleHabits: InsertLifestyleHabits): Promise<LifestyleHabits> {
    const id = this.currentId.lifestyleHabits++;
    const habits: LifestyleHabits = { ...lifestyleHabits, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    // Use composite key with userId to ensure data isolation
    this.lifestyleHabits.set(`${lifestyleHabits.userId}:${id}`, habits);
    return habits;
  }
  
  async updateLifestyleHabits(userId: number, updatedHabits: Partial<LifestyleHabits>): Promise<LifestyleHabits> {
    let habits = await this.getLifestyleHabits(userId);
    
    if (habits) {
      // Update existing habits
      habits = { ...habits, ...updatedHabits, updatedAt: new Date().toISOString() };
      // Use composite key with userId to ensure data isolation
      this.lifestyleHabits.set(`${userId}:${habits.id}`, habits);
    } else {
      // Create new habits
      habits = await this.createLifestyleHabits({ 
        userId, 
        dailyRoutine: updatedHabits.dailyRoutine || '',
        transportation: updatedHabits.transportation || [],
        dietaryPreferences: updatedHabits.dietaryPreferences || [],
        sleepHabits: updatedHabits.sleepHabits || ''
      });
    }
    
    return habits;
  }
  
  // Environmental sensitivities methods
  async getEnvironmentalSensitivities(userId: number): Promise<EnvironmentalSensitivities | undefined> {
    // Find the sensitivities directly by iterating through entries and checking keys that start with userId:
    for (const [key, sensitivities] of this.environmentalSensitivities.entries()) {
      // Ensure key is a string before calling startsWith
      if (typeof key === 'string' && key.startsWith(`${userId}:`)) {
        return sensitivities;
      }
    }
    return undefined;
  }
  
  async createEnvironmentalSensitivities(sensitivities: InsertEnvironmentalSensitivities): Promise<EnvironmentalSensitivities> {
    const id = this.currentId.environmentalSensitivities++;
    const envSensitivities: EnvironmentalSensitivities = { ...sensitivities, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    // Use composite key with userId to ensure data isolation
    this.environmentalSensitivities.set(`${sensitivities.userId}:${id}`, envSensitivities);
    return envSensitivities;
  }
  
  async updateEnvironmentalSensitivities(userId: number, updatedSensitivities: Partial<EnvironmentalSensitivities>): Promise<EnvironmentalSensitivities> {
    let sensitivities = await this.getEnvironmentalSensitivities(userId);
    
    if (sensitivities) {
      // Update existing sensitivities
      sensitivities = { ...sensitivities, ...updatedSensitivities, updatedAt: new Date().toISOString() };
      // Use composite key with userId to ensure data isolation
      this.environmentalSensitivities.set(`${userId}:${sensitivities.id}`, sensitivities);
    } else {
      // Create new sensitivities
      sensitivities = await this.createEnvironmentalSensitivities({ 
        userId, 
        pollutionSensitivity: updatedSensitivities.pollutionSensitivity || 3,
        uvSensitivity: updatedSensitivities.uvSensitivity || 3,
        heatSensitivity: updatedSensitivities.heatSensitivity || 3,
        coldSensitivity: updatedSensitivities.coldSensitivity || 3
      });
    }
    
    return sensitivities;
  }
  
  // Interests methods
  async getInterests(userId: number): Promise<Interests | undefined> {
    // Find the interests directly by iterating through entries and checking keys that start with userId:
    for (const [key, interests] of this.interestsMap.entries()) {
      // Ensure key is a string before calling startsWith
      if (typeof key === 'string' && key.startsWith(`${userId}:`)) {
        return interests;
      }
    }
    return undefined;
  }
  
  async createInterests(interests: InsertInterests): Promise<Interests> {
    const id = this.currentId.interests++;
    const newInterests: Interests = { ...interests, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    // Use composite key with userId to ensure data isolation
    this.interestsMap.set(`${interests.userId}:${id}`, newInterests);
    return newInterests;
  }
  
  async updateInterests(userId: number, updatedInterests: Partial<Interests>): Promise<Interests> {
    let interests = await this.getInterests(userId);
    
    if (interests) {
      // Update existing interests
      interests = { ...interests, ...updatedInterests, updatedAt: new Date().toISOString() };
      // Use composite key with userId to ensure data isolation
      this.interestsMap.set(`${userId}:${interests.id}`, interests);
    } else {
      // Create new interests
      interests = await this.createInterests({ 
        userId, 
        outdoorActivities: updatedInterests.outdoorActivities || [],
        clothingStyle: updatedInterests.clothingStyle || '',
        sustainabilityInterest: updatedInterests.sustainabilityInterest || 3,
        notifications: updatedInterests.notifications || []
      });
    }
    
    return interests;
  }
  
  // Survey methods
  async getSurvey(userId: number): Promise<Survey | undefined> {
    // Find the survey directly by iterating through entries and checking keys that start with userId:
    for (const [key, survey] of this.surveysMap.entries()) {
      // Ensure key is a string before calling startsWith
      if (typeof key === 'string' && key.startsWith(`${userId}:`)) {
        return survey;
      }
    }
    return undefined;
  }
  
  async createSurvey(userId: number, surveyData: Partial<InsertSurvey>): Promise<Survey> {
    const id = this.currentId.surveys++;
    const survey: Survey = { 
      id, 
      userId, 
      completed: surveyData.completed || false,
      lastStep: surveyData.lastStep || 0,
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    };
    this.surveysMap.set(id, survey);
    return survey;
  }
  
  async updateSurvey(userId: number, updatedSurvey: Partial<Survey>): Promise<Survey> {
    const survey = await this.getSurvey(userId);
    
    if (!survey) {
      return this.createSurvey(userId, updatedSurvey);
    }
    
    const updated: Survey = { 
      ...survey, 
      ...updatedSurvey, 
      updatedAt: new Date().toISOString() 
    };
    
    this.surveysMap.set(survey.id, updated);
    return updated;
  }
  
  // Poll methods
  async getPolls(): Promise<Poll[]> {
    return Array.from(this.pollsMap.values());
  }
  
  async getPoll(id: number): Promise<Poll | undefined> {
    return this.pollsMap.get(id);
  }
  
  async createPoll(pollData: Partial<InsertPoll>): Promise<Poll> {
    const id = this.currentId.polls++;
    const poll: Poll = { 
      id, 
      question: pollData.question || '',
      options: pollData.options || [],
      expiresAt: pollData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };
    this.pollsMap.set(id, poll);
    return poll;
  }
  
  async updatePoll(id: number, updatedPoll: Poll): Promise<Poll> {
    this.pollsMap.set(id, updatedPoll);
    return updatedPoll;
  }
  
  async deletePoll(id: number): Promise<void> {
    this.pollsMap.delete(id);
  }
  
  // Poll vote methods
  async getPollVotes(pollId: number): Promise<PollVote[]> {
    return Array.from(this.pollVotesMap.values()).filter(
      (vote) => vote.pollId === pollId
    );
  }
  
  async getUserPollVote(pollId: number, userId: number): Promise<PollVote | undefined> {
    return this.pollVotesMap.get(`${pollId}:${userId}`);
  }
  
  async createPollVote(vote: InsertPollVote): Promise<PollVote> {
    const id = this.currentId.pollVotes++;
    const pollVote: PollVote = { 
      ...vote, 
      id,
      createdAt: new Date().toISOString()
    };
    this.pollVotesMap.set(`${vote.pollId}:${vote.userId}`, pollVote);
    return pollVote;
  }
  
  // Chat history methods
  async getChatHistory(userId: number, deviceId?: string): Promise<ChatHistory | undefined> {
    // If deviceId is provided, use it to get device-specific chat history
    if (deviceId) {
      // Find the chat history directly by iterating through entries and checking keys that include both userId and deviceId
      for (const [key, history] of this.chatHistoryMap.entries()) {
        // Ensure key is a string before calling includes
        if (typeof key === 'string' && key.startsWith(`${userId}:${deviceId}:`)) {
          return history;
        }
      }
      return undefined;
    }
    
    // If no deviceId provided, fallback to original behavior
    for (const [key, history] of this.chatHistoryMap.entries()) {
      // Ensure key is a string before calling startsWith
      if (typeof key === 'string' && key.startsWith(`${userId}:`)) {
        return history;
      }
    }
    return undefined;
  }
  
  async createChatHistory(chatHistory: InsertChatHistory, deviceId?: string): Promise<ChatHistory> {
    const id = this.currentId.chatHistory++;
    const history: ChatHistory = { 
      ...chatHistory, 
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // Use composite key with userId and deviceId to ensure data isolation
    const key = deviceId ? `${chatHistory.userId}:${deviceId}:${id}` : `${chatHistory.userId}:${id}`;
    this.chatHistoryMap.set(key, history);
    return history;
  }
  
  async updateChatHistory(userId: number, updatedHistory: Partial<ChatHistory>, deviceId?: string): Promise<ChatHistory> {
    // Get chat history with deviceId to ensure proper isolation
    let history = await this.getChatHistory(userId, deviceId);
    
    if (history) {
      // Update existing history
      history = { ...history, ...updatedHistory, updatedAt: new Date().toISOString() };
      
      // Use composite key with userId and deviceId to ensure data isolation
      const key = deviceId ? `${userId}:${deviceId}:${history.id}` : `${userId}:${history.id}`;
      this.chatHistoryMap.set(key, history);
    } else {
      // Create new history with deviceId
      history = await this.createChatHistory({ 
        userId, 
        messages: updatedHistory.messages || []
      }, deviceId); // Pass deviceId to createChatHistory
    }
    
    return history;
  }
}

// Create and export storage instance
export const storage = new MemStorage();
