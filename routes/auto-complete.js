const express = require("express");
const router = express.Router();
const {Client} = require("@elastic/elasticsearch");
const client = new Client({node: "http://localhost:9200"});

router.get("/", async (req, res) => {
    const {query} = req.query;
    try {
    const response = await client.search({
        index: "products",
        suggest: {
            product_suggest: {
                prefix: query,
                completion: {
                    field: "suggest",
                    fuzzy: true
                }
            }
        }
    });
    res.json(response.suggest.product_suggest[0].options.map(ele => ele.text));
    }
    catch(error) {
        console.error(error);
        res.status(500).json({error: "AutoCompletion Failed!"});
    }
});

module.exports = router;