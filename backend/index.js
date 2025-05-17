require('dotenv').config(); // Must be FIRST

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;

if (!SLACK_TOKEN) {
  console.error('❌ SLACK_BOT_TOKEN is not defined. Check your .env file.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${SLACK_TOKEN}`
};

// Fetch users
app.get('/api/users', async (req, res) => {
  try {
    const result = await axios.get('https://slack.com/api/users.list', { headers });
    if (!result.data.ok) return res.status(400).json({ error: result.data.error });

    const users = result.data.members
      .filter(u => !u.is_bot && u.id !== 'USLACKBOT')
      .map(u => ({ id: u.id, name: u.real_name || u.name }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch channels
app.get('/api/channels', async (req, res) => {
  try {
    const result = await axios.get('https://slack.com/api/conversations.list?types=public_channel', { headers });
    if (!result.data.ok) return res.status(400).json({ error: result.data.error });

    const channels = result.data.channels.map(c => ({ id: c.id, name: c.name }));
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send message
app.post('/api/send', async (req, res) => {
  const { message, channel } = req.body;

  // Debug log
  console.log("🟡 Sending message:", message);
  console.log("🟡 To channel:", channel);

  if (!message || !channel) {
    console.error("❌ Missing message or channel in request.");
    return res.status(400).json({ error: "Missing message or channel" });
  }

  try {
    const response = await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel,
        text: message
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("🟢 Slack API Response:", response.data);

    if (!response.data.ok) {
      console.error("❌ Slack Error:", response.data.error);
      return res.status(400).json({ error: response.data.error });
    }

    res.json(response.data);

  } catch (error) {
    console.error("❌ Server crash error:");
    console.error(error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || "Unknown server error"
    });
  }
});




app.listen(5000, () => console.log('✅ Server running on http://localhost:5000'));
