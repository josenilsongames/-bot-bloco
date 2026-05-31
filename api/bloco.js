import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = getApps().length === 0? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default async function handler(req, res) {
  const blocoRef = doc(db, "global", "bloco");
  const snap = await getDoc(blocoRef);
  const data = snap.data();

  await updateDoc(blocoRef, {
    numero: (data.numero || 0) + 1,
    proximoBloco: (data.proximoBloco || Date.now()) + 600000
  });

  res.status(200).json({ ok: true, bloco: data.numero + 1 });
}
