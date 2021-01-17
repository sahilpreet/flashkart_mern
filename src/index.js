const express = require('express');

//mongodb database make connection
require("./db/mongoose");

const products = require('./model/products');
const users = require('./model/users')


const app = express()

const port = process.env.PORT || 3000

const productsRouter = require('./routers/products');
const usersRouter = require('./routers/users');

//for croos site error cors in fetch api
app.use(function (req, res, next) {
    //cors for all websites
    res.setHeader("Access-Control-Allow-Origin", "*");
    // res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    // res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    // res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

app.use(express.json())

//django main app and sub app routers
app.use(productsRouter)

app.use(usersRouter)

app.get("*", (req, res) => {
    res.status(404).send("page not found <a href='/products'>products<a/>")
})

app.listen(port, () => {
    console.log(`server running at port = ${port}`)
})

async function main() {
    try {
        //to make a relationship between collections
        // const user=await users.findById("6001abbaca8f950a5c2ab340")
        // console.log(user)
        // // user.cart=user.cart.concat("5ffd2e7e0e32ba1d54fd4073")
        // // await user.save()
        // await user.populate('cart').execPopulate()
        // console.log(user)
        //fullsearch only search exact word
        const productsFound = await products.find({
            $text: { $search: "nescafe" },
        })
        //partial search look for regex and find all
        const searchTerm="coff"
        const regexproductsfound = await products.find({
            $or: [
                { name: { $regex: searchTerm, $options: "i" } },
                { category: { $regex: searchTerm, $options: "i" } },
                { subcategory: { $regex: searchTerm, $options: "i" } },
            ]
        })
        // console.log(productsFound)
        console.log(regexproductsfound, regexproductsfound.length)
    } catch (error) {
        console.log(error)
    }
}

// main()