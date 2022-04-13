import 'node-ical';
import {CalendarResponse, DateWithTimeZone, fromURL, VEvent} from 'node-ical';

export enum SessionType {
	AMPHITHEATER = 'AMPHITHEATER',
	NORMAL       = 'NORMAL',
	OTHER        = 'OTHER'
}

export interface SessionComponent {
	resource: string | null,
	name: string,
	type: SessionType
}

export interface CourseComponent {
	id: string,
	start: number,
	end: number,
	course: SessionComponent,
	room: string[],
	classes: string[],
	teachers: string[],
}

export default class ScheduleManager {

	private readonly icalLink: string;


	constructor() {
		this.icalLink = process.env.BASE_LINK;
	}

	private async getIcalData(): Promise<CalendarResponse> {
		return fromURL(this.icalLink);
	}

	private static isClass(data: string): boolean {
		return (!isNaN(+data) || ['DUT info Apprentissage', 'DUT Info Année Spéciale'].includes(data));
	}

	private static async normalizeDescription(desc: string): Promise<string[][]> {
		const normalizedDesc = desc.split('\n').filter(el => el !== '').slice(0, -1);

		const professorList: string[] = [],
			  classesList: string[]   = [];

		for(const element of normalizedDesc) ScheduleManager.isClass(element) ? professorList.push(element.replace(/ +/g, ' ')) : classesList.push(element.replace(/ +/g, ' '));

		return [professorList, classesList];
	}

	private static async normalizeCourse(courseName: string, roomName: string): Promise<SessionComponent> {
		const data              = courseName.split(' '),
			  isResource        = new RegExp('^R[0-9].[0-9]{2}$'),
			  resource          = isResource.test(data[0]) ? data.shift() : null,
			  type: SessionType = roomName.startsWith('AMPHITHEATRE') ? SessionType.AMPHITHEATER : SessionType.NORMAL;
		return {name: data.join(' '), resource, type};
	}

	private static async normalizeDate(date: DateWithTimeZone): Promise<number> {
		return date.getTime();
	}

	private static async normalizeComponent(element: VEvent): Promise<CourseComponent> {
		const {uid, start, end, summary, location, description} = element,
			  [classes, professors]                             = await ScheduleManager.normalizeDescription('' + description);

		return {
			id      : uid,
			start   : await ScheduleManager.normalizeDate(start),
			end     : await ScheduleManager.normalizeDate(end),
			course  : await ScheduleManager.normalizeCourse(summary, location),
			classes,
			teachers: professors,
			room    : location.split(','),
		};
	}

	private static async normalizeSchudle(data: CalendarResponse): Promise<CourseComponent[]> {

		const courses: CourseComponent[] = [];

		for(const element in data) {
			if(data.hasOwnProperty(element)) {
				const component = data[element] as VEvent;
				courses.push(await ScheduleManager.normalizeComponent(component));
			}
		}

		return courses;
	}
	
	private static comparateSchedule(a: CourseComponent, b: CourseComponent): number {
		if(a.start > b.start) return 1;
		else if(a.start < b.start) return -1;
		else return a.classes[0].localeCompare(b.classes[0]);
	}

	public async getSchedule(): Promise<CourseComponent[]> {
		const courses = await ScheduleManager.normalizeSchudle(await this.getIcalData());
		return courses.sort((a, b) => ScheduleManager.comparateSchedule(a, b))
	}

	public async getScheduleByDay(day: number = 0, data: null | CourseComponent[] = null): Promise<CourseComponent[] | void> {
		data = data ?? await this.getSchedule();
		const ONE_DAY = 86400000;
		const today = new Date().getTime() - (new Date().getTime() % ONE_DAY);

		return data.filter(({start}: CourseComponent) => {
			return start - (start % ONE_DAY) === today + (ONE_DAY * day);
		});
	}

	public async getScheduleById(sid: string, data: null | CourseComponent[] = null): Promise<CourseComponent[] | void> {
		data = data ?? await this.getSchedule();
		return data.filter(({id}: CourseComponent) => {
			return sid === id;
		});
	}

	public async getScheduleByClass(className: string, data: null | CourseComponent[] = null): Promise<CourseComponent[]> {
		data = data ?? await this.getSchedule();
		return data.filter(({classes}: CourseComponent) => classes.includes(className));
	}

	public async getScheduleByClassAndDay(className: string, day: number = 0, data: null | CourseComponent[] = null): Promise<CourseComponent[] | void> {
		const daySchedule = await this.getScheduleByDay(day, data);
		if(!(daySchedule instanceof Object)) return;
		return await this.getScheduleByClass(className, daySchedule);
	}

	public async getScheduleByTeacher(teacherName: string, data: null | CourseComponent[] = null): Promise<CourseComponent[]> {
		data = data ?? await this.getSchedule();
		return data.filter(({teachers}: CourseComponent) => teachers.includes(teacherName));
	}

	public async getScheduleByTeacherAndDay(teacherName: string, day: number = 0, data: null | CourseComponent[] = null): Promise<CourseComponent[] | void> {
		const daySchedule = await this.getScheduleByDay(day, data);
		if(!(daySchedule instanceof Object)) return;
		return await this.getScheduleByTeacher(teacherName, daySchedule);
	}
	
	public async getScheduleByRoom(roomName: string, data: null | CourseComponent[] = null): Promise<CourseComponent[]> {
		data = data ?? await this.getSchedule();
		return data.filter(({room}: CourseComponent) => room.includes(roomName));
	}
	
	public async getScheduleByRoomAndDay(roomName: string, day: number = 0, data: null | CourseComponent[] = null): Promise<CourseComponent[] | void> {
		const daySchedule = await this.getScheduleByDay(day, data);
		if(!(daySchedule instanceof Object)) return;
		return await this.getScheduleByRoom(roomName, daySchedule);
	}

	public async getTeacherList(data: null | CourseComponent[] = null) {
		data = data ?? await this.getSchedule();
		const teacherList: string[] = [];
		data.forEach(({teachers}) => teacherList.push(...teachers));
		return new Set(teacherList.sort());
	}

	public async getClassList(data: null | CourseComponent[] = null) {
		data = data ?? await this.getSchedule();
		const classList: string[] = [];
		data.forEach(({classes}) => classList.push(...classes));
		return new Set(classList.sort());
	}
	
	public async getRoomList(data: null | CourseComponent[] = null) {
		data = data ?? await this.getSchedule();
		const roomList: string[] = [];
		data.forEach(({room}) => roomList.push(...room));
		return new Set(roomList.sort());
	}

	public async getNextCourse(data: null | CourseComponent[] = null) {
		data = data ?? await this.getSchedule();
		let minTime = data[0];
		for(const element of data) {
			if(element.start < minTime.start) minTime = element;
		}

		return minTime;
	}

}

const ics = new ScheduleManager();
ics.getScheduleByClass('14', null);

// TODO : FAIRE UN INDEX.d.ts, FAIRE LA PARTIE DES TEACHERS, FAIRE LA PARTIE DE LA GESTION DES ERREURS, FAIRE LA
// PARTIE API (DOIT ETRE DISPO POUR TOUT LE MONDE)