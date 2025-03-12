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
// Go back to previous page
function goBack() {
    window.history.back();
}

// Save a recurring transaction
export async function saveRecurringTransaction() {
    let description = document.getElementById("description").value;
    let amount = parseFloat(document.getElementById("amount").value);
    let type = document.getElementById("transactionType").checked ? "Income" : "Expense";
    let startDate = document.getElementById("startDate").value;
    let interval = document.getElementById("interval").value;

    if (!description || isNaN(amount) || !startDate || !interval) {
        alert("Please fill all fields.");
        return;
    }

    try {
        await addDoc(collection(db, "recurring_transactions"), {
            description: description,
            amount: type === "Expense" ? -amount : amount,
            type: type,
            startDate: startDate,
            interval: interval
        });

        alert("Recurring transaction saved!");
        goBack();
    } catch (error) {
        console.error("Error saving recurring transaction: ", error);
    }
}

// Ensure function is accessible globally
window.saveRecurringTransaction = saveRecurringTransaction;
