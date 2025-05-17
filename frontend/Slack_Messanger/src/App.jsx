import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const API = axios.create({ baseURL: 'http://localhost:5000/api' });


   useEffect(() => {
  API.get('/channels')
    .then(res => {
      console.log('Channels response:', res.data);
      setChannels(res.data.channels || res.data); // adjust based on backend response
    })
    .catch(err => console.error('Error loading channels:', err));

  API.get('/users')
    .then(res => {
      console.log('Users response:', res.data);
      setUsers(res.data.members || res.data); // adjust based on backend response
    })
    .catch(err => console.error('Error loading users:', err));
}, []);



 const handleSend = async () => {
  if (!message || !selectedChannel || !selectedUser) {
    alert('Please select a user and channel and write a message.');
    return;
  }

  try {
    const response = await API.post('/send', {
      message: `<@${selectedUser}> ${message}`,
      channel: selectedChannel
    });

    console.log('✅ Message sent:', response.data);
    alert('Message sent!');
    setMessage('');
  } catch (error) {
    console.error('❌ Failed to send message:', error);
    alert(`Failed to send message: ${error.message}`);
  }
};


  return (
    <>
       <div style={{ padding: 20, maxWidth: 600, margin: 'auto' }}>
      <h1>Slack Messenger</h1>

      <textarea
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        style={{ width: '100%' }}
      />
<select onChange={e => setSelectedUser(e.target.value)} value={selectedUser}>
  <option value="">Select User</option>
  {Array.isArray(users) && users.map(user => (
    <option key={user.id} value={user.id}>{user.name}</option>
  ))}
</select>

<select onChange={e => setSelectedChannel(e.target.value)} value={selectedChannel}>
  <option value="">Select Channel</option>
  {Array.isArray(channels) && channels.map(channel => (
    <option key={channel.id} value={channel.id}>#{channel.name}</option>
  ))}
</select>


      <button onClick={handleSend} style={{ marginTop: 10 }}>
        Send
      </button>
    </div>
    </>
  )
}

export default App
