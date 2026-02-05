/* 
===========================================
DASHBOARD APPLICATION JAVASCRIPT
===========================================
Author: TechArea Production
Description: Main JavaScript for dashboard functionality
*/

// Dashboard Module
const Dashboard = (function () {
  // DOM Elements
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuItems = document.querySelectorAll(".menu-item:not(.has-dropdown)");
  const dropdownItems = document.querySelectorAll(".menu-item.has-dropdown");

  // Initialize Dashboard
  function init() {
    console.log("Dashboard initialized");
    setupEventListeners();
    setActiveMenuItem();
    closeAllDropdowns(); // Close all dropdowns by default
    updateMobileMenuIcon();
  }

  // ==================== EVENT LISTENERS ====================
  function setupEventListeners() {
    // Mobile menu toggle
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", toggleSidebar);
    }

    // Overlay click to close sidebar
    if (overlay) {
      overlay.addEventListener("click", closeSidebar);
    }

    // Regular menu item click
    menuItems.forEach((item) => {
      item.addEventListener("click", handleMenuItemClick);
    });

    // Dropdown menu item click
    dropdownItems.forEach((item) => {
      item.addEventListener("click", handleDropdownClick);
    });

    // Submenu item click
    document.querySelectorAll(".submenu-item").forEach((item) => {
      item.addEventListener("click", handleSubmenuItemClick);
    });

    // Close sidebar on window resize if needed
    window.addEventListener("resize", handleResize);

    // Prevent dropdown closing when clicking inside
    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
      menu.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    });
  }

  // ==================== SIDEBAR FUNCTIONS ====================
  function toggleSidebar() {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
    updateMobileMenuIcon();
  }

  function openSidebar() {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    updateMobileMenuIcon();
  }

  function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    updateMobileMenuIcon();
  }

  function updateMobileMenuIcon() {
    if (mobileMenuBtn) {
      const icon = mobileMenuBtn.querySelector("i");
      if (sidebar.classList.contains("active")) {
        icon.className = "ri-close-line icon-fixed-size";
      } else {
        icon.className = "ri-menu-2-line icon-fixed-size";
      }
    }
  }

  // ==================== MENU FUNCTIONS ====================
  // Remove all active classes
  function removeAllActiveClasses() {
    // Remove from all menu items
    document.querySelectorAll(".menu-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Remove from all submenu items
    document.querySelectorAll(".submenu-item").forEach((item) => {
      item.classList.remove("active");
    });
  }

  // Handle regular menu item click
  function handleMenuItemClick(e) {
    e.preventDefault();

    // Remove all active class
    removeAllActiveClasses();

    // Close all dropdowns
    closeAllDropdowns();

    // Add active class to clicked item
    this.classList.add("active");

    // Close sidebar on mobile after selection
    if (window.innerWidth < 992) {
      closeSidebar();
    }

    // Update page content based on selected menu
    updatePageContent(this.getAttribute("data-menu"));
  }

  // Handle dropdown menu click
  function handleDropdownClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const menuName = this.getAttribute("data-menu");
    const submenu = document.getElementById(`submenu-${menuName}`);
    const arrow = this.querySelector(".menu-arrow");

    closeAllDropdownsExcept(menuName);

    if (submenu) {
      submenu.classList.toggle("open");
      arrow.classList.toggle("rotated");
    }
  }

  // Handle submenu item click
  function handleSubmenuItemClick(e) {
    e.preventDefault();

    const submenu = this.closest(".submenu");
    const dropdownParent = document.querySelector(
      `.menu-item[data-menu="${submenu.id.replace("submenu-", "")}"]`,
    );

    // Remove all active class
    removeAllActiveClasses();

    // Add active class to dropdown parent
    if (dropdownParent) {
      dropdownParent.classList.add("active");
    }

    // Add active class to clicked submenu item
    this.classList.add("active");

    // Open dropdown parent if not already open
    if (submenu && !submenu.classList.contains("open")) {
      submenu.classList.add("open");
      if (dropdownParent) {
        const arrow = dropdownParent.querySelector(".menu-arrow");
        if (arrow) {
          arrow.classList.add("rotated");
        }
      }
    }

    // Close sidebar on mobile after selection
    if (window.innerWidth < 992) {
      closeSidebar();
    }

    // Update page content
    updatePageContent(this.closest(".submenu").id.replace("submenu-", ""));
  }

  // ==================== DROPDOWN FUNCTIONS ====================
  function closeAllDropdowns() {
    document.querySelectorAll(".submenu").forEach((submenu) => {
      submenu.classList.remove("open");
    });

    document.querySelectorAll(".menu-arrow").forEach((arrow) => {
      arrow.classList.remove("rotated");
    });

    dropdownItems.forEach((item) => {
      item.classList.remove("active");
    });
  }

  function closeAllDropdownsExcept(excludeMenu) {
    document.querySelectorAll(".submenu").forEach((submenu) => {
      if (!submenu.id.includes(excludeMenu)) {
        submenu.classList.remove("open");
      }
    });

    document.querySelectorAll(".menu-arrow").forEach((arrow) => {
      arrow.classList.remove("rotated");
    });

    dropdownItems.forEach((item) => {
      const menuName = item.getAttribute("data-menu");
      if (menuName !== excludeMenu) {
        item.classList.remove("active");
      }
    });
  }

  // ==================== PAGE CONTENT UPDATER ====================
  function updatePageContent(page) {
    console.log(`Loading page: ${page}`);
    // Here you would typically load content via AJAX or update the main content area
    // For now, we'll just log to console
    // Example: loadContent(page);
  }

  // ==================== INITIAL SETUP ====================
  function setActiveMenuItem() {
    // Set first regular menu item as active by default
    if (menuItems.length > 0 && !document.querySelector(".menu-item.active")) {
      menuItems[0].classList.add("active");
    }
  }

  // ==================== WINDOW RESIZE HANDLER ====================
  function handleResize() {
    if (window.innerWidth >= 992) {
      // On desktop, ensure sidebar is visible and overlay is hidden
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      updateMobileMenuIcon();

      // Close all dropdowns on desktop resize
      closeAllDropdowns();
    }
  }

  // ==================== PUBLIC API ====================
  return {
    init,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    updatePageContent,
  };
})();

// ==================== INITIALIZE DASHBOARD ====================
document.addEventListener("DOMContentLoaded", function () {
  Dashboard.init();

  // Initialize Bootstrap tooltips if any
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize Bootstrap popovers if any
  const popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]'),
  );
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
});

// ==================== UTILITY FUNCTIONS ====================
// Format numbers with commas
function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

// Format date
function formatDate(date) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
}

// Show notification
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText =
    "top: 20px; right: 20px; z-index: 1050; min-width: 300px;";
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  // Add to body
  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

// Export utilities if needed
window.DashboardUtils = {
  formatNumber,
  formatDate,
  showNotification,
};




