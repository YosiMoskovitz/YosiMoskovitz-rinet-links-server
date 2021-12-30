
import jwt from "jsonwebtoken";

export default {
    checkAuth: (req, res, next) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                const error = {
                    code: 401,
                    message: "Token was not provided" 
                }
                throw error
            }
            const user = jwt.verify(token, process.env.JWT_KEY);
            req.user = {id: user.id};
            next();
        } catch (error) {
            res.status(401).json({
               message: error.message,
            })
        }
    },
    createToken: (user) => {
        const accessToken = jwt.sign({
            id: user._id, email: user.email
        },
            process.env.JWT_KEY,
            { expiresIn: '1d' });
        return accessToken;
    },
}