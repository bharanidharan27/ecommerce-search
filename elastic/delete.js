const {Client} = require('@elastic/elasticsearch');

const client = new Client({node: 'http://localhost:9200'});

async function deleteIndex() {
    try {
        const exists = await client.indices.exists({index: "products"});
        if(exists) {
            const response = await client.indices.delete({index: 'products'});
            console.log(response);
        } 
    }
    catch(error) {
        console.error(error);
    }
}

deleteIndex();