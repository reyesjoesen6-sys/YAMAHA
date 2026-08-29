/*******************************************************
 * YAMAHA STORE FRONTEND
 *******************************************************/


/*
 * =====================================================
 * GOOGLE APPS SCRIPT WEB APP URL
 * =====================================================
 *
 * AFTER DEPLOYING YOUR CODE.GS:
 *
 * Deploy
 * > New deployment
 * > Web app
 *
 * Copy the /exec URL and paste it here.
 */

const API_URL =
    "https://script.google.com/macros/s/AKfycbzcHjp3KmQhoXPCa3HFvqk3Rz3-xKvd14A5_PhhyIjeGWEIyKXb2Gnu7_KPtrIWnW2i/exec";


/*
 * =====================================================
 * GLOBAL VARIABLES
 * =====================================================
 */

let currentCustomer = null;

let adminSessionId = null;

let currentAdmin = null;

let customerOTPEmail = "";

let adminOTPEmail = "";

let cart = [];

let products = [];


/*
 * =====================================================
 * API REQUEST
 * =====================================================
 */

async function api(action, data = {}) {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({
                action: action,
                ...data
            })

        });

        const result = await response.json();

        return result;

    } catch (error) {

        console.error(error);

        showToast(
            "Cannot connect to Google Apps Script."
        );

        return {
            success: false,
            message: "Connection error."
        };
    }
}


/*
 * =====================================================
 * INITIALIZE
 * =====================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCart();

        showLogin();

    }
);


/*
 * =====================================================
 * AUTH PAGE
 * =====================================================
 */

function hideAuthBoxes() {

    const boxes = [

        "customerLoginBox",
        "registerBox",
        "customerOTPBox",
        "adminLoginBox",
        "adminOTPBox",
        "adminPasscodeBox"

    ];

    boxes.forEach(function (id) {

        document
            .getElementById(id)
            .classList.add("hidden");

    });
}


function showLogin() {

    hideAuthBoxes();

    document
        .getElementById("customerLoginBox")
        .classList.remove("hidden");
}


function showRegister() {

    hideAuthBoxes();

    document
        .getElementById("registerBox")
        .classList.remove("hidden");
}


function showAdminLogin() {

    hideAuthBoxes();

    document
        .getElementById("adminLoginBox")
        .classList.remove("hidden");
}


/*
 * =====================================================
 * CUSTOMER REGISTER
 * =====================================================
 */

async function registerCustomer() {

    const name =
        document.getElementById(
            "registerName"
        ).value.trim();

    const email =
        document.getElementById(
            "registerEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "registerPassword"
        ).value;

    if (!name || !email || !password) {

        showToast(
            "Please complete all fields."
        );

        return;
    }

    const result = await api(
        "register",
        {
            name: name,
            email: email,
            password: password
        }
    );

    if (result.success) {

        customerOTPEmail = email;

        hideAuthBoxes();

        document
            .getElementById("customerOTPBox")
            .classList.remove("hidden");

        showToast(
            "OTP sent to your Gmail."
        );

    } else {

        showToast(result.message);

    }
}


/*
 * =====================================================
 * CUSTOMER LOGIN
 * =====================================================
 */

async function customerLogin() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "loginPassword"
        ).value;

    if (!email || !password) {

        showToast(
            "Enter Gmail and password."
        );

        return;
    }

    const result = await api(
        "customerLogin",
        {
            email: email,
            password: password
        }
    );

    if (result.success) {

        currentCustomer =
            result.customer;

        openCustomerSystem();

    } else if (result.requireOTP) {

        customerOTPEmail = email;

        hideAuthBoxes();

        document
            .getElementById("customerOTPBox")
            .classList.remove("hidden");

        showToast(
            "OTP sent to your Gmail."
        );

    } else {

        showToast(result.message);

    }
}


/*
 * =====================================================
 * CUSTOMER OTP
 * =====================================================
 */

async function verifyCustomerOTP() {

    const otp =
        document.getElementById(
            "customerOTP"
        ).value.trim();

    if (otp.length !== 6) {

        showToast(
            "Enter the 6-digit OTP."
        );

        return;
    }

    const result = await api(
        "verifyCustomerOTP",
        {
            email: customerOTPEmail,
            otp: otp
        }
    );

    if (result.success) {

        showToast(
            "Account verified. Login now."
        );

        showLogin();

    } else {

        showToast(result.message);

    }
}


async function resendCustomerOTP() {

    if (!customerOTPEmail) {

        showToast(
            "Email not found."
        );

        return;
    }

    const result = await api(
        "resendCustomerOTP",
        {
            email: customerOTPEmail
        }
    );

    showToast(result.message);
}


/*
 * =====================================================
 * CUSTOMER SYSTEM
 * =====================================================
 */

function openCustomerSystem() {

    document
        .getElementById("authPage")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");

    document
        .getElementById("adminNavBtn")
        .classList.add("hidden");

    showPage("home");

    loadProducts();

    loadCustomerOrders();

    updateCartCount();
}


/*
 * =====================================================
 * ADMIN LOGIN
 * =====================================================
 */

async function adminLogin() {

    const email =
        document.getElementById(
            "adminEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "adminPassword"
        ).value;

    if (!email || !password) {

        showToast(
            "Enter admin Gmail and password."
        );

        return;
    }

    const result = await api(
        "adminLogin",
        {
            email: email,
            password: password
        }
    );

    if (result.success) {

        adminOTPEmail = email;

        hideAuthBoxes();

        document
            .getElementById("adminOTPBox")
            .classList.remove("hidden");

        showToast(
            "OTP sent to admin Gmail."
        );

    } else {

        showToast(result.message);

    }
}


/*
 * =====================================================
 * ADMIN OTP
 * =====================================================
 */

async function verifyAdminOTP() {

    const otp =
        document.getElementById(
            "adminOTP"
        ).value.trim();

    if (otp.length !== 6) {

        showToast(
            "Enter the 6-digit OTP."
        );

        return;
    }

    const result = await api(
        "verifyAdminOTP",
        {
            email: adminOTPEmail,
            otp: otp
        }
    );

    if (result.success) {

        adminSessionId =
            result.sessionId;

        hideAuthBoxes();

        document
            .getElementById("adminPasscodeBox")
            .classList.remove("hidden");

        showToast(
            "OTP verified."
        );

    } else {

        showToast(result.message);

    }
}


/*
 * =====================================================
 * ADMIN PASSCODE
 * =====================================================
 */

async function verifyAdminPasscode() {

    const passcode =
        document.getElementById(
            "adminPasscode"
        ).value;

    if (!passcode) {

        showToast(
            "Enter admin passcode."
        );

        return;
    }

    const result = await api(
        "verifyAdminPasscode",
        {
            sessionId: adminSessionId,
            passcode: passcode
        }
    );

    if (result.success) {

        currentAdmin =
            result.admin;

        openAdminSystem();

    } else {

        showToast(result.message);

    }
}


/*
 * =====================================================
 * OPEN ADMIN SYSTEM
 * =====================================================
 */

function openAdminSystem() {

    document
        .getElementById("authPage")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");

    document
        .getElementById("adminNavBtn")
        .classList.remove("hidden");

    document
        .getElementById("adminName")
        .textContent =
        "Logged in as: " +
        currentAdmin.name +
        " (" +
        currentAdmin.email +
        ")";

    showPage("adminPage");

    loadAdminDashboard();

    loadAdminProducts();

    loadAdminOrders();

    loadAdminCustomers();
}


/*
 * =====================================================
 * PAGE NAVIGATION
 * =====================================================
 */

function showPage(pageId) {

    if (!currentCustomer && !currentAdmin) {

        return;
    }

    document
        .querySelectorAll(".page")
        .forEach(function (page) {

            page.classList.add("hidden");

        });

    const page =
        document.getElementById(pageId);

    if (page) {

        page.classList.remove("hidden");

    }

    if (pageId === "cartPage") {

        renderCart();

    }

    if (pageId === "ordersPage") {

        loadCustomerOrders();

    }

    if (pageId === "adminPage") {

        if (currentAdmin) {

            loadAdminDashboard();

            loadAdminProducts();

            loadAdminOrders();

            loadAdminCustomers();

        }

    }
}


/*
 * =====================================================
 * LOAD PRODUCTS
 * =====================================================
 */

async function loadProducts() {

    const result =
        await api("getProducts");

    if (!result.success) {

        showToast(result.message);

        return;
    }

    products =
        result.products || [];

    renderProducts();

}


/*
 * =====================================================
 * RENDER PRODUCTS
 * =====================================================
 */

function renderProducts(
    list = products
) {

    const grid =
        document.getElementById(
            "productsGrid"
        );

    const featured =
        document.getElementById(
            "featuredProducts"
        );

    grid.innerHTML = "";

    featured.innerHTML = "";

    list.forEach(function (product) {

        grid.innerHTML +=
            productHTML(product);

    });

    list
        .slice(0, 4)
        .forEach(function (product) {

            featured.innerHTML +=
                productHTML(product);

        });
}


function productHTML(product) {

    let image = "";

    if (product.image) {

        image =
            `<img src="${escapeHTML(product.image)}"
                  alt="${escapeHTML(product.name)}">`;

    } else {

        image =
            `<div class="product-placeholder">
                🏍️
             </div>`;
    }

    const disabled =
        Number(product.stock) <= 0
            ? "disabled"
            : "";

    return `

        <div class="product-card">

            <div class="product-image">

                ${image}

            </div>

            <div class="product-info">

                <span class="category">
                    ${escapeHTML(product.category)}
                </span>

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    ${escapeHTML(product.description || "")}
                </p>

                <div class="price">
                    ₱${formatMoney(product.price)}
                </div>

                <div class="stock">
                    Stock: ${product.stock}
                </div>

                <button
                    class="primary-btn"
                    ${disabled}
                    onclick="addToCart('${product.id}')">

                    ${Number(product.stock) <= 0
                        ? "Out of Stock"
                        : "Add to Cart"}

                </button>

            </div>

        </div>
    `;
}


/*
 * =====================================================
 * SEARCH
 * =====================================================
 */

function searchProducts() {

    const query =
        document
            .getElementById("productSearch")
            .value
            .toLowerCase();

    const filtered =
        products.filter(function (product) {

            return (

                product.name
                    .toLowerCase()
                    .includes(query)

                ||

                product.category
                    .toLowerCase()
                    .includes(query)

            );

        });

    renderProducts(filtered);
}


/*
 * =====================================================
 * CART
 * =====================================================
 */

function loadCart() {

    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "yamahaCart"
                )
            ) || [];

    } catch (e) {

        cart = [];

    }

    updateCartCount();
}


function saveCart() {

    localStorage.setItem(
        "yamahaCart",
        JSON.stringify(cart)
    );

    updateCartCount();
}


function addToCart(productId) {

    const product =
        products.find(function (p) {

            return String(p.id) ===
                String(productId);

        });

    if (!product) {

        return;
    }

    if (Number(product.stock) <= 0) {

        showToast(
            "Product is out of stock."
        );

        return;
    }

    const existing =
        cart.find(function (item) {

            return String(item.id) ===
                String(productId);

        });

    if (existing) {

        if (
            existing.quantity <
            Number(product.stock)
        ) {

            existing.quantity++;

        } else {

            showToast(
                "Maximum available stock reached."
            );

            return;
        }

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1
        });

    }

    saveCart();

    showToast(
        product.name +
        " added to cart."
    );
}


function removeFromCart(productId) {

    cart =
        cart.filter(function (item) {

            return String(item.id) !==
                String(productId);

        });

    saveCart();

    renderCart();
}


function changeQuantity(
    productId,
    amount
) {

    const item =
        cart.find(function (item) {

            return String(item.id) ===
                String(productId);

        });

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {

        removeFromCart(productId);

        return;
    }

    const product =
        products.find(function (p) {

            return String(p.id) ===
                String(productId);

        });

    if (
        product &&
        item.quantity > Number(product.stock)
    ) {

        item.quantity =
            Number(product.stock);

        showToast(
            "Maximum stock reached."
        );
    }

    saveCart();

    renderCart();
}


function renderCart() {

    const container =
        document.getElementById(
            "cartItems"
        );

    if (!cart.length) {

        container.innerHTML =
            `
            <div class="order-card">
                <h3>Your cart is empty.</h3>
                <p>
                    Add Yamaha products first.
                </p>
            </div>
            `;

        document
            .getElementById("cartTotal")
            .textContent = "0";

        return;
    }

    let total = 0;

    container.innerHTML = "";

    cart.forEach(function (item) {

        const subtotal =
            item.price *
            item.quantity;

        total += subtotal;

        container.innerHTML += `

            <div class="cart-item">

                <div>

                    <h3>
                        ${escapeHTML(item.name)}
                    </h3>

                    <p>
                        ₱${formatMoney(item.price)}
                        each
                    </p>

                </div>

                <div>

                    <button
                        class="small-btn edit-btn"
                        onclick="changeQuantity(
                            '${item.id}',
                            -1
                        )">
                        -
                    </button>

                    <strong>
                        ${item.quantity}
                    </strong>

                    <button
                        class="small-btn edit-btn"
                        onclick="changeQuantity(
                            '${item.id}',
                            1
                        )">
                        +
                    </button>

                </div>

                <strong>
                    ₱${formatMoney(subtotal)}
                </strong>

                <button
                    class="small-btn delete-btn"
                    onclick="removeFromCart(
                        '${item.id}'
                    )">
                    Remove
                </button>

            </div>

        `;
    });

    document
        .getElementById("cartTotal")
        .textContent =
        formatMoney(total);
}


function updateCartCount() {

    const count =
        cart.reduce(
            function (sum, item) {

                return sum +
                    Number(item.quantity);

            },
            0
        );

    document
        .getElementById("cartCount")
        .textContent = count;
}


/*
 * =====================================================
 * CHECKOUT
 * =====================================================
 */

async function checkout() {

    if (!currentCustomer) {

        showToast(
            "Please login as customer first."
        );

        return;
    }

    if (!cart.length) {

        showToast(
            "Your cart is empty."
        );

        return;
    }

    const result =
        await api(
            "createOrder",
            {
                customerEmail:
                    currentCustomer.email,

                items: cart
            }
        );

    if (result.success) {

        cart = [];

        saveCart();

        showToast(
            "Order " +
            result.orderId +
            " created successfully."
        );

        loadProducts();

        renderCart();

        showPage("ordersPage");

        loadCustomerOrders();

    } else {

        showToast(result.message);

    }
}


/*
 * =====================================================
 * CUSTOMER ORDERS
 * =====================================================
 */

async function loadCustomerOrders() {

    if (!currentCustomer) return;

    const result =
        await api(
            "getOrders",
            {
                email:
                    currentCustomer.email
            }
        );

    if (!result.success) {

        return;
    }

    const container =
        document.getElementById(
            "customerOrders"
        );

    container.innerHTML = "";

    if (!result.orders.length) {

        container.innerHTML = `

            <div class="order-card">

                <h3>
                    No orders yet.
                </h3>

            </div>

        `;

        return;
    }

    result.orders
        .reverse()
        .forEach(function (order) {

            let itemText = "";

            order.items.forEach(function (item) {

                itemText +=
                    `${item.name} × ${item.quantity}<br>`;

            });

            container.innerHTML += `

                <div class="order-card">

                    <div class="order-header">

                        <strong>
                            ${order.id}
                        </strong>

                        <span class="status">
                            ${order.status}
                        </span>

                    </div>

                    <p>
                        ${itemText}
                    </p>

                    <br>

                    <strong>
                        Total:
                        ₱${formatMoney(order.total)}
                    </strong>

                </div>

            `;

        });
}


/*
 * =====================================================
 * ADMIN DASHBOARD
 * =====================================================
 */

async function loadAdminDashboard() {

    if (!adminSessionId) return;

    const result =
        await api(
            "getDashboard",
            {
                sessionId:
                    adminSessionId
            }
        );

    if (!result.success) {

        adminLogout();

        return;
    }

    const data =
        result.dashboard;

    document
        .getElementById("statProducts")
        .textContent =
        data.products;

    document
        .getElementById("statCustomers")
        .textContent =
        data.customers;

    document
        .getElementById("statOrders")
        .textContent =
        data.orders;

    document
        .getElementById("statSales")
        .textContent =
        formatMoney(data.totalSales);
}


/*
 * =====================================================
 * ADMIN PRODUCTS
 * =====================================================
 */

async function loadAdminProducts() {

    const result =
        await api(
            "getProducts"
        );

    if (!result.success) return;

    products =
        result.products;

    const container =
        document.getElementById(
            "adminProducts"
        );

    let html = `

        <table>

            <thead>

                <tr>

                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>

                </tr>

            </thead>

            <tbody>

    `;

    products.forEach(function (product) {

        html += `

            <tr>

                <td>
                    ${escapeHTML(product.id)}
                </td>

                <td>
                    ${escapeHTML(product.name)}
                </td>

                <td>
                    ${escapeHTML(product.category)}
                </td>

                <td>
                    ₱${formatMoney(product.price)}
                </td>

                <td>
                    ${product.stock}
                </td>

                <td>

                    <button
                        class="small-btn edit-btn"
                        onclick="editProduct(
                            '${product.id}'
                        )">
                        Edit
                    </button>

                    <button
                        class="small-btn delete-btn"
                        onclick="deleteProduct(
                            '${product.id}'
                        )">
                        Delete
                    </button>

                </td>

            </tr>

        `;

    });

    html += `

            </tbody>

        </table>

    `;

    container.innerHTML = html;
}


/*
 * =====================================================
 * ADD / EDIT PRODUCT MODAL
 * =====================================================
 */

function openProductModal(product = null) {

    document
        .getElementById("productModal")
        .classList.remove("hidden");

    if (product) {

        document
            .getElementById("modalTitle")
            .textContent =
            "Update Product";

        document
            .getElementById("productId")
            .value =
            product.id;

        document
            .getElementById("productName")
            .value =
            product.name;

        document
            .getElementById("productCategory")
            .value =
            product.category;

        document
            .getElementById("productPrice")
            .value =
            product.price;

        document
            .getElementById("productStock")
            .value =
            product.stock;

        document
            .getElementById("productDescription")
            .value =
            product.description || "";

        document
            .getElementById("productImage")
            .value =
            product.image || "";

    } else {

        document
            .getElementById("modalTitle")
            .textContent =
            "Add Product";

        clearProductForm();

    }
}


function closeProductModal() {

    document
        .getElementById("productModal")
        .classList.add("hidden");

}


function clearProductForm() {

    document
        .getElementById("productId")
        .value = "";

    document
        .getElementById("productName")
        .value = "";

    document
        .getElementById("productPrice")
        .value = "";

    document
        .getElementById("productStock")
        .value = "";

    document
        .getElementById("productDescription")
        .value = "";

    document
        .getElementById("productImage")
        .value = "";
}


function editProduct(id) {

    const product =
        products.find(function (p) {

            return String(p.id) ===
                String(id);

        });

    if (!product) return;

    openProductModal(product);
}


/*
 * =====================================================
 * SAVE PRODUCT
 * =====================================================
 */

async function saveProduct() {

    if (!adminSessionId) {

        showToast(
            "Admin authentication required."
        );

        return;
    }

    const id =
        document
            .getElementById("productId")
            .value;

    const data = {

        sessionId:
            adminSessionId,

        id: id,

        name:
            document
                .getElementById("productName")
                .value.trim(),

        category:
            document
                .getElementById("productCategory")
                .value,

        price:
            Number(
                document
                    .getElementById("productPrice")
                    .value
            ),

        stock:
            Number(
                document
                    .getElementById("productStock")
                    .value
            ),

        description:
            document
                .getElementById("productDescription")
                .value.trim(),

        image:
            document
                .getElementById("productImage")
                .value.trim()

    };

    if (!data.name || !data.price) {

        showToast(
            "Product name and price are required."
        );

        return;
    }

    let result;

    if (id) {

        result =
            await api(
                "updateProduct",
                data
            );

    } else {

        result =
            await api(
                "addProduct",
                data
            );

    }

    if (result.success) {

        closeProductModal();

        showToast(
            result.message
        );

        loadProducts();

        loadAdminProducts();

        loadAdminDashboard();

    } else {

        showToast(result.message);

    }
}


/*
 * =====================================================
 * DELETE PRODUCT
 * =====================================================
 */

async function deleteProduct(id) {

    if (!adminSessionId) {

        showToast(
            "Admin authentication required."
        );

        return;
    }

    const product =
        products.find(function (p) {

            return String(p.id) ===
                String(id);

        });

    if (!product) return;

    const confirmed =
        confirm(
            "Delete " +
            product.name +
            "?"
        );

    if (!confirmed) return;

    const result =
        await api(
            "deleteProduct",
            {
                sessionId:
                    adminSessionId,

                id: id
            }
        );

    if (result.success) {

        showToast(
            result.message
        );

        loadProducts();

        loadAdminProducts();

        loadAdminDashboard();

    } else {

        showToast(result.message);

    }
}


/*
 * =====================================================
 * ADMIN ORDERS
 * =====================================================
 */

async function loadAdminOrders() {

    if (!adminSessionId) return;

    const result =
        await api(
            "getOrders",
            {
                admin: true,

                email:
                    currentAdmin.email
            }
        );

    if (!result.success) return;

    const container =
        document.getElementById(
            "adminOrders"
        );

    let html = `

        <table>

            <thead>

                <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>

            </thead>

            <tbody>

    `;

    result.orders.forEach(function (order) {

        html += `

            <tr>

                <td>
                    ${escapeHTML(order.id)}
                </td>

                <td>
                    ${escapeHTML(
                        order.customerName
                    )}
                    <br>
                    <small>
                        ${escapeHTML(
                            order.customerEmail
                        )}
                    </small>
                </td>

                <td>
                    ₱${formatMoney(order.total)}
                </td>

                <td>
                    ${escapeHTML(order.status)}
                </td>

                <td>

                    <select
                        onchange="changeOrderStatus(
                            '${order.id}',
                            this.value
                        )">

                        <option
                            ${order.status === "Pending"
                                ? "selected"
                                : ""}>
                            Pending
                        </option>

                        <option
                            ${order.status === "Processing"
                                ? "selected"
                                : ""}>
                            Processing
                        </option>

                        <option
                            ${order.status === "Completed"
                                ? "selected"
                                : ""}>
                            Completed
                        </option>

                        <option
                            ${order.status === "Cancelled"
                                ? "selected"
                                : ""}>
                            Cancelled
                        </option>

                    </select>

                </td>

            </tr>

        `;

    });

    html += `

            </tbody>

        </table>

    `;

    container.innerHTML = html;
}


async function changeOrderStatus(
    orderId,
    status
) {

    const result =
        await api(
            "updateOrderStatus",
            {
                sessionId:
                    adminSessionId,

                orderId:
                    orderId,

                status:
                    status
            }
        );

    showToast(
        result.message
    );

    loadAdminOrders();

    loadAdminDashboard();
}


/*
 * =====================================================
 * ADMIN CUSTOMERS
 * =====================================================
 */

async function loadAdminCustomers() {

    if (!adminSessionId) return;

    const result =
        await api(
            "getCustomers",
            {
                sessionId:
                    adminSessionId
            }
        );

    if (!result.success) return;

    const container =
        document.getElementById(
            "adminCustomers"
        );

    let html = `

        <table>

            <thead>

                <tr>
                    <th>Customer ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Verified</th>
                    <th>Created</th>
                </tr>

            </thead>

            <tbody>

    `;

    result.customers.forEach(function (customer) {

        html += `

            <tr>

                <td>
                    ${escapeHTML(customer.id)}
                </td>

                <td>
                    ${escapeHTML(customer.name)}
                </td>

                <td>
                    ${escapeHTML(customer.email)}
                </td>

                <td>
                    ${escapeHTML(customer.verified)}
                </td>

                <td>
                    ${escapeHTML(
                        String(customer.createdAt)
                    )}
                </td>

            </tr>

        `;

    });

    html += `

            </tbody>

        </table>

    `;

    container.innerHTML = html;
}


/*
 * =====================================================
 * ADMIN LOGOUT
 * =====================================================
 */

function adminLogout() {

    adminSessionId = null;

    currentAdmin = null;

    document
        .getElementById("app")
        .classList.add("hidden");

    document
        .getElementById("authPage")
        .classList.remove("hidden");

    document
        .getElementById("adminNavBtn")
        .classList.add("hidden");

    showLogin();

    showToast(
        "Admin panel locked."
    );
}


/*
 * =====================================================
 * GENERAL LOGOUT
 * =====================================================
 */

function logout() {

    currentCustomer = null;

    currentAdmin = null;

    adminSessionId = null;

    document
        .getElementById("app")
        .classList.add("hidden");

    document
        .getElementById("authPage")
        .classList.remove("hidden");

    showLogin();
}


/*
 * =====================================================
 * TOAST
 * =====================================================
 */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(
        function () {

            toast.classList.remove("show");

        },
        3000
    );
}


/*
 * =====================================================
 * HELPERS
 * =====================================================
 */

function formatMoney(number) {

    return Number(number || 0)
        .toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}


function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
