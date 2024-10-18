import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent{

  // Tipo de gráfico
  public chartType: ChartType = 'doughnut';

  // Datos del gráfico
  public chartData: ChartData<'bar'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
    datasets: [
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
      { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
    ]
  };

  // Opciones de configuración del gráfico
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };

}
