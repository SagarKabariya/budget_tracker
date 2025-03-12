import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyC49uyxoesQ8lV1_LWZ_37bSKYmpygQxco",
    authDomain: "easybudget-d728d.firebaseapp.com",
    projectId: "easybudget-d728d",
    storageBucket: "easybudget-d728d.firebasestorage.app",
    messagingSenderId: "347678442675",
    appId: "1:347678442675:web:dbc76959e35dbff8c89cc6",
    measurementId: "G-SPE5GKFJFQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveTransaction() {
    let description = document.getElementById("description").value;
    let amount = parseFloat(document.getElementById("amount").value);
    let type = document.getElementById("transactionType").checked ? "Income" : "Expense";
    let date = document.getElementById("date").value;

    if (!description || isNaN(amount) || !date) {
        alert("Please fill all fields.");
        return;
    }

    try {
        await addDoc(collection(db, "transactions"), {
            description: description,
            amount: type === "Expense" ? -amount : amount,
            type: type,
            date: date
        });

        alert("Transaction saved!");
        window.history.back();
    } catch (error) {
        console.error("Error saving transaction: ", error);
    }
}

// Ensure function is accessible globally
window.saveTransaction = saveTransaction;
