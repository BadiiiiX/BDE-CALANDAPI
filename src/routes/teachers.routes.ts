import {Router}        from 'express';
import ScheduleManager from '../utils/scheduleManager';
import {checkValues}   from '../utils/checkValues';
import classesRoutes   from './classes.routes';

const teachersRoutes = Router(),
	  schedule       = new ScheduleManager();

teachersRoutes.get('/', (req, res) => res.status(200).send('Teacher Schedule'));

teachersRoutes.get('/list',
				   async (req, res) => res.status(200).json([...await schedule.getTeacherList()]));

teachersRoutes.get('/:teacher_name', async (req, res) => {
	const teacherName = req.params.teacher_name;

	if(await checkValues(res, 'teacher', teacherName, 'TeacherName')) return;

	res.status(200).json(await schedule.getScheduleByTeacher(teacherName));
});

teachersRoutes.get('/:teacher_name/next', async (req, res) => {
	const teacherName = req.params.teacher_name;

	if(await checkValues(res, 'teacher', teacherName, 'ClassName')) return;

	const teacherSchedule = await schedule.getScheduleByTeacher(teacherName);
	return res.status(200).json(await schedule.getNextCourse(teacherSchedule || null));
});

teachersRoutes.get('/:teacher_name/:day', async (req, res) => {
	const teacherName = req.params.teacher_name,
		days        = +req.params.day;

	if(await checkValues(res, 'teacher', teacherName, 'TeacherName')) return;
	if(await checkValues(res, 'day', days, 'Day')) return;

	res.status(200).json(await schedule.getScheduleByTeacherAndDay(teacherName, +days));
});

export default teachersRoutes;