document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "text/xml");
            displayXMLAsTable(xmlDoc);
            generateLink(xmlDoc); // Call generateLink after XML is parsed and displayed
        };
        reader.readAsText(file);
    }
});

// Function to handle HTTP query payload
function handleHttpQueryPayload() {
    const urlParams = new URLSearchParams(window.location.search);
    const xmlData = urlParams.get('xmlData');
    if (xmlData) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, "text/xml");
        displayXMLAsTable(xmlDoc);
        generateLink(xmlDoc); // Call generateLink after XML is parsed and displayed
    }
}

function displayXMLAsTable(xml) {
    const tableContainer = document.getElementById('tableContainer');

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.classList.add('uk-table');
    table.classList.add('uk-table-divider');

    const headers = ['Environment Id', 'Machine Id', 'AlternateId', 'Role Id'];
    
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

    // Display the generated table as code in an extra container
    const extraContainer = document.getElementById('extraContainer');
    extraContainer.style.backgroundColor = '#f0f0f0';
    extraContainer.style.borderRadius = '8px';
    extraContainer.style.padding = '10px';
    extraContainer.style.marginTop = '20px';
    extraContainer.style.position = 'relative';

	const oldCodeBlocks = document.getElementsByTagName('pre');
	Array.from(oldCodeBlocks).forEach(oldCodeBlock => oldCodeBlock.remove());
	
    const codeBlock = document.createElement('pre');
    codeBlock.textContent = formatHTML(table.outerHTML);
  
    extraContainer.appendChild(codeBlock);
}


function formatHTML(html) {
    let formatted = '';
    const reg = /(>)(<)(\/*)/g;
    html = html.replace(reg, '$1\n$2$3');
    let pad = 0;
    html.split('\n').forEach(function(node) {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        const padding = new Array(pad + 1).join('    ');
        formatted += padding + node + '\n';
        pad += indent;
    });

    return formatted;
}

const excelButton = document.getElementById('excelButton');
excelButton.addEventListener('click', function() {
    const table = tableContainer.querySelector('table');
    const rows = table.querySelectorAll('tr');
    let csvContent = '';
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const colCount = cols.length;
        const rowData = Array.from(cols).map((col, index) => {
            if (colCount === 1 && index === 0)
              return '\t\t\t' + col.textContent;
            else if (colCount === 3 && index === 0)
              return '\t' + col.textContent;
            return col.textContent;
        }).join('\t');
        csvContent += rowData + '\n';
    });
    navigator.clipboard.writeText(csvContent).then(() => {
        alert('Table copied as Excel format!');
    });
});

const copyButton = document.getElementById('copyButton');
copyButton.addEventListener('click', function() {
    const code = extraContainer.querySelector('pre').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Code copied to clipboard!');
    });
});

// Function to generate a link to table.html with xmlData query parameter
function generateLink(xmlDoc) {
    const xmlString = new XMLSerializer().serializeToString(xmlDoc);
    const encodedXml = encodeURIComponent(xmlString);
    const link = `table.html?xmlData=${encodedXml}`;
    const linkContainer = document.getElementById('linkContainer');
        const existingLink = linkContainer.querySelector('a');
    if (existingLink) {
        existingLink.href = link;
        existingLink.textContent = 'Generated Link';
    } else {
        const newLink = document.createElement('a');
        newLink.href = link;
        newLink.textContent = 'Generated Link';
        linkContainer.appendChild(newLink);
    }
}

// Event listener for copyLinkButton to copy the generated link to clipboard
const copyLinkButton = document.getElementById('copyLinkButton');
copyLinkButton.addEventListener('click', function() {
    const link = document.querySelector('#linkContainer a').href;
    navigator.clipboard.writeText(link).then(() => {
        alert('Link copied to clipboard!');
    });
});

// Event listener for copyIframeButton to copy an iframe with the generated link to clipboard
const copyIframeButton = document.getElementById('copyIframeButton');
copyIframeButton.addEventListener('click', function() {
    const link = document.querySelector('#linkContainer a').href;
    const iframeCode = `<iframe src="${link}" width="100%" height="500px"></iframe>`;
    navigator.clipboard.writeText(iframeCode).then(() => {
        alert('Iframe code copied to clipboard!');
    });
});


// Call the function to handle HTTP query payload on page load
window.onload = handleHttpQueryPayload;
