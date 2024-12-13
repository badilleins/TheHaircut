import { User } from 'src/app/models/user.model';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { subDays, addDays, startOfDay, addMinutes, subWeeks, subMonths, addWeeks, addMonths, startOfWeek, startOfMonth, endOfWeek } from 'date-fns';
import { Subject, Subscription } from 'rxjs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Appointment } from 'src/app/models/appointment.model';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateAppointmentComponent } from '../add-update-appointment/add-update-appointment.component';
import { orderBy, where } from 'firebase/firestore';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AddUpdateAppointmentClientComponent } from '../add-update-appointment-client/add-update-appointment-client.component';

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
  user: User;

  viewDate: Date = new Date();
  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Week;

  

  // Definir refresh como Subject
  refresh: Subject<any> = new Subject();

  hourStartsAt
  hourEndsAt
  daysInWeek = 3;

  events: CalendarEvent[] = [];

  closeOpenMonthViewDay() {}

  // Agregar handleEvent para manejar clics en eventos
  handleEvent(action: string, event: CalendarEvent): void {
    const appointmentEdit = this.appointments.find(
      (appointment) => appointment.date.getTime() === event.start.getTime()
    );
    
    if (appointmentEdit) {
      this.addUpdateAppointment(null, appointmentEdit);
    }
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

  async addUpdateAppointment(date:any, appointmentEdit?: Appointment)
  {
    if(appointmentEdit){
      if(!appointmentEdit.client){
        console.log(appointmentEdit)
        let success = await this.utilsSrv.presentModal({
          component: AddUpdateAppointmentComponent,
          cssClass: 'add-update-modal',
          componentProps: { appointmentEdit }
        })
        if (success) 'Actualizado con exito';
      }else{
        let success = await this.utilsSrv.presentModal({
          component: AddUpdateAppointmentClientComponent,
          cssClass: 'add-update-modal',
          componentProps: { appointmentEdit }
        })
        if (success) 'Actualizado con exito';
      }
    }else{
      // Validar que no haya conflicto con otras citas
      const conflict = this.appointments.some(
        (appointment) =>
          (appointment.date.getTime() == date.date.getTime()||
          (appointment.date.getTime() > date.date.getTime() &&
            appointment.date.getTime() < addMinutes(date.date, 59).getTime())||
            appointment.endDate.getTime() > date.date.getTime() &&
            appointment.endDate.getTime() < addMinutes(date.date, 59).getTime())
      );
      if (conflict) {
        this.utilsSrv.showToast({
          message:"La cita debe crearse una hora antes de otra cita ya agendada y no puede agendarse sobre otra cita",
          duration: 2500,
          color: 'warning',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
        return;
      }
      let appointment:Appointment = {
        id: null,
        name: '',
        lastName: '',
        date: date.date,
        barber: this.user,
        endDate: addMinutes(date.date, 60),
        status: 0,
        securityCode: 0,
  
      }
      let success = await this.utilsSrv.presentModal({
        component: AddUpdateAppointmentComponent,
        cssClass: 'add-update-modal',
        componentProps: { appointment }
      })
      if (success) 'Creado con exito';
    }
    
  }

  getAppointments() {
    let path = `appointments`;
    this.loading = true;
    let query = [
      where('barber.uid', '==', this.user.uid),
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
          let color: string = '#6d2c35'
          let isDrag: boolean = true
          if(appointment.status==1){
            isDrag=false
            color='#ffc409'
          } 
          return {
            id: appointment.id,
            start: appointment.date, 
            end: appointment.endDate,  
            title: 'Cita con: \n'+ appointment.name+"\n"+appointment.lastName,
            color: { primary: color, secondary: color, secondaryText: '#FFFFFF' },
            draggable: isDrag
          } as CalendarEvent;
        });
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
    this.user= this.utilsSrv.getFromLocalStorage('user');
    this.hourStartsAt = this.user.hourStartAt;  
    this.hourEndsAt = this.user.hourEndAt;
    this.viewDate = new Date();
    this.getAppointments();
    
  }

  ngOnDestroy() {
    if (this.appointmentsSub) {
      this.appointmentsSub.unsubscribe();
    }
  }

  confirmDragAppointment(event: any) {
    this.utilsSrv.presentAlert({
      header: 'Mover cita',
      message: '¿Estás seguro de mover esta cita?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Mover',
          handler: () => {
                this.eventTimesChanged(event)
          }
        },
      ],
    });
  }

  eventTimesChanged({ event, newStart, newEnd, allDay }: CalendarEventTimesChangedEvent): void {
    if (newStart < new Date()) {
      this.utilsSrv.showToast({
        message:"No se puede mover una cita a una fecha pasada",
        duration: 2500,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
      return;
    }
  
    // Validar que no haya conflicto con otras citas
    const conflict = this.appointments.some(
      (appointment) =>
        (appointment.date.getTime() == newStart.getTime()||
         (appointment.date.getTime() > newStart.getTime() &&
          appointment.date.getTime() < addMinutes(newStart, 59).getTime())||
          appointment.endDate.getTime() > newStart.getTime() &&
          appointment.endDate.getTime() < addMinutes(newStart, 59).getTime())&&
        appointment.id !== event.id
      
    );
    if (conflict) {
      this.utilsSrv.showToast({
        message:"La cita debe moverse a una hora antes de otra cita ya agendada y no puede agendarse sobre otra cita",
        duration: 2500,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
      return;
    }  
    // Actualizar la cita con las nuevas fechas
    const appointmentToUpdate = this.appointments.find((a) => a.id === event.id);
    if (appointmentToUpdate) {
      appointmentToUpdate.date = newStart;
      appointmentToUpdate.endDate = newEnd;
      appointmentToUpdate.status = 2
      let path = `appointments/${appointmentToUpdate.id}`
      try {
        this.firebaseSrv.updateDocument(path, appointmentToUpdate);
        this.getAppointments();
        this.utilsSrv.showToast({
          message: 'Cita movida exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      } catch (error) {
        this.utilsSrv.showToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      }
      
    }
  }
  

}
