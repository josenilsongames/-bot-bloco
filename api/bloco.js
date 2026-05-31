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
    
    // Se não existe nada, cria o primeiro
    if (!data) {
      data = {
        numero: 989025,
        timestamp: 1780262890000
      };
    }
    
    let numero = data.numero;
    let proximoBloco = data.timestamp;
    const agora = Date.now();

    // SE O TEMPO JÁ VENCEU, O BOT SOMA +10MIN
    if (agora >= proximoBloco) {
      numero = numero + 1; // Próximo bloco
      proximoBloco = proximoBloco + 600000; // +10 minutos
      
      // Salva no Firebase igual você fazia manual
      await ref.set({ 
        numero: numero, 
        timestamp: proximoBloco 
      });
    }

    // Manda o tempo pro jogo
    res.status(200).json({
      currentBlock: numero,
      nextBlockTime: proximoBloco
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Erro Firebase' });
  }
}
