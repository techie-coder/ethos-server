const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config();

const authenticate = (req, res, next) => {
    const header = req.headers['authorization']
    const token = header.split(" ")[1]

    if(!token) {
        return res.status(401).json({message: 'Authorization token is required.'})
    }

    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        req.email = decoded.email;
        next();
    }catch(err){
        return res.status(401).json({message: 'Invalid token.'});
    }
}

module.exports = authenticate;