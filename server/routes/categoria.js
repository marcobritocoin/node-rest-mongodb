const express = require('express');

const { tokenVerify, AdminRoleVerify } = require('../middlewares/authentication');

const app = express();

const Categoria = require('../models/categoria');

// ====================================
// =    Mostrar todas las categorias
// ====================================
app.get('/categoria', tokenVerify, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email') // Como las relaciones SQL
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments({}, (err, conteo) => {
                res.json({
                    ok: true,
                    total_registros: conteo,
                    categorias

                })
            });

        });
});

// ====================================
// =    Mostrar una sola categoria
// ====================================
app.get('/categoria/:id', tokenVerify, (req, res) => {

    const id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Error al devolver el registro'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ====================================
// =    Crear nueva categoria
// ====================================
app.post('/categoria', [tokenVerify, AdminRoleVerify], (req, res) => {
    // Regresar la nueva categoria
    let body = req.body;

    let categoria = new Categoria();
    categoria.descripcion = body.descripcion;
    categoria.usuario = req.usuario._id;

    categoria.save((err, categoriaDB) => {
        // Error en la BBDD
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Error por si no se creo la categoria como tal
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});


// ====================================
// =    Modificar categoria
// ====================================
app.put('/categoria/:id', [tokenVerify, AdminRoleVerify], (req, res) => {
    const id = req.params.id;
    const body = req.body;

    if (Object.keys(body).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Por favor envia una descripcion para actualizar'
            }
        });
    }

    Categoria.findByIdAndUpdate(id, body, {
        new: true
    }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Error por si no se Modificó la categoria como tal
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});


// ====================================
// =    Eliminar categoria
// ====================================
app.delete('/categoria/:id', [tokenVerify, AdminRoleVerify], (req, res) => {
    // Solo un administrador puede modificar
    const id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDeleted) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada'
        });
    });
});






module.exports = app;