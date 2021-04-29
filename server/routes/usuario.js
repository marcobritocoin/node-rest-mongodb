const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const { tokenVerify, AdminRoleVerify } = require('../middlewares/authentication');

const app = express();

app.get('/usuario', [tokenVerify, AdminRoleVerify], (req, res) => {

    // // Obtener los datos del usuario por PAYLOAD
    // // Validado por el Middelware
    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email,
    //     role: req.usuario.role
    // });

    // Control de paginacion
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.countDocuments({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cant_registros: conteo
                });
            });


        });
});

app.post('/usuario', [tokenVerify, AdminRoleVerify], (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.put('/usuario/:id', [tokenVerify, AdminRoleVerify], (req, res) => {
    const id = req.params.id;

    // Validando con la libreria Underscore
    const body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    // --> Otra manera NO optima
    // delete body.password;
    // delete body.google;

    // Ver Documentacion mongoose
    Usuario.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.delete('/usuario/:id', [tokenVerify, AdminRoleVerify], (req, res) => {
    const id = req.params.id;

    // ===============================================
    // Borrando el Usuario de manera LOGICA de la BD
    // ===============================================

    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });

    // ============================================
    // Borrando el Usuario fisicamente de la BD
    // ============================================

    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }

    //     if (usuarioBorrado === null) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         });
    //     }

    //     res.json({
    //         ok: true,
    //         usuario: usuarioBorrado
    //     });

    // });

});

module.exports = app;