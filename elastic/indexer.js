const {Client} = require('@elastic/elasticsearch');
const fs = require('fs');

const client = new Client({node: 'http:localhost:9200'});
const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));

async function createIndex() {
    const exists = await client.indices.exists({index: 'products'});

    try {
        if(!exists) {
            await client.indices.create({
                index: 'products',
                mappings: {
                    properties: {
                        name: {type: 'text'},
                        description: {type: 'text'},
                        category: {type: 'keyword'},
                        brand: {type: 'keyword'},
                        price: {type: 'float'},
                        stock: {type: 'integer'},
                        rating: {type: 'float'},
                        suggest: {type: 'completion'}
                    }
                }
            });
            const body = products.flatMap(doc => [{index: {_index: 'products'}}, {...doc, suggest: doc.name}]);
            const bulkResponse = await client.bulk({refresh: true, body});
            if(bulkResponse.errors) {
                console.log('Error while indexing products');
            }
            else {
                console.log('Products indexed Successfully');
            }

        }
    }
    catch(error) {
        console.error(error);
    }
}

createIndex();
