import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addDoc, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const CreateMail = () => {
  const { user } = useAuth();
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if recipient exists in the users collection
  const checkRecipientExists = async (recipientEmail) => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', recipientEmail));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty; // Return true if recipient exists
    } catch (error) {
      console.error('Error checking recipient existence:', error);
      return false;
    }
  };

  // Add recipient to the users collection if they don't exist
  const addRecipientToUsers = async (recipientEmail) => {
    try {
      const userRef = doc(db, 'users', recipientEmail);
      await setDoc(userRef, { email: recipientEmail });
      console.log('Recipient added to users collection');
    } catch (error) {
      console.error('Error adding recipient:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!recipient || !subject || !body) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (!user) {
      setErrorMessage('You need to be logged in to send an email.');
      return;
    }

    const senderEmail = user.email;

    // Check if recipient exists; if not, add them
    const recipientExists = await checkRecipientExists(recipient);
    if (!recipientExists) {
      await addRecipientToUsers(recipient); // Add recipient to users collection
    }

    try {
      await addDoc(collection(db, 'emails'), {
        recipient,
        subject,
        body,
        sender: senderEmail,
        isSpam: false,
        timestamp: new Date(),
      });
      alert('Email sent successfully!');
    } catch (error) {
      setErrorMessage('Error sending email: ' + error.message);
    }
  };

  return (
    <div className="create-mail-container">
      <h2>Create New Mail</h2>
      <form className="create-mail-form">
        <div className="form-group">
          <label className="input-label" htmlFor="recipient">To</label>
          <input
            type="email"
            id="recipient"
            placeholder="Recipient's Email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="input-label" htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="input-label" htmlFor="body">Body</label>
          <textarea
            id="body"
            placeholder="Email Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="button" onClick={handleSendEmail}>Send Email</button>
      </form>
    </div>
  );
};

export default CreateMail;
