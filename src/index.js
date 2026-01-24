require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// For Production
const BASE_URL = process.env.EZETAP_PROD_BASE_URL;
const USERNAME = process.env.EZETAP_PROD_USERNAME;
const APP_KEY = process.env.EZETAP_PROD_APP_KEY;

// For Demo
// const BASE_URL = process.env.EZETAP_DEMO_BASE_URL;
// const USERNAME = process.env.EZETAP_DEMO_USERNAME;
// const APP_KEY = process.env.EZETAP_DEMO_APP_KEY;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API running');
});

app.post('/upi/qr/generate', async (req, res) => {

  console.log('EZETAP_USERNAME', USERNAME);
  console.log('EZETAP_APP_KEY', APP_KEY);

  try {
    const payload = {
      accountLabel: "Pabesto_01_A",
      amount: req.body.amount,
      externalRefNumber: req.body.externalRefNumber,
      username: USERNAME,
      appKey: APP_KEY,
      customerName: req.body.customerName,
      customerMobileNumber: req.body.customerMobileNumber,
      customerEmail: req.body.customerEmail
    };

    console.log(payload);

    const { data } = await axios.post(
      `${BASE_URL}/api/2.0/merchant/upi/qrcode/generate`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log(data);

    res.json({
      success: true,
      txnId: data.txnId,
      qrString: data.qrCode || data.qrData,
      amount: data.amount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

//260107154426374E632018309

app.post('/upi/status', async (req, res) => {
  try {
    const payload = {
      username: USERNAME,
      appKey: APP_KEY,
      //   txnId: req.body.txnId,
      externalRefNumber: req.body.externalRefNumber,
    };

    const { data } = await axios.post(
      `${BASE_URL}/api/2.0/payment/status`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log(data);
    console.log(data.rrNumber);

    res.json({
      success: true,
      status: data.status,
      rrn: data.rrNumber,
      settlementStatus: data.settlementStatus
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


app.get('/upi/status/:txnId', async (req, res) => {
  const payload = {
    txnId: req.params.txnId,
    username: USERNAME
  };

  const { data } = await axios.post(
    `${BASE_URL}/api/2.0/payment/status`,
    payload
  );

  res.json(data);
});


app.post('/upi/stop', async (req, res) => {
  const payload = {
    txnId: req.body.txnId,
    username: USERNAME,
    appKey: APP_KEY
  };

  const { data } = await axios.post(
    `${BASE_URL}/api/2.0/payment/stopPayment`,
    payload
  );

  res.json({ success: true, data });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
