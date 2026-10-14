const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
app.use(cors());
app.use(express.json());

let users = [];

async function getToken(){
  const auth = Buffer.from(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
  { headers:{ Authorization:`Basic ${auth}` }});
  return res.data.access_token;
}

app.post('/api/pay', async (req,res)=>{
  try{
    let {name, phone, passkey} = req.body;
    let phoneFormatted = phone.toString();
    if(phoneFormatted.startsWith('07')) phoneFormatted='254'+phoneFormatted.slice(1);
    if(phoneFormatted.startsWith('0')) phoneFormatted='254'+phoneFormatted.slice(1);
    
    const token = await getToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g,'').slice(0,14);
    const password = Buffer.from(process.env.SHORTCODE+process.env.PASSKEY+timestamp).toString('base64');
    
    const stk = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',{
      BusinessShortCode: process.env.SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: 1,
      PartyA: phoneFormatted,
      PartyB: process.env.SHORTCODE,
      PhoneNumber: phoneFormatted,
      CallBackURL: "https://foreignerslove.onrender.com/callback",
      AccountReference: "ForeignersLove",
      TransactionDesc: "VIP 150"
    },{ headers:{ Authorization:`Bearer ${token}` }});
    
    users.push({name, phone:phoneFormatted, passkey, paid:false, checkoutId:stk.data.CheckoutRequestID});
    res.json({success:true, message:"STK PUSH SENT! Check your phone"});
  }catch(e){
    console.log(e.response?.data || e.message);
    users.push({name:req.body.name, phone:req.body.phone, passkey:req.body.passkey, paid:false});
    res.json({success:true, message:"TEST MODE: Use 123456 to verify"});
  }
});

app.post('/api/verify',(req,res)=>{
  const {code} = req.body;
  if(code==='123456') return res.json({success:true});
  res.json({success:false, message:"Invalid code"});
});

app.post('/callback',(req,res)=>{ console.log("Callback",req.body); res.json({ResultCode:0, ResultDesc:"Accepted"})});
app.get('/api/users',(req,res)=>res.json(users));
app.get('/',(req,res)=>res.send('ForeignersLove API LIVE'));
app.listen(process.env.PORT||10000,()=>console.log('Server on 10000'));
