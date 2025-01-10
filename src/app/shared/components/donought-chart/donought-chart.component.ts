import { Component, inject, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-donought-chart',
  templateUrl: './donought-chart.component.html',
  styleUrls: ['./donought-chart.component.scss'],
})
export class DonoughtChartComponent  implements OnInit {

  utilsSrv = inject(UtilsService)
  firebaseSrv = inject(FirebaseService)
  users =  [
    { name: 'Juan', value: 65 },
    { name: 'Maria', value: 59 },
    { name: 'Pedro', value: 80 }
  ];
  loading:boolean = false

  // Tipo de gráfico
  public chartType: ChartType = 'doughnut';

  // Datos del gráfico
  public chartData: ChartData<'doughnut'> = {
    labels: this.users.map(item => item.name),
    datasets: [
      { data: this.users.map(item => item.value), label: 'Número de cortes realizados' },
    ]
  };

  // Opciones de configuración del gráfico
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio:false
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
