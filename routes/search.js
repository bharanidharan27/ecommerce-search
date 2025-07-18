const express = require('express');
const router = express.Router();
const {Client} = require('@elastic/elasticsearch');

const client = new Client({node: 'http://localhost:9200'});

router.get('/', async (req, res) => {
    const {query} = req.query;
    const decodedQuery = decodeURIComponent(query);
    const brand = decodeURIComponent(req.query.brand);
    const category = decodeURIComponent(req.query.category);
    const priceRange = decodeURIComponent(req.query.priceRange);
    const rating = decodeURIComponent(req.query.rating);
    let isFilterSearch = false;
    if(brand === "undefined" || category === "undefined" || priceRange !== "undefined" || rating !== "undefined") isFilterSearch = true;
    let result;
    try {
        if(!isFilterSearch) {
            console.log("Inside Multi Match Search");
            result = await client.search({
                index: 'products',
                query: {
                    multi_match: {
                        query: decodedQuery,
                        fields: ['name^3', 'description', 'brand']
                    }
                }
            });
        }
        else {
            console.log("Inside Boolean Search");
            let jsonBody = {
                query: {
                    bool: {}
                }
            };
            if(decodedQuery !== "undefined") {
                jsonBody.query.bool.must = {};
                jsonBody.query.bool.must.multi_match = {
                    query: decodedQuery,
                    fields: ['name^3', 'description']
                }
            }
            jsonBody.query.bool.filter = [];
            if(brand !== "undefined") {
                jsonBody.query.bool.filter.push({
                    term: { brand: brand }
                });
            }
            if(category !== "undefined") {
                jsonBody.query.bool.filter.push({
                    term: { category: category }
                });
            }
            if(priceRange !== "undefined") {
                const [gte, lte] = priceRange.split("-");
                if(jsonBody.query.bool.must === undefined) jsonBody.query.bool.must = {};
                jsonBody.query.bool.must.range = {
                    price: {
                        "gte": gte,
                        "lte": lte
                    }
                };
            }
            if(rating !== "undefined") {
                if(jsonBody.query.bool.must === undefined) jsonBody.query.bool.must = {};
                jsonBody.query.bool.must.range = {
                    rating: {
                        "gte": rating
                    }
                };
            }
            result = await client.search(jsonBody);
        }
        res.json(result.hits.hits.map(hit => hit._source));
        
        // console.log(result);
    }
    catch(error) {
        console.error(error);
        res.status(500).json({error: "Serach Failed"});
    }
});

module.exports = router;