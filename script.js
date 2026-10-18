
document.addEventListener('DOMContentLoaded', () => {
    // NAVEGACIÓN Y TABS
    const tabs = document.querySelectorAll('.tabs a');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
            
            // Subir la página con efecto smooth al cambiar de pestaña
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // SISTEMA DE NOTIFICACIONES (TOAST)
    function showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 3000);
    }

    // LÓGICA DEL CARRITO
    let cart = [];

    function updateCartView() {
        const cartList = document.getElementById('cart-items');
        const totalElem = document.getElementById('cart-total');
        const cartCount = document.getElementById('cart-count');
        cartList.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span style="flex:1;">${item.name}</span> <span class="gold-text">$${item.price}</span>`;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'del-btn';
            removeBtn.textContent = '✕';
            removeBtn.onclick = () => { cart.splice(index, 1); updateCartView(); };
            
            li.appendChild(removeBtn);
            cartList.appendChild(li);
            total += item.price;
        });

        totalElem.textContent = `$${total}`;
        cartCount.textContent = cart.length;
        if(cart.length === 0) { 
            cartList.innerHTML = '<li class="text-muted" style="justify-content:center; border:none;">Tu orden está vacía</li>'; 
        }
    }
    updateCartView();

    // AGREGAR AL CARRITO (CATÁLOGO Y ADEREZOS)
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));
            cart.push({ name, price });
            updateCartView();
            showToast(`Agregado: ${name}`);
        });
    });

    // CALCULADORA "TU ESTILO, TU ROLLO"
    const customForm = document.getElementById('custom-roll-form');
    const livePriceEl = document.getElementById('custom-live-price');
    const basePrice = 63; // Precio base oculto

    const qtyControls = document.querySelectorAll('.qty-control');
    qtyControls.forEach(control => {
        const btnMinus = control.querySelector('.btn-minus');
        const btnPlus = control.querySelector('.btn-plus');
        const input = control.querySelector('.qty-input');

        btnPlus.addEventListener('click', () => { 
            input.value = parseInt(input.value) + 1; 
            calculateCustomPrice(); 
        });
        
        btnMinus.addEventListener('click', () => { 
            if (parseInt(input.value) > 0) { 
                input.value = parseInt(input.value) - 1; 
                calculateCustomPrice(); 
            } 
        });
        
        input.addEventListener('change', () => { 
            if (input.value < 0 || isNaN(input.value) || input.value === '') input.value = 0; 
            calculateCustomPrice(); 
        });
    });

    function calculateCustomPrice() {
        let total = basePrice;
        customForm.querySelectorAll('.qty-input').forEach(input => {
            const qty = parseInt(input.value);
            if(qty > 0) { total += (qty * parseFloat(input.dataset.price)); }
        });
        livePriceEl.textContent = total;
        return total;
    }

    document.getElementById('btn-mi-estilo').addEventListener('click', () => {
        const finalPrice = calculateCustomPrice();
        let ingredientes = [];
        
        customForm.querySelectorAll('.qty-input').forEach(input => {
            const qty = parseInt(input.value);
            if (qty > 0) ingredientes.push(`${qty}x ${input.dataset.name}`);
        });

        if(ingredientes.length === 0) { 
            alert('Agrega al menos un ingrediente a tu base.'); 
            return; 
        }

        const customName = `Rollo Tu Estilo: (${ingredientes.join(', ')})`;
        cart.push({ name: customName, price: finalPrice });
        updateCartView();
        showToast('Rollo a tu estilo creado');
        
        // Resetear visualización del form y saltar a carrito
        customForm.querySelectorAll('.qty-input').forEach(input => input.value = 0);
        calculateCustomPrice();
        document.querySelector('a[href="#seleccion"]').click();
    });

    // FINALIZAR POR WHATSAPP
    document.getElementById('btn-whatsapp').addEventListener('click', () => {
        if(cart.length === 0) { 
            alert('Agrega especialidades a tu orden primero.'); 
            return; 
        }
        
        const nombre = document.getElementById('cliente-nombre').value;
        const ubicacion = document.getElementById('cliente-ubicacion').value;
        const fecha = document.getElementById('cliente-fecha').value;
        const pago = document.getElementById('cliente-pago').value;
        const telefono = document.getElementById('cliente-telefono').value;

        if(!nombre || !ubicacion || !fecha || !telefono) { 
            alert('Por favor, completa tus datos de entrega en el formulario.'); 
            return; 
        }

        let pedidoTexto = "*🍣 NUEVO PEDIDO KURO ROLLS 🍣*\n\n";
        pedidoTexto += `*👤 Cliente:* ${nombre}\n*📍 Ubicación:* ${ubicacion}\n*⏰ Fecha:* ${fecha.replace('T', ' ')}\n*📞 Teléfono:* ${telefono}\n*💳 Pago:* ${pago.toUpperCase()}\n\n*🛒 ORDEN:*\n`;
        
        let total = 0;
        cart.forEach(item => { 
            pedidoTexto += `▫️ ${item.name} - $${item.price}\n`; 
            total += item.price; 
        });
        pedidoTexto += `\n*🧾 TOTAL:* $${total}`;

        const numeroDestino = "524622431013";
        const urlWhatsapp = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(pedidoTexto)}`;
        
        window.open(urlWhatsapp, '_blank');

        // Ocultar form y mostrar éxito
        document.getElementById('checkout-form').style.display = 'none';
        const msgDiv = document.getElementById('mensaje-agradecimiento');
        msgDiv.style.display = 'block';
        msgDiv.innerHTML = `<h3 class="gold-text font-serif" style="margin-bottom:15px; font-size:1.8rem;">¡Orden Confirmada!</h3>
                            <p class="font-sans text-muted">Gracias ${nombre}, hemos preparado tu pedido para el ${fecha.replace('T', ' a las ')}.</p>
                            <button onclick="location.reload()" class="btn-elegant-outline" style="margin-top:30px;">Hacer Nueva Orden</button>`;
    });
});
