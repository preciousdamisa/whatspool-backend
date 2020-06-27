const app = require('express')();
const config = require('config');

require('./startup/logging')();
require('./startup/cors')(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();

const PORT = process.env.PORT || config.get('port');
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
