import {Router}        from 'express';
import ScheduleManager from '../utils/scheduleManager';
import {checkValues}   from '../utils/checkValues';

const classesRoutes = Router(),
	  schedule      = new ScheduleManager();


classesRoutes.get('/', (req, res) => res.status(200).send('Class Schedule'));

classesRoutes.get('/list',
				  async (req, res) => res.status(200).json([...await schedule.getClassList()]));

classesRoutes.get('/:class_name', async (req, res) => {
	const className = req.params.class_name;

	if(await checkValues(res, 'class', className, 'ClassName')) return;

	res.status(200).json(await schedule.getScheduleByClass(className));
});

classesRoutes.get('/:class_name/next', async (req, res) => {
	const className = req.params.class_name;

	if(await checkValues(res, 'class', className, 'ClassName')) return;

	const classSchedule = await schedule.getScheduleByClass(className);
	return res.status(200).json(await schedule.getNextCourse(classSchedule || null));
});

classesRoutes.get('/:class_name/:day', async (req, res) => {
	const className = req.params.class_name,
		days      = +req.params.day;

	if(await checkValues(res, 'class', className, 'ClassName')) return;
	if(await checkValues(res, 'day', days, 'Day')) return;

	res.status(200).json(await schedule.getScheduleByClassAndDay(className, +days));
});
export default classesRoutes;