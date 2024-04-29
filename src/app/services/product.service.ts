import { Injectable } from '@angular/core';
import { apiServer } from '../api-services/apiservice';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.model';
@Injectable({
  providedIn: 'root'
})
export class ProductoService {
private ApiUrl: string = apiServer.serverUrl;
  constructor(private http: HttpClient) { }
  getProducto(): Observable<Producto[]>{
    return this.http.get<Producto[]>(`${this.ApiUrl}`)
  }
}
