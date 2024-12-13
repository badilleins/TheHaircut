import { Component, inject, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { where } from 'firebase/firestore';
import { Appointment } from 'src/app/models/appointment.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

Chart.register(...registerables);

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit{

  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)
  users =  [
    { name: 'Juan', value: 20 , value1: 40},
    { name: 'Maria', value: 30, value1: 20},
    { name: 'Pedro', value: 50, value1: 60 }
  ];
  loading:boolean = false

  // Tipo de gráfico
  public chartType: ChartType = 'bar';

  // Datos del gráfico
  public chartData: ChartData<'bar'> = {
    labels: this.users.map(item => item.name),
    datasets: [
      { data: this.users.map(item => item.value), label: 'Citas semanales' },
      { data: this.users.map(item => item.value1), label: 'Citas mensuales' },
    ]
  };

  // Opciones de configuración del gráfico
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio:true
  };

  ngOnInit(): void {
      this.getAppointments();
  }

  async getAppointments() {
  //   let path = `users`;
  //   this.loading = true;

  //   let query = [
  //     where("isBarber", "==", true)
  //   ]

  //   let sub = this.firebaseSrv.getCollectionData(path,query).subscribe({
  //     next: (res: any) => {
  //       this.users= res
  //       this.loading = false;
  //       sub.unsubscribe();
  //       console.log(this.users)
  //     }
  //   })

 }

}
