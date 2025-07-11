const express = require('express');
const router = express.Router();
const {Client} = require('@elastic/elasticsearch');

const client = new Client({node: 'http://localhost:9200'});

router.get('/', async (req, res) => {
    const {query} = req.query;
    try { 
        const result = await client.search({
            index: 'products',
            query: {
                multi_match: {
                    query: query,
                    fields: ['name^3', 'description', 'brand']
                }
            }
        });

        res.json(result.hits.hits.map(hit => hit._source));
    }
    catch(error) {
        console.error(error);
        res.status(500).json({error: "Serach Failed"});
    }
});

module.exports = router;