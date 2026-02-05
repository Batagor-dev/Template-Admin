/* 
===========================================
SELECT2 MODERN JAVASCRIPT - TECHAREA PRODUCTION
===========================================
Author: TechArea Production
Description: Modern Select2 functionality dengan tema TechArea
*/

document.addEventListener("DOMContentLoaded", () => {
    console.log("SELECT2.JS: Initializing select components...");
    
    // Cegah inisialisasi ganda
    if (window.select2Initialized) return;
    window.select2Initialized = true;
    
    /* ===============================
       BASIC SELECT DENGAN SEARCH
    =============================== */
    const basicSelects = document.querySelectorAll(".basic-select:not([data-initialized])");
    
    basicSelects.forEach((select, index) => {
        select.setAttribute("data-initialized", "true");
        
        const input = select.querySelector("input");
        const control = select.querySelector(".basic-control");
        const arrow = select.querySelector(".arrow");
        
        if (!input || !control) {
            console.error("Invalid basic-select structure", select);
            return;
        }
        
        // Get options from data attribute
        const optionsData = select.getAttribute("data-options");
        if (!optionsData) {
            console.error("No data-options attribute found");
            return;
        }
        
        const options = optionsData.split(",").map(o => o.trim());
        let selectedValue = '';
        
        // Remove old dropdown if exists
        const oldDropdown = select.querySelector(".basic-dropdown");
        if (oldDropdown) oldDropdown.remove();
        
        // CREATE DROPDOWN
        const dropdown = document.createElement("div");
        dropdown.className = "basic-dropdown";
        
        // Search input
        const searchDiv = document.createElement("div");
        searchDiv.className = "search-input";
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "Search...";
        searchDiv.appendChild(searchInput);
        dropdown.appendChild(searchDiv);
        
        // Options container
        const optionsContainer = document.createElement("div");
        optionsContainer.className = "options-container";
        dropdown.appendChild(optionsContainer);
        
        // Function to render options
        function renderOptions(filter = "") {
            optionsContainer.innerHTML = "";
            const filteredOptions = options.filter(opt => 
                opt.toLowerCase().includes(filter.toLowerCase())
            );
            
            if (filteredOptions.length === 0) {
                const noResults = document.createElement("div");
                noResults.className = "no-results";
                noResults.textContent = "No results found";
                optionsContainer.appendChild(noResults);
                return;
            }
            
            filteredOptions.forEach(opt => {
                const item = document.createElement("div");
                item.className = "option";
                item.textContent = opt;
                item.dataset.value = opt;
                
                // Mark as selected if matches current value
                if (selectedValue === opt) {
                    item.classList.add("selected");
                }
                
                item.addEventListener("click", (e) => {
                    e.stopPropagation();
                    selectedValue = opt;
                    input.value = opt;
                    closeAllDropdowns();
                    
                    // Remove selected class from all options
                    optionsContainer.querySelectorAll(".option").forEach(optEl => {
                        optEl.classList.remove("selected");
                    });
                    
                    // Add selected class to clicked option
                    item.classList.add("selected");
                    
                    // Trigger change event
                    const changeEvent = new Event('change', { bubbles: true });
                    select.dispatchEvent(changeEvent);
                });
                
                optionsContainer.appendChild(item);
            });
        }
        
        // Initial render
        renderOptions();
        select.appendChild(dropdown);
        
        // Toggle dropdown on control click
        control.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            // Close all other dropdowns
            closeAllDropdowns(select);
            
            const isOpen = dropdown.classList.contains("show");
            
            if (!isOpen) {
                dropdown.classList.add("show");
                select.classList.add("open");
                setTimeout(() => {
                    searchInput.focus();
                    searchInput.value = "";
                    renderOptions();
                }, 10);
            } else {
                dropdown.classList.remove("show");
                select.classList.remove("open");
            }
        });
        
        // Search functionality
        searchInput.addEventListener("input", (e) => {
            renderOptions(e.target.value);
        });
        
        // Keyboard navigation
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeAllDropdowns();
            } else if (e.key === "ArrowDown") {
                const firstOption = optionsContainer.querySelector(".option");
                if (firstOption) firstOption.focus();
            }
        });
    });
    
    /* ===============================
       TAG SELECT (MULTIPLE)
    =============================== */
    const tagSelects = document.querySelectorAll(".tag-select:not([data-initialized])");
    
    tagSelects.forEach((select, index) => {
        select.setAttribute("data-initialized", "true");
        
        const input = select.querySelector("input");
        
        if (!input) {
            console.error("Invalid tag-select structure", select);
            return;
        }
        
        // Get options from data attribute
        const optionsData = select.getAttribute("data-options");
        if (!optionsData) {
            console.error("No data-options attribute found");
            return;
        }
        
        const options = optionsData.split(",").map(o => o.trim());
        let selectedTags = [];
        const maxTags = parseInt(select.getAttribute("data-max")) || Infinity;
        
        // Remove old dropdown if exists
        const oldDropdown = select.querySelector(".tag-dropdown");
        if (oldDropdown) oldDropdown.remove();
        
        // Clear old tags
        const oldTags = select.querySelectorAll(".tag:not(:has(input))");
        oldTags.forEach(tag => tag.remove());
        
        // CREATE DROPDOWN
        const dropdown = document.createElement("div");
        dropdown.className = "tag-dropdown";
        
        // Function to render selected tags
        function renderTags() {
            // Remove all existing tags (except input)
            const existingTags = select.querySelectorAll(".tag:not(:has(input))");
            existingTags.forEach(tag => tag.remove());
            
            // Add selected tags
            selectedTags.forEach((tag, tagIndex) => {
                const tagEl = document.createElement("span");
                tagEl.className = "tag";
                tagEl.dataset.index = tagIndex;
                tagEl.innerHTML = `${tag}<span class="remove">&times;</span>`;
                
                // Remove tag on click
                tagEl.querySelector(".remove").addEventListener("click", (e) => {
                    e.stopPropagation();
                    selectedTags = selectedTags.filter(t => t !== tag);
                    renderTags();
                    renderDropdownOptions();
                    
                    // Trigger change event
                    const changeEvent = new Event('change', { bubbles: true });
                    select.dispatchEvent(changeEvent);
                });
                
                // Insert tag before input
                select.insertBefore(tagEl, input);
            });
        }
        
        // Function to render dropdown options
        function renderDropdownOptions(filter = "") {
            dropdown.innerHTML = "";
            
            // Show message if max tags reached
            if (selectedTags.length >= maxTags) {
                const maxMessage = document.createElement("div");
                maxMessage.className = "no-results";
                maxMessage.textContent = `Maximum ${maxTags} tags allowed`;
                dropdown.appendChild(maxMessage);
                return;
            }
            
            const availableOptions = options.filter(opt => 
                !selectedTags.includes(opt) && 
                opt.toLowerCase().includes(filter.toLowerCase())
            );
            
            if (availableOptions.length === 0 && filter.trim() === "") {
                const noResults = document.createElement("div");
                noResults.className = "no-results";
                noResults.textContent = "No options available";
                dropdown.appendChild(noResults);
                return;
            }
            
            // Show custom tag option if input doesn't match any existing option
            if (filter.trim() !== "" && 
                !options.includes(filter.trim()) && 
                !selectedTags.includes(filter.trim())) {
                const customItem = document.createElement("div");
                customItem.className = "option custom-option";
                customItem.innerHTML = `<i class="ri-add-line"></i> Add "${filter.trim()}"`;
                customItem.dataset.value = filter.trim();
                
                customItem.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (selectedTags.length < maxTags) {
                        selectedTags.push(filter.trim());
                        renderTags();
                        renderDropdownOptions();
                        input.value = "";
                        input.focus();
                        
                        // Trigger change event
                        const changeEvent = new Event('change', { bubbles: true });
                        select.dispatchEvent(changeEvent);
                    }
                    closeAllDropdowns();
                });
                
                dropdown.appendChild(customItem);
            }
            
            availableOptions.forEach(opt => {
                const item = document.createElement("div");
                item.className = "option";
                item.textContent = opt;
                item.dataset.value = opt;
                
                item.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (selectedTags.length < maxTags && !selectedTags.includes(opt)) {
                        selectedTags.push(opt);
                        renderTags();
                        renderDropdownOptions();
                        input.value = "";
                        input.focus();
                        
                        // Trigger change event
                        const changeEvent = new Event('change', { bubbles: true });
                        select.dispatchEvent(changeEvent);
                    }
                    closeAllDropdowns();
                });
                
                dropdown.appendChild(item);
            });
        }
        
        // Append dropdown and initialize
        select.appendChild(dropdown);
        renderTags();
        renderDropdownOptions();
        
        // Focus and show dropdown on input click
        input.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllDropdowns(select);
            select.classList.add("focused");
            dropdown.classList.add("show");
            renderDropdownOptions();
        });
        
        // Filter options on input
        input.addEventListener("input", (e) => {
            renderDropdownOptions(e.target.value);
            dropdown.classList.add("show");
        });
        
        // Add tag on Enter
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && input.value.trim()) {
                e.preventDefault();
                const newTag = input.value.trim();
                if (selectedTags.length >= maxTags) {
                    alert(`Maximum ${maxTags} tags allowed`);
                    return;
                }
                if (newTag && !selectedTags.includes(newTag)) {
                    selectedTags.push(newTag);
                    renderTags();
                    renderDropdownOptions();
                    input.value = "";
                    
                    // Trigger change event
                    const changeEvent = new Event('change', { bubbles: true });
                    select.dispatchEvent(changeEvent);
                }
            }
            
            if (e.key === "Escape") {
                closeAllDropdowns();
            }
            
            // Backspace to remove last tag
            if (e.key === "Backspace" && input.value === "" && selectedTags.length > 0) {
                selectedTags.pop();
                renderTags();
                renderDropdownOptions();
                
                // Trigger change event
                const changeEvent = new Event('change', { bubbles: true });
                select.dispatchEvent(changeEvent);
            }
        });
        
        // Remove focus class when clicking outside
        input.addEventListener("blur", () => {
            setTimeout(() => {
                if (!select.contains(document.activeElement)) {
                    select.classList.remove("focused");
                }
            }, 100);
        });
    });
    
    /* ===============================
       HELPER FUNCTIONS
    =============================== */
    
    function closeAllDropdowns(except = null) {
        // Close all basic dropdowns
        document.querySelectorAll(".basic-dropdown.show").forEach(dropdown => {
            const parent = dropdown.closest(".basic-select");
            if (except !== parent) {
                dropdown.classList.remove("show");
                if (parent) parent.classList.remove("open");
            }
        });
        
        // Close all tag dropdowns
        document.querySelectorAll(".tag-dropdown.show").forEach(dropdown => {
            const parent = dropdown.closest(".tag-select");
            if (except !== parent) {
                dropdown.classList.remove("show");
                if (parent) parent.classList.remove("focused");
            }
        });
        
        // Hide mobile overlay
        const overlay = document.querySelector(".select-overlay");
        if (overlay) overlay.classList.remove("show");
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".basic-select") && 
            !e.target.closest(".tag-select") &&
            !e.target.closest(".select-overlay")) {
            closeAllDropdowns();
        }
    });
    
    // Close with Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeAllDropdowns();
        }
    });
    
    /* ===============================
       MOBILE RESPONSIVE HANDLING
    =============================== */
    function setupMobileResponsive() {
        if (window.innerWidth <= 768) {
            // Create mobile overlay
            let overlay = document.querySelector(".select-overlay");
            if (!overlay) {
                overlay = document.createElement("div");
                overlay.className = "select-overlay";
                document.body.appendChild(overlay);
                
                overlay.addEventListener("click", () => {
                    closeAllDropdowns();
                });
            }
            
            // Show overlay when dropdown opens
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && 
                        (mutation.attributeName === 'class')) {
                        if (mutation.target.classList.contains('show')) {
                            overlay.classList.add('show');
                        }
                    }
                });
            });
            
            // Observe dropdowns for changes
            document.querySelectorAll('.basic-dropdown, .tag-dropdown').forEach(dropdown => {
                observer.observe(dropdown, { attributes: true });
            });
            
        } else {
            // Remove mobile overlay on desktop
            const overlay = document.querySelector(".select-overlay");
            if (overlay) overlay.classList.remove("show");
        }
    }
    
    // Initialize responsive behavior
    setupMobileResponsive();
    window.addEventListener("resize", setupMobileResponsive);
    
    /* ===============================
       PUBLIC API
    =============================== */
    window.TechAreaSelect2 = {
        // Get selected value from basic select
        getBasicValue: (selector) => {
            const select = document.querySelector(selector);
            if (!select) return null;
            const input = select.querySelector('input');
            return input ? input.value : '';
        },
        
        // Get selected tags from tag select
        getTagValues: (selector) => {
            const select = document.querySelector(selector);
            if (!select) return [];
            const tags = select.querySelectorAll('.tag:not(:has(input))');
            return Array.from(tags).map(tag => {
                return tag.textContent.replace('×', '').trim();
            });
        },
        
        // Set value for basic select
        setBasicValue: (selector, value) => {
            const select = document.querySelector(selector);
            if (!select) return false;
            const input = select.querySelector('input');
            if (input) {
                input.value = value;
                return true;
            }
            return false;
        },
        
        // Clear all tags
        clearTags: (selector) => {
            const select = document.querySelector(selector);
            if (!select) return false;
            const tags = select.querySelectorAll('.tag:not(:has(input))');
            tags.forEach(tag => tag.remove());
            return true;
        },
        
        // Add tag to tag select
        addTag: (selector, tag) => {
            const select = document.querySelector(selector);
            if (!select) return false;
            
            const input = select.querySelector('input');
            if (!input) return false;
            
            // Simulate adding tag
            const tagEl = document.createElement("span");
            tagEl.className = "tag";
            tagEl.innerHTML = `${tag}<span class="remove">&times;</span>`;
            
            // Add remove event
            tagEl.querySelector(".remove").addEventListener("click", (e) => {
                e.stopPropagation();
                tagEl.remove();
            });
            
            select.insertBefore(tagEl, input);
            return true;
        }
    };
    
    console.log("Select2 components initialized successfully!");
});