import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const ref = db.collection('recompensa_status').doc('bloco_atual');
  
  try {
    const doc = await ref.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Documento bloco_atual nao encontrado' });
    }
    
    let data = doc.data();
    let numero = data.numero;
    let proximoBloco = data.timestamp;
    const agora = Date.now();

    while (agora >= proximoBloco) {
      numero = numero + 1;
      proximoBloco = proximoBloco + 600000;
    }

    if (proximoBloco !== data.timestamp) {
      await ref.set({ numero, timestamp: proximoBloco });
    }

    res.status(200).json({
      currentBlock: numero,
      nextBlockTime: proximoBloco
    });
    
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: error.message });
  }
}
