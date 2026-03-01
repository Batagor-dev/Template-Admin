/* 
===========================================
SELECT2 PROFESSIONAL - TECHAREA PRODUCTION
===========================================
Author: TechArea Production
Description: Professional Select2 JavaScript - Complete with Dropdown and Form Handling
*/

(function() {
    'use strict';

    if (window.TechAreaSelect2) return;

    let activeDropdown = null;
    let activeTrigger = null;

    const positionDropdown = (dropdown, trigger) => {
        const rect = trigger.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 320;
        
        let top = rect.bottom;
        let left = rect.left;
        
        // Cek apakah dropdown akan keluar dari viewport bawah
        if (rect.bottom + dropdownHeight > viewportHeight) {
            top = rect.top - dropdownHeight - 4;
        }
        
        // Batasi agar tidak keluar dari viewport kiri/kanan
        left = Math.max(10, Math.min(left, window.innerWidth - 310));
        
        // Set position fixed dengan nilai dalam px
        dropdown.style.top = top + 'px';
        dropdown.style.left = left + 'px';
        dropdown.style.width = Math.max(rect.width, 300) + 'px';
        
        // Pastikan z-index tertinggi
        dropdown.style.zIndex = '999999';
    };

    const closeAllDropdowns = (except = null) => {
        document.querySelectorAll('.basic-dropdown.show, .tag-dropdown.show').forEach(dropdown => {
            if (except !== dropdown) {
                dropdown.classList.remove('show');
                const parent = dropdown.closest('.basic-select, .tag-select');
                if (parent) {
                    parent.classList.remove('open', 'focused');
                }
            }
        });
        
        const overlay = document.querySelector('.select-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
        
        activeDropdown = null;
        activeTrigger = null;
    };

    class BasicSelect {
        constructor(element) {
            this.element = element;
            this.input = element.querySelector('input');
            this.control = element.querySelector('.basic-control');
            this.options = element.dataset.options?.split(',').map(o => o.trim()) || [];
            this.selectedValue = '';
            this.dropdown = null;
            this.init();
        }
        
        init() {
            const oldDropdown = this.element.querySelector('.basic-dropdown');
            if (oldDropdown) oldDropdown.remove();
            this.createDropdown();
            this.bindEvents();
        }
        
        createDropdown() {
            this.dropdown = document.createElement('div');
            this.dropdown.className = 'basic-dropdown';
            this.dropdown.style.zIndex = '999999';
            
            const searchDiv = document.createElement('div');
            searchDiv.className = 'dropdown-search';
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search...';
            searchDiv.appendChild(searchInput);
            this.dropdown.appendChild(searchDiv);
            
            this.optionsContainer = document.createElement('div');
            this.optionsContainer.className = 'dropdown-options';
            this.dropdown.appendChild(this.optionsContainer);
            
            document.body.appendChild(this.dropdown);
            this.renderOptions();
        }
        
        renderOptions(filter = '') {
            const filtered = this.options.filter(opt => 
                opt.toLowerCase().includes(filter.toLowerCase())
            );
            
            this.optionsContainer.innerHTML = '';
            
            if (filtered.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'dropdown-empty';
                empty.textContent = 'No results found';
                this.optionsContainer.appendChild(empty);
                return;
            }
            
            filtered.forEach(opt => {
                const option = document.createElement('div');
                option.className = 'dropdown-option';
                if (opt === this.selectedValue) {
                    option.classList.add('selected');
                }
                option.textContent = opt;
                option.dataset.value = opt;
                
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectOption(opt);
                    closeAllDropdowns();
                });
                
                this.optionsContainer.appendChild(option);
            });
        }
        
        selectOption(value) {
            this.selectedValue = value;
            this.input.value = value;
            
            this.optionsContainer.querySelectorAll('.dropdown-option').forEach(opt => {
                opt.classList.toggle('selected', opt.dataset.value === value);
            });
            
            this.element.dispatchEvent(new CustomEvent('change', { 
                bubbles: true,
                detail: { value: value }
            }));
        }
        
        bindEvents() {
            this.control.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (this.element.classList.contains('disabled')) return;
                
                closeAllDropdowns(this.dropdown);
                
                if (!this.dropdown.classList.contains('show')) {
                    // Hitung posisi sebelum menampilkan
                    positionDropdown(this.dropdown, this.control);
                    
                    // Tampilkan dropdown
                    this.dropdown.classList.add('show');
                    this.element.classList.add('open');
                    
                    // Focus ke search input
                    const searchInput = this.dropdown.querySelector('.dropdown-search input');
                    setTimeout(() => {
                        searchInput.focus();
                        searchInput.value = '';
                        this.renderOptions();
                    }, 10);
                    
                    activeDropdown = this.dropdown;
                    activeTrigger = this.control;
                    
                    // Tampilkan overlay di mobile
                    if (window.innerWidth <= 768) {
                        const overlay = document.querySelector('.select-overlay');
                        if (overlay) {
                            overlay.classList.add('show');
                        }
                    }
                } else {
                    this.dropdown.classList.remove('show');
                    this.element.classList.remove('open');
                }
            });
            
            const searchInput = this.dropdown.querySelector('.dropdown-search input');
            searchInput.addEventListener('input', (e) => {
                this.renderOptions(e.target.value);
            });
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeAllDropdowns();
                }
            });
        }
    }

    class TagSelect {
        constructor(element) {
            this.element = element;
            this.input = element.querySelector('input');
            this.options = element.dataset.options?.split(',').map(o => o.trim()) || [];
            this.maxTags = parseInt(element.dataset.max) || Infinity;
            this.selectedTags = [];
            this.dropdown = null;
            this.init();
        }
        
        init() {
            const oldDropdown = this.element.querySelector('.tag-dropdown');
            if (oldDropdown) oldDropdown.remove();
            
            document.querySelectorAll('.tag').forEach(tag => tag.remove());
            
            this.createDropdown();
            this.bindEvents();
        }
        
        createDropdown() {
            this.dropdown = document.createElement('div');
            this.dropdown.className = 'tag-dropdown';
            this.dropdown.style.zIndex = '999999';
            
            this.optionsContainer = document.createElement('div');
            this.optionsContainer.className = 'dropdown-options';
            this.dropdown.appendChild(this.optionsContainer);
            
            document.body.appendChild(this.dropdown);
        }
        
        renderTags() {
            this.element.querySelectorAll('.tag').forEach(tag => tag.remove());
            
            this.selectedTags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = `tag ${this.getTagVariant()}`;
                tagEl.innerHTML = `${tag}<span class="remove">&times;</span>`;
                
                tagEl.querySelector('.remove').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeTag(tag);
                });
                
                this.element.insertBefore(tagEl, this.input);
            });
        }
        
        getTagVariant() {
            if (this.element.classList.contains('primary')) return 'primary';
            if (this.element.classList.contains('success')) return 'success';
            if (this.element.classList.contains('warning')) return 'warning';
            if (this.element.classList.contains('danger')) return 'danger';
            if (this.element.classList.contains('info')) return 'info';
            return 'gray';
        }
        
        renderOptions(filter = '') {
            this.optionsContainer.innerHTML = '';
            
            if (this.selectedTags.length >= this.maxTags) {
                const empty = document.createElement('div');
                empty.className = 'dropdown-empty';
                empty.textContent = `Maximum ${this.maxTags} tags allowed`;
                this.optionsContainer.appendChild(empty);
                return;
            }
            
            const available = this.options.filter(opt => 
                !this.selectedTags.includes(opt) && 
                opt.toLowerCase().includes(filter.toLowerCase())
            );
            
            if (available.length === 0 && filter.trim() === '') {
                const empty = document.createElement('div');
                empty.className = 'dropdown-empty';
                empty.textContent = 'No options available';
                this.optionsContainer.appendChild(empty);
                return;
            }
            
            if (filter.trim() && !this.options.includes(filter.trim())) {
                const custom = document.createElement('div');
                custom.className = 'dropdown-option custom';
                custom.innerHTML = `<i class="ri-add-line"></i> Add "${filter.trim()}"`;
                custom.dataset.value = filter.trim();
                
                custom.addEventListener('click', () => {
                    this.addTag(filter.trim());
                    closeAllDropdowns();
                });
                
                this.optionsContainer.appendChild(custom);
            }
            
            available.forEach(opt => {
                const option = document.createElement('div');
                option.className = 'dropdown-option';
                option.textContent = opt;
                option.dataset.value = opt;
                
                option.addEventListener('click', () => {
                    this.addTag(opt);
                    closeAllDropdowns();
                });
                
                this.optionsContainer.appendChild(option);
            });
        }
        
        addTag(tag) {
            if (this.selectedTags.length >= this.maxTags) {
                alert(`Maximum ${this.maxTags} tags allowed`);
                return;
            }
            
            if (!this.selectedTags.includes(tag)) {
                this.selectedTags.push(tag);
                this.renderTags();
                this.input.value = '';
                
                this.element.dispatchEvent(new CustomEvent('change', {
                    bubbles: true,
                    detail: { tags: this.selectedTags }
                }));
            }
        }
        
        removeTag(tag) {
            this.selectedTags = this.selectedTags.filter(t => t !== tag);
            this.renderTags();
            
            this.element.dispatchEvent(new CustomEvent('change', {
                bubbles: true,
                detail: { tags: this.selectedTags }
            }));
        }
        
        bindEvents() {
            this.input.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAllDropdowns(this.dropdown);
                
                positionDropdown(this.dropdown, this.element);
                this.dropdown.classList.add('show');
                this.element.classList.add('focused');
                this.renderOptions();
                
                activeDropdown = this.dropdown;
                activeTrigger = this.element;
                
                // Tampilkan overlay di mobile
                if (window.innerWidth <= 768) {
                    const overlay = document.querySelector('.select-overlay');
                    if (overlay) {
                        overlay.classList.add('show');
                    }
                }
            });
            
            this.input.addEventListener('input', (e) => {
                if (this.dropdown.classList.contains('show')) {
                    positionDropdown(this.dropdown, this.element);
                    this.renderOptions(e.target.value);
                }
            });
            
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && this.input.value.trim()) {
                    e.preventDefault();
                    this.addTag(this.input.value.trim());
                }
                
                if (e.key === 'Escape') {
                    closeAllDropdowns();
                }
                
                if (e.key === 'Backspace' && this.input.value === '' && this.selectedTags.length > 0) {
                    this.selectedTags.pop();
                    this.renderTags();
                }
            });
            
            this.input.addEventListener('blur', () => {
                setTimeout(() => {
                    if (!this.element.contains(document.activeElement)) {
                        this.element.classList.remove('focused');
                    }
                }, 100);
            });
        }
    }

    const init = () => {
        document.querySelectorAll('.basic-select:not([data-initialized])').forEach(el => {
            el.setAttribute('data-initialized', 'true');
            new BasicSelect(el);
        });
        
        document.querySelectorAll('.tag-select:not([data-initialized])').forEach(el => {
            el.setAttribute('data-initialized', 'true');
            new TagSelect(el);
        });
    };

    // Tutup dropdown ketika klik di luar
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.basic-select') && 
            !e.target.closest('.tag-select') &&
            !e.target.closest('.basic-dropdown') &&
            !e.target.closest('.tag-dropdown')) {
            closeAllDropdowns();
        }
    });

    // Update posisi dropdown saat scroll
    window.addEventListener('scroll', () => {
        if (activeDropdown && activeTrigger) {
            positionDropdown(activeDropdown, activeTrigger);
        }
    }, { passive: true });

    // Update posisi dropdown saat resize
    window.addEventListener('resize', () => {
        if (activeDropdown && activeTrigger) {
            positionDropdown(activeDropdown, activeTrigger);
        }
    });

    // Tutup dengan tombol ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllDropdowns();
        }
    });

    // Setup overlay untuk mobile
    const setupMobileOverlay = () => {
        let overlay = document.querySelector('.select-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'select-overlay';
            overlay.style.zIndex = '999998';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', closeAllDropdowns);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            setupMobileOverlay();
        });
    } else {
        init();
        setupMobileOverlay();
    }

    window.TechAreaSelect2 = {
        getBasicValue: (selector) => {
            const el = document.querySelector(selector);
            return el?.querySelector('input')?.value || '';
        },
        
        getTagValues: (selector) => {
            const el = document.querySelector(selector);
            if (!el) return [];
            return Array.from(el.querySelectorAll('.tag')).map(tag => 
                tag.textContent.replace('×', '').trim()
            );
        },
        
        setBasicValue: (selector, value) => {
            const el = document.querySelector(selector);
            const instance = el?.__selectInstance;
            if (instance && instance.selectOption) {
                instance.selectOption(value);
                return true;
            }
            return false;
        },
        
        clearTags: (selector) => {
            const el = document.querySelector(selector);
            const instance = el?.__selectInstance;
            if (instance) {
                instance.selectedTags = [];
                instance.renderTags();
                return true;
            }
            return false;
        }
    };

})();

/* 
===========================================
SELECT2 FORM HANDLER - TECHAREA PRODUCTION
===========================================
Description: Form handling functions for Select2 components
*/

// Function to show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 999999; min-width: 350px; box-shadow: var(--shadow-lg);';
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="ri-${type === 'success' ? 'checkbox-circle' : 'information'}-line me-2 fs-5"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Function to collect all select values
function collectFormData() {
    const data = {
        // Basic Selects
        country: document.querySelectorAll('.basic-select')[0]?.querySelector('input')?.value || '',
        category: document.querySelectorAll('.basic-select')[1]?.querySelector('input')?.value || '',
        city: document.querySelectorAll('.basic-select')[2]?.querySelector('input')?.value || '',
        disabled: document.querySelectorAll('.basic-select')[3]?.querySelector('input')?.value || '',
        
        // Tag Selects - Bagian 2
        multipleCountries: Array.from(document.querySelectorAll('.tag-select.primary')[0]?.querySelectorAll('.tag') || []).map(t => t.textContent.replace('×', '').trim()),
        colors: Array.from(document.querySelectorAll('.tag-select.primary')[1]?.querySelectorAll('.tag') || []).map(t => t.textContent.replace('×', '').trim()),
        frameworks: Array.from(document.querySelectorAll('.tag-select.success')[0]?.querySelectorAll('.tag') || []).map(t => t.textContent.replace('×', '').trim()),
        languages: Array.from(document.querySelectorAll('.tag-select.success')[1]?.querySelectorAll('.tag') || []).map(t => t.textContent.replace('×', '').trim()),
        
        // Tag Selects - Bagian 3
        skills: Array.from(document.querySelectorAll('.tag-select.danger')[0]?.querySelectorAll('.tag') || []).map(t => t.textContent.replace('×', '').trim()),
        technologies: Array.from(document.querySelectorAll('.tag-select.info')[0]?.querySelectorAll('.tag') || []).map(t => t.textContent.replace('×', '').trim()),
        framework2: document.querySelectorAll('.basic-select')[4]?.querySelector('input')?.value || '',
        menuItems: document.querySelectorAll('.basic-select')[5]?.querySelector('input')?.value || ''
    };
    
    return data;
}

// Submit form function
function submitForm() {
    const formData = collectFormData();
    
    // Count selected items
    let totalSelected = 0;
    for (let key in formData) {
        if (Array.isArray(formData[key])) {
            totalSelected += formData[key].length;
        } else if (formData[key] && formData[key] !== '') {
            totalSelected++;
        }
    }
    
    // Log to console
    console.log('=== SELECT2 FORM SUBMISSION ===');
    console.log('Form Data:', formData);
    console.log('Total selections:', totalSelected);
    console.log('===============================');
    
    // Show success notification
    showNotification(`Form submitted successfully! Total ${totalSelected} items selected. Check console for details.`, 'success');
    
    return false;
}

// Reset all selects function
function resetAllSelects() {
    document.querySelectorAll('.basic-select input').forEach(input => {
        input.value = '';
    });
    
    document.querySelectorAll('.tag-select .tag').forEach(tag => {
        tag.remove();
    });
    
    document.querySelectorAll('.basic-select, .tag-select').forEach(el => {
        el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    showNotification('All selections have been reset', 'info');
}

// Initialize form handlers
function initSelect2Form() {
    // Reset button
    const resetBtn = document.getElementById('resetAll');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAllSelects);
    }
    
    // Form submission
    const form = document.getElementById('select2Form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitForm();
        });
    }
    
    console.log('Select2 Form Handler initialized');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSelect2Form);
} else {
    initSelect2Form();
}