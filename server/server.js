require('./config/config')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


/**
 *   Middelwares
 */

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Configuracion global de Rutas
app.use(require('./routes/index'));


// Ruta principal del proyecto
app.get('/', (req, res) => {
    res.send('Mandanga Style');
});

/**
 *   Conexión con la BBDD de MongoDB con Mongoose
 */

mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}, () => {
    console.log('Conexión exitosa con la BBDD!');
});

mongoose.connection.on('error', function(err) {
    console.log('Error de conexión con la BBDD: ' + err);
});

app.listen(process.env.PORT, () => {
    console.log(`Escuchando en el puerto: ${process.env.PORT}`);
});