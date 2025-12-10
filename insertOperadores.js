const mongoose = require('mongoose');
const Operador = require('./src/database/models/Operador');

// Configuración de la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitmah';

// Datos reales de los operadores
const operadores = [
    { id: 1, tarjeton: "TPA0001", nombre: "ORAN AZPEITIA JESÚS" },
    { id: 2, tarjeton: "TPA0002", nombre: "LEÓN ESQUIVEL REFUGIO" },
    { id: 3, tarjeton: "TPA0005", nombre: "BAUTISTA BAUTISTA EFRAÍN" },
    { id: 4, tarjeton: "TPA0008", nombre: "SANTILLAN VÁZQUEZ GLADIS" },
    { id: 5, tarjeton: "TPA0009", nombre: "ISLAS CASTRO GUILLERMO" },
    { id: 6, tarjeton: "TPA0010", nombre: "ESCUDERO LARA JOEL" },
    { id: 7, tarjeton: "TPA0011", nombre: "RÍOS SALAS JORGE" },
    { id: 8, tarjeton: "TPA0013", nombre: "ESPINOZA ORTIZ JULIO IVÁN" },
    { id: 9, tarjeton: "TPA0014", nombre: "CERÓN MORALES MATÍAS" },
    { id: 10, tarjeton: "TPA0019", nombre: "CASTILLO MARTÍNEZ MARIO" },
    { id: 11, tarjeton: "TPA0020", nombre: "BONILLA CABAÑAS ALEJANDRO" },
    { id: 12, tarjeton: "TPA0021", nombre: "HERNÁNDEZ BOJORQUEZ GILBERTO" },
    { id: 13, tarjeton: "TPA0022", nombre: "HERNÁNDEZ RÍOS JOSÉ ALFREDO" },
    { id: 14, tarjeton: "TPA0024", nombre: "CABAÑAS GARCÍA AGUSTÍN" },
    { id: 15, tarjeton: "TPA0028", nombre: "OLIVARES MENDOZA ÁNGEL" },
    { id: 16, tarjeton: "TPA0029", nombre: "PADILLA GARCÍA ARMANDO" },
    { id: 17, tarjeton: "TPA0034", nombre: "PÉREZ CASTAÑEDA TOMAS" },
    { id: 18, tarjeton: "TPA0036", nombre: "GARCÍA CANO ERNESTO" },
    { id: 19, tarjeton: "TPA0038", nombre: "HERNÁNDEZ ALCIBAR FRANCISCO" },
    { id: 20, tarjeton: "TPA0039", nombre: "BARAJAS OLMOS GUSTAVO" },
    { id: 21, tarjeton: "TPA0044", nombre: "DOLORES LÓPEZ ARTEMIO" },
    { id: 22, tarjeton: "TPA0045", nombre: "MONZALVO HERNÁNDEZ JAIME" },
    { id: 23, tarjeton: "TPA0046", nombre: "PÉREZ MARTÍNEZ JESÚS" },
    { id: 24, tarjeton: "TPA0048", nombre: "PALOMINO HERNÁNDEZ JOSÉ ROBERTO" },
    { id: 25, tarjeton: "TPA0052", nombre: "SÁNCHEZ UBALDO JUAN GERMÁN" },
    { id: 26, tarjeton: "TPA0054", nombre: "MONZALVO MORALES JUAN MANUEL" },
    { id: 27, tarjeton: "TPA0056", nombre: "PRADO GONZÁLEZ MARTÍN GREGORIO" },
    { id: 28, tarjeton: "TPA0057", nombre: "GUTIÉRREZ HIDALGO OSCAR" },
    { id: 29, tarjeton: "TPA0058", nombre: "ANAYA AVILÉS OSCAR" },
    { id: 30, tarjeton: "TPA0060", nombre: "VICTORIA RUBIO ROBERTO" },
    { id: 31, tarjeton: "TPA0061", nombre: "MONZALVO HERNÁNDEZ SANTIAGO" },
    { id: 32, tarjeton: "TPA0067", nombre: "MARTÍNEZ JIMÉNEZ ALEJANDRO" },
    { id: 33, tarjeton: "TPA0068", nombre: "TRUJILLO ALVARADO LUIS PABLO" },
    { id: 34, tarjeton: "TPA0069", nombre: "NIETO FLORES MIGUEL ÁNGEL" },
    { id: 35, tarjeton: "TPA0070", nombre: "HERNÁNDEZ JUÁREZ NICOLAS" },
    { id: 36, tarjeton: "TPA0077", nombre: "VALENCIA DORANTES JOAQUIN" },
    { id: 37, tarjeton: "TPA0079", nombre: "MADARIAGA ESPINOSA OSCAR ARMANDO" },
    { id: 38, tarjeton: "TPA0080", nombre: "NORIEGA ORTEGA RAFAEL" },
    { id: 39, tarjeton: "TPA0083", nombre: "ACAXTENCO MORGADO JOSÉ" },
    { id: 40, tarjeton: "TPA0084", nombre: "MARTÍNEZ ARISTA FERMIN" },
    { id: 41, tarjeton: "TPA0086", nombre: "ZUÑIGA OLMOS OSCAR ANDRÉS" },
    { id: 42, tarjeton: "TPA0087", nombre: "PÉREZ RUÍZ DAVID" },
    { id: 43, tarjeton: "TPA0092", nombre: "MEJÍA GÓMEZ GABINO" },
    { id: 44, tarjeton: "TPA0095", nombre: "ISLAS MENESES ELOY" },
    { id: 45, tarjeton: "TPA0097", nombre: "GARCÍA RUIZ JOSÉ LUIS" },
    { id: 46, tarjeton: "TPA0098", nombre: "SANTILLAN SANTILLAN JUAN CARLOS" },
    { id: 47, tarjeton: "TPA0100", nombre: "GUTIÉRREZ LUGO ARMANDO" },
    { id: 48, tarjeton: "TPA0101", nombre: "RAMÍREZ BARRAZA ÁNGEL GABRIEL" },
    { id: 49, tarjeton: "TPA0104", nombre: "MONTES DE OCA ISLAS OSCAR" },
    { id: 50, tarjeton: "TPA0107", nombre: "RODRÍGUEZ RECILLAS ALEJANDRO" },
    { id: 51, tarjeton: "TPA0108", nombre: "HERNÁNDEZ PÉREZ ARTURO" },
    { id: 52, tarjeton: "TPA0110", nombre: "SÁNCHEZ BAUTISTA ERNESTO" },
    { id: 53, tarjeton: "TPA0113", nombre: "CURIEL SÁNCHEZ JOSÉ DANIEL" },
    { id: 54, tarjeton: "TPA0115", nombre: "PALACIOS DOMÍNGUEZ LEONARDO" },
    { id: 55, tarjeton: "TPA0116", nombre: "BOLAÑOS GÓMEZ LUIS ÁNGEL" },
    { id: 56, tarjeton: "TPA0117", nombre: "CERÓN ORDOÑEZ RODOLFO" },
    { id: 57, tarjeton: "TPA0123", nombre: "HERNÁNDEZ REYES JAVIER" },
    { id: 58, tarjeton: "TPA0126", nombre: "GARCÍA RUIZ JAVIER" },
    { id: 59, tarjeton: "TPA0129", nombre: "IBARRA PERALES ALFREDO" },
    { id: 60, tarjeton: "TPA0132", nombre: "NIETO LÓPEZ NOÉ" },
    { id: 61, tarjeton: "TPA0134", nombre: "VILLAFUERTE TREJO SERGIO" },
    { id: 62, tarjeton: "TPA0143", nombre: "ISLAS FLORES JOSÉ" },
    { id: 63, tarjeton: "TPA0151", nombre: "SÁNCHEZ LEÓN JUAN MANUEL" },
    { id: 64, tarjeton: "TPA0265", nombre: "CORONA VÁZQUEZ HÉCTOR OSCAR" },
    { id: 65, tarjeton: "TPA0267", nombre: "MARTÍNEZ MONTAÑO FLORENTINO ESMEREGILDO" },
    { id: 66, tarjeton: "TPA0270", nombre: "PÉREZ RUÍZ MELESIO" },
    { id: 67, tarjeton: "TPA0163", nombre: "FLORES SÁNCHEZ ARMANDO" },
    { id: 68, tarjeton: "TPA0165", nombre: "ZAMORA VARGAS EDGAR RICARDO" },
    { id: 69, tarjeton: "TPA0168", nombre: "MORENO CASTILLO JESÚS ENRIQUE" },
    { id: 70, tarjeton: "TPA0172", nombre: "CRUZ HERNÁNDEZ ÁNGEL" },
    { id: 71, tarjeton: "TPA0177", nombre: "LECHUGA JUÁREZ MARIO ALBERTO" },
    { id: 72, tarjeton: "TPA0178", nombre: "NARANJO RAMÍREZ JOSÉ ENRIQUE" },
    { id: 73, tarjeton: "TPA0184", nombre: "FUENTES LÓPEZ JUAN JOSÉ" },
    { id: 74, tarjeton: "TPA0186", nombre: "GONZÁLEZ HERNÁNDEZ EDUARDO" },
    { id: 75, tarjeton: "TPA0188", nombre: "LANGO AVILEZ ISRAEL" },
    { id: 76, tarjeton: "TPA0189", nombre: "LEÓN CARRILLO ENRIQUE" },
    { id: 77, tarjeton: "TPA0191", nombre: "MONTALVO HERNÁNDEZ EUSEBIO ALEJANDRO" },
    { id: 78, tarjeton: "TPA0192", nombre: "MORENO OLVERA PATRICIO" },
    { id: 79, tarjeton: "TPA0194", nombre: "VALDON LARA MARYAVIT" },
    { id: 80, tarjeton: "TPA0356", nombre: "HERNÁNDEZ MARTÍNEZ JUAN RAFAEL" },
    { id: 81, tarjeton: "TPA0358", nombre: "MENESES MENDOZA EDUARDO" },
    { id: 82, tarjeton: "TPA0359", nombre: "MONZALVO REYES OSCAR" },
    { id: 83, tarjeton: "TPA0364", nombre: "SÁNCHEZ ROMERO SERGIO RAÚL" },
    { id: 84, tarjeton: "TPA0366", nombre: "VINIEGRA CANTÓN GERARDO FERNANDO" },
    { id: 85, tarjeton: "TPA0370", nombre: "ÁLVAREZ HERNÁNDEZ MANUEL" },
    { id: 86, tarjeton: "TPA0373", nombre: "RAMIREZ BARRAZA CLEMENTE" },
    { id: 87, tarjeton: "TPA0383", nombre: "LOZADA PÉREZ MIGUEL ÁNGEL" },
    { id: 88, tarjeton: "TPA0389", nombre: "PÉREZ BAÑOS PEDRO JAVIER" },
    { id: 89, tarjeton: "TPA0391", nombre: "PÉREZ ARROYO SALVADOR" },
    { id: 90, tarjeton: "TPA0392", nombre: "LEAL ORTIZ ALDO ISAAC" },
    { id: 91, tarjeton: "TPA0397", nombre: "FIGUEROA PASCUAL ANDRÉS" },
    { id: 92, tarjeton: "TPA0401", nombre: "VEGA QUIJANO VICTOR GABRIEL" },
    { id: 93, tarjeton: "TPA0417", nombre: "CHAPARRO RAMÍREZ JOSÉ JUAN" },
    { id: 94, tarjeton: "TPA0421", nombre: "VELÁZQUEZ ESCALANTE CARLOS GERARDO" },
    { id: 95, tarjeton: "TPA0433", nombre: "NAJERA RAMÍREZ SALOMON" },
    { id: 96, tarjeton: "TPA0444", nombre: "BOLAÑOS GARCÍA MIGUEL ÁNGEL" },
    { id: 97, tarjeton: "TPA0448", nombre: "AMADOR JIMÉNEZ JOSUE" },
    { id: 98, tarjeton: "TPA0452", nombre: "CABRERA LAZCANO GUADALUPE" },
    { id: 99, tarjeton: "TP00455", nombre: "GARZA LÓPEZ ISRAEL" },
    { id: 100, tarjeton: "TPA0456", nombre: "ARAGON LARIOS JORGE" },
    { id: 101, tarjeton: "TPA0463", nombre: "TORRES MORENO MIGUEL ÁNGEL" },
    { id: 102, tarjeton: "TPA0469", nombre: "GUEVARA LEDEZMA ISIDRO EDGAR" },
    { id: 103, tarjeton: "TPA0476", nombre: "VERA NERI ROSALIO" },
    { id: 104, tarjeton: "TPA0506", nombre: "FIGUEROA ARROYO LUIS ALBERTO" },
    { id: 105, tarjeton: "TPA0515", nombre: "LÓPEZ GARCÍA LUIS FERNANDO" },
    { id: 106, tarjeton: "TPA0517", nombre: "SEGURA ROBLES EDGAR ADAN" },
    { id: 107, tarjeton: "TPA0530", nombre: "TÉLLEZ GIRÓN ZENIL JUAN ALBERTO" },
    { id: 108, tarjeton: "TPA0534", nombre: "ISLAS PÉREZ FRANCISCO" },
    { id: 109, tarjeton: "TP00535", nombre: "CABELLO LARA GONZALO" },
    { id: 110, tarjeton: "TPA0542", nombre: "MORALES PERÉZ JOSÉ MARIA" },
    { id: 111, tarjeton: "TP00550", nombre: "BOLAÑOS GÓMEZ EMMANUEL" },
    { id: 112, tarjeton: "TP00556", nombre: "AVILES JUARICO MIGUEL ÁNGEL" },
    { id: 113, tarjeton: "TP00559", nombre: "LUNA RODRIGUEZ JESÚS" },
    { id: 114, tarjeton: "TPA0581", nombre: "PÉREZ BUTANDA FERNANDO" },
    { id: 115, tarjeton: "TPA0590", nombre: "ROSAS RODRÍGUEZ GIL ARTURO" },
    { id: 116, tarjeton: "TPB00592", nombre: "OLVERA RAMOS LUIS ALBERTO" },
    { id: 117, tarjeton: "TPA0602", nombre: "LABASTIDA GARCIA ROBERTO ISRRAEL" },
    { id: 118, tarjeton: "TPA0606", nombre: "MAYO RAMÍREZ JORGE ERNESTO" },
    { id: 119, tarjeton: "TPA0626", nombre: "HERNÁNDEZ GÓMEZ JOSÉ" },
    { id: 120, tarjeton: "TPA0629", nombre: "LOYDE MARTINEZ ROSALIO" },
    { id: 121, tarjeton: "TPA0646", nombre: "ORTIZ SEGURA FELIPE HUMBERTO" },
    { id: 122, tarjeton: "TPA0649", nombre: "CORTES TOVAR ANDRES" },
    { id: 123, tarjeton: "TPA0671", nombre: "GARCÍA LÓPEZ EDUARDO" },
    { id: 124, tarjeton: "TPA0673", nombre: "GARCÍA ROSALES JUPITER" },
    { id: 125, tarjeton: "TPA0678", nombre: "SÁNCHEZ TENIENTE GERARDO" },
    { id: 126, tarjeton: "TPA0680", nombre: "ZAMORA ZAMORA ALVARO" },
    { id: 127, tarjeton: "TPA0681", nombre: "FONSECA PAREDES MARIO ANDRÉS" },
    { id: 128, tarjeton: "TPA0684", nombre: "LÓPEZ MIRANDA SEVERIANO" },
    { id: 129, tarjeton: "TPA0691", nombre: "CABRERA HERNÁNDEZ HEBERTO" },
    { id: 130, tarjeton: "TPA0695", nombre: "BAUTISTA HERNÁNDEZ JOSÉ SANTIAGO" },
    { id: 131, tarjeton: "TPA0703", nombre: "SALINAS CERON ESTEBAN" },
    { id: 132, tarjeton: "TPA0707", nombre: "SOTO AMADOR JOSE MANUEL" },
    { id: 133, tarjeton: "TPA0715", nombre: "JAEN PEÑA UVALDO" },
    { id: 134, tarjeton: "TPA0718", nombre: "VEGA MARQUEZ JOSE DANIEL" },
    { id: 135, tarjeton: "TPA0725", nombre: "ROMERO ESPINOSA LUIS ÁNGEL" },
    { id: 136, tarjeton: "TPA0726", nombre: "CUELLAR LEÓN RICARDO ISRAEL" },
    { id: 137, tarjeton: "TPA0728", nombre: "CASTILLO GONZALEZ ALBERTO" },
    { id: 138, tarjeton: "TPA0737", nombre: "MARTINEZ VERONICA JULIAN" },
    { id: 139, tarjeton: "TPA0738", nombre: "CENOBIO QUIROZ MARCEL" },
    { id: 140, tarjeton: "TPA0745", nombre: "ARMAS ALVARADO OSCAR MARIO" },
    { id: 141, tarjeton: "TPA0748", nombre: "SANCHEZ RAMIREZ JOSEFINA" },
    { id: 142, tarjeton: "TPA0752", nombre: "COLIN SAMANO MIGUEL ANGEL" },
    { id: 143, tarjeton: "TPA0755", nombre: "MARISCAL CERVANTES GABRIEL JESUS" },
    { id: 144, tarjeton: "TPA0763", nombre: "BARRERA REYES VICTOR MANUEL" },
    { id: 145, tarjeton: "TPA0767", nombre: "HERNANDEZ DELGADO OSCAR ISIDRO" },
    { id: 146, tarjeton: "TPA0768", nombre: "JARILLO GONZALEZ MARIO" },
    { id: 147, tarjeton: "TPA0773", nombre: "MAGALLANES RAMIREZ JIRAM" },
    { id: 148, tarjeton: "TPA0775", nombre: "BRITO ESTRADA RAUL ADAN" },
    { id: 149, tarjeton: "TPA0779", nombre: "ALMAZAN BUSTAMANTE JOSE LUIS" },
    { id: 150, tarjeton: "TPA0786", nombre: "GONZÁLEZ BOBADILLA JUAN ALEJANDRO" },
    { id: 151, tarjeton: "TPA0787", nombre: "JAEN ESPINOZA JOSÉ ALBERTO" },
    { id: 152, tarjeton: "TPA0790", nombre: "GONZÁLEZ SAMPAYO FILOMENA" },
    { id: 153, tarjeton: "TPA0791", nombre: "MORENO FLORES LEONARDO DANIEL" },
    { id: 154, tarjeton: "TPA0792", nombre: "SOTO PAREDES DANIEL" },
    { id: 155, tarjeton: "TPA0795", nombre: "BECERRIL OLVERA ELEAZAR" },
    { id: 156, tarjeton: "TPA0798", nombre: "PÉREZ HERNÁNDEZ FEDERICO" },
    { id: 157, tarjeton: "TPA0800", nombre: "SÁNCHEZ LAZO LUIS EDUARDO" },
    { id: 158, tarjeton: "TPA0802", nombre: "TÉLLEZ CERÓN SAÚL" },
    { id: 159, tarjeton: "TPA0805", nombre: "ORTEGA HERNÁNDEZ JOSÉ ANDRÉS" },
    { id: 160, tarjeton: "TPA0810", nombre: "GONZÁLEZ VENEGAS LUIS ANTONIO" },
    { id: 161, tarjeton: "TPA0812", nombre: "AGUILAR ROSALES ALÁN NOÉ" },
    { id: 162, tarjeton: "TPA0815", nombre: "REYES ARRIAGA NATANAEL" },
    { id: 163, tarjeton: "TPA0820", nombre: "LORA MARTÍNEZ MARGARITA" },
    { id: 164, tarjeton: "TPA0821", nombre: "HERRERA ROMERO EDGAR" },
    { id: 165, tarjeton: "TPA0835", nombre: "OLVERA ANGELES ALVARO" },
    { id: 166, tarjeton: "TPA0837", nombre: "BARRÓN GUERRERO VICTOR MANUEL" },
    { id: 167, tarjeton: "TPA0842", nombre: "CAMPOS CAMARENA ISRAEL" },
    { id: 168, tarjeton: "TPA0844", nombre: "VIVEROS GARCÍA DANIEL" },
    { id: 169, tarjeton: "TPA0845", nombre: "VÁZQUEZ PÉREZ ÁNGEL" },
    { id: 170, tarjeton: "TPA0846", nombre: "MANZANARES CHÁVEZ ERIK SAMAR" },
    { id: 171, tarjeton: "TPA0848", nombre: "LUCAS MARTÍNEZ MARIANO" },
    { id: 172, tarjeton: "TPA0852", nombre: "CAMPOS CAMARENA FELIPE DE JESÚS" },
    { id: 173, tarjeton: "TPA0854", nombre: "BAUTISTA GARCÍA JOSÉ" },
    { id: 174, tarjeton: "TPA0856", nombre: "ARENAS ESCAMILLA TONATIUH" },
    { id: 175, tarjeton: "TPA0857", nombre: "ORTA HERNÁNDEZ JAVIER SAMUEL" },
    { id: 176, tarjeton: "TPA0861", nombre: "CHIPOLINI DÁVALOS NORMA ANGELICA" },
    { id: 177, tarjeton: "TPA0864", nombre: "CABRERA POMAR ALEJANDRO" },
    { id: 178, tarjeton: "TPA0867", nombre: "JUÁREZ SÁNCHEZ JORGE LUIS" },
    { id: 179, tarjeton: "TPA0868", nombre: "GARCÍA TORRES ALDO URIEL" },
    { id: 180, tarjeton: "TPA0869", nombre: "ABREGO LEAL GUADALUPE" },
    { id: 181, tarjeton: "TPA0871", nombre: "MORALES ISLAS JUAN AUGUSTO" },
    { id: 182, tarjeton: "TPA0872", nombre: "CASTEL ORTEGA OSCAR" },
    { id: 183, tarjeton: "TPA0873", nombre: "LÓPEZ FLORES HAERVY JAHIR" },
    { id: 184, tarjeton: "TPA0876", nombre: "GARCÍA RIVERA EUSEBIO ARTURO" },
    { id: 185, tarjeton: "TPA0877", nombre: "CASTEL ORTEGA OSCAR" }
];

async function insertOperadores() {
    try {
        // Conectar a la base de datos
        console.log('Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado a MongoDB exitosamente');

        // Limpiar operadores existentes (opcional)
        console.log('Limpiando operadores existentes...');
        await Operador.deleteMany({});
        console.log('Operadores anteriores eliminados');

        // Insertar operadores
        console.log('Insertando operadores...');
        const resultado = await Operador.insertMany(operadores);
        console.log(`${resultado.length} operadores insertados exitosamente`);

        // Mostrar algunos ejemplos
        console.log('\nEjemplos de operadores insertados:');
        const ejemplos = await Operador.find().limit(5);
        ejemplos.forEach(op => {
            console.log(`ID: ${op.id}, Tarjetón: ${op.tarjeton}, Nombre: ${op.nombre}`);
        });

        // Estadísticas
        const total = await Operador.countDocuments();
        console.log(`\nTotal de operadores en la base de datos: ${total}`);

    } catch (error) {
        console.error('Error:', error.message);
        if (error.code === 11000) {
            console.log('Error: Algunos tarjetones ya existen en la base de datos');
        }
    } finally {
        await mongoose.connection.close();
        console.log('\nConexión cerrada');
    }
}

// Ejecutar el script
insertOperadores(); 