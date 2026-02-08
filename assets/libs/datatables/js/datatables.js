/* 
===========================================
DATATABLES CUSTOM JAVASCRIPT
===========================================
Author: TechArea Production
Description: Custom JavaScript for DataTables functionality with Custom Pagination
*/

// DataTables Module
const DataTablesApp = (function () {
    // Sample Data for Basic Table
    const sampleData = [
        { id: 1, name: "Tiger Nixon", position: "System Architect", office: "Edinburgh", age: 61, startDate: "2011-04-25", salary: 320800, status: "Active" },
        { id: 2, name: "Garrett Winters", position: "Accountant", office: "Tokyo", age: 63, startDate: "2011-07-25", salary: 170750, status: "Active" },
        { id: 3, name: "Ashton Cox", position: "Junior Technical Author", office: "San Francisco", age: 66, startDate: "2009-01-12", salary: 86000, status: "Inactive" },
        { id: 4, name: "Cedric Kelly", position: "Senior Javascript Developer", office: "Edinburgh", age: 22, startDate: "2012-03-29", salary: 433060, status: "Active" },
        { id: 5, name: "Airi Satou", position: "Accountant", office: "Tokyo", age: 33, startDate: "2008-11-28", salary: 162700, status: "Active" },
        { id: 6, name: "Brielle Williamson", position: "Integration Specialist", office: "New York", age: 61, startDate: "2012-12-02", salary: 372000, status: "On Leave" },
        { id: 7, name: "Herrod Chandler", position: "Sales Assistant", office: "San Francisco", age: 59, startDate: "2012-08-06", salary: 137500, status: "Active" },
        { id: 8, name: "Rhona Davidson", position: "Integration Specialist", office: "Tokyo", age: 55, startDate: "2010-10-14", salary: 327900, status: "Inactive" },
        { id: 9, name: "Colleen Hurst", position: "Javascript Developer", office: "San Francisco", age: 39, startDate: "2009-09-15", salary: 205500, status: "Active" },
        { id: 10, name: "Sonya Frost", position: "Software Engineer", office: "Edinburgh", age: 23, startDate: "2008-12-13", salary: 103600, status: "Active" },
        { id: 11, name: "Jena Gaines", position: "Office Manager", office: "London", age: 30, startDate: "2008-12-19", salary: 90560, status: "Active" },
        { id: 12, name: "Quinn Flynn", position: "Support Lead", office: "Edinburgh", age: 22, startDate: "2013-03-03", salary: 342000, status: "Active" },
        { id: 13, name: "Charde Marshall", position: "Regional Director", office: "San Francisco", age: 36, startDate: "2008-10-16", salary: 470600, status: "Inactive" },
        { id: 14, name: "Haley Kennedy", position: "Senior Marketing Designer", office: "London", age: 43, startDate: "2012-12-18", salary: 313500, status: "Active" },
        { id: 15, name: "Tatyana Fitzpatrick", position: "Regional Director", office: "London", age: 19, startDate: "2010-03-17", salary: 385750, status: "Active" },
        { id: 16, name: "Michael Silva", position: "Marketing Designer", office: "London", age: 66, startDate: "2012-11-27", salary: 198500, status: "Active" },
        { id: 17, name: "Paul Byrd", position: "Chief Financial Officer", office: "New York", age: 64, startDate: "2010-06-09", salary: 725000, status: "Active" },
        { id: 18, name: "Gloria Little", position: "Systems Administrator", office: "New York", age: 59, startDate: "2009-04-10", salary: 237500, status: "Active" },
        { id: 19, name: "Bradley Greer", position: "Software Engineer", office: "London", age: 41, startDate: "2012-10-13", salary: 132000, status: "On Leave" },
        { id: 20, name: "Dai Rios", position: "Personnel Lead", office: "Edinburgh", age: 35, startDate: "2012-09-26", salary: 217500, status: "Active" }
    ];

    let basicTable;
    let isDataTableInitialized = false;

    // ==================== CUSTOM PAGINATION MANAGER ====================
    const CustomPagination = (function() {
        let table;
        let currentPage = 1;
        let pageSize = 10;
        let totalPages = 1;
        
        function init(dataTable) {
            table = dataTable;
            pageSize = table.page.len();
            
            // Setup event listeners
            setupEventListeners();
            
            // Initial update
            updatePagination();
            
            console.log("Custom Pagination initialized");
        }
        
        function setupEventListeners() {
            // Previous page
            $(document).on('click', '#prev-page', function(e) {
                e.preventDefault();
                if (!$(this).hasClass('disabled')) {
                    goToPage(currentPage - 1);
                }
            });
            
            // Next page
            $(document).on('click', '#next-page', function(e) {
                e.preventDefault();
                if (!$(this).hasClass('disabled')) {
                    goToPage(currentPage + 1);
                }
            });
            
            // Page size change
            $(document).on('change', '#page-size-select', function() {
                pageSize = parseInt($(this).val());
                table.page.len(pageSize).draw();
                updatePagination();
            });
            
            // Page number click (delegated)
            $(document).on('click', '.page-number', function(e) {
                e.preventDefault();
                const pageNum = parseInt($(this).data('page'));
                if (pageNum !== currentPage) {
                    goToPage(pageNum);
                }
            });
        }
        
        function goToPage(page) {
            if (page < 1 || page > totalPages) return;
            
            currentPage = page;
            table.page(page - 1).draw(false);
            updatePagination();
            
            // Smooth scroll to table
            $('html, body').animate({
                scrollTop: $('#basicDatatable').offset().top - 100
            }, 300);
        }
        
        function updatePagination() {
            if (!table) return;
            
            const info = table.page.info();
            currentPage = info.page + 1;
            totalPages = info.pages;
            
            // Update info text
            $('#pagination-start').text(info.start + 1);
            $('#pagination-end').text(info.end);
            $('#pagination-total').text(info.recordsTotal);
            
            // Update page size selector
            $('#page-size-select').val(info.length);
            
            // Update pagination buttons
            updatePageButtons();
            
            // Update prev/next button states
            $('#prev-page').toggleClass('disabled', currentPage === 1);
            $('#next-page').toggleClass('disabled', currentPage === totalPages);
        }
        
        function updatePageButtons() {
            const $pagination = $('.pagination-custom');
            const pageNumbers = generatePageNumbers();
            
            // Clear existing page numbers (keep prev/next)
            $pagination.find('.page-item:not(#prev-page):not(#next-page)').remove();
            
            // Add page number buttons
            pageNumbers.forEach(pageNum => {
                const isActive = pageNum === currentPage;
                const isEllipsis = pageNum === '...';
                
                const $li = $('<li>', {
                    class: 'page-item' + 
                           (isActive ? ' active' : '') + 
                           (isEllipsis ? ' ellipsis disabled' : ''),
                    'data-page': isEllipsis ? null : pageNum
                });
                
                const $a = $('<a>', {
                    class: 'page-link' + (isEllipsis ? '' : ' page-number'),
                    href: '#',
                    'data-page': isEllipsis ? null : pageNum
                }).html(isEllipsis ? '...' : pageNum);
                
                $li.append($a);
                
                // Insert before next button
                $('#next-page').before($li);
            });
        }
        
        function generatePageNumbers() {
            const pages = [];
            const maxVisible = 5; // Maximum visible page numbers
            
            if (totalPages <= maxVisible) {
                // Show all pages
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Always show first page
                pages.push(1);
                
                // Calculate start and end
                let start = Math.max(2, currentPage - 1);
                let end = Math.min(totalPages - 1, currentPage + 1);
                
                // Adjust if at the beginning
                if (currentPage <= 3) {
                    end = 4;
                }
                
                // Adjust if at the end
                if (currentPage >= totalPages - 2) {
                    start = totalPages - 3;
                }
                
                // Add ellipsis if needed
                if (start > 2) {
                    pages.push('...');
                }
                
                // Add middle pages
                for (let i = start; i <= end; i++) {
                    pages.push(i);
                }
                
                // Add ellipsis if needed
                if (end < totalPages - 1) {
                    pages.push('...');
                }
                
                // Always show last page
                if (totalPages > 1) {
                    pages.push(totalPages);
                }
            }
            
            return pages;
        }
        
        return {
            init,
            updatePagination,
            goToPage
        };
    })();

    // Initialize DataTables
    function init() {
        console.log("DataTables App initialized");
        
        // Tunggu sampai jQuery dan DataTables tersedia
        if (typeof jQuery === 'undefined' || typeof $.fn.DataTable === 'undefined') {
            console.log("Waiting for jQuery or DataTables...");
            setTimeout(init, 100);
            return;
        }
        
        try {
            // Initialize Basic Table
            initBasicTable();
            
            // Setup Event Listeners
            setupEventListeners();
            
            console.log("DataTables App setup complete");
        } catch (error) {
            console.error("Error in DataTables init:", error);
            // Fallback to manual table
            manualTableFallback();
        }
    }

    // ==================== BASIC TABLE ====================
    function initBasicTable() {
        try {
            // Cek jika tabel sudah diinisialisasi
            if (isDataTableInitialized) {
                console.log("DataTable already initialized");
                return;
            }
            
            // Cek jika tabel ada
            if ($('#basicDatatable').length === 0) {
                console.error("Table #basicDatatable not found!");
                return;
            }
            
            // Hapus data yang ada di tbody untuk menghindari konflik
            $('#basicDatatable tbody').empty();
            
            // Initialize DataTable
            basicTable = $('#basicDatatable').DataTable({
                data: sampleData,
                columns: [
                    { 
                        data: 'id',
                        title: "ID",
                        width: "50px"
                    },
                    { 
                        data: 'name',
                        title: "Name",
                        width: "200px",
                        render: function(data, type, row) {
                            return `
                                <div class="d-flex align-items-center">
                                    <div class="avatar avatar-sm me-2">
                                        <img src="assets/img/avatar/no-img.jpeg" alt="${row.name}">
                                    </div>
                                    <div>
                                        <div class="fw-medium">${row.name}</div>
                                        <small class="text-muted">ID: EMP${row.id.toString().padStart(3, '0')}</small>
                                    </div>
                                </div>
                            `;
                        }
                    },
                    { 
                        data: 'position',
                        title: "Position",
                        width: "150px"
                    },
                    { 
                        data: 'office',
                        title: "Office",
                        width: "120px"
                    },
                    { 
                        data: 'age',
                        title: "Age",
                        width: "80px"
                    },
                    { 
                        data: 'startDate',
                        title: "Start Date",
                        width: "120px",
                        render: function(data) {
                            return new Date(data).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            });
                        }
                    },
                    { 
                        data: 'salary',
                        title: "Salary",
                        width: "120px",
                        render: function(data) {
                            return data.toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0
                            });
                        }
                    },
                    { 
                        data: 'status',
                        title: "Status",
                        width: "100px",
                        render: function(data) {
                            let statusClass = 'status-badge ';
                            switch(data.toLowerCase()) {
                                case 'active':
                                    statusClass += 'active';
                                    break;
                                case 'inactive':
                                    statusClass += 'inactive';
                                    break;
                                case 'on leave':
                                    statusClass += 'on-leave';
                                    break;
                                default:
                                    statusClass += 'active';
                            }
                            return `<span class="${statusClass}">${data}</span>`;
                        }
                    },
                    { 
                        title: "Actions",
                        orderable: false,
                        width: "120px",
                        render: function(data, type, row) {
                            return `
                                <div class="action-buttons">
                                    <button class="action-btn view" data-id="${row.id}" title="View">
                                        <i class="ri-eye-line icon-fixed-size-sm"></i>
                                    </button>
                                    <button class="action-btn edit" data-id="${row.id}" title="Edit">
                                        <i class="ri-pencil-line icon-fixed-size-sm"></i>
                                    </button>
                                    <button class="action-btn delete" data-id="${row.id}" title="Delete">
                                        <i class="ri-delete-bin-line icon-fixed-size-sm"></i>
                                    </button>
                                </div>
                            `;
                        }
                    }
                ],
                pageLength: 10,
                responsive: true,
                lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                language: {
                    lengthMenu: "Show _MENU_ entries",
                    search: "Search:",
                    info: "", // Hide default info
                    infoEmpty: "",
                    infoFiltered: "",
                    paginate: {
                        first: "",
                        last: "",
                        next: "",
                        previous: ""
                    }
                },
                order: [[0, 'asc']],
                drawCallback: function(settings) {
                    // Update custom pagination
                    CustomPagination.updatePagination();
                    
                    // Update action buttons
                    $('#basicDatatable').off('click', '.action-btn').on('click', '.action-btn', function() {
                        const btn = $(this);
                        const action = btn.hasClass('view') ? 'view' :
                                     btn.hasClass('edit') ? 'edit' :
                                     btn.hasClass('delete') ? 'delete' : null;
                        const id = btn.data('id');
                        
                        if (action && id) {
                            handleAction(action, id);
                        }
                    });
                },
                initComplete: function() {
                    console.log("DataTable initialized successfully");
                    isDataTableInitialized = true;
                    
                    // Initialize custom pagination
                    CustomPagination.init(this.api());
                    
                    // Update pagination style
                    updatePaginationStyle();
                }
            });
            
            console.log("DataTable created successfully");
            
        } catch (error) {
            console.error("Error initializing DataTable:", error);
            // Fallback to manual table
            manualTableFallback();
        }
    }

    // Fallback jika DataTables gagal
    function manualTableFallback() {
        console.log("Using manual table fallback");
        
        const tableBody = $('#basicDatatable tbody');
        if (tableBody.length === 0) return;
        
        tableBody.empty();
        
        sampleData.forEach(item => {
            // Format salary
            const formattedSalary = item.salary.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
            });
            
            // Format date
            const formattedDate = new Date(item.startDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Determine status badge class
            let statusClass = 'status-badge ';
            switch(item.status.toLowerCase()) {
                case 'active':
                    statusClass += 'active';
                    break;
                case 'inactive':
                    statusClass += 'inactive';
                    break;
                case 'on leave':
                    statusClass += 'on-leave';
                    break;
            }
            
            const row = `
                <tr>
                    <td>${item.id}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="avatar avatar-sm me-2">
                                <img src="assets/img/avatar/no-img.jpeg" alt="${item.name}">
                            </div>
                            <div>
                                <div class="fw-medium">${item.name}</div>
                                <small class="text-muted">ID: EMP${item.id.toString().padStart(3, '0')}</small>
                            </div>
                        </div>
                    </td>
                    <td>${item.position}</td>
                    <td>${item.office}</td>
                    <td>${item.age}</td>
                    <td>${formattedDate}</td>
                    <td>${formattedSalary}</td>
                    <td><span class="${statusClass}">${item.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view" data-id="${item.id}" title="View">
                                <i class="ri-eye-line icon-fixed-size-sm"></i>
                            </button>
                            <button class="action-btn edit" data-id="${item.id}" title="Edit">
                                <i class="ri-pencil-line icon-fixed-size-sm"></i>
                            </button>
                            <button class="action-btn delete" data-id="${item.id}" title="Delete">
                                <i class="ri-delete-bin-line icon-fixed-size-sm"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            
            tableBody.append(row);
        });
        
        console.log("Manual table loaded");
    }

    // ==================== EVENT LISTENERS ====================
    function setupEventListeners() {
        // Refresh Table Button
        $(document).on('click', '#refreshTable', function() {
            refreshTable();
        });
        
        // Add New Row Button
        $(document).on('click', '#addNewRow', function() {
            showAddModal();
        });
        
        // Save Employee Button (Modal)
        $(document).on('click', '#saveEmployee', function() {
            saveEmployee();
        });
        
        console.log("Event listeners setup complete");
    }

    // ==================== TABLE FUNCTIONS ====================
    function refreshTable() {
        try {
            if (basicTable && isDataTableInitialized) {
                basicTable.clear();
                
                // Tambahkan data baru jika ada
                const newData = [...sampleData]; // Duplikat data
                
                basicTable.rows.add(newData);
                basicTable.draw();
                
                showNotification('Table refreshed successfully!', 'success');
            } else {
                // Reinitialize jika belum diinisialisasi
                if ($('#basicDatatable').length) {
                    $('#basicDatatable').DataTable().destroy();
                    $('#basicDatatable').empty();
                    isDataTableInitialized = false;
                    initBasicTable();
                }
                showNotification('Table reinitialized!', 'info');
            }
        } catch (error) {
            console.error("Error refreshing table:", error);
            manualTableFallback();
            showNotification('Table refreshed manually!', 'warning');
        }
    }

    // ==================== MODAL FUNCTIONS ====================
    function showAddModal() {
        const modalElement = document.getElementById('employeeModal');
        if (!modalElement) {
            console.error("Modal not found!");
            return;
        }
        
        const modal = new bootstrap.Modal(modalElement);
        const modalTitle = document.getElementById('modalTitle');
        
        if (modalTitle) {
            modalTitle.textContent = 'Add New Employee';
        }
        
        // Reset form
        const form = document.getElementById('employeeForm');
        if (form) {
            form.reset();
        }
        
        modal.show();
    }

    function showEditModal(id) {
        const modalElement = document.getElementById('employeeModal');
        if (!modalElement) {
            console.error("Modal not found!");
            return;
        }
        
        const modal = new bootstrap.Modal(modalElement);
        const modalTitle = document.getElementById('modalTitle');
        
        // Find employee data
        const employee = sampleData.find(item => item.id == id);
        
        if (employee) {
            // Fill form with employee data
            document.getElementById('modalName').value = employee.name;
            document.getElementById('modalPosition').value = employee.position;
            document.getElementById('modalOffice').value = employee.office;
            document.getElementById('modalSalary').value = employee.salary;
            document.getElementById('modalStatus').value = employee.status;
            
            if (modalTitle) {
                modalTitle.textContent = 'Edit Employee';
            }
            
            modal.show();
        }
    }

    function saveEmployee() {
        const name = document.getElementById('modalName').value;
        const position = document.getElementById('modalPosition').value;
        const office = document.getElementById('modalOffice').value;
        const salary = document.getElementById('modalSalary').value;
        const status = document.getElementById('modalStatus').value;
        
        if (!name || !position || !office || !salary) {
            showNotification('Please fill all required fields!', 'warning');
            return;
        }
        
        // Simpan data
        const newEmployee = {
            id: sampleData.length + 1,
            name: name,
            position: position,
            office: office,
            age: Math.floor(Math.random() * 30) + 25, // Random age 25-55
            startDate: new Date().toISOString().split('T')[0],
            salary: parseInt(salary),
            status: status
        };
        
        sampleData.push(newEmployee);
        
        showNotification('Employee saved successfully!', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
        if (modal) {
            modal.hide();
        }
        
        // Refresh table
        refreshTable();
    }

    // ==================== ACTION HANDLERS ====================
    function handleAction(action, id) {
        switch(action) {
            case 'view':
                showNotification(`Viewing employee ID: ${id}`, 'info');
                break;
            case 'edit':
                showEditModal(id);
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this record?')) {
                    deleteRecord(id);
                }
                break;
        }
    }

    function deleteRecord(id) {
        // Cari index data
        const index = sampleData.findIndex(item => item.id == id);
        
        if (index !== -1) {
            // Hapus dari array
            sampleData.splice(index, 1);
            
            showNotification(`Record ${id} deleted successfully!`, 'success');
            
            // Refresh table
            refreshTable();
        }
    }

    // ==================== UTILITY FUNCTIONS ====================
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        $('.custom-notification').remove();
        
        // Create notification element
        const notification = $(`
            <div class="alert alert-${type} alert-dismissible fade show custom-notification" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);
        
        // Style notification
        notification.css({
            'position': 'fixed',
            'top': '20px',
            'right': '20px',
            'z-index': '9999',
            'min-width': '300px',
            'box-shadow': '0 4px 12px rgba(0,0,0,0.15)'
        });
        
        // Add to body
        $('body').append(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.alert('close');
        }, 5000);
    }

    function updatePaginationStyle() {
        setTimeout(function() {
            console.log("Pagination styling updated");
        }, 50);
    }

    // ==================== PUBLIC API ====================
    return {
        init,
        refreshTable,
        showAddModal
    };
})();

// ==================== INITIALIZE DATATABLES ====================
// Tunggu sampai semua library terload
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing DataTables...");
    
    // Tunggu sebentar untuk memastikan jQuery sudah dimuat
    setTimeout(function() {
        if (window.jQuery && window.jQuery.fn && window.jQuery.fn.DataTable) {
            console.log("All dependencies loaded, initializing DataTablesApp...");
            DataTablesApp.init();
        } else {
            console.error("jQuery or DataTables not available");
            // Coba lagi setelah 1 detik
            setTimeout(function() {
                if (window.jQuery && window.jQuery.fn && window.jQuery.fn.DataTable) {
                    DataTablesApp.init();
                } else {
                    console.error("Failed to load dependencies");
                    // Tampilkan table manual
                    if (typeof DataTablesApp !== 'undefined') {
                        DataTablesApp.init();
                    }
                }
            }, 1000);
        }
    }, 500);
});

// Inisialisasi saat window load (fallback)
window.addEventListener('load', function() {
    console.log("Window loaded");
    
    if (typeof DataTablesApp !== 'undefined' && !window.dataTablesInitialized) {
        window.dataTablesInitialized = true;
        setTimeout(function() {
            DataTablesApp.init();
        }, 300);
    }
});