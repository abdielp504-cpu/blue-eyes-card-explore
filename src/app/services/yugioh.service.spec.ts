import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Card, CardInfoResponse } from '../models/card.model';
import { CardNotFoundError, YugiohService } from './yugioh.service';

describe('YugiohService', () => {
  let service: YugiohService;
  let httpTestingController: HttpTestingController;

  const card: Card = {
    id: 1,
    name: 'Blue-Eyes White Dragon',
    type: 'Normal Monster',
    desc: 'A legendary dragon.',
    race: 'Dragon',
    atk: 3000,
    def: 2500,
    level: 8,
    attribute: 'LIGHT',
    card_images: [
      {
        image_url: 'https://images.ygoprodeck.com/images/cards/1.jpg',
        image_url_small: 'https://images.ygoprodeck.com/images/cards_small/1.jpg',
      },
    ],
    card_prices: [
      {
        cardmarket_price: '1.00',
        tcgplayer_price: '2.00',
        ebay_price: '3.00',
        amazon_price: '4.00',
        coolstuffinc_price: '5.00',
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(YugiohService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('searches cards by partial name and returns the data array', () => {
    let result: Card[] | undefined;
    service.searchCards('Blue-Eyes').subscribe((cards) => (result = cards));

    const request = httpTestingController.expectOne(
      (req) =>
        req.url === 'https://db.ygoprodeck.com/api/v7/cardinfo.php' &&
        req.params.get('fname') === 'Blue-Eyes',
    );
    expect(request.request.params.has('archetype')).toBe(false);
    request.flush({ data: [card] } satisfies CardInfoResponse);

    expect(result).toEqual([card]);
  });

  it('loads the Blue-Eyes archetype using the archetype parameter', () => {
    let result: Card[] | undefined;
    service.getBlueEyesCards().subscribe((cards) => (result = cards));

    const request = httpTestingController.expectOne(
      (req) =>
        req.url === 'https://db.ygoprodeck.com/api/v7/cardinfo.php' &&
        req.params.get('archetype') === 'Blue-Eyes',
    );
    request.flush({ data: [card] } satisfies CardInfoResponse);

    expect(result).toEqual([card]);
  });

  it('converts the API no-results 400 response to an empty array', () => {
    let result: Card[] | undefined;
    service.searchCards('no matching card').subscribe((cards) => (result = cards));

    const request = httpTestingController.expectOne(
      (req) => req.params.get('fname') === 'no matching card',
    );
    request.flush(
      { error: 'No card matching your query was found in the YGOProDeck database.' },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(result).toEqual([]);
  });

  it('preserves network errors instead of treating them as empty results', () => {
    let receivedError: unknown;
    service.searchCards('Blue-Eyes').subscribe({
      error: (error: unknown) => (receivedError = error),
    });

    const request = httpTestingController.expectOne(
      (req) => req.params.get('fname') === 'Blue-Eyes',
    );
    request.error(new ProgressEvent('error'));

    expect(receivedError).toBeInstanceOf(HttpErrorResponse);
    expect((receivedError as HttpErrorResponse).status).toBe(0);
  });

  it('loads one card by ID', () => {
    let result: Card | undefined;
    service.getCardById(1).subscribe((foundCard) => (result = foundCard));

    const request = httpTestingController.expectOne(
      (req) =>
        req.url === 'https://db.ygoprodeck.com/api/v7/cardinfo.php' && req.params.get('id') === '1',
    );
    request.flush({ data: [card] } satisfies CardInfoResponse);

    expect(result).toEqual(card);
  });

  it('returns the same not-found error for an empty response and the API 400 response', () => {
    const errors: unknown[] = [];
    service.getCardById(404).subscribe({ error: (error: unknown) => errors.push(error) });
    const emptyResponse = httpTestingController.expectOne((req) => req.params.get('id') === '404');
    emptyResponse.flush({ data: [] } satisfies CardInfoResponse);

    service.getCardById(405).subscribe({ error: (error: unknown) => errors.push(error) });
    const apiError = httpTestingController.expectOne((req) => req.params.get('id') === '405');
    apiError.flush(
      { error: 'No card matching your query was found in the YGOProDeck database.' },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(errors).toHaveLength(2);
    expect(errors[0]).toBeInstanceOf(CardNotFoundError);
    expect(errors[1]).toBeInstanceOf(CardNotFoundError);
    expect((errors[0] as Error).message).toBe((errors[1] as Error).message);
    expect((errors[0] as Error).message).toBe('No se encontró una carta con ese identificador.');
  });
});
