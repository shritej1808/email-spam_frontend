// import { useState, useEffect } from "react";
// import { db, auth } from "../firebase";
// import { collection, query, where, getDocs } from "firebase/firestore";

// const Spam = () => {
//   const [spamEmails, setSpamEmails] = useState([]);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchSpamEmails = async () => {
//       try {
//         const user = auth.currentUser;
//         if (!user) {
//           setError("No user logged in");
//           return;
//         }
//         const q = query(
//           collection(db, "emails"),
//           where("recipient", "==", user.email),
//           where("isSpam", "==", true)
//         );
        
//         const querySnapshot = await getDocs(q);
//         const emails = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

//         setSpamEmails(emails);
//       } catch (err) {
//         setError("Error fetching spam emails: " + err.message);
//       }
//     };

//     fetchSpamEmails();
//   }, []);

//   return (
//     <div>
//       <h2>Spam Emails</h2>
//       {error && <p>{error}</p>}
//       <ul>
//         {spamEmails.map((email) => (
//           <li key={email.id}>
//             <strong>From:</strong> {email.from}
//             <br />
//             <strong>Subject:</strong> {email.subject}
//             <br />
//             <strong>Message:</strong> {email.body}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Spam;

import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const Spam = () => {
  const [spamEmails, setSpamEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSpamEmails = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setError("No user is currently logged in. Please log in to view your spam emails.");
          setLoading(false);
          return;
        }

        // Query Firestore to fetch spam emails for the current user
        const q = query(
          collection(db, "emails"),
          where("recipient", "==", user.email),
          where("isSpam", "==", true)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setSpamEmails([]);
          setLoading(false);
          return;
        }

        const emails = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSpamEmails(emails);
      } catch (err) {
        setError("Error fetching spam emails: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSpamEmails();
  }, []);

  return (
    <div className="spam-container">
      <h2>Spam Emails</h2>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="loading-message">Loading spam emails...</p>
      ) : spamEmails.length === 0 ? (
        <p className="no-spam-message">No spam emails found in your mailbox.</p>
      ) : (
        <ul className="spam-email-list">
          {spamEmails.map((email) => (
            <li key={email.id} className="spam-email-item">
              <p>
                <strong>From:</strong> {email.from || "Unknown Sender"}
              </p>
              <p>
                <strong>Subject:</strong> {email.subject || "No Subject"}
              </p>
              <p>
                <strong>Message:</strong> {email.body || "No Content"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Spam;

