// Function to initialize the table with data from sessionStorage
function initializeTableFromSessionStorage() {
    let existingData = JSON.parse(sessionStorage.getItem('mergedData')) || [];
    displayDataInTable(existingData);
}

// Display the table when the page loads
window.addEventListener('load', initializeTableFromSessionStorage);
document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault();

    let fileInput = document.getElementById('fileInput');
    let file = fileInput.files[0];

    if (!file) {
        console.error('No file selected.');
        return;
    }

    let reader = new FileReader();

    reader.onload = function (event) {
        let result = event.target.result;
        let lines = result.split('\n'); // Split the CSV data into lines
        let csvData = [];

        // Generate unique IDs for each entry
        let existingData = JSON.parse(sessionStorage.getItem('mergedData')) || [];
        let idCounter = existingData.length > 0 ? Math.max(...existingData.map(item => item.id)) + 1 : 1;

        // Skip the first line (header) and convert the remaining lines to JSON
        for (let i = 1; i < lines.length; i++) {
            let fields = lines[i].split(',');
            let name = fields[0].trim();
            let subject = fields[1].trim();
            let id = idCounter++; // Increment ID counter
            csvData.push({ id, name, subject });
        }

        // Read the existing data from sessionStorage
        let existingSessionData = JSON.parse(sessionStorage.getItem('mergedData')) || [];
        console.log('Previous JSON:', existingSessionData);

        // Merge new CSV data with existing session data, avoiding duplicates
        let mergedData = mergeData(existingSessionData, csvData);

        console.log('Updated JSON:', mergedData);

        // Save merged data to sessionStorage
        sessionStorage.setItem('mergedData', JSON.stringify(mergedData));

        // Display the data in a table
        displayDataInTable(mergedData);

        // Show alert prompt for successful upload
        alert('File uploaded successfully!');
    };

    reader.readAsText(file);
});

document.getElementById('addDataForm').addEventListener('submit', function (event) {
    event.preventDefault();

    let name = document.getElementById('name').value.trim();
    let subject = document.getElementById('subject').value.trim();

    if (!name || !subject) {
        alert('Please enter both name and subject.');
        return;
    }

    let existingData = JSON.parse(sessionStorage.getItem('mergedData')) || [];

    // Check if a student with the same name or subject already exists
    let isDuplicate = existingData.some(item => item.name === name && item.subject === subject);

    if (isDuplicate) {
        alert('Student with the same name and subject already exists.');
        return;
    }

    let newData = { id: generateUniqueId(existingData), name, subject };

    existingData.push(newData);

    sessionStorage.setItem('mergedData', JSON.stringify(existingData));

    console.log('Updated JSON:', existingData);

    displayDataInTable(existingData);
});

// Function to generate a unique ID for a new entry
function generateUniqueId(existingData) {
    let maxId = existingData.reduce((max, item) => Math.max(max, item.id), 0);
    return maxId + 1;
}

// Function to merge CSV and JSON data, avoiding duplicates
function mergeData(existingData, newData) {
    let mergedData = existingData.slice();

    for (let i = 0; i < newData.length; i++) {
        let isNewEntryDuplicate = existingData.some(item => item.name === newData[i].name && item.subject === newData[i].subject);
        if (!isNewEntryDuplicate) {
            mergedData.push(newData[i]);
        } else {
            console.error(`Duplicate entry found: Name "${newData[i].name}" and Subject "${newData[i].subject}"`);
        }
    }

    return mergedData;
}

// Function to display data in a table
function displayDataInTable(data) {
    let tableHtml = `
        <table class="table table-bordered table-striped">
            <thead class="thead-dark">
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>`;

    for (let i = 0; i < data.length; i++) {
        tableHtml += `
            <tr>
                <td>${data[i].id}</td>
                <td>${data[i].name}</td>
                <td>${data[i].subject}</td>
                <td>
                    <button type="button" class="btn btn-danger" onclick="deleteRow(${data[i].id})">Delete</button>
                    <button type="button" class="btn btn-primary" onclick="editRow(${data[i].id})">Edit</button>
                </td>
            </tr>`;
    }

    tableHtml += `
            </tbody>
        </table>`;

    document.getElementById('dataContainer').innerHTML = tableHtml;
}

// Function to delete a row
function deleteRow(id) {
    let existingData = JSON.parse(sessionStorage.getItem('mergedData')) || [];
    let updatedData = existingData.filter(item => item.id !== id);
    sessionStorage.setItem('mergedData', JSON.stringify(updatedData));
    displayDataInTable(updatedData);
}

// Function to edit a row
function editRow(id) {
    let existingData = JSON.parse(sessionStorage.getItem('mergedData')) || [];
    let rowData = existingData.find(item => item.id === id);
    if (rowData) {
        document.getElementById('editId').value = rowData.id;
        document.getElementById('editName').value = rowData.name;
        document.getElementById('editSubject').value = rowData.subject;
        document.getElementById('editFormContainer').style.display = 'block';
    }
}

// Function to delete sessionStorage
function deleteLocalStorage() {
    sessionStorage.removeItem('mergedData');
    displayDataInTable([]);
}

// Event listener for edit form submission
document.getElementById('editDataForm').addEventListener('submit', function (event) {
    event.preventDefault();

    let id = document.getElementById('editId').value;
    let name = document.getElementById('editName').value.trim();
    let subject = document.getElementById('editSubject').value.trim();

    if (!name || !subject) {
        alert('Please enter both name and subject.');
        return;
    }

    let existingData = JSON.parse(sessionStorage.getItem('mergedData')) || [];
    let index = existingData.findIndex(item => item.id == id);
    if (index !== -1) {
        // Check if the updated name and subject combination already exists
        let isDuplicateEntry = existingData.some((item, i) => i !== index && item.name === name && item.subject === subject);

        if (isDuplicateEntry) {
            alert('Student with the same name and subject already exists.');
            return;
        }

        existingData[index].name = name;
        existingData[index].subject = subject;
        sessionStorage.setItem('mergedData', JSON.stringify(existingData));
        displayDataInTable(existingData);
        document.getElementById('editFormContainer').style.display = 'none';
    }
});