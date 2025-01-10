import { Component, inject, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { addDays, addMinutes, addMonths, addWeeks, endOfWeek, format, startOfDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { startAt, where } from 'firebase/firestore';
import { Subject, Subscription } from 'rxjs';
import { Appointment } from 'src/app/models/appointment.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-calendar-client',
  templateUrl: './calendar-client.component.html',
  styleUrls: ['./calendar-client.component.scss'],
})
export class CalendarClientComponent  implements OnInit, OnChanges{
  @Input() barber: User
  @Output() dateSelected = new EventEmitter<Date>();
  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)

  loading: boolean = false
  appointments: Appointment[] = []
  appointmentsSub: Subscription | null = null;

  viewDate: Date = new Date();
  CalendarView = CalendarView;
  view: CalendarView = CalendarView.Week;

  

  // Definir refresh como Subject
  refresh: Subject<any> = new Subject();

  hourStartsAt:number
  hourEndsAt:number
  daysInWeek = 3;

  events: CalendarEvent[] = [];

  closeOpenMonthViewDay() {}


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


  getAppointments() {
    let path = `appointments`;
    this.loading = true;
    let query = [
      where('barber.uid', '==', this.barber.uid),
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
            id: appointment.id,
            start: appointment.date, 
            end: appointment.endDate,  
            color: { primary: '#EC400A', secondary: '#E29A84', secondaryText: '#FFFFFF' },
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
    this.hourStartsAt = this.barber.hourStartAt;  
    this.hourEndsAt = this.barber.hourEndAt;
    this.viewDate = new Date();
    this.getAppointments();
    
  }

  ngOnDestroy() {
    if (this.appointmentsSub) {
      this.appointmentsSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['barber']) {
      this.hourStartsAt = this.barber.hourStartAt;  
      this.hourEndsAt = this.barber.hourEndAt;
      this.viewDate = new Date();
      this.getAppointments();
    }
  }

  addEvent(event){

    if (event.date < new Date()) {
      this.utilsSrv.showToast({
        message:"No se puede agendar una cita en una fecha pasada",
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
      return;
    }
  
    // Validar que no haya conflicto con otras citas
    const conflict = this.appointments.some(
      (appointment) =>
        (appointment.date.getTime() == event.date.getTime()||
         (appointment.date.getTime() > event.date.getTime() &&
          appointment.date.getTime() < addMinutes(event.date, 59).getTime())||
          (appointment.endDate.getTime() > event.date.getTime() &&
          appointment.endDate.getTime() < addMinutes(event.date, 59).getTime()))&&
        appointment.id !== event.id
      
    );
    if (conflict) {
      this.utilsSrv.showToast({
        message:"La cita debe debe agendarse una una hora antes de otra cita ya agendada y no puede agendarse sobre otra cita",
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline',
      });
      return;
    }
    // Verificar si la fecha ya está ocupada por un appointment
  const isOccupied = this.appointments.some(appointment =>
    appointment.date.getTime() === event.date.getTime()
  );

  if (isOccupied) {
    return;
  }

  // Crear el nuevo evento
  const newEvent: CalendarEvent = {
    start: event.date,
    end: addMinutes(event.date, 59),
    title: 'Cita agendada',
    color: { primary: '#3880ff', secondary: '#bbd8ff' },
  };

  // Filtrar para eliminar cualquier evento previamente marcado con el mismo título
  this.events = this.events.filter(
    existingEvent => existingEvent.title !== 'Cita agendada'
  );

  // Agregar el nuevo evento
  this.events = [...this.events, newEvent];

  // Refrescar la vista del calendario
  this.refresh.next(true);

  // Emitir el evento seleccionado
  this.dateSelected.emit(event.date);
  }
}
