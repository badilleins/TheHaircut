import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as L from 'leaflet';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
})
export class CustomInputComponent  implements OnInit {

  @Input() icon!:string
  @Input() type!:string
  @Input() label!:string
  @Input() autocomplete!:string
  @Input() control!:FormControl
  @Input() required!:boolean
  isPassword!:boolean
  @Input() isPicker: boolean = false;
  @Input() pickerType: 'time' | 'address' = 'time'; // Tipo de selector
  @Input() placeholder: string = '';
  userAddress : string =''
  isLoading: boolean = false;
  isModalOpen:boolean = false;

  hide:boolean = true
  showDateTime = false;
  showAddressModal:boolean = false;
  selectedAddress: {lat:number;lng:number} | null =null
  map: any
  marker: L.Marker | undefined;

  selectedTime: string | null = null;


  constructor(private cdr: ChangeDetectorRef) { }



  ngOnInit() {
    if(this.type=='password') this.isPassword=true
  }

  ngAfterViewInit() {
    // Verificamos si el mapa ya ha sido inicializado
    if (this.isModalOpen) {
      this.initializeMap();
      this.cdr.detectChanges(); // Detectamos cambios para asegurarnos que el DOM esté listo
    }
  }

  openPicker() {
    this.isModalOpen = true;
    if (this.pickerType === 'address') {
        setTimeout(()=>{
          this.initializeMap();
          if(this.map){
            this.map.invalidateSize();
          }
        }, 300);
      }
    }

  closePicker() {
    this.isModalOpen = false;
    if(this.map){
      this.map.remove();
      this.map = null;
    }
    const mapContainer = document.getElementById('map')
    if(mapContainer){
      mapContainer.innerHTML= ''
    }
  }

  onPickerChange(event: any) {
    const isoString = event.detail.value; // El valor emitido por ion-datetime (ISO completo)
    if (isoString) {
      const date = new Date(isoString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const formattedTime = this.formatTime(hours, minutes); // Formato HH:mm
      this.control.setValue(formattedTime); // Actualiza el FormControl con el formato correcto
      console.log("Hora seleccionada:", formattedTime);
    }
    this.closePicker();
  }

  showOrHidePassword() {
    this.hide = !this.hide;
    this.type = this.hide ? 'password' : 'text';
  }

  initializeMap() {
    const mapContainer = document.getElementById('map')
    const defaultIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41], // Tamaño del ícono
      iconAnchor: [12, 41], // Punto de anclaje
      popupAnchor: [1, -34], // Punto donde aparece el popup
      shadowSize: [41, 41], // Tamaño de la sombra
    });

    if (!this.map && mapContainer) {
      this.map = L.map('map').setView([-1.24878,-78.62138],13);


      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);


      this.map.on('click', (e: any) => {
        this.selectedAddress = e.latlng;

        if(this.marker){
          this.map.removeLayer(this.marker)
         }
        // Añadir un marcador al mapa
        this.marker = L.marker([e.latlng.lat, e.latlng.lng], { icon: defaultIcon }).addTo(this.map)
      .bindPopup('Estás aquí.')
       .openPopup();
      });
      this.getUserLocation();
    }
  }

  getUserLocation(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const{latitude,longitude} = position.coords

          this.map.setView([latitude,longitude],16)

        },
        (error)=>{
          console.error('No se obtuvo la ubicación',error)
        }
      );
    }else{
      console.error('Geolocalización no soportada por el navegador.');
    }
  }

  reverseGeocode(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        this.userAddress = data.display_name || 'Dirección no encontrada';
        console.log('Dirección obtenida:', this.userAddress);
      })
      .catch((error) => {
        console.error('Error en la geocodificación inversa:', error);
      });
  }

  confirmAddress() {

    if (this.selectedAddress) {
      this.isLoading = true;
      const {lat, lng} = this.selectedAddress;
      this.reverseGeocode(lat, lng)

      setTimeout(()=>{
        if(this.userAddress){
          this.control.setValue(this.userAddress);
        } else{
          alert('No se puedo obtener la dirección. Intenta de nuevo.')
        }
        this.closePicker();
      },1000);
    } else {
      alert('Por favor selecciona una ubicación.');
    }
  }

  // Acepta la hora seleccionada y cierra el selector
  onTimeSelected(event: any) {
    console.log("Evento recibido:", event);
    const timeString = event.detail.value;
    if (timeString) {
      console.log("Hora seleccionada (ISO): ", timeString);
      const date = new Date(timeString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      // Usamos el formato HH:mm
      this.selectedTime = this.formatTime(hours, minutes);
      console.log("Hora seleccionada:", this.selectedTime);
      // Actualizamos el FormControl con el formato adecuado
      this.control.setValue(this.selectedTime, { emitEvent: true });
    } else {
      console.error("No se seleccionó ninguna hora.");
    }
  }

  // Formato de hora normal (HH:mm)
  formatTime(hours: number, minutes: number): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Acepta la hora seleccionada y cierra el selector
  acceptTime() {
    if (this.selectedTime != null) {
      console.log("Hora aceptada:", this.selectedTime);
      // Usamos el formato adecuado y lo pasamos al FormControl
      this.control.setValue(this.selectedTime, { emitEvent: true });
      this.showDateTime = false;
    } else {
      console.error("No se ha seleccionado ninguna hora");
    }
  }
}
