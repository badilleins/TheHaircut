export interface User{
    uid:string;
    name:string;
    lastName: string;
    email:string;
    password:string;
    isBarber: boolean;
    isAdmin: boolean;
    isBlocked: boolean;
    phone: number;
    hourStartAt:number;
    hourEndAt: number;
    uidBranch: string;
    image: string;
}