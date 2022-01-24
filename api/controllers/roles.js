
import Role from "../model/roles.js"

export default {
    getRoles: (req, res) => {
        Role.find().then((roles)=> {
            res.status(200).json({
                roles
            })
        }).catch(error =>{
            res.status(500).json({
                error
            })
        })        
    },
}