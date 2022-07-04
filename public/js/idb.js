let db;

const request = indexedDB.open("Budget_Trackerdb", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("create_transaction", {autoIncrement: true});
};

request.onsuccess = function (event) {
    db = event.target.result
    if (navigator.onLine) {
        checkDatabase();
    }
}

function saveRecord(record) {
    const transaction = db.transaction(['create_transaction'], 'readwrite');

    const  budgetObjectStore = transaction.objectStore('create_transaction');

    budgetObjectStore.add(record);
};

function createTransaction() {

    const transaction = db.transaction(['create_transaction'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('create_transaction');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {

        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['create_transaction'], 'readwrite');

                    const budgetObjectStore = transaction.objectStore('create_transaction');

                    budgetObjectStore.clear();

                    alert('Save Complete, All Transactions Have Been Safely Stored');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

window.addEventListener('online', uploadTransaction);