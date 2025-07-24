document.addEventListener('DOMContentLoaded', () => {
    const usersTableBody = document.getElementById('users-table-body');
    const userForm = document.getElementById('user-form');
    const userIdInput = document.getElementById('user-id');
    const userNombreInput = document.getElementById('user-nombre');
    const userEmailInput = document.getElementById('user-email');
    const userTelefonoInput = document.getElementById('user-telefono');
    const userDireccionInput = document.getElementById('user-direccion');
    const userTipoInput = document.getElementById('user-tipo');
    const userModalLabel = document.getElementById('userModalLabel');
    const btnNewUser = document.getElementById('btn-new-user');

    const navUsuarios = document.getElementById('nav-usuarios');
    const navVentas = document.getElementById('nav-ventas');
    const navFacturas = document.getElementById('nav-facturas');

    const usuariosSection = document.getElementById('usuarios-section');
    const ventasSection = document.getElementById('ventas-section');
    const facturasSection = document.getElementById('facturas-section');

    // Elementos de la sección de ventas
    const selectCliente = document.getElementById('select-cliente');
    const selectProducto = document.getElementById('select-producto');
    const inputCantidad = document.getElementById('input-cantidad');
    const inputSubtotal = document.getElementById('input-subtotal');
    const btnAddToCart = document.getElementById('btn-add-to-cart');
    const cartTableBody = document.getElementById('cart-table-body');
    const totalFacturaSpan = document.getElementById('total-factura');
    const btnFinalizeInvoice = document.getElementById('btn-finalize-invoice');

    // Elementos de la sección de facturas
    const invoicesListContainer = document.getElementById('invoices-list-container');

    let productsData = []; // Para almacenar los productos cargados y sus precios
    let cart = []; // Carrito de compras

    // Funciones para cambiar de sección
    function showSection(sectionToShow) {
        usuariosSection.style.display = 'none';
        ventasSection.style.display = 'none';
        facturasSection.style.display = 'none';

        navUsuarios.classList.remove('active');
        navVentas.classList.remove('active');
        navFacturas.classList.remove('active');

        sectionToShow.style.display = 'block';
        if (sectionToShow === usuariosSection) navUsuarios.classList.add('active');
        else if (sectionToShow === ventasSection) navVentas.classList.add('active');
        else if (sectionToShow === facturasSection) navFacturas.classList.add('active');
    }

    navUsuarios.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(usuariosSection);
        loadUsers();
    });

    navVentas.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(ventasSection);
        loadClients();
        loadProducts();
        resetCart();
    });

    navFacturas.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(facturasSection);
        loadInvoices();
    });

    // Cargar usuarios al inicio (sección por defecto)
    showSection(usuariosSection);
    loadUsers();

    // --- Gestión de Usuarios ---

    btnNewUser.addEventListener('click', () => {
        userForm.reset();
        userIdInput.value = '';
        userModalLabel.textContent = 'Crear Nuevo Usuario';
    });

    async function loadUsers() {
        try {
            const response = await fetch('/api/usuarios');
            const users = await response.json();
            usersTableBody.innerHTML = '';
            users.forEach(user => {
                const row = usersTableBody.insertRow();
                row.insertCell().textContent = user.id_usuario;
                row.insertCell().textContent = user.nombre;
                row.insertCell().textContent = user.email;
                row.insertCell().textContent = user.telefono;
                row.insertCell().textContent = user.direccion;
                row.insertCell().textContent = user.tipo;
                row.insertCell().textContent = user.estado;
                const actionsCell = row.insertCell();

                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.classList.add('btn', 'btn-warning', 'btn-sm', 'me-2');
                editButton.addEventListener('click', () => editUser(user));
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Eliminar';
                deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
                deleteButton.addEventListener('click', () => deleteUser(user.id_usuario));
                actionsCell.appendChild(deleteButton);
            });
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    }

    async function saveUser(event) {
        event.preventDefault();
        const id = userIdInput.value;
        const nombre = userNombreInput.value;
        const email = userEmailInput.value;
        const telefono = userTelefonoInput.value;
        const direccion = userDireccionInput.value;
        const tipo = userTipoInput.value;

        const userData = { nombre, email, telefono, direccion, tipo };

        try {
            let response;
            if (id) {
                response = await fetch(`/api/usuarios/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
            } else {
                response = await fetch('/api/usuarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
            }

            if (response.ok) {
                alert(id ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
                const userModal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
                userModal.hide();
                loadUsers();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            alert('Error al guardar usuario.');
        }
    }

    function editUser(user) {
        userIdInput.value = user.id_usuario;
        userNombreInput.value = user.nombre;
        userEmailInput.value = user.email;
        userTelefonoInput.value = user.telefono;
        userDireccionInput.value = user.direccion;
        userTipoInput.value = user.tipo;
        userModalLabel.textContent = 'Editar Usuario';
        const userModal = new bootstrap.Modal(document.getElementById('userModal'));
        userModal.show();
    }

    async function deleteUser(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este usuario (desactivar)?')) {
            try {
                const response = await fetch(`/api/usuarios/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert('Usuario desactivado exitosamente');
                    loadUsers();
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                alert('Error al eliminar usuario.');
            }
        }
    }

    userForm.addEventListener('submit', saveUser);

    // --- Gestión de Ventas ---

    async function loadClients() {
        try {
            const response = await fetch('/api/usuarios/clientes');
            const clients = await response.json();
            selectCliente.innerHTML = '<option value="">Seleccione un cliente</option>';
            clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id_usuario;
                option.textContent = client.nombre;
                selectCliente.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }
    }

    async function loadProducts() {
        try {
            const response = await fetch('/api/productos');
            // Parsear el precio a float inmediatamente después de recibir los datos
            productsData = (await response.json()).map(p => ({ ...p, precio: parseFloat(p.precio) }));
            selectProducto.innerHTML = '<option value="">Seleccione un producto</option>';
            productsData.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id_producto;
                option.textContent = `${product.nombre} (Stock: ${product.stock})`;
                option.dataset.price = product.precio; // Guardar precio en el dataset
                option.dataset.stock = product.stock; // Guardar stock en el dataset
                selectProducto.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    function calculateProductSubtotal() {
        const selectedProductOption = selectProducto.options[selectProducto.selectedIndex];
        // Asegurarse de que price sea un número
        const price = parseFloat(selectedProductOption.dataset.price || 0);
        const quantity = parseInt(inputCantidad.value || 0);
        const subtotal = price * quantity;
        inputSubtotal.value = subtotal.toFixed(2);
    }

    selectProducto.addEventListener('change', calculateProductSubtotal);
    inputCantidad.addEventListener('input', calculateProductSubtotal);

    btnAddToCart.addEventListener('click', () => {
        const selectedProductId = selectProducto.value;
        const quantity = parseInt(inputCantidad.value);

        if (!selectedProductId || quantity <= 0) {
            alert('Por favor, seleccione un producto y una cantidad válida.');
            return;
        }

        const product = productsData.find(p => p.id_producto == selectedProductId);

        if (!product) {
            alert('Producto no encontrado.');
            return;
        }

        if (quantity > product.stock) {
            alert(`No hay suficiente stock para ${product.nombre}. Stock disponible: ${product.stock}`);
            return;
        }

        // Verificar si el producto ya está en el carrito
        const existingCartItem = cart.find(item => item.id_producto === product.id_producto);

        if (existingCartItem) {
            // Si ya existe, actualizar la cantidad
            if (existingCartItem.cantidad + quantity > product.stock) {
                alert(`No puedes agregar más de ${product.stock - existingCartItem.cantidad} unidades de ${product.nombre}.`);
                return;
            }
            existingCartItem.cantidad += quantity;
            // Asegurarse de que el subtotal se recalcule con números
            existingCartItem.subtotal = existingCartItem.cantidad * product.precio;
        } else {
            // Si no existe, añadirlo como nuevo
            cart.push({
                id_producto: product.id_producto,
                nombre: product.nombre,
                // Asegurarse de que precio_unitario sea un número
                precio_unitario: product.precio,
                cantidad: quantity,
                // Asegurarse de que subtotal se calcule con números
                subtotal: quantity * product.precio
            });
        }

        renderCart();
        calculateTotal();
        // Restablecer campos de producto y cantidad después de agregar al carrito
        selectProducto.value = '';
        inputCantidad.value = 1;
        inputSubtotal.value = '';
    });

    function renderCart() {
        cartTableBody.innerHTML = '';
        cart.forEach((item, index) => {
            const row = cartTableBody.insertRow();
            row.insertCell().textContent = item.nombre;
            row.insertCell().textContent = item.cantidad;
            // Asegurarse de que precio_unitario sea un número antes de toFixed
            row.insertCell().textContent = item.precio_unitario.toFixed(2);
            // Asegurarse de que subtotal sea un número antes de toFixed
            row.insertCell().textContent = item.subtotal.toFixed(2);
            const actionsCell = row.insertCell();
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Quitar';
            removeButton.classList.add('btn', 'btn-danger', 'btn-sm');
            removeButton.addEventListener('click', () => removeItemFromCart(index));
            actionsCell.appendChild(removeButton);
        });
    }

    function removeItemFromCart(index) {
        cart.splice(index, 1);
        renderCart();
        calculateTotal();
    }

    function calculateTotal() {
        // Asegurarse de que la suma se haga con números
        const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
        totalFacturaSpan.textContent = total.toFixed(2);
    }

    function resetCart() {
        cart = [];
        renderCart();
        calculateTotal();
        selectCliente.value = '';
        selectProducto.value = '';
        inputCantidad.value = 1;
        inputSubtotal.value = '';
    }

    btnFinalizeInvoice.addEventListener('click', async () => {
        const id_usuario = selectCliente.value;

        if (!id_usuario) {
            alert('Por favor, seleccione un cliente.');
            return;
        }

        if (cart.length === 0) {
            alert('El carrito está vacío. Agregue productos antes de finalizar la factura.');
            return;
        }

        try {
            // 1. Crear la factura
            const invoiceResponse = await fetch('/api/ventas/factura', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_usuario })
            });

            if (!invoiceResponse.ok) {
                const errorData = await invoiceResponse.json();
                throw new Error(`Error al crear factura: ${errorData.error}`);
            }
            const invoiceData = await invoiceResponse.json();
            const id_factura = invoiceData.id_factura;

            // 2. Agregar productos al detalle de la factura
            for (const item of cart) {
                const detailResponse = await fetch('/api/ventas/detalle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_factura: id_factura,
                        id_producto: item.id_producto,
                        cantidad: item.cantidad
                    })
                });

                if (!detailResponse.ok) {
                    const errorData = await detailResponse.json();
                    throw new Error(`Error al agregar producto ${item.nombre}: ${errorData.error}`);
                }
            }

            alert('Factura finalizada exitosamente!');
            resetCart(); // Limpiar el carrito y campos después de finalizar

        } catch (error) {
            console.error('Error al finalizar factura:', error);
            alert(`Error al finalizar factura: ${error.message}`);
        }
    });

    // --- Funciones de Facturas ---
    async function loadInvoices() {
        try {
            const response = await fetch('/api/ventas/facturas');
            const rawInvoices = await response.json();

            // Agrupar los detalles por factura
            const invoicesMap = new Map();
            rawInvoices.forEach(item => {
                if (!invoicesMap.has(item.id_factura)) {
                    invoicesMap.set(item.id_factura, {
                        id_factura: item.id_factura,
                        codigo_factura: item.codigo_factura,
                        fecha: item.fecha,
                        total: parseFloat(item.total),
                        impuesto: parseFloat(item.impuesto),
                        estado_factura: item.estado_factura,
                        nombre_cliente: item.nombre_cliente,
                        email_cliente: item.email_cliente,
                        detalles: []
                    });
                }
                // Solo agregar si hay detalles de producto y el id_detalle no es nulo (para facturas sin productos)
                if (item.id_detalle) {
                    invoicesMap.get(item.id_factura).detalles.push({
                        id_detalle: item.id_detalle,
                        nombre_producto: item.nombre_producto,
                        cantidad: item.cantidad,
                        precio_unitario: parseFloat(item.precio_unitario),
                        subtotal: parseFloat(item.subtotal)
                    });
                }
            });

            const invoices = Array.from(invoicesMap.values());

            invoicesListContainer.innerHTML = '';
            if (invoices.length === 0) {
                invoicesListContainer.innerHTML = '<p>No hay facturas registradas.</p>';
                return;
            }

            invoices.forEach(invoice => {
                const invoiceCard = document.createElement('div');
                invoiceCard.classList.add('card', 'mb-3');
                invoiceCard.innerHTML = `
                    <div class="card-header bg-primary text-white">
                        Factura #${invoice.codigo_factura} - Cliente: ${invoice.nombre_cliente} (${invoice.email_cliente})
                    </div>
                    <div class="card-body">
                        <p><strong>Fecha:</strong> ${new Date(invoice.fecha).toLocaleString()}</p>
                        <p><strong>Estado:</strong> ${invoice.estado_factura}</p>
                        <h5>Detalles:</h5>
                        <table class="table table-sm table-bordered">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unitario</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoice.detalles.length > 0 ? invoice.detalles.map(detail => `
                                    <tr>
                                        <td>${detail.nombre_producto}</td>
                                        <td>${detail.cantidad}</td>
                                        <td>${detail.precio_unitario.toFixed(2)}</td>
                                        <td>${detail.subtotal.toFixed(2)}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4">No hay productos en esta factura.</td></tr>'}
                            </tbody>
                        </table>
                        <p class="text-end"><strong>Impuesto (IVA):</strong> ${invoice.impuesto.toFixed(2)}</p>
                        <h4 class="text-end"><strong>Total:</strong> ${invoice.total.toFixed(2)}</h4>
                    </div>
                `;
                invoicesListContainer.appendChild(invoiceCard);
            });

        } catch (error) {
            console.error('Error al cargar facturas:', error);
            invoicesListContainer.innerHTML = '<p class="text-danger">Error al cargar las facturas.</p>';
        }
    }
});