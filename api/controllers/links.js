
import Links from "../model/links.js";
import Category from "../model/categories.js";


export default {
    /**
     *  
     */
    getLinks: (req, res) => {
        Links.find().then((Links) => {
            res.status(200).json({
                Links
            })
        }).catch(error => {
            res.status(500).json({
                error
            })
        })
    },
    getLinkById: (req, res) => {
        const linkID = req.params.linkID;
        Links.findOne({ _id: linkID }).then((Link) => {
            res.status(200).json({
                Link
            })
        }).catch(error => {
            res.status(500).json({
                error
            })
        });
    },
    getLinksByCategory: (req, res) => {
        const categoryId = req.params.categoryId;
        Links.find({ categoryId }).then((Links) => {
            res.status(200).json({
                Links
            })
        }).catch(error => {
            res.status(500).json({
                error
            })
        });
    },

    addLink: (req, res) => {
        const { title, path, categoryId, description } = req.body;

        Category.findById(categoryId).then((category) => {
            if (!category) {
                const error = {
                    code: 404,
                    message: "Category not found"
                }
                throw error
            }

            const link = new Links({
                title,
                path,
                categoryId,
                description,
            });

            return link.save();
        }).then(() => {
            res.status(200).json({
                message: 'Link Added To List!'
            })
        }).catch((error) => {
            if (!error.code) {
                error.code = 500
            }
            res.status(error.code).json({
                error
            })
        });
    },
    updateLink: (req, res) => {
        const LinkID = req.params.linkID;
        Links.updateOne({ _id: LinkID }, req.body).then(() => {
            res.status(200).json({
                message: `Updated Link ID_${LinkID}.`
            })
        }).catch(error => {
            res.status(500).json({
                error
            })
        });
    },
    deleteLink: (req, res) => {
        const LinkID = req.params.linkID;
        Links.deleteOne({ _id: LinkID }).then(() => {
            res.status(200).json({
                message: `Deleted Link ID_${LinkID}.`
            })
        }).catch(error => {
            res.status(500).json({
                error
            })
        });
    },
    getLinksAndCategories: (req, res) => {
        var data = {}
        Links.find().then((linksData) => {
            var links = linksData.map((link) => {
                return link.toClient();
            })
            data = { ...data, links }
        }).then(() => {
            Category.find().then((categoriesData) => {
                var categories = categoriesData.map((category) => {
                    return category.toClient();
                })
                data = { ...data, categories }
                res.status(200).json({
                    data
                })
            })
        }).catch(error => {
            console.log(error)
                res.status(500).json({
                    error
                })
            })
    }

}

const idTo0 = ()=> {

}