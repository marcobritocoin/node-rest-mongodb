const express = require('express');
const fs = require('fs');
const app = express();
const PATH = require('path');

const { tokenVerify, AdminRoleVerify, tokenVerifyImg } = require('../middlewares/authentication');

app.get('/imagen/:tipo/:img', tokenVerifyImg, (req, res) => {

    const tipo = req.params.tipo;
    const img = req.params.img;

    const pathImg = PATH.resolve(__dirname, `../../uploads/${ tipo }/${ img }`);

    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        res.sendFile(PATH.resolve(__dirname, '../assets/no-image.jpg'));
    }

});

module.exports = app;