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

const calendarElement = document.getElementById("calendar");
const balanceElement = document.getElementById("balance");
const transactionList = document.getElementById("transactionList");
const selectedDateElement = document.getElementById("selectedDate");
const monthYearElement = document.getElementById("monthYear");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");
const mainFab = document.getElementById("mainFab");
const fabMenu = document.getElementById("fabMenu");
const addTransactionBtn = document.getElementById("addTransaction");
const recurringTransactionBtn = document.getElementById("recurringTransaction");

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let recurringTransactions = [];
function updateMonthYearDisplay() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearElement.innerText = monthNames[currentMonth] + " " + currentYear;
}

export async function fetchRecurringTransactions() {
    recurringTransactions = [];
    try {
        const querySnapshot = await getDocs(collection(db, "recurring_transactions"));
        querySnapshot.forEach(doc => {
            recurringTransactions.push(doc.data());
        });
    } catch (error) {
        console.error("Error fetching recurring transactions:", error);
    }
}

export function generateCalendar(year, month) {
    calendarElement.innerHTML = "";
    updateMonthYearDisplay();

    let firstDay = new Date(year, month, 1).getDay();
    let daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarHTML = '<table><tr>';
    let days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    days.forEach(day => calendarHTML += `<th>${day}</th>`);
    calendarHTML += '</tr><tr>';

    for (let i = 0; i < firstDay; i++) {
        calendarHTML += "<td></td>";
    }

    for (let day = 1; day <= daysInMonth; day++) {
        let dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        let estimatedBalance = calculateFutureBalance(year, month, day);

        calendarHTML += `<td class="calendar-day" data-date="${dateKey}">${day} <br> <span class="balance">$${estimatedBalance.toFixed(2)}</span></td>`;

        if ((day + firstDay) % 7 === 0) {
            calendarHTML += "</tr><tr>";
        }
    }

    calendarHTML += "</tr></table>";
    calendarElement.innerHTML = calendarHTML;

    document.querySelectorAll(".calendar-day").forEach(day => {
        day.addEventListener("click", function () {
            let selectedDate = this.getAttribute("data-date");
            selectedDateElement.innerText = selectedDate;
            fetchTransactions(selectedDate);
        });
    });
}

function calculateFutureBalance(year, month, day) {
    let balance = 0;
    let dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    recurringTransactions.forEach(tx => {
        let txDate = new Date(tx.startDate);
        let txYear = txDate.getFullYear();
        let txMonth = txDate.getMonth();
        let txDay = txDate.getDate();

        if (txYear <= year && (txMonth < month || (txMonth === month && txDay <= day))) {
            if (tx.interval === "monthly" && txDay <= day) {
                balance += tx.amount;
            } else if (tx.interval === "weekly") {
                let daysBetween = Math.floor((new Date(year, month, day) - txDate) / (1000 * 60 * 60 * 24));
                if (daysBetween % 7 === 0) {
                    balance += tx.amount;
                }
            } else if (tx.interval === "yearly" && txMonth === month && txDay === day) {
                balance += tx.amount;
            }
        }
    });

    return balance;
}

export async function fetchTransactions(date) {
    transactionList.innerHTML = "<li>Loading...</li>";

    try {
        const q = query(collection(db, "transactions"), where("date", "==", date));
        const querySnapshot = await getDocs(q);

        transactionList.innerHTML = "";
        let totalBalance = 0;

        if (querySnapshot.empty) {
            transactionList.innerHTML = "<li>No transactions</li>";
        } else {
            querySnapshot.forEach(docSnapshot => {
                let data = docSnapshot.data();
                let txElement = document.createElement("li");
                txElement.innerHTML = `${data.type} : ${data.description}: $${data.amount} 
                        <button class="edit-btn" data-id="${docSnapshot.id}">✏️</button> 
                        <button class="delete-btn" data-id="${docSnapshot.id}">🗑️</button>`;

                transactionList.appendChild(txElement);

                totalBalance += data.amount;
            });

            document.querySelectorAll(".edit-btn").forEach(button => {
                button.addEventListener("click", function () {
                    editTransaction(this.getAttribute("data-id"));
                });
            });

            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", function () {
                    deleteTransaction(this.getAttribute("data-id"));
                });
            });
        }

        balanceElement.innerText = `$${totalBalance.toFixed(2)}`;
    } catch (error) {
        console.error("Error fetching transactions: ", error);
        transactionList.innerHTML = "<li>Error loading transactions</li>";
    }
}
export async function editTransaction(transactionId) {
    let newAmount = prompt("Enter new amount:");
    let newDescription = prompt("Enter new description:");

    if (newAmount && newDescription) {
        const transactionRef = doc(db, "transactions", transactionId);
        try {
            await updateDoc(transactionRef, {
                amount: parseFloat(newAmount),
                description: newDescription
            });
            alert("Transaction updated successfully!");
            fetchTransactions(selectedDateElement.innerText);
        } catch (error) {
            console.error("Error updating transaction: ", error);
        }
    }
}

export async function deleteTransaction(transactionId) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        const transactionRef = doc(db, "transactions", transactionId);
        try {
            await deleteDoc(transactionRef);
            alert("Transaction deleted successfully!");
            fetchTransactions(selectedDateElement.innerText);
        } catch (error) {
            console.error("Error deleting transaction: ", error);
        }
    }
}
prevMonthButton.addEventListener("click", function () {
    currentMonth -= 1;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear -= 1;
    }
    generateCalendar(currentYear, currentMonth);
});

nextMonthButton.addEventListener("click", function () {
    currentMonth += 1;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear += 1;
    }
    generateCalendar(currentYear, currentMonth);
});

mainFab.addEventListener("click", function () {
    fabMenu.classList.toggle("hidden");
});

addTransactionBtn.addEventListener("click", function () {
    window.location.href = "add_transaction.html";
});

recurringTransactionBtn.addEventListener("click", function () {
    window.location.href = "add_recurring_transaction.html";
});

fetchRecurringTransactions().then(() => {
    generateCalendar(currentYear, currentMonth);
});