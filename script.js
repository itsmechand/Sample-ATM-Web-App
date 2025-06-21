const screenContent = document.getElementById('screenContent');
const inputDisplay = document.getElementById('inputDisplay');
const keypadArea = document.getElementById('keypadArea');
const menuSection = document.getElementById('menuSection');
const welcomeTitle = document.getElementById('welcomeTitle');

// --- State Management ---
let atmState = {
    currentScreen: 'account', // account, pin, menu, withdraw, deposit, etc.
    inputBuffer: '',
    accountNumber: '',
    isAuthenticated: false,
    balance: 0,
    userName: '',
    tempPin: '',
    tempRecipient: ''
};

const demoAccounts = {
    '123456789012': { pin: '1234', balance: 2500.00, name: 'Rebel Star', transactions: [] },
    '123456789022': { pin: '9999', balance: 5000.00, name: 'Mahanati', transactions: [] }
};

// --- Core UI Functions ---
function updateScreen(message) {
    screenContent.innerHTML = message;
}

function updateInputDisplay() {
    let label = '';
    let value = atmState.inputBuffer;
    let isPin = false;

    switch (atmState.currentScreen) {
        case 'account': label = 'Account Number: '; break;
        case 'pin': label = 'PIN: '; isPin = true; break;
        case 'withdrawAmount': label = 'Withdraw Amount: ₹'; break;
        case 'depositAmount': label = 'Deposit Amount: ₹'; break;
        case 'changePinNew': label = 'New PIN: '; isPin = true; break;
        case 'changePinConfirm': label = 'Confirm PIN: '; isPin = true; break;
        case 'transferRecipient': label = 'Recipient Acc: '; break;
        case 'transferAmount': label = 'Transfer Amount: ₹'; break;
    }

    if (isPin) {
        value = '*'.repeat(value.length);
    }
    inputDisplay.innerHTML = label + value;
}

function returnToMenu() {
    atmState.currentScreen = 'menu';
    showMenu();
}

// --- Keypad Handlers ---
function pressKey(key) {
    const isPinField = ['pin', 'changePinNew', 'changePinConfirm'].includes(atmState.currentScreen);
    const isAccountField = ['account', 'transferRecipient'].includes(atmState.currentScreen);

    const maxLength = isPinField ? 4 : (isAccountField ? 12 : 10);

    if (atmState.inputBuffer.length < maxLength) {
        atmState.inputBuffer += key;
        updateInputDisplay();
    }
}

function clearInput() {
    atmState.inputBuffer = '';
    updateInputDisplay();
}

function enterKey() {
    switch (atmState.currentScreen) {
        case 'account': handleAccountEntry(); break;
        case 'pin': handlePinEntry(); break;
        case 'withdrawAmount': processWithdrawal(); break;
        case 'depositAmount': processDeposit(); break;
        case 'changePinNew': processNewPin(); break;
        case 'changePinConfirm': processConfirmPin(); break;
        case 'transferRecipient': processRecipient(); break;
        case 'transferAmount': processTransfer(); break;
    }
}

// --- Authentication ---
function handleAccountEntry() {
    if (atmState.inputBuffer.length !== 12) {
        updateScreen('Account Number must be 12 digits. Please try again.');
        atmState.inputBuffer = '';
        updateInputDisplay();
        return;
    }

    const account = demoAccounts[atmState.inputBuffer];
    if (account) {
        atmState.accountNumber = atmState.inputBuffer;
        atmState.userName = account.name;
        atmState.balance = account.balance;
        atmState.currentScreen = 'pin';
        atmState.inputBuffer = '';
        updateScreen('Please enter your 4-digit PIN.');
    } else {
        updateScreen('Invalid Account Number. Please try again.');
        atmState.inputBuffer = '';
    }
    updateInputDisplay();
}

function handlePinEntry() {
    if (atmState.inputBuffer.length !== 4) {
        updateScreen('PIN must be 4 digits. Please try again.');
        atmState.inputBuffer = '';
        updateInputDisplay();
        return;
    }

    const account = demoAccounts[atmState.accountNumber];
    if (account && account.pin === atmState.inputBuffer) {
        atmState.isAuthenticated = true;
        atmState.currentScreen = 'menu';
        atmState.inputBuffer = '';
        showMenu();
    } else {
        updateScreen('Invalid PIN. Please try again.');
        atmState.inputBuffer = '';
    }
    updateInputDisplay();
}

// --- Menu and Transactions ---
function showMenu() {
    keypadArea.classList.add('hidden');
    menuSection.classList.remove('hidden');
    welcomeTitle.textContent = `Welcome, ${atmState.userName}`;
    updateScreen('Please select a transaction.');
}

function addTransaction(accountNumber, type, amount, status = 'Success') {
    const account = demoAccounts[accountNumber];
    if (account) {
        account.transactions.unshift({
            date: new Date().toLocaleString(),
            type: type,
            amount: amount,
            status: status
        });
        if (account.transactions.length > 10) account.transactions.pop();
    }
}

function showBalanceEnquiry() {
    updateScreen(`Your current balance is: ₹${atmState.balance.toFixed(2)}`);
    addTransaction(atmState.accountNumber, 'Balance Enquiry', atmState.balance);
}

function showWithdraw() {
    atmState.currentScreen = 'withdrawAmount';
    menuSection.classList.add('hidden');
    keypadArea.classList.remove('hidden');
    updateScreen('Please enter the amount to withdraw.');
    atmState.inputBuffer = '';
    updateInputDisplay();
}

function processWithdrawal() {
    const amount = parseFloat(atmState.inputBuffer);
    if (isNaN(amount) || amount <= 0) {
        updateScreen('Invalid amount. Please try again.');
        addTransaction(atmState.accountNumber, 'Withdrawal', amount, 'Invalid Amount');
    } else if (amount > atmState.balance) {
        updateScreen(`Insufficient funds. Your balance is ₹${atmState.balance.toFixed(2)}.`);
        addTransaction(atmState.accountNumber, 'Withdrawal', amount, 'Insufficient Funds');
    } else {
        atmState.balance -= amount;
        demoAccounts[atmState.accountNumber].balance = atmState.balance;
        addTransaction(atmState.accountNumber, 'Withdrawal', amount, 'Success');
        updateScreen(`Successfully withdrew ₹${amount.toFixed(2)}.<br>Your new balance is ₹${atmState.balance.toFixed(2)}.`);
    }
    atmState.inputBuffer = '';
    setTimeout(returnToMenu, 3000);
}

function showDeposit() {
    atmState.currentScreen = 'depositAmount';
    menuSection.classList.add('hidden');
    keypadArea.classList.remove('hidden');
    updateScreen('Please enter the amount to deposit.');
    atmState.inputBuffer = '';
    updateInputDisplay();
}

function processDeposit() {
    const amount = parseFloat(atmState.inputBuffer);
    if (isNaN(amount) || amount <= 0) {
        updateScreen('Invalid amount. Please try again.');
        addTransaction(atmState.accountNumber, 'Deposit', amount, 'Invalid Amount');
    } else {
        atmState.balance += amount;
        demoAccounts[atmState.accountNumber].balance = atmState.balance;
        addTransaction(atmState.accountNumber, 'Deposit', amount, 'Success');
        updateScreen(`Successfully deposited ₹${amount.toFixed(2)}.<br>Your new balance is ₹${atmState.balance.toFixed(2)}.`);
    }
    atmState.inputBuffer = '';
    setTimeout(returnToMenu, 3000);
}

function showTransactionHistory() {
    const transactions = demoAccounts[atmState.accountNumber].transactions;
    if (transactions.length === 0) {
        updateScreen('You have no transactions yet.');
        return;
    }

    let historyHtml = '<div style="text-align: left; font-size: 0.8em; line-height: 1.6;">';
    historyHtml += '<strong>Transaction History (Last 10)</strong><br><hr>';
    transactions.forEach(tx => {
        const amountStr = tx.type === 'Balance Enquiry' ? '' : `: ₹${tx.amount.toFixed(2)}`;
        historyHtml += `&bull; ${tx.date} - ${tx.type}${amountStr} (${tx.status})<br>`;
    });
    historyHtml += '</div>';

    updateScreen(historyHtml);
}

function showChangePin() {
    atmState.currentScreen = 'changePinNew';
    menuSection.classList.add('hidden');
    keypadArea.classList.remove('hidden');
    updateScreen('Please enter your new 4-digit PIN.');
    atmState.inputBuffer = '';
    updateInputDisplay();
}

function processNewPin() {
    if (atmState.inputBuffer.length !== 4) {
        updateScreen('PIN must be 4 digits. Please try again.');
        atmState.inputBuffer = '';
        updateInputDisplay();
        return;
    }
    atmState.tempPin = atmState.inputBuffer;
    atmState.currentScreen = 'changePinConfirm';
    atmState.inputBuffer = '';
    updateScreen('Please confirm your new PIN.');
    updateInputDisplay();
}

function processConfirmPin() {
    if (atmState.inputBuffer !== atmState.tempPin) {
        updateScreen('PINs do not match. Please start over.');
        addTransaction(atmState.accountNumber, 'Change PIN', 0, 'Failed - Mismatch');
    } else {
        demoAccounts[atmState.accountNumber].pin = atmState.tempPin;
        updateScreen('PIN changed successfully.');
        addTransaction(atmState.accountNumber, 'Change PIN', 0, 'Success');
    }
    atmState.inputBuffer = '';
    atmState.tempPin = '';
    setTimeout(returnToMenu, 3000);
}

function showMoneyTransfer() {
    atmState.currentScreen = 'transferRecipient';
    menuSection.classList.add('hidden');
    keypadArea.classList.remove('hidden');
    updateScreen('Enter 12-digit account number of the recipient.');
    atmState.inputBuffer = '';
    updateInputDisplay();
}

function processRecipient() {
    const recipientAccNum = atmState.inputBuffer;
    if (recipientAccNum.length !== 12) {
        updateScreen('Recipient account number must be 12 digits.');
        atmState.inputBuffer = '';
        updateInputDisplay();
        return;
    }
    if (recipientAccNum === atmState.accountNumber) {
        updateScreen('You cannot transfer money to your own account.');
        atmState.inputBuffer = '';
        updateInputDisplay();
        return;
    }
    if (!demoAccounts[recipientAccNum]) {
        updateScreen('Recipient account not found. Please try again.');
        atmState.inputBuffer = '';
        updateInputDisplay();
        return;
    }

    atmState.tempRecipient = recipientAccNum;
    atmState.currentScreen = 'transferAmount';
    atmState.inputBuffer = '';
    updateScreen(`Transfer to ${demoAccounts[recipientAccNum].name}.<br>Enter amount to transfer.`);
    updateInputDisplay();
}

function processTransfer() {
    const amount = parseFloat(atmState.inputBuffer);
    const recipientAccNum = atmState.tempRecipient;

    if (isNaN(amount) || amount <= 0) {
        updateScreen('Invalid amount.');
        addTransaction(atmState.accountNumber, `Transfer to ${recipientAccNum}`, amount, 'Invalid Amount');
    } else if (amount > atmState.balance) {
        updateScreen(`Insufficient funds. Your balance is ₹${atmState.balance.toFixed(2)}.`);
        addTransaction(atmState.accountNumber, `Transfer to ${recipientAccNum}`, amount, 'Insufficient Funds');
    } else {
        // Debit sender
        atmState.balance -= amount;
        demoAccounts[atmState.accountNumber].balance = atmState.balance;
        addTransaction(atmState.accountNumber, `Transfer to ${recipientAccNum}`, amount, 'Success');

        // Credit recipient
        demoAccounts[recipientAccNum].balance += amount;
        addTransaction(recipientAccNum, `Transfer from ${atmState.accountNumber}`, amount, 'Success');

        updateScreen(`Successfully transferred ₹${amount.toFixed(2)} to ${demoAccounts[recipientAccNum].name}.<br>Your new balance is ₹${atmState.balance.toFixed(2)}.`);
    }

    atmState.inputBuffer = '';
    atmState.tempRecipient = '';
    setTimeout(returnToMenu, 3000);
}

function showUserRegistration() {
    const newAccountNumber = String(Math.floor(100000000000 + Math.random() * 900000000000));
    const newPin = String(Math.floor(1000 + Math.random() * 9000));
    const newName = 'New User';

    demoAccounts[newAccountNumber] = { pin: newPin, balance: 0, name: newName, transactions: [] };

    updateScreen(`New Account Created!<br><br>Name: ${newName}<br>Account: ${newAccountNumber}<br>PIN: ${newPin}<br><br>Please keep these details safe.`);
    // No transaction log for this as it's not tied to the logged-in user
    setTimeout(returnToMenu, 7000);
}

function showPinGeneration() {
    const currentPin = demoAccounts[atmState.accountNumber].pin;
    updateScreen(`For security reasons, this feature is disabled.<br>However, for demo purposes, your PIN is: ${currentPin}`);
    addTransaction(atmState.accountNumber, 'PIN Reminder', 0, 'Success');
    setTimeout(returnToMenu, 5000);
}

function exitATM() {
    menuSection.classList.add('hidden');
    keypadArea.classList.add('hidden');
    welcomeTitle.textContent = 'WELCOME TO SBI ATM';
    updateScreen('<div style="font-size:1.3em; margin: 40px 0;">Thank you for using SBI ATM!<br>Have a great day!</div>');
    setTimeout(resetATM, 4000);
}

function resetATM() {
    atmState = {
        currentScreen: 'account',
        inputBuffer: '',
        accountNumber: '',
        isAuthenticated: false,
        balance: 0,
        userName: '',
        tempPin: '',
        tempRecipient: ''
    };
    welcomeTitle.textContent = 'WELCOME TO SBI ATM';
    updateScreen('Please Enter Your 12-digit Account Number to begin.');
    menuSection.classList.add('hidden');
    keypadArea.classList.remove('hidden');
    updateInputDisplay();
} 