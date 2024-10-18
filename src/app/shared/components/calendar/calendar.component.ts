import { User } from 'src/app/models/user.model';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { subDays, addDays, startOfDay, addMinutes, subWeeks, subMonths, addWeeks, addMonths, startOfWeek, startOfMonth, endOfWeek } from 'date-fns';
import { Subject, Subscription } from 'rxjs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Appointment } from 'src/app/models/appointment.model';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateAppointmentComponent } from '../add-update-appointment/add-update-appointment.component';
import { orderBy } from 'firebase/firestore';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})

export class CalendarComponent  implements OnInit, OnDestroy {

  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)

  loading: boolean = false
  appointments: Appointment[] = []
  appointmentsSub: Subscription | null = null;

  user(): User {
    return this.utilsSrv.getFromLocalStorage('user');
  }

  viewDate: Date = new Date();
  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Week;

  

  // Definir refresh como Subject
  refresh: Subject<any> = new Subject();

  hourStartsAt = this.user().hourStartAt;  
  hourEndsAt = this.user().hourEndAt;
  daysInWeek = 3;

  events: CalendarEvent[] = [
    {
      start: startOfDay(new Date()),
      end: addDays(new Date(),0),
      title: 'Cita agendada',
      color: { primary: '#1e90ff', secondary: '#D1E8FF' },
    },
    {
      start: addDays(new Date(), 0,),
      end: addDays(new Date(), 2),
      title: 'Cita para mañana',
      color: { primary: '#e3bc08', secondary: '#FDF1BA' },
    },
  ];

  closeOpenMonthViewDay() {}

  // Agregar handleEvent para manejar clics en eventos
  handleEvent(action: string, event: CalendarEvent): void {
    console.log('Evento clicado:', action, event);
  }

  getTitle(): string {
    if (this.view === CalendarView.Month) {
      // Devuelve el mes y el año en formato "Septiembre 2024"
      return format(this.viewDate, 'MMMM yyyy');
    } else if (this.view === CalendarView.Week) {
      // Devuelve el rango de la semana en formato "03 Septiembre - 09 Septiembre"
      const startOfWeek = format(this.viewDate, 'dd MMMM');
      const endOfWeek = format(addDays(this.viewDate, 6), 'dd MMMM');
      return `${startOfWeek} - ${endOfWeek}`;
    } else if (this.view === CalendarView.Day) {
      // Devuelve el día en formato "03 Septiembre 2024"
      return format(this.viewDate, 'dd MMMM yyyy');
    }
    return '';
  }

  async addUpdateAppointment(date:any)
  {
    console.log(date)
    let appointment:Appointment = {
      id: null,
      name: this.user().name,
      lastName: this.user().lastName,
      date: date.date,
      endDate: addMinutes(date.date, 60),
      status: 0,
      securityCode: 0,
      price: 7

    }
    let success = await this.utilsSrv.presentModal({
      component: AddUpdateAppointmentComponent,
      cssClass: 'add-update-modal',
      componentProps: { appointment }
    })
    if (success) 'Actualizado con exito';
  }

  getAppointments() {
    let path = `users/${this.user().uid}/appointments`;
    console.log(path);
    this.loading = true;

    let query = [
      orderBy('date', 'asc'),
    ]

    this.appointmentsSub = this.firebaseSrv.getCollectionData(path,query).subscribe({
      next: (res: any) => {
        this.appointments = res.map((appointment: any) => {
          return {
            ...appointment,
            date: appointment.date.toDate(),
            endDate: appointment.endDate.toDate()
          };
        });
        this.events = this.appointments.map((appointment: any) => {
          return {
            start: appointment.date, 
            end: appointment.endDate,  
            title: 'Cita agendada de: '+ appointment.date.getHours()+":"+appointment.date.getMinutes() + " a: " + appointment.endDate.getHours()+":"+appointment.endDate.getMinutes(), // Asegúrate de que tu objeto tenga un título
            color: { primary: '#6B4F4F', secondary: '#E29A84', secondaryText: '#FFFFFF' },
            draggable: true
          } as CalendarEvent;
        });
        console.log(this.events)
        this.loading = false;
      }
    })
  }

  daySelected(day: { date: Date }) {
    this.viewDate = day.date;  // Cambia la vista al día seleccionado
    this.view = CalendarView.Day;  // Cambia la vista a día
  }

  setView(view: CalendarView) {
    // Cuando cambias la vista, ajusta la fecha en función de la nueva vista
    if (view === CalendarView.Day) {
      this.viewDate = startOfDay(this.viewDate);  // Asegúrate de que la vista día comience desde el día actual
    } else if (view === CalendarView.Week) {
      this.viewDate = startOfWeek(this.viewDate, { weekStartsOn: 1 });  // Inicia la semana en el lunes de la semana actual
    } else if (view === CalendarView.Month) {
      this.viewDate = startOfMonth(this.viewDate);  // Inicia el mes en el primer día del mes actual
    }
    this.view = view;  // Cambia la vista
  }

  prev() {
    // Cambiar la fecha hacia atrás según la vista actual
    if (this.view === CalendarView.Day) {
      this.viewDate = subDays(this.viewDate, 1);  // Día anterior
    } else if (this.view === CalendarView.Week) {
      this.viewDate = subWeeks(this.viewDate, 1);  // Semana anterior
    } else if (this.view === CalendarView.Month) {
      this.viewDate = subMonths(this.viewDate, 1);  // Mes anterior
    }
  }

  next() {
    // Cambiar la fecha hacia adelante según la vista actual
    if (this.view === CalendarView.Day) {
      this.viewDate = addDays(this.viewDate, 1);  // Día siguiente
    } else if (this.view === CalendarView.Week) {
      this.viewDate = addWeeks(this.viewDate, 1);  // Semana siguiente
    } else if (this.view === CalendarView.Month) {
      this.viewDate = addMonths(this.viewDate, 1);  // Mes siguiente
    }
  }

  get prevDate(): string {
    if (this.view === CalendarView.Day) {
      return format(subDays(this.viewDate, 1), 'dd/MM/yyyy',{locale: es});  // Día anterior
    } else if (this.view === CalendarView.Week) {
      const start = startOfWeek(subWeeks(this.viewDate, 1), { weekStartsOn: 0 });
      const end = endOfWeek(subWeeks(this.viewDate, 1), { weekStartsOn: 0 });
      return `Del ${format(start, 'dd/MM', { locale: es })} al ${format(end, 'dd/MM/yyyy', { locale: es })}`;  // Semana anterior
    } else if (this.view === CalendarView.Month) {
      return format(subMonths(this.viewDate, 1), 'MMMM yyyy', {locale: es});  // Mes anterior
    }
    return '';
  }

  get nextDate(): string {
    if (this.view === CalendarView.Day) {
      return format(addDays(this.viewDate, 1), 'dd/MM/yyyy', {locale: es});  // Día siguiente
    } else if (this.view === CalendarView.Week) {
      const start = startOfWeek(addWeeks(this.viewDate, 1), { weekStartsOn: 0 });
      const end = endOfWeek(addWeeks(this.viewDate, 1), { weekStartsOn: 0 });
      return `Del ${format(start, 'dd/MM', { locale: es })} al ${format(end, 'dd/MM/yyyy', { locale: es })}`;  // Semana siguiente
    } else if (this.view === CalendarView.Month) {
      return format(addMonths(this.viewDate, 1), 'MMMM yyyy', {locale: es});  // Mes siguiente
    }
    return '';
  }

  constructor() {}

  ngOnInit() {
    this.viewDate = new Date();
    this.getAppointments();
  }

  ngOnDestroy() {
    if (this.appointmentsSub) {
      this.appointmentsSub.unsubscribe();
    }
  }

}
