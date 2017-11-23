import { StitchClient } from 'mongodb-stitch';
let client = new StitchClient('mapful-cffdt');

client.login()
    .then(() => console.log("[MongoDB Stitch] Connected to Stitch"))
    .catch(e => console.error(e));

const db = client.service('mongodb', 'mongodb-atlas').db('Mapful');

export default db;