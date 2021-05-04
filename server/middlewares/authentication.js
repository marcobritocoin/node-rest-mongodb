const jwt = require('jsonwebtoken');

// ============================
// =   Verificar Token
// ============================

let tokenVerify = (req, res, next) => {
    let token = req.get('token'); // Authorization

    if (!token) {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Te falto el Token brother'
            }
        });
    }

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token inválido'
                }
            });
        }

        // Obtener el PAYLOAD (todos los datos del usuario)
        // Recordar el jwt = (Header + Payload + SEED)
        req.usuario = decoded.usuario;

        next();


    });

};

// ============================
// =   Verificar AdminRole
// ============================

let AdminRoleVerify = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'No tienes privilegios de Administrador!'
            }
        });
    } else {
        next();
    }

}

// ============================
// =   Verificar Token IMG
// ============================

let tokenVerifyImg = (req, res, next) => {
    //let token = req.get('token'); // Authorization por header
    let token = req.query.token; // Authorization por URL


    if (!token) {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Te falto el Token brother'
            }
        });
    }

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token inválido'
                }
            });
        }

        // Obtener el PAYLOAD (todos los datos del usuario)
        // Recordar el jwt = (Header + Payload + SEED)
        //req.usuario = decoded.usuario;

        next();


    });

};

module.exports = {
    tokenVerify,
    AdminRoleVerify,
    tokenVerifyImg
}