const express = require('express');
const app = express();
const { tokenVerify, AdminRoleVerify } = require('../middlewares/authentication');
const Producto = require('../models/producto');


// ====================================
// =    Mostrar todas las categorias
// ====================================

app.get('/producto', tokenVerify, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde) // paginador
        .limit(5) // limite de resultados
        .sort('nombre') // Ordenar Alfabeticamente por Nombre
        .populate('usuario', 'nombre email') // Como las relaciones SQL
        .populate('categoria', 'descripcion') // Como las relaciones SQL
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments({ disponible: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    total_registros: conteo,
                    productos
                })
            });

        });
});

// ====================================
// =    Mostrar un solo producto por ID
// ====================================
app.get('/producto/:id', tokenVerify, (req, res) => {

    const id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email') // Como las relaciones SQL
        .populate('categoria', 'descripcion') // Como las relaciones SQL
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Busqueda fallída del producto'
                    }
                });
            }

            if (!productoDB || productoDB.disponible == false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

// ====================================
// =    Buscar productos
// ====================================
app.get('/producto/buscar/:termino', tokenVerify, (req, res) => {
    const termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex, disponible: true })
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Proceso de busqueda falló'
                    }
                });
            }

            if (!productoDB || Object.keys(productoDB).length === 0) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Sin resultados'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});


// ====================================
// =    Crear nuevo producto
// ====================================
// grabar el usuarios
// grabar una categorita del listado

app.post('/producto', [tokenVerify, AdminRoleVerify], (req, res) => {
    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });


    producto.save((err, productoDB) => {
        // Error en la BBDD
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Error por si no se creo la categoria como tal
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });
});


// ====================================
// =    Actualizar producto
// ====================================
app.put('/producto/:id', [tokenVerify, AdminRoleVerify], (req, res) => {
    const id = req.params.id;
    const body = req.body;

    if (Object.keys(body).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Por favor envia información para actualizar'
            }
        });
    }

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Error por si no se Modificó la categoria como tal
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });
        });



    });

});


// =========================================
// =    Eliminar categoria de manera logica
// =========================================
app.delete('/producto/:id', [tokenVerify, AdminRoleVerify], (req, res) => {
    const id = req.params.id;

    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado,
            message: 'Producto borrado'
        });
    });
});


module.exports = app;