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
  // ===== LIBERA CORS =====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // ===== FIM CORS =====

  try {
    const blocoRef = doc(db, "global", "bloco");
    const snap = await getDoc(blocoRef);

    if (!snap.exists()) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const data = snap.data();
    const novoNumero = (data.numero || 0) + 1;
    const proximoTempo = (data.proximoBloco || Date.now()) + 600000;

    await updateDoc(blocoRef, {
      numero: novoNumero,
      proximoBloco: proximoTempo
    });

    // IMPORTANTE: Retorna os dados que o jogo precisa
    res.status(200).json({
      currentBlock: novoNumero,
      nextBlockTime: proximoTempo
    });

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar bloco' });
  }
}
