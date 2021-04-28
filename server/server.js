require('./config/config')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const Usuario = {
    nombre: 'Marco Brito'
}

app.get('/', function(req, res) {
    res.send(JSON.stringify(Usuario));
});

app.get('/usuario', function(req, res) {
    res.send('Get usuario');
});

app.post('/usuario', function(req, res) {
    const body = req.body;

    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });
    } else {
        res.json({ persona: body });
    }

});

app.put('/usuario/:id', function(req, res) {
    const idx = req.params.id;
    res.json({ id: idx });
});

app.delete('/usuario', function(req, res) {
    res.send('Delete usuario');
});

app.listen(process.env.PORT, () => {
    console.log(`Escuchando en el puerto: ${process.env.PORT}`);
});