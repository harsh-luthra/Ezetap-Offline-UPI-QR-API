require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API running');
});

app.post('/upi/qr/generate', async (req, res) => {

    console.log('EZETAP_USERNAME', process.env.EZETAP_USERNAME);
    console.log('EZETAP_APP_KEY', process.env.EZETAP_APP_KEY);

  try {
    const payload = {
      // accountLabel: "store001",
      amount: req.body.amount,
      externalRefNumber: req.body.externalRefNumber,
      username: process.env.EZETAP_USERNAME,
      appKey: process.env.EZETAP_APP_KEY,
      customerName: req.body.customerName,
      customerMobileNumber: req.body.customerMobileNumber,
      customerEmail: req.body.customerEmail
    };

    const { data } = await axios.post(
      `${process.env.EZETAP_BASE_URL}/api/2.0/merchant/upi/qrcode/generate`,
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
      username: process.env.EZETAP_USERNAME,
      appKey: process.env.EZETAP_APP_KEY,
    //   txnId: req.body.txnId,
      externalRefNumber: req.body.externalRefNumber,
    };

    const { data } = await axios.post(
      `${process.env.EZETAP_BASE_URL}/api/2.0/payment/status`,
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
    username: process.env.EZETAP_USERNAME
  };

  const { data } = await axios.post(
    `${process.env.EZETAP_BASE_URL}/api/2.0/payment/status`,
    payload
  );

  res.json(data);
});


app.post('/upi/stop', async (req, res) => {
  const payload = {
    txnId: req.body.txnId,
    username: process.env.EZETAP_USERNAME,
    appKey: process.env.EZETAP_APP_KEY
  };

  const { data } = await axios.post(
    `${process.env.EZETAP_BASE_URL}/api/2.0/payment/stopPayment`,
    payload
  );

  res.json({ success: true, data });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
