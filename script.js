document.addEventListener("DOMContentLoaded", () => {
    limpiarCampos();
});

function limpiarCampos() {
    localStorage.clear();
    document.getElementById("nombre-empresa").value = "";
    document.getElementById("razon-social").value = "";
    document.getElementById("rut").value = "";
    document.getElementById("direccion").value = "";
    document.getElementById("nombre-cliente").value = "";
    document.getElementById("direccion-cliente").value = "";
    document.getElementById("telefono-cliente").value = "";
    document.getElementById("email-cliente").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("factura").innerHTML = "<h2>Factura</h2>";
}


function guardarEmpresa() {
    const empresa = {
        nombre: document.getElementById("nombre-empresa").value,
        razonSocial: document.getElementById("razon-social").value,
        rut: document.getElementById("rut").value,
        direccion: document.getElementById("direccion").value
    };
    localStorage.setItem("empresa", JSON.stringify(empresa));
    alert("Datos de la empresa guardados.");
    mostrarFacturaEnPantalla();
}

function agregarProducto() {
    const descripcion = document.getElementById("descripcion").value;
    const cantidad = parseFloat(document.getElementById("cantidad").value);
    const precio = parseFloat(document.getElementById("precio").value);
    
    if (!descripcion || isNaN(cantidad) || isNaN(precio)) {
        alert("Por favor, ingrese todos los datos del producto.");
        return;
    }
    
    const producto = { descripcion, cantidad, precio };
    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    productos.push(producto);
    localStorage.setItem("productos", JSON.stringify(productos));
    
    mostrarFacturaEnPantalla();
    document.getElementById("descripcion").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("precio").value = "";
}

function mostrarFacturaEnPantalla() {
    const facturaContainer = document.getElementById("factura");
    facturaContainer.innerHTML = "<h2>Factura</h2>";
    
    const empresa = JSON.parse(localStorage.getItem("empresa"));
    if (empresa) {
        facturaContainer.innerHTML += `<p><strong>Empresa:</strong> ${empresa.nombre}</p>`;
        facturaContainer.innerHTML += `<p><strong>Razón Social:</strong> ${empresa.razonSocial}</p>`;
        facturaContainer.innerHTML += `<p><strong>RUT:</strong> ${empresa.rut}</p>`;
        facturaContainer.innerHTML += `<p><strong>Dirección:</strong> ${empresa.direccion}</p>`;
    }
    
    const cliente = JSON.parse(localStorage.getItem("cliente"));
    if (cliente) {
        facturaContainer.innerHTML += `<h3>Datos del Cliente</h3>`;
        facturaContainer.innerHTML += `<p><strong>Nombre:</strong> ${cliente.nombre}</p>`;
        facturaContainer.innerHTML += `<p><strong>Dirección:</strong> ${cliente.direccion}</p>`;
        facturaContainer.innerHTML += `<p><strong>Teléfono:</strong> ${cliente.telefono}</p>`;
        facturaContainer.innerHTML += `<p><strong>Email:</strong> ${cliente.email}</p>`;
    }
    
    facturaContainer.innerHTML += `<p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>`;
    
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    let total = 0;
    if (productos.length > 0) {
        let tablaHTML = `<table border='1'><tr><th>Descripción</th><th>Cantidad</th><th>Precio</th><th>Total</th></tr>`;
        productos.forEach((p, index) => {
            let subtotal = p.cantidad * p.precio;
            total += subtotal;
            tablaHTML += `<tr>
                <td>${p.descripcion}</td>
                <td>${p.cantidad}</td>
                <td>$${p.precio}</td>
                <td>$${subtotal}</td>
                <td><button onclick='eliminarProducto(${index})'>Eliminar</button></td>
            </tr>`;
        });
        tablaHTML += `<tr><td colspan='3'><strong>Total:</strong></td><td><strong>$${total}</strong></td></tr>`;
        tablaHTML += "</table>";
        facturaContainer.innerHTML += tablaHTML;
    }
    
    facturaContainer.innerHTML += `<button onclick='generarFacturaPDF()'>Descargar Factura en PDF</button>`;
}

function generarFacturaPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const empresa = JSON.parse(localStorage.getItem("empresa"));
    const cliente = JSON.parse(localStorage.getItem("cliente"));
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    let total = 0;

    doc.text("Factura", 20, 20);
    
    if (empresa) {
        doc.text(`Empresa: ${empresa.nombre}`, 20, 30);
        doc.text(`Razón Social: ${empresa.razonSocial}`, 20, 40);
        doc.text(`RUT: ${empresa.rut}`, 20, 50);
        doc.text(`Dirección: ${empresa.direccion}`, 20, 60);
    }
    
    if (cliente) {
        doc.text("Datos del Cliente", 20, 80);
        doc.text(`Nombre: ${cliente.nombre}`, 20, 90);
        doc.text(`Dirección: ${cliente.direccion}`, 20, 100);
        doc.text(`Teléfono: ${cliente.telefono}`, 20, 110);
        doc.text(`Email: ${cliente.email}`, 20, 120);
    }
    
    const datosTabla = productos.map(p => {
        let subtotal = p.cantidad * p.precio;
        total += subtotal;
        return [p.descripcion, p.cantidad, `$${p.precio}`, `$${subtotal}`];
    });
    
    doc.autoTable({
        startY: 130,
        head: [["Descripción", "Cantidad", "Precio", "Total"]],
        body: datosTabla
    });
    
    doc.text(`Total Factura: $${total}`, 20, doc.autoTable.previous.finalY + 10);
    
    doc.save("Factura.pdf");
}
