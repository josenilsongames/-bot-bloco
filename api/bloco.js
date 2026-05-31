import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const ref = db.collection('recompensa_status').doc('bloco_atual');
  
  try {
    const doc = await ref.get();
    let data = doc.data();
    
    let numero = data.numero;
    let proximoBloco = data.timestamp;
    const agora = Date.now();

    // Se já venceu, o BOT soma +10min sozinho
    while (agora >= proximoBloco) {
      numero = numero + 1;
      proximoBloco = proximoBloco + 600000; // +10 minutos
    }

    // Salva o novo valor no Firebase
    if (proximoBloco !== data.timestamp) {
      await ref.set({ 
        numero: numero, 
        timestamp: proximoBloco 
      });
    }

    res.status(200).json({
      currentBlock: numero,
      nextBlockTime: proximoBloco
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
