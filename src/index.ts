import express, {Application}      from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi    from 'swagger-ui-express'
import routes       from './routes/routes';
const swaggerDocument = require('./swagger.json');

const app: Application = express();


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(routes);
app.listen(3333, () => {
	console.log('Server started');
});
