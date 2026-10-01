import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Card, CardInfoResponse } from '../models/card.model';

export class CardNotFoundError extends Error {
  constructor() {
    super('No se encontró una carta con ese identificador.');
    this.name = 'CardNotFoundError';
  }
}

@Injectable({
  providedIn: 'root',
})
export class YugiohService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

  searchCards(name: string): Observable<Card[]> {
    const params = new HttpParams().set('fname', name.trim());

    return this.getCards(params);
  }

  getBlueEyesCards(): Observable<Card[]> {
    const params = new HttpParams().set('archetype', 'Blue-Eyes');

    return this.getCards(params);
  }

  getCardById(id: number): Observable<Card> {
    const params = new HttpParams().set('id', id);

    return this.http.get<CardInfoResponse>(this.endpoint, { params }).pipe(
      map((response) => {
        const card = response.data[0];
        if (!card) {
          throw new CardNotFoundError();
        }

        return card;
      }),
      catchError((error: unknown) => {
        if (error instanceof CardNotFoundError) {
          return throwError(() => error);
        }

        if (this.isNoResultsError(error)) {
          return throwError(() => new CardNotFoundError());
        }

        return throwError(() => error);
      }),
    );
  }

  private getCards(params: HttpParams): Observable<Card[]> {
    return this.http.get<CardInfoResponse>(this.endpoint, { params }).pipe(
      map((response) => response.data),
      catchError((error: unknown) => {
        if (this.isNoResultsError(error)) {
          return of([]);
        }

        return throwError(() => error);
      }),
    );
  }

  private isNoResultsError(error: unknown): error is HttpErrorResponse {
    if (!(error instanceof HttpErrorResponse) || error.status !== 400) {
      return false;
    }

    const body: unknown = error.error;
    return (
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof body.error === 'string' &&
      body.error.includes('No card matching your query')
    );
  }
}
