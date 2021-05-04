const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path');

const { tokenVerify, AdminRoleVerify } = require('../middlewares/authentication');

const fs = require('fs');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', tokenVerify, function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Necesitas enviar un archivo'
            }
        });
    }

    // Validar tipo
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son: ' + tiposValidos.join(', ')
            }
        });
    }



    const archivo = req.files.archivo;
    const nombreCortado = archivo.name.split('.');
    const extension = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }


    // Cambiar nombre del archivo para evitar colision en nombres
    //Ex: 123-123.jpg
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    // Establecer la ruta donde se guardarán los archivos
    let uploadPath = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreArchivo }`);

    archivo.mv(uploadPath, function(err) {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        // Imagen cargada en el server 
        switch (tipo) {
            case 'productos':
                imagenProducto(id, res, nombreArchivo);
                break;
            default:
                imagenUsuario(id, res, nombreArchivo);
                break;
        }


    });


});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            })
        }

        //Borrando las imagenes anteriores del usuario
        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });

    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            })
        }

        //Borrando las imagenes anteriores del usuario
        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                usuario: productoGuardado,
                img: nombreArchivo
            });
        });
    });
}

function borraArchivo(nombreImg, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${ nombreImg }`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;