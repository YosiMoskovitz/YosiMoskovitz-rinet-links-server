
import Category from "../model/categories.js";

export default {
    getCategories: (req, res) => {
        Category.find().then((categories)=> {
            res.status(200).json({
                categories
            })
        }).catch(error =>{
            res.status(500).json({
                error
            })
        })        
    },
    getCategory: (req, res) => {
        const categoryId = req.params.categoryId;
        Category.findById(categoryId).then((category)=> {
            res.status(200).json({
                category
            })
        }).catch(error =>{
            res.status(500).json({
                error
            })
        })        
    },
    createCategory: (req, res) => {
        const {title, description } = req.body;
        const category = new Category({
            title,
            description,
        });
        category.save().then(()=>{
            res.status(200).json({
                message: 'Created Category'
            })
        }).catch(error =>{
            res.status(500).json({
                error
            })
        });
    },
    updateCategory: (req, res) => {
        const categoryId = req.params.categoryId;
        Category.updateOne({_id: categoryId}, req.body).then(()=>{
            res.status(200).json({
                message: `updated Category ${categoryId}.`
            })
        }).catch(error =>{
            res.status(500).json({
                error
            })
        });
    },
    deleteCategory: (req, res) => {
        const categoryId = req.params.categoryId;
        Category.deleteOne({_id: categoryId}).then(()=>{
            res.status(200).json({
                message: `deleted Category ${categoryId}.`
            })
        }).catch(error =>{
            res.status(500).json({
                error
            })
        });
    }
    
}