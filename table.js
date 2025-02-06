function displayXMLAsTable(xml) {
    const tableContainer = document.getElementById('tableContainer');

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.classList.add('uk-table');
    table.classList.add('uk-table-divider');

    const headers = ['Environment Id', 'Machine Id', 'AlternateId', 'Role Id', 'OS'];
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.border = '1px solid #ddd';
        th.style.padding = '12px 15px';
        th.style.backgroundColor = 'rgba(59,69,89)';
        th.style.color = 'white';
        th.style.textAlign = 'left';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    const environments = xml.getElementsByTagName('Environment');
    Array.from(environments).forEach(environment => {
        const envId = environment.getElementsByTagName('Id')[0].textContent;
        const machines = environment.getElementsByTagName('Machine');
        const envRowSpan = Array.from(machines).reduce((sum, machine) => sum + machine.getElementsByTagName('Role').length, 0);

        let envRowAdded = false;
        Array.from(machines).forEach(machine => {
            const machineId = machine.getElementsByTagName('Id')[0].textContent;
            const alternateId = machine.getElementsByTagName('AlternateId')[0].textContent;
            const osFamily = machine.getElementsByTagName('family')[0].textContent;
            const osArch = machine.getElementsByTagName('arch')[0].textContent;
            const os = `${osFamily} ${osArch}`;
            const roles = Array.from(machine.getElementsByTagName('Role')); // Ensure roles is an array
            const roleCount = roles.length;

            roles.forEach((role, index) => {
                const tr = document.createElement('tr');

                if (!envRowAdded) {
                    const envCell = document.createElement('td');
                    envCell.textContent = envId;
                    envCell.rowSpan = envRowSpan;
                    envCell.style.borderBottom = '2px solid #000'; // Thicker bottom border for environment rows
                    envCell.style.padding = '12px 15px';
                    envCell.style.fontWeight = 'bold';
                    tr.appendChild(envCell);
                    envRowAdded = true;
                }

                if (index === 0) {
                    const machineCell = document.createElement('td');
                    machineCell.textContent = machineId;
                    machineCell.rowSpan = roleCount;
                    machineCell.style.borderBottom = '2px solid #000'; // Thicker bottom border for machine rows
                    machineCell.style.padding = '12px 15px';
                    tr.appendChild(machineCell);

                    const alternateIdCell = document.createElement('td');
                    alternateIdCell.textContent = alternateId;
                    alternateIdCell.rowSpan = roleCount;
                    alternateIdCell.style.borderBottom = '2px solid #000'; // Thicker bottom border for alternateId rows
                    alternateIdCell.style.padding = '12px 15px';
                    tr.appendChild(alternateIdCell);

                    const osCell = document.createElement('td');
                    osCell.textContent = os;
                    osCell.rowSpan = roleCount;
                    osCell.style.borderBottom = '2px solid #000'; // Thicker bottom border for OS rows
                    osCell.style.padding = '12px 15px';
                    tr.appendChild(osCell);
                }

                const roleId = role.getElementsByTagName('Id')[0].textContent;
                const roleCell = document.createElement('td');
                roleCell.textContent = roleId;
                roleCell.style.borderBottom = '1px solid #ddd';
                roleCell.style.padding = '12px 15px';
              
                if (index === roleCount-1) {
                  roleCell.style.borderBottom = '2px solid #000'; // Thicker bottom border
                }
              
                tr.appendChild(roleCell);

                tbody.appendChild(tr);
            });
        });
    });
    table.appendChild(tbody);

    // Append table to container
    const oldTables = document.getElementsByClassName('uk-table');
    Array.from(oldTables).forEach(oldTable => oldTable.remove());
    tableContainer.appendChild(table);
}

// Function to decompress the xmlData
function decompressData(data) {
    return LZString.decompressFromEncodedURIComponent(data);
}

// Function to handle HTTP query payload
function handleHttpQueryPayload() {
    const urlParams = new URLSearchParams(window.location.search);
    const xmlData = urlParams.get('xmlData');
    if (xmlData) {
        const decompressedXmlData = decompressData(xmlData); // Decompress the xmlData
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(decompressedXmlData, "text/xml");
        displayXMLAsTable(xmlDoc);
    }
}

// Call the function to handle HTTP query payload on page load
window.onload = handleHttpQueryPayload;
