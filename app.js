/* --- Firebase init --- */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* --- DOM --- */
const app = document.getElementById("app");
const input = document.querySelector("#chat input");
const sendBtn = document.querySelector("#chat button");
const chat = document.getElementById("chat");

/* --- State --- */
let currentDialog = "global";

/* --- Send message --- */
function sendMessage(text) {
  if (!text.trim()) return;

  db.collection("dialogs")
    .doc(currentDialog)
    .collection("messages")
    .add({
      text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

  input.value = "";
}

/* --- Input events --- */
sendBtn.addEventListener("click", () => {
  sendMessage(input.value);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage(input.value);
  }
});

/* --- Listen messages --- */
db.collection("dialogs")
  .doc(currentDialog)
  .collection("messages")
  .orderBy("createdAt")
  .onSnapshot((snapshot) => {
    renderMessages(snapshot.docs);
  });

/* --- Render --- */
function renderMessages(docs) {
  chat.querySelectorAll(".msg").forEach(n => n.remove());

  docs.forEach(doc => {
    const div = document.createElement("div");
    div.className = "msg";
    div.textContent = doc.data().text;
    chat.prepend(div);
  });
}

/* --- Default state --- */
app.dataset.state = "chat";
