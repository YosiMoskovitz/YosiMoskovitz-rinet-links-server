
import jwt from "jsonwebtoken";

export default {
    checkAuth: (req, res, next) => {
        try {
            const token = req.cookies.token;
            console.log('jwt token checked')
            console.log(token)
            jwt.verify(token, process.env.JWT_KEY)
            next();
        } catch (error) {
            res.status(222).json({
                message: 'Auth Failed',
            })
        }
    },
    createToken: (user) => {
        const accessToken = jwt.sign({
            id: user._id, email: user.email
        },
            process.env.JWT_KEY);
        return accessToken;
    }
}