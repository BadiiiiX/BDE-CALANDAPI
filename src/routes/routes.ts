import {Router}      from 'express';
import teachersRoutes from './teachers.routes';
import classesRoutes from './classes.routes';
import coursesRoutes from './courses.routes';

const routes = Router();

routes.get('/', (req, res) => res.send('Documentation to do ?'));

routes.use('/classes', classesRoutes);
routes.use('/teachers', teachersRoutes);
routes.use('/courses', coursesRoutes);


export default routes;
