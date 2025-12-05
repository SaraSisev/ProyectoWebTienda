import PDFDocument from "pdfkit";

export default function generatePdfBuffer(data) {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));

        // ============================
        // ENCABEZADO
        // ============================
        try {
            doc.image("utils/LogoBlockWorld.png", 50, 30, { width: 80 }); 
        } catch (err) {
            console.log("Logo no encontrado, continuando sin logo");
        }

        doc.fontSize(22)
            .font("Helvetica-Bold")
            .text("BlockWorld Store", 150, 40);

        doc.fontSize(10)
            .font("Helvetica")
            .text("Construye aventuras, colecciona momentos", 150, 65)
            .text("www.blockworld.com | contacto@blockworld.com", 150, 80)
            .text("Tel: (55) 1234-5678", 150, 95);

        doc.moveTo(50, 110).lineTo(550, 110).stroke(); 

        // ============================
        // TÍTULO y FECHA
        // ============================
        doc.moveDown(1); 
        doc.fontSize(18).font("Helvetica-Bold").text("NOTA DE COMPRA", { align: "center" });

        doc.moveDown(0.2); 
        doc.fontSize(11)
            .font("Helvetica")
            .text(
                `Fecha: ${new Date().toLocaleDateString("es-MX")} - ${new Date().toLocaleTimeString("es-MX")}`,
                { align: "center" }
            );

        doc.moveDown(2); 

        // ============================
        // DATOS DEL CLIENTE
        // ============================
        doc.fontSize(14).font("Helvetica-Bold").text("DATOS DEL CLIENTE", 50);

        doc.moveDown(0.4); 
        doc.fontSize(11).font("Helvetica");

        let clienteDetalleY = doc.y;
        const lineSpacing = 16; 

        doc.text(`Nombre: ${data.userName}`, 50, clienteDetalleY)
           .text(`Correo: ${data.userEmail}`, 50, clienteDetalleY + lineSpacing);

        if (data.datosEnvio) {
            clienteDetalleY += (lineSpacing * 2.5); 
            doc.text(`Dirección: ${data.datosEnvio.direccion}`, 50, clienteDetalleY)
               .text(`Ciudad: ${data.datosEnvio.ciudad}, ${data.datosEnvio.pais}`, 50, clienteDetalleY + lineSpacing)
               .text(`C.P.: ${data.datosEnvio.cp}`, 50, clienteDetalleY + (lineSpacing * 2))
               .text(`Teléfono: ${data.datosEnvio.telefono}`, 50, clienteDetalleY + (lineSpacing * 3));
            
            doc.y = clienteDetalleY + (lineSpacing * 4); 
        }

        doc.moveDown(0.5); 

        // ============================
        // TABLA DE PRODUCTOS
        // ============================
        doc.fontSize(14).font("Helvetica-Bold").text("PRODUCTOS", 50);
        doc.moveDown(0.6);

        const tableTop = doc.y;

        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Producto", 50, tableTop)
            .text("Cant.", 310, tableTop, { width: 40, align: "center" })
            .text("Precio Unit.", 380, tableTop, { width: 70, align: "right" })
            .text("Subtotal", 470, tableTop, { width: 80, align: "right" });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let y = tableTop + 25;
        doc.font("Helvetica");

        data.carrito.forEach((item) => {
            const subtotalItem = item.precio * item.cantidad;

            doc.text(item.nombre, 50, y, { width: 240 })
                .text(item.cantidad, 310, y, { width: 40, align: "center" })
                .text(`$${parseFloat(item.precio).toFixed(2)}`, 380, y, { width: 70, align: "right" })
                .text(`$${subtotalItem.toFixed(2)}`, 470, y, { width: 80, align: "right" });

            y += 22;

            if (y > 680) {
                doc.addPage();
                y = 50;
            }
        });

        doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
        y += 30;

        // ============================
        // TOTALES
        // ============================
        const labelX = 370; 
        const valueX = 460;
        const widthCol = 90;

        doc.fontSize(11).font("Helvetica");

        const writeTotal = (label, value, isNegative = false) => {
            doc.text(label, labelX, y, { width: widthCol, align: "left" });
            
            let displayValue = value.toFixed(2);
            if (isNegative) {
                displayValue = `(${Math.abs(value).toFixed(2)})`;
            }

            doc.text(`$${displayValue}`, valueX, y, { width: widthCol, align: "right" });
            y += 18;
        };

        let porcentajeImpuesto;
        if (data.tasaImpuesto) {
            porcentajeImpuesto = data.tasaImpuesto;
        } else if (data.esMexico) {
            //México
            porcentajeImpuesto = 16;
        } else {
            // Por defecto, calcular desde los datos
            porcentajeImpuesto = data.subtotal > 0 
                ? Math.round((data.impuestos / data.subtotal) * 100) 
                : 16;
        }

        writeTotal("Subtotal:", data.subtotal);
        writeTotal(`Impuestos (${porcentajeImpuesto}%):`, data.impuestos);
        writeTotal("Envío:", data.envio);

        if (data.descuento > 0) {
            doc.fillColor("green");
            writeTotal(`Cupón (${data.cuponUsado || "DESC"}):`, data.descuento, true);
            doc.fillColor("black");
        }

        doc.moveTo(labelX, y + 10).lineTo(550, y + 10).stroke();
        y += 25;

        doc.fontSize(16)
            .font("Helvetica-Bold")
            .text("TOTAL:", labelX, y, { width: widthCol, align: "left" })
            .text(`$${data.total.toFixed(2)}`, valueX, y, { width: widthCol, align: "right" });

        // ============================
        // MÉTODO DE PAGO
        // ============================
        doc.fontSize(11)
            .font("Helvetica")
            .text(`\nMétodo de pago: ${formatMetodoPago(data.metodoPago)}`, 50, y + 50);

        // ============================
        // FOOTER
        // ============================
        doc.moveDown(5);

        doc.fontSize(9)
            .font("Helvetica-Oblique")
            .text("Gracias por tu compra. Para cualquier duda, contáctanos.", {
                width: 500,
                align: "center",
            });

        doc.end();
    });
}

function formatMetodoPago(metodo) {
    const metodos = {
        tarjeta: "Tarjeta de Crédito/Débito",
        transferencia: "Transferencia Bancaria",
        oxxo: "Pago en OXXO",
    };
    return metodos[metodo] || metodo;
}