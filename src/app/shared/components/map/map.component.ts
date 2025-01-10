import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent  implements OnInit {
map: L.map;

  constructor() { }

  ngOnInit() {
    this.map = L.map('mapId').setView([-1.24878,-78.62138])
  }

}
