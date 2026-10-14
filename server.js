const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./'));

app.get('/', (req,res)=> res.send('ForeignersLove API Live - AI Companions Only'));

// FAKE M-Pesa for now - activates after 10 seconds (TEST MODE)
app.post('/api/pay', (req,res)=>{
  const {phone} = req.body;
  console.log('Payment request for:', phone);
  // Simulate STK push success
  setTimeout(()=>{
    console.log('Activated for', phone);
  },10000);
  res.json({success:true, message:'TEST MODE: STK Push simulated. In real Daraja, user will get prompt. Use passkey 123456 after 10sec to activate.', checkoutId: 'test_'+Date.now()});
});

app.post('/api/verify', (req,res)=>{
  res.json({success:true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server on '+PORT));
