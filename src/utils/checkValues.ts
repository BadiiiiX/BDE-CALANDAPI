import ScheduleManager from './scheduleManager';
import {Response}      from 'express';

type valueType = 'class' | 'teacher' | 'day'


export const checkValues = async (res: Response<any, any>, type: valueType, value: string | number, name: string = "Undefined") => {

	const schedule = new ScheduleManager();

	switch(type) {
		case 'class':
			if(![...await schedule.getClassList()].includes('' + value)) {
				res.status(400)
				   .json({'message': `Bad Request, \'${name}\' must exist.`});
				return true;
			}
			break;
		case 'teacher':
			if(![...await schedule.getTeacherList()].includes('' + value)) {
				res.status(400)
				   .json({'message': `Bad Request, \'${name}\' must exist.`});
				return true;
			}
			break;
		case 'day':
			if(isNaN(+value)) {
				res.status(400).json({'message': 'Bad Request, \'Day\' must be a number.'});
				return true;
			}
			break;
		default:
			console.warn(`[CheckValues] Type ${type} is not referred.`);
			return false;
	}
	return false;
};