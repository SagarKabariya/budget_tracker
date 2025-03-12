import { db } from "./firebase.js";  // Import Firestore from firebase.js
import { collection, getDocs } from "./firebase-firestore.js";  // Import Firestore functions


async function fetchTransactions() {
    const querySnapshot = await getDocs(collection(db, "transactions"));
    querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
    });
}

fetchTransactions();