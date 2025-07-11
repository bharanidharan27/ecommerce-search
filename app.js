const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
try {
const searchRoutes = require('./routes/search');
app.use('/api/search', searchRoutes);
}
catch(error) {
    console.error("Inside Search: " , error);
}

try {
const autoCompleteRoutes = require('./routes/auto-complete');
app.use("/api/autocomplete", autoCompleteRoutes);
}
catch(error) {
    console.error("Inside Autocomplete: ", error);
}
app.use(bodyParser.json()); // Reads incoming byte stream as json

app.use(express.static(path.join(__dirname, 'dist')));
// try {
// app.get('/*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });
// }
// catch(error) {
//     console.error("Inside *: ", error);
// }
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})