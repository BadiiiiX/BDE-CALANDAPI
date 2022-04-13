import {Router}        from 'express';
import ScheduleManager from '../utils/scheduleManager';
import {checkValues}   from '../utils/checkValues';

const roomsRoutes = Router(),
	  schedule    = new ScheduleManager();

roomsRoutes.get('/', (req, res) => res.status(200).send('Room Schedule'));

roomsRoutes.get('/list',
				async (req, res) => res.status(200).json([...await schedule.getRoomList()]));

roomsRoutes.get('/:room_name', async (req, res) => {
	const teacherName = req.params.room_name;
	
	res.status(200).json(await schedule.getScheduleByRoom(teacherName));
});

roomsRoutes.get('/:room_name/:day', async (req, res) => {
	const teacherName = req.params.room_name,
		  days        = +req.params.day;
	
	if(await checkValues(res, 'day', days, 'Day')) return;
	
	res.status(200).json(await schedule.getScheduleByRoomAndDay(teacherName, +days));
});

export default roomsRoutes;