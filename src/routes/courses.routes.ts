/**
 * @swagger
 * /courses/list:
 *   get:
 *     summary: Retrieve a list of JSONPlaceholder users
 *     description: Retrieve a list of users from JSONPlaceholder. Can be used to populate a list of fake users when prototyping or testing an API.
 */

import {Router}        from 'express';
import ScheduleManager from '../utils/scheduleManager';
import {checkValues}   from '../utils/checkValues';

const coursesRoutes = Router(),
	  schedule      = new ScheduleManager();

coursesRoutes.get('/', (req, res) => res.status(200).send('Courses Schedule'));

coursesRoutes.get('/list',
				  async (req, res) => res.status(200).json(await schedule.getSchedule()));

coursesRoutes.get('/:day', async (req, res) => {
	const days = +req.params.day;

	if(await checkValues(res, 'day', days, 'Day')) return;

	res.status(200).json(await schedule.getScheduleByDay(+days));
});

coursesRoutes.get('/id/:id',
				  async (req, res) => res.status(200).json(await schedule.getScheduleById(req.params.id)));

export default coursesRoutes;