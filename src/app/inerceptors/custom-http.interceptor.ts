import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Modify the request (e.g., add authorization headers or logging)
    const clonedRequest = req.clone({
      setHeaders: {
        'Authorization': 'Bearer token' // Example of adding a header
      }
    });

    return next.handle(clonedRequest);
  }
}
