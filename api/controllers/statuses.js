
import Status from "../model/statuses.js"

export default {
    getStatuses: (req, res) => {
        Status.find().then((statuses)=> {
            res.status(200).json({
                statuses
            })
        }).catch(error =>{
            res.status(500).json({
                error
            })
        })        
    },
}