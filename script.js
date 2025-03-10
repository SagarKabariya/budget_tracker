document.addEventListener("DOMContentLoaded", function () {
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

   function updateMonthYearDisplay() {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthYearElement.innerText = monthNames[currentMonth] + " " + currentYear;
    }

    function generateCalendar(year, month) {
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
            calendarHTML += `<td class="calendar-day" data-date="${dateKey}">${day}</td>`;
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

    function fetchTransactions(date) {
        transactionList.innerHTML = "<li>Loading...</li>";
        db.collection("transactions")
            .where("date", "==", date)
            .get()
            .then(snapshot => {
                transactionList.innerHTML = "";
                let totalBalance = 0;
                if (snapshot.empty) {
                    transactionList.innerHTML = "<li>No transactions</li>";
                } else {
                    snapshot.forEach(doc => {
                        let data = doc.data();
                        let txElement = document.createElement("li");
                        txElement.innerText = `${data.description}: $${data.amount}`;
                        transactionList.appendChild(txElement);
                        totalBalance += data.amount;
                    });
                }
                balanceElement.innerText = `$${totalBalance.toFixed(2)}`;
            })
            .catch(error => {
                console.error("Error fetching transactions: ", error);
                transactionList.innerHTML = "<li>Error loading transactions</li>";
            });
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

    generateCalendar(currentYear, currentMonth);
});
