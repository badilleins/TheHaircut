import { User } from "./user.model";

export interface Appointment {
    id:string,
    client?: User,
    name?: string,
    lastName?:string,
    barber: User,
    date: Date,
    securityCode: number,
    status: number,
    endDate: Date,
}