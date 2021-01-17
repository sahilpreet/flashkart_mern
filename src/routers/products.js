const express = require('express');
//collection as table in sql
const products = require('../model/products');
const { Error } = require('mongoose');

const multer = require('multer');
const sharp = require('sharp');

const router = new express.Router()

const auth = require("../middleware/auth")
// const sizeof=require("object-sizeof")

const categoryWithSubCategoryFunction = (productsfound) => {
    let categoryWithSubCategory = new Object();
    productsfound.forEach(element => {
        if (!categoryWithSubCategory.hasOwnProperty(element.category)) {
            // continue
            categoryWithSubCategory[element.category] = []
            categoryWithSubCategory[element.category].push(element)
        } else {
            if (categoryWithSubCategory[element.category].includes(element.subcategory)) {
                // continue
            } else {
                categoryWithSubCategory[element.category].push(element.subcategory)
            }
        }
    });
    return categoryWithSubCategory
}

router.get("/products", async (req, res) => {
    try {
        const productsfound = await products.find({})
        // console.log(productsfound)
        let productswithoutimage = [];
        productsfound.forEach(element => {
            const product = element.toObject()
            delete product.image
            productswithoutimage.push(product)
            // console.log(product)
        });
        res.status(200).send(productswithoutimage)
    } catch (error) {
        // console.log(error.message)
        res.send({ error: error.message })
    }
})

router.get("/product/:id", async (req, res) => {
    try {
        //  console.log(req.params)
        const id = req.params.id
        if (id.length < 400) {
            const productsfound = await products.findById(id)
            // console.log(productsfound)
            res.status(200).send(productsfound)
        }
        else {
            //  console.log(id.length)
            throw new Error("not a id")
        }
    } catch (error) {
        //  console.log(error.message)
        res.send({ error: error.message })
    }
})


// router.get("/category/:category", async (req, res) => {
//     try {
//         //  console.log(req.params)
//         const category = req.params.category
//         if (category.length < 200) {
//             const productsfound = await products.find({ category: category })
//             // console.log(productsfound)
//             res.status(200).send(productsfound)
//         }
//         else {
//             //  console.log(category.length)
//             throw new Error("not a category")
//         }
//     } catch (error) {
//         //  console.log(error.message)
//         res.send({ error: error.message })
//     }
// })

// router.get("/subcategory/:subcategory", async (req, res) => {
//     try {
//         //  console.log(req.params)
//         const subcategory = req.params.subcategory
//         if (subcategory.length < 200) {
//             const productsfound = await products.find({ subcategory: subcategory })
//             // console.log(productsfound)
//             res.status(200).send(productsfound)
//         }
//         else {
//             //  console.log(subcategory.length)
//             throw new Error("not a subcategory")
//         }
//     } catch (error) {
//         //  console.log(error.message)
//         res.send({ error: error.message })
//     }
// })

const productimage = multer({
    limits: 5000000,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png)$/)) {
            return cb(new Error("please upload an image"))
        }
        // console.log(file.originalname)
        cb(undefined, true)
    }
})


router.post("/product", productimage.single("image"), async (req, res) => {
    // console.log(req.body, "body")
    // const presentFields=Object.keys(req.body)
    // const allowedFields=["name","category","subcategory","regularprice","discountedprice"]
    // const isValidoperation=presentFields.every((present)=>allowedFields.includes(present))
    // if(!isValidoperation){
    // res.send("fields not correct")
    // }    
    try {
        const enteredProduct = new products(req.body)
        if (req.file.buffer) {
            // console.log(req.file.buffer)
            const buffer = await sharp(req.file.buffer).png().toBuffer()
            enteredProduct.image = buffer
        }
        await enteredProduct.save()
        const enteredObjectProduct = enteredProduct.toObject()
        delete enteredObjectProduct["image"]
        // delete enteredObjectProduct["createdAt"]
        // delete enteredObjectProduct["updatedAt"]
        res.setHeader('Content-Type', 'application/json');
        res.send(enteredObjectProduct)
    } catch (error) {
        res.send({ error: error.message })
    }
})

router.get("/product/:id/image", async (req, res) => {
    try {
        // console.log(req.params.id)
        const product = await products.findById(req.params.id)
        if (!product || !product.image) {
            // console.log(product)
            return res.status(404).send({ error: "product not found" })
        }
        res.set("Content-Type", "image/png")
        res.send(product.image)
    } catch (error) {
        res.send({ error: error.message })
    }

})

//pages for react
router.get("/products_index_page", auth, async (req, res) => {
    try {
        const indexPageObj = new Object()
        const productsfound = await products.find({})
        const categoryWithSubCategory = categoryWithSubCategoryFunction(productsfound)
        indexPageObj["categoryWithSubCategory"] = categoryWithSubCategory
        indexPageObj["products"] = productsfound.slice(0, 47)
        // console.log(indexPageObj)
        if (req.user) {
            const user = req.user
            indexPageObj["cartvalue"] = user.cart.length
            // console.log(user.cart.length)
            // will populate full product in cart not only id use in cartpage
            // await user.populate('cart').execPopulate()
            // console.log(user, "product")
        }
        // console.log(sizeof(indexPageObj))
        res.status(200).send(indexPageObj)
    } catch (error) {
        // console.log(error)
        res.send({ error: error.message })
    }
})

router.get("/productview/:id", auth, async (req, res) => {
    try {
        //  console.log(req.params)
        const id = req.params.id
        if (id.length < 400) {
            const productfound = await products.findById(id)
            // console.log(productfound)
            const productviewPageObj = new Object()
            const productsfound = await products.find({})
            // console.log(productsfound)
            const categoryWithSubCategory = categoryWithSubCategoryFunction(productsfound)
            productviewPageObj["categoryWithSubCategory"] = categoryWithSubCategory
            productviewPageObj["product"] = productfound
            const categoryProductsFound = await products.find({ category: productfound.category }).limit(20)
            productviewPageObj["categoryproducts"] = categoryProductsFound
            if (req.user) {
                const user = req.user
                productviewPageObj["cartvalue"] = user.cart.length
                // console.log(user.cart.length)
            }
            res.status(200).send(productviewPageObj)
        }
        else {
            //  console.log(id.length)
            throw new Error("not a id")
        }
    } catch (error) {
        // console.log(error)
        res.send({ error: error.message })
    }
})

router.get("/category/:category", auth, async (req, res) => {
    try {
        // console.log(req.query)
        const skip = parseInt(req.query.skip === undefined ? 0 : req.query.skip)
        const limit = parseInt(req.query.limit === undefined ? 10 : req.query.limit)
        const productsFound = await products.find({ category: req.params.category }).skip(skip)
        const productsFoundCategory = productsFound.slice(0, limit)
        const categoryPage = new Object()
        const productsAll = await products.find({})
        const categoryWithSubCategory = categoryWithSubCategoryFunction(productsAll)
        categoryPage["categoryWithSubCategory"] = categoryWithSubCategory
        categoryPage["products"] = productsFoundCategory
        const pageno = (skip / limit) + 1
        categoryPage["pageno"] = parseInt(pageno)
        categoryPage["nextskip"] = productsFound.length > limit ? skip + limit : null
        categoryPage["prevskip"] = skip - limit >= 0 ? skip - limit : null
        if (req.user) {
            const user = req.user
            categoryPage["cartvalue"] = user.cart.length
            // console.log(user.cart.length)
        }
        res.status(200).send(categoryPage)
    } catch (error) {
        // console.log(error)
        res.status(501).send({ error: error.message })

    }
})

router.get("/subcategory/:subcategory", auth, async (req, res) => {
    try {
        // console.log(req.query)
        const skip = parseInt(req.query.skip === undefined ? 0 : req.query.skip)
        const limit = parseInt(req.query.limit === undefined ? 10 : req.query.limit)
        const productsFound = await products.find({ subcategory: req.params.subcategory }).skip(skip)
        const productsFoundSubCategory = productsFound.slice(0, limit)
        const subcategoryPage = new Object()
        const productsAll = await products.find({})
        const categoryWithSubCategory = categoryWithSubCategoryFunction(productsAll)
        subcategoryPage["categoryWithSubCategory"] = categoryWithSubCategory
        subcategoryPage["products"] = productsFoundSubCategory
        const pageno = (skip / limit) + 1
        subcategoryPage["pageno"] = parseInt(pageno)
        subcategoryPage["nextskip"] = productsFound.length > limit ? skip + limit : null
        subcategoryPage["prevskip"] = skip - limit >= 0 ? skip - limit : null
        if (req.user) {
            const user = req.user
            subcategoryPage["cartvalue"] = user.cart.length
            // console.log(user.cart.length)
        }
        res.status(200).send(subcategoryPage)
    } catch (error) {
        // console.log(error)
        res.status(501).send({ error: error.message })

    }
})

router.get("/cart", auth, async (req, res) => {
    try {
        // console.log(req.user)
        const cartPage = new Object()
        const productsAll = await products.find({})
        const categoryWithSubCategory = categoryWithSubCategoryFunction(productsAll)
        cartPage["categoryWithSubCategory"] = categoryWithSubCategory
        const userProducts = await req.user.populate('cart').execPopulate()
        cartPage["products"] = userProducts.cart
        res.send(cartPage)
    } catch (error) {
        res.send({ error: error.message })
    }
})

router.post("/cart_add_remove", auth, async (req, res) => {
    try {
        if (req.body.action === "add") {
            req.user.cart = req.user.cart.concat(req.body.product_id)
            await req.user.save()
            res.send({ cartvalue: req.user.cart.length })
        }
        else if (req.body.action === "remove") {
            req.user.cart = req.user.cart.filter((element) => element != req.body.product_id)
            await req.user.save()
            // console.log(req.user.cart, req.user.cart.length)
            const userProducts = await req.user.populate('cart').execPopulate()
            res.send({ cartvalue: userProducts.cart.length, cart: userProducts.cart })
        }
        else if (req.body.action === "removeall") {
            req.body.product_id.forEach((productToRemove) => {
                req.user.cart = req.user.cart.filter((element) => element != productToRemove)
            })
            await req.user.save()
            // console.log(req.user.cart, req.user.cart.length)
            const userProducts = await req.user.populate('cart').execPopulate()
            res.send({ cartvalue: userProducts.cart.length, cart: userProducts.cart })
        } else { res.send({}) }
    } catch (error) {
        res.send({ error: error.message })
    }
})

router.get("/search",auth,async(req,res)=>{
    try {
        console.log(Object.keys(req.query),req.query)
        const skip = parseInt(req.query.skip === undefined ? 0 : req.query.skip)
        const limit = parseInt(req.query.limit === undefined ? 10 : req.query.limit)
        const searchTerm=Object.keys(req.query)[0]
        const regexProductsFound=await products.find({
            $or:[
                { name: { $regex: searchTerm, $options: "i" } },
                { category: { $regex: searchTerm, $options: "i" } },
                { subcategory: { $regex: searchTerm, $options: "i" } },
            ]
        }).skip(skip)
        const productsFoundSent=regexProductsFound.slice(0,limit)
        console.log(regexProductsFound.length,searchTerm,productsFoundSent.length)
        const searchPageObj = new Object()
        const productsAll = await products.find({})
        const categoryWithSubCategory = categoryWithSubCategoryFunction(productsAll)
        searchPageObj["categoryWithSubCategory"] = categoryWithSubCategory
        searchPageObj["products"] = productsFoundSent
        const pageno = (skip / limit) + 1
        searchPageObj["pageno"] = parseInt(pageno)
        searchPageObj["nextskip"] = regexProductsFound.length > limit ? skip + limit : null
        searchPageObj["prevskip"] = skip - limit >= 0 ? skip - limit : null
        if (req.user) {
            const user = req.user
            searchPageObj["cartvalue"] = user.cart.length
            // console.log(user.cart.length)
        }
        res.send(searchPageObj)
    } catch (error) {
        res.send({error:error.message})        
    }
})

module.exports = router