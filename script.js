// Check if the browser supports the Web Storage API
if (typeof(Storage) === "undefined") {
    alert('Local storage is not supported by your browser. Data will not be saved.');
}

let transactions = JSON.parse(localStorage.getItem('transactions')) || []; // Array to store transactions

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadTransactions() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                transactions = JSON.parse(event.target.result);
                saveTransactions();
                updateTable();
            } catch (error) {
                alert('Error parsing JSON file.');
            }
        };
        reader.readAsText(file);
    } else {
        alert('Please select a JSON file.');
    }
}

function addEntry() {
    const fecha = document.getElementById('fecha').value;
    const quienPago = document.getElementById('quienPago').value;
    const aFavorDe = document.getElementById('aFavorDe').value;
    const descripcion = document.getElementById('descripcion').value;
    const monto = parseFloat(document.getElementById('monto').value);

    if (!fecha || !quienPago || !aFavorDe || !descripcion || isNaN(monto)) {
        alert('Please fill in all fields.');
        return;
    }

    const newTransaction = {
        fecha: fecha,
        quienPago: quienPago,
        aFavorDe: aFavorDe,
        descripcion: descripcion,
        monto: monto
    };

    transactions.push(newTransaction); // Add to transactions array
    saveTransactions(); // Save to local storage
    updateTable(); // Update the table with the new data
    clearForm(); // Clear the form
}

function updateTable() {
    const tableBody = document.getElementById('transactionTableBody');
    tableBody.innerHTML = ''; // Clear existing table rows

    let saldoAgustin = 0;
    let saldoPietro = 0;

    const currency = document.getElementById('currency').value;

    transactions.forEach((transaction, index) => {
        const newRow = tableBody.insertRow();
        const fechaCell = newRow.insertCell(0);
        const quienPagoCell = newRow.insertCell(1);
        const aFavorDeCell = newRow.insertCell(2);
        const descripcionCell = newRow.insertCell(3);
        const montoCell = newRow.insertCell(4);
        const saldoAgustinCell = newRow.insertCell(5);
        const saldoPietroCell = newRow.insertCell(6);
        const actionsCell = newRow.insertCell(7);

        // Format the date to show month name
        const date = new Date(transaction.fecha);
        const monthName = date.toLocaleString('default', { month: 'long' });
        const day = date.getDate();
        fechaCell.innerHTML = `${monthName.substring(0,3)} ${day}`;

        quienPagoCell.innerHTML = transaction.quienPago;
        aFavorDeCell.innerHTML = transaction.aFavorDe;
        descripcionCell.innerHTML = transaction.descripcion;
        montoCell.innerHTML = transaction.monto.toFixed(2) + ' ' + getCurrencySymbol(currency);

        if (transaction.quienPago === document.getElementById('name1').value && transaction.aFavorDe === document.getElementById('name2').value) {
            saldoAgustin -= transaction.monto;
            saldoPietro += transaction.monto
        } else if (transaction.quienPago === document.getElementById('name2').value && transaction.aFavorDe === document.getElementById('name1').value) {
            saldoAgustin += transaction.monto;
            saldoPietro -= transaction.monto;
        }

        saldoAgustinCell.innerHTML = getCurrencySymbol(currency) + ' ' + (saldoAgustin >= 0 ? '+' : '') + saldoAgustin.toFixed(2);
        saldoPietroCell.innerHTML = getCurrencySymbol(currency) + ' ' + (saldoPietro >= 0 ? '+' : '') + saldoPietro.toFixed(2);

        if (saldoAgustin < 0) {
            saldoAgustinCell.style.color = 'red';
        } else {
            saldoAgustinCell.style.color = ''; // Reset color if positive
        }

        if (saldoPietro < 0) {
            saldoPietroCell.style.color = 'red';
        } else {
            saldoPietroCell.style.color = ''; // Reset color if positive
        }

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'Eliminar';
        deleteButton.classList.add('deleteButton');
        deleteButton.onclick = () => deleteEntry(index);
        actionsCell.appendChild(deleteButton);

        // Set data-column-name attributes for responsive table
        fechaCell.setAttribute('data-column-name', 'Fecha');
        quienPagoCell.setAttribute('data-column-name', 'Quién pagó');
        aFavorDeCell.setAttribute('data-column-name', 'A favor de');
        descripcionCell.setAttribute('data-column-name', 'Descripción');
        montoCell.setAttribute('data-column-name', 'Monto');
        saldoAgustinCell.setAttribute('data-column-name', 'Saldo Agustín');
        saldoPietroCell.setAttribute('data-column-name', 'Saldo Pietro');
        actionsCell.setAttribute('data-column-name', 'Acciones');
    });

    // Add the "Balance Final" row
    const balanceFinalRow = tableBody.insertRow();
    const balanceFinalTextCell = balanceFinalRow.insertCell(0);
    balanceFinalTextCell.colSpan = 4;
    balanceFinalTextCell.innerHTML = 'Balance Final';
    const montoFinalCell = balanceFinalRow.insertCell(1);
    montoFinalCell.innerHTML = '-';
    const saldoAgustinFinalCell = balanceFinalRow.insertCell(2);
    saldoAgustinFinalCell.innerHTML =  getCurrencySymbol(currency) + ' ' + (saldoAgustin >= 0 ? '+' : '') + saldoAgustin.toFixed(2);
    const saldoPietroFinalCell = balanceFinalRow.insertCell(3);
    saldoPietroFinalCell.innerHTML = getCurrencySymbol(currency) + ' ' + (saldoPietro >= 0 ? '+' : '') + saldoPietro.toFixed(2);

    if (saldoAgustin < 0) {
        saldoAgustinFinalCell.style.color = 'red';
    } else {
        saldoAgustinFinalCell.style.color = ''; // Reset color if positive
    }

    if (saldoPietro < 0) {
        saldoPietroFinalCell.style.color = 'red';
    } else {
        saldoPietroFinalCell.style.color = ''; // Reset color if positive
    }

    balanceFinalTextCell.style.textAlign = "right"; 
    montoFinalCell.style.textAlign = "right";            

    // Set data-column-name attributes for responsive table
    balanceFinalTextCell.setAttribute('data-column-name', '');
    montoFinalCell.setAttribute('data-column-name', '');
    saldoAgustinFinalCell.setAttribute('data-column-name', 'Saldo Agustín');
    saldoPietroFinalCell.setAttribute('data-column-name', 'Saldo Pietro');
}

function clearForm() {
    document.getElementById('fecha').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('monto').value = '';
}

function downloadHtml() {
    // Convert transactions to JSON
    const json = JSON.stringify(transactions);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Generate filename based on current date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // January is 0!
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    a.download = `shared_account_data_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function calculateBalances(transactions, currentIndex) {
    let saldoAgustin = 0;
    let saldoPietro = 0;

    for (let i = 0; i <= currentIndex; i++) {
        const transaction = transactions[i];
        if (transaction.quienPago === 'Agustín' && transaction.aFavorDe === 'Pietro') {
            saldoAgustin -= transaction.monto;
            saldoPietro += transaction.monto;
        } else if (transaction.quienPago === 'Pietro' && transaction.aFavorDe === 'Agustín') {
            saldoAgustin += transaction.monto;
            saldoPietro -= transaction.monto;
        }
    }

    return [saldoAgustin, saldoPietro];
}

function createDeleteButton(index) {
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Eliminar';
    deleteButton.classList.add('deleteButton');
    deleteButton.onclick = () => deleteEntry(index);
    return deleteButton;
}

function deleteEntry(index) {
    if (confirm('Are you sure you want to delete this entry?')) {
        transactions.splice(index, 1);
        saveTransactions();
        updateTable();
    }
}

function clearAllEntries() {
    if (confirm('Are you sure you want to clear all entries?')) {
        transactions = [];
        saveTransactions();
        updateTable();
    }
}

function updateAFavorDe() {
    const quienPago = document.getElementById('quienPago').value;
    const aFavorDe = document.getElementById('aFavorDe');

    if (quienPago === document.getElementById('name1').value) {
        aFavorDe.value = document.getElementById('name2').value;
    } else {
        aFavorDe.value = document.getElementById('name1').value;
    }
}

function updateNames() {
    const name1 = document.getElementById('name1').value;
    const name2 = document.getElementById('name2').value;
    const currency = document.getElementById('currency').value;

    document.getElementById('participant1').innerText = name1;
    document.getElementById('participant2').innerText = name2;

    // Update options in "Quién pagó" select
    document.getElementById('quienPago1').innerText = name1;
    document.getElementById('quienPago1').value = name1;
    document.getElementById('quienPago2').innerText = name2;
    document.getElementById('quienPago2').value = name2;

    // Update options in "A favor de" select (if needed immediately)
    const aFavorDe = document.getElementById('aFavorDe');
    aFavorDe.innerHTML = `<option value="${name2}">${name2}</option><option value="${name1}">${name1}</option>`;

    // Update title
    document.getElementById('participant1Title').innerText = name1;
    document.getElementById('participant2Title').innerText = name2;

    updateTable();
    updateAFavorDe();
}

function updateCurrency() {
    updateTable();
}

function getCurrencySymbol(currency) {
    if (currency === 'EUR') {
        return '€';
    } else if (currency === 'USD') {
        return '$';
    }
    return currency; // Default to currency code if symbol not found
}

async function saveTransactionsOnline() {
    const data = {
        transactions: transactions,
        name1: document.getElementById('name1').value,
        name2: document.getElementById('name2').value,
        currency: document.getElementById('currency').value
    };

    try {
        const response = await fetch('https://api.npoint.io/v1/your_unique_endpoint', { // Replace with your actual endpoint
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Transactions saved online successfully!');
        } else {
            alert('Failed to save transactions online.');
        }
    } catch (error) {
        console.error('Error saving transactions:', error);
        alert('An error occurred while saving transactions online.');
    }
}

// Initial data load (if any)
window.onload = () => {
    updateTable();
};