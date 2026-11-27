
let products = JSON.parse(localStorage.getItem("jlInventory")) || [];

const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");
const productTable = document.getElementById("productTable");

const addProductBtn = document.getElementById("addProductBtn");
const closeModal = document.getElementById("closeModal");
const searchInput = document.getElementById("searchInput");

const productId = document.getElementById("productId");
const productName = document.getElementById("productName");
const category = document.getElementById("category");
const price = document.getElementById("price");
const quantity = document.getElementById("quantity");
const minimumStock = document.getElementById("minimumStock");

document.getElementById("year").textContent = new Date().getFullYear();

function saveProducts() {
    localStorage.setItem("jlInventory", JSON.stringify(products));
}

function formatMoney(amount) {
    return Number(amount).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function getStatus(product) {
    if (product.quantity === 0) {
        return { text: "Out of Stock", className: "out-stock" };
    }

    if (product.quantity <= product.minimumStock) {
        return { text: "Low Stock", className: "low-stock" };
    }

    return { text: "In Stock", className: "in-stock" };
}

function updateDashboard() {
    const totalProducts = products.length;

    const totalStock = products.reduce(
        (sum, product) => sum + product.quantity, 0
    );

    const lowStock = products.filter(
        product => product.quantity <= product.minimumStock
    ).length;

    const inventoryValue = products.reduce(
        (sum, product) => sum + product.price * product.quantity, 0
    );

    document.getElementById("totalProducts").textContent = totalProducts;
    document.getElementById("totalStock").textContent = totalStock;
    document.getElementById("lowStock").textContent = lowStock;

    document.getElementById("inventoryValue").textContent =
        "KES " + formatMoney(inventoryValue);
}

function displayProducts(search = "") {
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase())
    );

    if (filteredProducts.length === 0) {
        productTable.innerHTML = `
            <tr>
                <td colspan="6">No products found.</td>
            </tr>
        `;
        updateDashboard();
        return;
    }

    productTable.innerHTML = filteredProducts.map(product => {
        const status = getStatus(product);

        return `
            <tr>
                <td>${escapeHTML(product.name)}</td>
                <td>${escapeHTML(product.category)}</td>
                <td>${formatMoney(product.price)}</td>
                <td>${product.quantity}</td>
                <td>
                    <span class="badge ${status.className}">
                        ${status.text}
                    </span>
                </td>
                <td>
                    <button class="action-btn edit-btn"
                        data-action="edit" data-id="${product.id}">
                        Edit
                    </button>
                    <button class="action-btn delete-btn"
                        data-action="delete" data-id="${product.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    updateDashboard();
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function resetForm() {
    productForm.reset();
    productId.value = "";
    minimumStock.value = 5;
    document.getElementById("modalTitle").textContent =
        "Add New Product";
}

addProductBtn.addEventListener("click", () => {
    resetForm();
    productModal.style.display = "flex";
});

closeModal.addEventListener("click", () => {
    productModal.style.display = "none";
});

productModal.addEventListener("click", event => {
    if (event.target === productModal) {
        productModal.style.display = "none";
    }
});

productForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = productName.value.trim();
    const productCategory = category.value.trim();
    const productPrice = Number(price.value);
    const productQuantity = Number(quantity.value);
    const minStock = Number(minimumStock.value);

    if (!name || !productCategory ||
        !Number.isFinite(productPrice) || productPrice <= 0 ||
        !Number.isSafeInteger(productQuantity) || productQuantity < 0 ||
        !Number.isSafeInteger(minStock) || minStock < 0) {
        alert("Please enter valid product details.");
        return;
    }

    const existingProduct = products.find(
        product => product.id === productId.value
    );

    if (productId.value && !existingProduct) {
        alert("Product not found. Please refresh and try again.");
        return;
    }

    const product = {
        id: productId.value || Date.now().toString(),
        name,
        category: productCategory,
        price: productPrice,
        quantity: productQuantity,
        minimumStock: minStock
    };

    if (productId.value) {
        products = products.map(item =>
            item.id === productId.value ? product : item
        );
    } else {
        products.push(product);
    }

    saveProducts();
    displayProducts(searchInput.value);

    productModal.style.display = "none";
    resetForm();

    alert("Product saved successfully!");
});

productTable.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    const product = products.find(item => item.id === id);

    if (!product) return;

    if (action === "edit") {
        productId.value = product.id;
        productName.value = product.name;
        category.value = product.category;
        price.value = product.price;
        quantity.value = product.quantity;
        minimumStock.value = product.minimumStock;

        document.getElementById("modalTitle").textContent =
            "Edit Product";

        productModal.style.display = "flex";
    }

    if (action === "delete") {
        const confirmed = confirm(
            `Delete ${product.name} from inventory?`
        );

        if (confirmed) {
            products = products.filter(item => item.id !== id);
            saveProducts();
            displayProducts(searchInput.value);
        }
    }
});

searchInput.addEventListener("input", () => {
    displayProducts(searchInput.value);
});

displayProducts();
