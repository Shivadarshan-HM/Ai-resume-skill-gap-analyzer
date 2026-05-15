import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./config";

const USERS_COLLECTION = "users";
const ANALYSES_COLLECTION = "resume_analyses";
const CHATS_COLLECTION = "chat_messages";

function createSkillSet(role = "") {
  const roleMap = {
    "Frontend Developer": ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Redux"],
    "Backend Developer": ["Node.js", "Python", "APIs", "Databases", "Authentication", "Testing"],
    "Full Stack Developer": ["React", "Node.js", "APIs", "Databases", "Git", "Deployment"],
    "Data Scientist": ["Python", "Pandas", "Machine Learning", "SQL", "Statistics", "Visualization"],
    "Data Analyst": ["SQL", "Excel", "Power BI", "Python", "Data Cleaning", "Reporting"],
    "DevOps Engineer": ["CI/CD", "Docker", "Kubernetes", "AWS", "Terraform", "Monitoring"],
    "ML Engineer": ["Python", "TensorFlow", "PyTorch", "MLOps", "Data Pipelines", "Deployment"],
    "UI/UX Designer": ["Figma", "User Research", "Wireframing", "Design Systems", "Prototyping", "Accessibility"],
    "Product Manager": ["Roadmapping", "Analytics", "Stakeholder Management", "Agile", "User Stories", "Prioritization"],
    "Cloud Engineer": ["AWS", "Azure", "GCP", "Networking", "Security", "Infrastructure as Code"],
    "Cybersecurity Engineer": ["Network Security", "Threat Modeling", "SIEM", "Incident Response", "IAM", "Penetration Testing"],
    "Mobile Developer": ["React Native", "Flutter", "Android", "iOS", "API Integration", "State Management"],
    "Blockchain Developer": ["Solidity", "Smart Contracts", "Web3", "Cryptography", "Ethereum", "Testing"],
    "Game Developer": ["Unity", "C#", "Game Physics", "3D Math", "Optimization", "Gameplay Systems"],
  };

  return roleMap[role] || ["Communication", "Problem Solving", "Teamwork", "Git", "Testing", "Documentation"];
}

function extractFoundSkills(text, roleSkills) {
  const lower = text.toLowerCase();
  return roleSkills.filter((skill) => lower.includes(skill.toLowerCase()));
}

function buildSuggestions(missingSkills) {
  return missingSkills.slice(0, 6).map((skill, index) => ({
    skill,
    priority: index < 2 ? "High" : index < 4 ? "Medium" : "Low",
    how_to_learn: `Build one project section highlighting ${skill} with measurable outcomes.`,
  }));
}

function estimateScore(foundSkills, requiredSkills) {
  if (!requiredSkills.length) return 0;
  return Math.round((foundSkills.length / requiredSkills.length) * 100);
}

export async function createOrUpdateUserProfile(uid, profileData) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(userRef);

  const payload = {
    ...profileData,
    updatedAt: serverTimestamp(),
  };

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      ...payload,
      createdAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, payload);
  }

  const saved = await getDoc(userRef);
  return { id: saved.id, ...saved.data() };
}

export async function getUserProfile(uid) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function createResumeAnalysis(uid, payload) {
  const textSource = `${payload.resumeText || ""} ${payload.prompt || ""}`.trim();
  const requiredSkills = createSkillSet(payload.role);
  const foundSkills = extractFoundSkills(textSource, requiredSkills);
  const missingSkills = requiredSkills.filter((skill) => !foundSkills.includes(skill));
  const matchScore = estimateScore(foundSkills, requiredSkills);
  const suggestions = buildSuggestions(missingSkills);

  const analysis = {
    uid,
    role: payload.role,
    prompt: payload.prompt || "",
    sourceFileName: payload.fileName || "",
    summary:
      payload.resumeText?.trim() || payload.prompt?.trim()
        ? "Resume analyzed and matched against role requirements using Firebase-backed skill heuristics."
        : "No resume text extracted. Uploading PDF/DOCX stores metadata; add prompt details for better matching.",
    analysis:
      "This result is generated client-side and stored in Firestore. You can enhance it later by adding a Cloud Function for advanced AI analysis.",
    required_skills: requiredSkills,
    found_skills: foundSkills,
    missing_skills: missingSkills,
    highlighted_skills: missingSkills.slice(0, 3),
    suggestions,
    match_score: matchScore,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const added = await addDoc(collection(db, ANALYSES_COLLECTION), analysis);
  const saved = await getDoc(added);
  return { id: saved.id, ...saved.data() };
}

export async function getLatestResumeAnalysis(uid) {
  const q = query(
    collection(db, ANALYSES_COLLECTION),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const snapshots = await getDocs(q);
  if (snapshots.empty) return null;

  const docSnapshot = snapshots.docs[0];
  return { id: docSnapshot.id, ...docSnapshot.data() };
}

export async function addChatMessage(uid, message) {
  const payload = {
    uid,
    role: message.role,
    content: message.content,
    createdAt: serverTimestamp(),
  };

  const added = await addDoc(collection(db, CHATS_COLLECTION), payload);
  const saved = await getDoc(added);
  return { id: saved.id, ...saved.data() };
}

export async function getChatMessages(uid, maxItems = 20) {
  const q = query(
    collection(db, CHATS_COLLECTION),
    where("uid", "==", uid),
    orderBy("createdAt", "asc"),
    limit(maxItems)
  );

  const snapshots = await getDocs(q);
  return snapshots.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function removeChatMessage(messageId) {
  await deleteDoc(doc(db, CHATS_COLLECTION, messageId));
}

export async function createDocument(collectionName, data) {
  const added = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const saved = await getDoc(added);
  return { id: saved.id, ...saved.data() };
}

export async function updateDocument(collectionName, id, data) {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  const saved = await getDoc(ref);
  return { id: saved.id, ...saved.data() };
}

export async function getDocument(collectionName, id) {
  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function deleteDocument(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id));
}
