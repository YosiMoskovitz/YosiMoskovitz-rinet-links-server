export default {
    getFile: (req, res) => {
        const categoryId = req.params.categoryId;
        File.findById(categoryId).then((category)=> {
            res.status(200).json({
                category
            })
        }).catch(error =>{
            res.status(500).json({
                error
            })
        })        
    },
    createFile: (req, res) => {
        const {title, description } = req.body;
        const category = new File({
            title,
            description,
        });
        category.save().then(()=>{
            res.status(200).json({
                message: 'Created File'
            })
        }).catch(error =>{
            res.status(500).json({
                error
            })
        });
    },
    updateFile: (req, res) => {
        const categoryId = req.params.categoryId;
        File.updateOne({_id: categoryId}, req.body).then(()=>{
            res.status(200).json({
                message: `updated File ${categoryId}.`
            })
        }).catch(error =>{
            res.status(500).json({
                error
            })
        });
    },
    deleteFile: (req, res) => {
        const categoryId = req.params.categoryId;
        File.deleteOne({_id: categoryId}).then(()=>{
            res.status(200).json({
                message: `deleted File ${categoryId}.`
            })
        }).catch(error =>{
            res.status(500).json({
                error
            })
        });
    }
    
}